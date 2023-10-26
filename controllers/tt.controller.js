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


const Tt = db.tt
const TtDetail = db.ttDetail


// @desc GET /
// @route GET /
// @access Private
const indexTt = asyncHnadler( async (req, res) => {
    // const {userId} = req.body

    // if(!userId) {
    //     res.status(400).send({ error: { required: 'Please add all fields' } })
    //     throw new Error('Please add all fields')
    // }
    const userId = 1
    let x = await Tt.findAll({ 
        where: {
            userId: userId
        },
        order: [
            ['id', 'DESC'],
        ],
        include: {
            model: TtDetail,
            order: [['id', 'DESC']], 
            limit: 1 
        }
    })

    res.json(x)
    
})

const scrapeAndStore = async (userId, account) => {
    return new Promise(async (resovle, reject) => {

        const io = global.io // Access io as a global variable
        io.emit('create-account-tt', { message: "「"+account+"」のデータの取得を開始します" })
        const dumpUserProfile = await SCRAPER.puppeteer.tt.getProfile(account)
        if(dumpUserProfile != null) {
            console.log('prepare for store')
            io.emit('create-account-tt', { message: "「"+account+"」: データをデータベースに保存する準備をする" })
                // store the profile
            const profileData = {
                userId: userId,
                uniqueId: account,
                avatar: dumpUserProfile.avatar,
            }

            const tt = await Tt.create(profileData)
            if(tt) {
                io.emit('create-account-tt', { message: "「"+account+"」: すべて完了！" })

                // store the followers
                const followerData = {
                    ttId: tt.id,
                    nickname: dumpUserProfile.nickname,
                    following: dumpUserProfile.followings_count,
                    followers: dumpUserProfile.followers_count,
                    friends: dumpUserProfile.friends_count,
                    likes_count: dumpUserProfile.likes_count,
                    media_count: dumpUserProfile.video_count,
                    description: dumpUserProfile.description,
                    biolink: dumpUserProfile.bioLink,
                }
    
                const ttDetail = await TtDetail.create(followerData)
                if(ttDetail) {
                    resovle(true)
                } else {
                    io.emit('create-account-tt', { message: "スキップされました:「"+account+"」のデータを取得できません" })
                    resovle(false)
                }

            } else {
                resovle(false)
            }

        } else {
            io.emit('create-account-tt', { message: "スキップされました:「"+account+"」のデータを取得できません" })
            resovle(false)
        }
    })
    
}

// @desc POST store Tt
// @route POST /tt/store
// @access Private
const storeTt = asyncHnadler( async (req, res) => {
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
                    key = key.replace('https://tiktok.com/', '').replace(/\s/g, '').replace(/@/g, '')
                    if(key != '') {
                        dataArray.push(key)
                    }
                    value = value.replace('https://tiktok.com/', '')
                    if(value != '') {
                        dataArray.push(value.replace(/\s/g, '').replace(/@/g, ''))
                    }
                } else {
                    value = value.replace('https://tiktok.com/', '')
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
                    dataArray.push(columns[0].replace('https://tiktok.com/', '').replace(/\s/g, '').replace(/@/g, ''));
                } else {
                    dataArray.push(columns.replace('https://tiktok.com/', '').replace(/\s/g, '').replace(/@/g, ''));
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
                io.emit('create-account-tt', { message: "「"+dataArray[i]+"」はこの名前ですでに存在します。スキップしています..." })
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

// @desc GET Tt detail
// @route GET /tt/:id/detail
// @access Private
const detailTt = asyncHnadler( async (req, res) => {
    const data = req.params
    if(data?.id && data.id != null) {
        let x = await Tt.findOne({
            where: {
                id: data.id,
            },
            include: {
                model: TtDetail,
            }
        })
        res.send(x)
    } else {
        res.send(null)
    }

})

// @desc DELETE Tt destroy
// @route DELETE /tt/:id/destroy
// @access Private
const destroyTt = asyncHnadler( async (req, res) => {
    const data = req.params
    if(data?.id && data.id != null) {
        const result = await Tt.destroy({
            where: {
                id: data.id
            }
        })
    
        if(result) {
            res.status(201).send({success: true})
        }else {
            res.status(400).send({ success: false })
            throw new Error('Invalid id')
        }
    } else {
        res.status(400).send({ success: false })
            throw new Error('Invalid id')
    }

})

// @desc POST refresh all accounts
// @route POST /tt/refresh
// @access Private
const refreshTt = asyncHnadler( async (req, res) => {

    const data = req.params
    const io = global.io // Access io as a global variable

    // get all accounts
    let x = []
    if(data?.account && data.account != null) {
        let dumpInsta = await Tt.findOne({
            where: {
                uniqueId: data.account,
            },
        })
        x.push(dumpInsta)
    } else {
        const userId = 1
        x = await Tt.findAll({ 
            where: {
                userId: userId
            },
            order: [
                ['id', 'DESC'],
            ],
        })
    }

    let success = true

    for (let index = 0; index < x.length; index++) {
        
        // get account data
        const follower = x[index]
        const account = follower.uniqueId
        const userProfile = await SCRAPER.playwright.tt.getProfile(account)
        console.log(userProfile)
        if(userProfile != null) {
            console.log('prepare for store')
            // update the data
            const profileData = {
                avatar: userProfile.avatar,
            }

            console.log('update')
            const ttUpdate = await Tt.update(profileData, {
                where: { id: follower.id },
            })
            if(ttUpdate) {

                // store the followers
                const followerData = {
                    ttId: follower.id,
                    nickname: userProfile.nickname,
                    following: userProfile.followings_count,
                    followers: userProfile.followers_count,
                    friends: userProfile.friends_count,
                    likes_count: userProfile.likes_count,
                    media_count: userProfile.video_count,
                    description: userProfile.description,
                    biolink: userProfile.bioLink,
                }

                const ttDetail = await TtDetail.create(followerData)
                if(ttDetail) {
                    const data = await Tt.findOne({
                        where: {
                            id: follower.id,
                        },
                        include: {
                            model: TtDetail,
                            order: [['id', 'DESC']], 
                            limit: 1 
                        }
                    })

                    console.log(data)
        
                    if(x) {
                        io.emit('refresh-account-tt', { updated: true, data: data})
                    }
                } else {
                    success = false
                }

            } else {
                success = false
            }
        } else {
            success = false
        }
    }

    console.log('all done')
    res.status(201).send({success: success})

})


module.exports = {
    indexTt,
    storeTt,
    detailTt,
    destroyTt,
    refreshTt
}