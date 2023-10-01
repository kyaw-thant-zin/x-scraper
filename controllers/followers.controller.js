// controllers/followers.controller.js

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


const Followers = db.followers


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
    let followers = await Followers.findAll({ 
        where: {
            userId: userId
        },
        order: [
            ['id', 'DESC'],
        ],
    })

    res.json(followers)
})

const scrapeAndStore = async (data, account , index, length) => {
    return new Promise(async (resovle, reject) => {

        const io = global.io // Access io as a global variable
        io.emit('create-account', { message: "「"+account+"」のデータの取得を開始します" })
        const dumpUserProfile = await SCRAPER.puppeteer.getProfile(account, index, length)
        if(dumpUserProfile != null) {
            console.log('prepare for store')
            io.emit('create-account', { message: "「"+account+"」: データをデータベースに保存する準備をする" })
                // store the data
                const followerData = {
                    userId: data.userId,
                    account: account,
                    following: dumpUserProfile.followings_count,
                    followers: dumpUserProfile.followers_count,
                    friends: dumpUserProfile.favourites_count,
                    media_count: dumpUserProfile.media_count,
                    name: dumpUserProfile.name,
                    profile_banner_url: dumpUserProfile.profile_banner_url,
                    profile_image_url_https: dumpUserProfile.profile_image_url_https,
                    statuses_count: dumpUserProfile.statuses_count,
                    description: dumpUserProfile.description,
                    tt_created_at: dumpUserProfile.created_at
                }

                console.log('store: '+account)
                const follower = await Followers.create(followerData)
                if(follower) {
                    io.emit('create-account', { message: "「"+account+"」: すべて完了！" })
                    resovle(true)
                } else {
                    resovle(false)
                }

            } else {
                io.emit('create-account', { message: "スキップされました:「"+account+"」のデータを取得できません" })
                resovle(false)
            }
    })
    
}

// @desc POST store followers
// @route POST /followers/store
// @access Private
const store = asyncHnadler( async (req, res) => {
    const data = req.body
    const file = req.file

    let dataArray = []

    if(!file) {
        
        if((data?.account && data.account != null) && (data?.userId && data.userId != null)) {
    
            dataArray = data.account.includes(',') ? data.account.split(',') : [data.account]

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
                    key = key.replace('https://twitter.com/', '')
                    if(key != '') {
                        dataArray.push(key)
                    }
                    value = value.replace('https://twitter.com/', '')
                    if(value != '') {
                        dataArray.push(value)
                    }
                } else {
                    value = value.replace('https://twitter.com/', '')
                    if(value != '') {
                        dataArray.push(value)
                    }
                }
            }
        } else if(fileExtension == 'csv') {
            // Read CSV file
            req.file.buffer.toString().split('\n').forEach(line => {
                const columns = line.replace('\r', '').split(',');
                if (columns.length === 1 && columns[0] !== '') {
                    // Handle single-item arrays
                    dataArray.push(columns[0].replace('https://twitter.com/', ''));
                } else {
                    dataArray.push(columns.replace('https://twitter.com/', ''));
                }
            });

        }else {
            res.json({success: false})
        }
    }

    console.log(dataArray)

    if(Array.isArray(dataArray) && dataArray.length > 0) {
    
        for(let i = 0; i < dataArray.length; i++) {
            await scrapeAndStore(data, dataArray[i], i, dataArray.length)
        }
        console.log('finished.....')
        res.json({success: true})

    } else {
        res.json({success: false})
    }
    
    
})

// @desc GET followers detail
// @route GET /followers/:id/detail
// @access Private
const detail = asyncHnadler( async (req, res) => {
    const data = req.params
    if(data?.id && data.id != null) {
        let follower = await Followers.findOne({
            where: {
                id: data.id,
            }
        })
        res.send(follower)
    } else {
        res.send(null)
    }

})

// @desc DELETE followers destroy
// @route DELETE /followers/:id/destroy
// @access Private
const destroy = asyncHnadler( async (req, res) => {
    const data = req.params
    if(data?.id && data.id != null) {
        const result = await Followers.destroy({
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
// @route POST /followers/refresh
// @access Private
const refresh = asyncHnadler( async (req, res) => {

    // get the data and do not close browser but update the data first and then fetch the new 

    const io = global.io // Access io as a global variable

    // get all accounts
    const userId = 1
    let followers = await Followers.findAll({ 
        where: {
            userId: userId
        },
        order: [
            ['id', 'DESC'],
        ],
    })

    let success = true

    for (let index = 0; index < followers.length; index++) {
        
        // get account data
        const follower = followers[index]
        const account = follower.account
        const userProfile = await SCRAPER.puppeteer.getProfileRefresh(account, followers.length, index)
        console.log(userProfile)
        if(userProfile != null) {
            console.log('prepare for store')
            // update the data
            const followerData = {
                following: userProfile.followings_count,
                followers: userProfile.followers_count,
                friends: userProfile.favourites_count,
                media_count: userProfile.media_count,
                name: userProfile.name,
                profile_banner_url: userProfile.profile_banner_url,
                profile_image_url_https: userProfile.profile_image_url_https,
                statuses_count: userProfile.statuses_count,
                description: userProfile.description,
            }
            console.log('update')
            const f = await Followers.update(followerData, {
                where: { id: follower.id },
            })
            

            const data = await Followers.findOne({
                where: {
                    id: follower.id,
                }
            })

            if(f) {
                io.emit('refresh-account', { updated: true, data: data})
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