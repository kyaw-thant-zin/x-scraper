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


const Insta = db.insta
const InstaDetail = db.instaDetail


// @desc GET /
// @route GET /
// @access Private
const indexInsta = asyncHnadler( async (req, res) => {
    const userId = 1
    let x= null
    try {
        x = await Insta.findAll({
          where: {
            userId: userId,
          },
          order: [['id', 'DESC']],
          include: {
            model: InstaDetail,
            order: [['id', 'DESC']],
            limit: 1,
          },
        });
      
        res.json(x)
    } catch (error) {
        console.error(null);
    }
    
})

const scrapeAndStore = async (userId, account) => {
    return new Promise(async (resovle, reject) => {

        const io = global.io // Access io as a global variable
        io.emit('create-account', { message: "「"+account+"」のデータの取得を開始します" })
        const dumpUserProfile = await SCRAPER.playwright.insta.getProfile(account)
        if(dumpUserProfile != null) {
            console.log('prepare for store')
            io.emit('create-account', { message: "「"+account+"」: データをデータベースに保存する準備をする" })
            // store the profile
            const profileData = {
                userId: userId,
                insta_id: dumpUserProfile.insta_id,
                fb_id: dumpUserProfile.fbid,
                username: dumpUserProfile.username,
                profile_image_url: dumpUserProfile.profile_image_url,
            }

            const i = await Insta.create(profileData)
            if(i) {
                io.emit('create-account', { message: "「"+account+"」: すべて完了！" })

                // store the followers
                const followerData = {
                    instumId: i.id,
                    name: dumpUserProfile.full_name,
                    following: dumpUserProfile.followings_count,
                    followers: dumpUserProfile.followers_count,
                    media_count: dumpUserProfile.media_count,
                    description: dumpUserProfile.description,
                }
    
                const instaDetail = await InstaDetail.create(followerData)
                if(instaDetail) {
                    resovle(true)
                } else {
                    io.emit('create-account', { message: "スキップされました:「"+account+"」のデータを取得できません" })
                    resovle(false)
                }

            } else {
                resovle(false)
            }

        } else {
            io.emit('create-account', { message: "スキップされました:「"+account+"」のデータを取得できません" })
            resovle(false)
        }
    })
    
}

// @desc POST store X
// @route POST /X/store
// @access Private
const storeInsta = asyncHnadler( async (req, res) => {
    const data = req.body
    const file = req.file
    const io = global.io // Access io as a global variable

    let dataArray = []

    if(!file) {
        
        if((data?.account && data.account != null) && (data?.userId && data.userId != null)) {
    
            dataArray = data.account.includes(',') ? data.account.replace(/\s/g, '').split(',') : [data.account.replace(/\s/g, '')]

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
                    key = key.replace('https://www.instagram.com/', '')
                    if(key != '') {
                        dataArray.push(key.replace(/\s/g, '').replace(/\s/g, '/'))
                    }
                    value = value.replace('https://www.instagram.com/', '')
                    if(value != '') {
                        dataArray.push(value.replace(/\s/g, '').replace(/\s/g, '/'))
                    }
                } else {
                    value = value.replace('https://www.instagram.com/', '')
                    if(value != '') {
                        dataArray.push(value.replace(/\s/g, '').replace(/\s/g, '/'))
                    }
                }
            }
        } else if(fileExtension == 'csv') {
            // Read CSV file
            req.file.buffer.toString().split('\n').forEach(line => {
                const columns = line.replace('\r', '').split(',');
                if (columns.length === 1 && columns[0] !== '') {
                    // Handle single-item arrays
                    dataArray.push(columns[0].replace('https://www.instagram.com/', '').replace(/\s/g, '').replace(/\s/g, '/'));
                } else {
                    dataArray.push(columns.replace('https://www.instagram.com/', '').replace(/\s/g, '').replace(/\s/g, '/'));
                }
            });

        }else {
            res.json({success: false})
        }
    }

    console.log(dataArray)
    let checkUnique = false

    if(Array.isArray(dataArray) && dataArray.length > 0) {
    
        for(let i = 0; i < dataArray.length; i++) {

            let success = false
            // check account unique
            let x = await Insta.findOne({
                where: {
                    username: dataArray[i],
                }
            })
            
            if(x) {
                io.emit('create-account', { message: "「"+dataArray[i]+"」はこの名前ですでに存在します。スキップしています..." })
                if(dataArray.length <= 1) {
                    checkUnique = true
                }
            } else {
                success = await scrapeAndStore(data.userId, dataArray[i])
                if(success) {
                    res.json({success: true})
                } else {
                    res.json({success: success})
                }
            }

        }
        console.log('finished.....')
        
        if(checkUnique) {
            res.json({success: success, unique: true})
        } 

    } else {
        res.json({success: false})
    }
    
    
})

// @desc GET X detail
// @route GET /X/:id/detail
// @access Private
const detailInsta = asyncHnadler( async (req, res) => {
    const data = req.params
    if(data?.id && data.id != null) {
        let x = await Insta.findOne({
            where: {
                id: data.id,
            },
            include: {
                model: InstaDetail,
            }
        })
        res.send(x)
    } else {
        res.send(null)
    }

})


module.exports = {
    indexInsta,
    storeInsta,
    detailInsta
}