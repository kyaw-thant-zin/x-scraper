// controllers/insta.controller.js

/**
 * Required External Modules
 */
const xlsx = require('xlsx')
const express = require("express")
const asyncHnadler = require('express-async-handler')

/**
 * Required Internal Modules
 */
const {SCRAPER} = require('../utils/scraper')
const db = require('../models/index')


const Yt = db.yt
const YtDetail = db.ytDetail


// @desc GET /
// @route GET /
// @access Private
const indexYt = asyncHnadler( async (req, res) => {

    // const {userId} = req.body

    // if(!userId) {
    //     res.status(400).send({ error: { required: 'Please add all fields' } })
    //     throw new Error('Please add all fields')
    // }
    const userId = 1
    let yts = await Yt.findAll({ 
        where: {
            userId: userId
        },
        order: [
            ['id', 'DESC'],
        ],
        include: {
            model: YtDetail,
            order: [['id', 'DESC']], 
            limit: 1 
        }
    })

    res.json(yts)
    
})

const scrapeAndStore = async (userId, account) => {
    return new Promise(async (resovle, reject) => {

        const io = global.io // Access io as a global variable
        io.emit('create-account-yt', { message: "「"+account+"」のデータの取得を開始します" })
        const dumpUserProfile = await SCRAPER.playwright.yt.getProfile(account)
        if(dumpUserProfile != null) {
            console.log('prepare for store')
            io.emit('create-account-yt', { message: "「"+account+"」: データをデータベースに保存する準備をする" })
                // store the profile
            const profileData = {
                userId: userId,
                account: account,
                avatar: dumpUserProfile.avatar,
                banner: dumpUserProfile.banner,
                joined: dumpUserProfile.joined,
            }

            const yt = await Yt.create(profileData)
            if(yt) {
                io.emit('create-account-yt', { message: "「"+account+"」: すべて完了！" })

                // store the followers
                const followerData = {
                    ytId: yt.id,
                    title: dumpUserProfile.title,
                    subscribers: dumpUserProfile.subscribers,
                    views: dumpUserProfile.views,
                    media_count: dumpUserProfile.media_count,
                    description: dumpUserProfile.desc,
                    link: dumpUserProfile.link,
                }
    
                const ytDetail = await YtDetail.create(followerData)
                if(ytDetail) {
                    resovle(true)
                } else {
                    io.emit('create-account-yt', { message: "スキップされました:「"+account+"」のデータを取得できません" })
                    resovle(false)
                }

            } else {
                resovle(false)
            }

        } else {
            io.emit('create-account-yt', { message: "スキップされました:「"+account+"」のデータを取得できません" })
            resovle(false)
        }
    })
    
}

// @desc POST store Yt
// @route POST /yt/store
// @access Private
const storeYt = asyncHnadler( async (req, res) => {
    const data = req.body
    const file = req.file
    const io = global.io // Access io as a global variable

    let dataArray = []

    if(!file) {
        
        if((data?.account && data.account != null) && (data?.userId && data.userId != null)) {
    
            dataArray = data.account.includes(',') ? data.account.replace(/\s/g, '').replace(/@/g, '').split(',') : [data.account.replace(/\s/g, '').replace(/@/g, '')]

        } else {
            res.json({success: false})
        }

    } else {
        const fileExtension = file.originalname.split('.').pop().toLowerCase()
        if(fileExtension == 'xlsx') {
            // Read Excel (xlsx) file
            const workbook = xlsx.read(file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const excelData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

            // Check if excelData is empty
            if (!excelData.length) {
                res.json({success: false})
            }

            // Process Excel data
            for (let i = 0; i < excelData.length; i++) {
                const rowData = excelData[i];
                let key = Object.keys(rowData)[0]; // Extracting the key (URL)
                let value = rowData[key]; // Extracting the value (another URL)

                if(dataArray.length == 0) {
                    key = key.replace('https://youtube.com/', '').replace(/\s/g, '').replace(/@/g, '')
                    if(key != '') {
                        dataArray.push(key)
                    }
                    value = value.replace('https://youtube.com/', '')
                    if(value != '') {
                        dataArray.push(value.replace(/\s/g, '').replace(/@/g, ''))
                    }
                } else {
                    value = value.replace('https://youtube.com/', '')
                    if(value != '') {
                        dataArray.push(value.replace(/\s/g, '').replace(/@/g, ''))
                    }
                }
            }
        } else if(fileExtension == 'csv') {
            // Read CSV file
            req.file.buffer.toString().split('\n').forEach(line => {
                const columns = line.replace('\r', '').split(',');
                if (columns.length === 1 && columns[0] !== '') {
                    // Handle single-item arrays
                    dataArray.push(columns[0].replace('https://youtube.com/', '').replace(/\s/g, '').replace(/@/g, ''));
                } else {
                    dataArray.push(columns.replace('https://youtube.com/', '').replace(/\s/g, '').replace(/@/g, ''));
                }
            });

        }else {
            res.json({success: false})
        }
    }

    console.log(dataArray)
    let checkUnique = false
    let success = true

    if(Array.isArray(dataArray) && dataArray.length > 0) {
    
        for(let i = 0; i < dataArray.length; i++) {

            // check account unique
            let x = await Tt.findOne({
                where: {
                    uniqueId: dataArray[i],
                }
            })
            
            if(x) {
                io.emit('create-account-yt', { message: "「"+dataArray[i]+"」はこの名前ですでに存在します。スキップしています..." })
                if(dataArray.length <= 1) {
                    checkUnique = true
                }
            } else {
                success = await scrapeAndStore(data.userId, dataArray[i])
            }

        }
        console.log('finished.....')
        
        if(checkUnique) {
            res.json({success: true, unique: true})
        } else {
            res.json({success: success})
        }

    } else {
        res.json({success: false})
    }
    
    
})


module.exports = {
    indexYt,
    storeYt
}