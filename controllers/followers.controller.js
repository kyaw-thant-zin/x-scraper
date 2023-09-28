// controllers/followers.controller.js

/**
 * Required External Modules
 */
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

// @desc POST store followers
// @route POST /followers/store
// @access Private
const store = asyncHnadler( async (req, res) => {
    const data = req.body
    let userProfile = null
    if((data?.account && data.account != null) && (data?.userId && data.userId != null)) {
        userProfile = await SCRAPER.playwright.getProfile(data.account)
        if(userProfile != null) {
            // store the data
            const followerData = {
                userId: data.userId,
                account: data.account,
                following: userProfile.followings_count,
                followers: userProfile.followers_count,
                friends: userProfile.favourites_count,
                media_count: userProfile.media_count,
                name: userProfile.name,
                profile_banner_url: userProfile.profile_banner_url,
                profile_image_url_https: userProfile.profile_image_url_https,
                statuses_count: userProfile.statuses_count,
                description: userProfile.description,
                tt_created_at: userProfile.created_at
            }

            console.log(followerData)

            const follower = await Followers.create(followerData).then(followers => {
                return followers.get({ plain: true })
            })

            if(follower) {
                res.status(201).send({success: true})
            } else {
                res.json({success: false})
            }
        } else {
            res.json({success: false})
        }
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
        if(userProfile != null) {

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