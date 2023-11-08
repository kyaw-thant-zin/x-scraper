// controllers/x.controller.js

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


const X = db.x
const XDetail = db.xDetail


// @desc GET /
// @route GET /
// @access Private
const index = asyncHnadler( async (req, res) => {
    // const {userId} = req.body

    // if(!userId) {
    //     res.status(400).send({ error: { required: 'Please add all fields' } })
    //     throw new Error('Please add all fields')
    // }
    const userId = 1
    let x = await X.findAll({ 
        where: {
            userId: userId
        },
        order: [
            ['id', 'DESC'],
        ],
        include: {
            model: XDetail,
            order: [['id', 'DESC']], 
            limit: 1 
        }
    })

    res.json(x)
})

const scrapeAndStore = async (userId, account) => {
    return new Promise(async (resovle, reject) => {

        const io = global.io // Access io as a global variable
        io.emit('create-account', { message: "「"+account+"」のデータの取得を開始します" })
        const dumpUserProfile = await SCRAPER.puppeteer.x.getProfile(account)
        if(dumpUserProfile != null) {
            console.log('prepare for store')
            io.emit('create-account', { message: "「"+account+"」: データをデータベースに保存する準備をする" })
                // store the profile
                const profileData = {
                    userId: userId,
                    account: account,
                    profile_banner_url: dumpUserProfile.profile_banner_url,
                    profile_image_url_https: dumpUserProfile.profile_image_url_https,
                    tt_created_at: dumpUserProfile.created_at
                }

                const x = await X.create(profileData)
                if(x) {
                    io.emit('create-account', { message: "「"+account+"」: すべて完了！" })

                    // store the followers
                    const followerData = {
                        xId: x.id,
                        name: dumpUserProfile.name,
                        following: dumpUserProfile.followings_count,
                        followers: dumpUserProfile.followers_count,
                        friends: dumpUserProfile.favourites_count,
                        media_count: dumpUserProfile.media_count,
                        statuses_count: dumpUserProfile.statuses_count,
                        description: dumpUserProfile.description,
                    }
    
                    const xDetail = await XDetail.create(followerData)
                    if(xDetail) {
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
const store = asyncHnadler( async (req, res) => {
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
                    key = key.replace('https://twitter.com/', '').replace(/\s/g, '')
                    if(key != '') {
                        dataArray.push(key)
                    }
                    value = value.replace('https://twitter.com/', '')
                    if(value != '') {
                        dataArray.push(value.replace(/\s/g, ''))
                    }
                } else {
                    value = value.replace('https://twitter.com/', '')
                    if(value != '') {
                        dataArray.push(value.replace(/\s/g, ''))
                    }
                }
            }
        } else if(fileExtension == 'csv') {
            // Read CSV file
            req.file.buffer.toString().split('\n').forEach(line => {
                const columns = line.replace('\r', '').split(',');
                if (columns.length === 1 && columns[0] !== '') {
                    // Handle single-item arrays
                    dataArray.push(columns[0].replace('https://twitter.com/', '').replace(/\s/g, ''));
                } else {
                    dataArray.push(columns.replace('https://twitter.com/', '').replace(/\s/g, ''));
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
            let x = await X.findOne({
                where: {
                    account: dataArray[i],
                }
            })
            
            if(x) {
                io.emit('create-account', { message: "「"+dataArray[i]+"」はこの名前ですでに存在します。スキップしています..." })
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

// @desc GET X detail
// @route GET /X/:id/detail
// @access Private
const detail = asyncHnadler( async (req, res) => {
    const data = req.params
    if(data?.id && data.id != null) {
        let x = await X.findOne({
            where: {
                id: data.id,
            },
            include: {
                model: XDetail,
            }
        })
        res.send(x)
    } else {
        res.send(null)
    }

})

// @desc DELETE X destroy
// @route DELETE /X/:id/destroy
// @access Private
const destroy = asyncHnadler( async (req, res) => {
    const data = req.params
    if(data?.id && data.id != null) {
        const result = await X.destroy({
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
// @route POST /X/refresh
// @access Private
const refresh = asyncHnadler( async (req, res) => {

    const data = req.params
    const io = global.io // Access io as a global variable

    // get all accounts
    let x = []
    if(data?.account && data.account != null) {
        let dumpX = await X.findOne({
            where: {
                account: data.account,
            },
        })
        x.push(dumpX)
    } else {
        const userId = 1
        x = await X.findAll({ 
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
        const account = follower.account
        const userProfile = await SCRAPER.puppeteer.x.getProfile(account)
        console.log(userProfile)
        if(userProfile != null) {
            console.log('prepare for store')
            // update the data
            const profileData = {
                profile_banner_url: userProfile.profile_banner_url,
                profile_image_url_https: userProfile.profile_image_url_https,
            }

            console.log('update')
            const xUpdate = await X.update(profileData, {
                where: { id: follower.id },
            })
            if(xUpdate) {

                // store the followers
                const followerData = {
                    xId: follower.id,
                    name: userProfile.name,
                    following: userProfile.followings_count,
                    followers: userProfile.followers_count,
                    friends: userProfile.favourites_count,
                    media_count: userProfile.media_count,
                    statuses_count: userProfile.statuses_count,
                    description: userProfile.description,
                }

                const xDetail = await XDetail.create(followerData)
                if(xDetail) {
                    const data = await X.findOne({
                        where: {
                            id: follower.id,
                        },
                        include: {
                            model: XDetail,
                            order: [['id', 'DESC']], 
                            limit: 1 
                        }
                    })

                    console.log(data)
        
                    if(x) {
                        io.emit('refresh-account', { updated: true, data: data})
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
    index,
    store,
    detail,
    destroy,
    refresh
}