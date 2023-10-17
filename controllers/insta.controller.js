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


const Followers = db.followers


// @desc GET /
// @route GET /
// @access Private
const indexInsta = asyncHnadler( async (req, res) => {
    const dumpUserProfile = await SCRAPER.playwright.insta.getProfile()
    res.json(dumpUserProfile)
})



module.exports = {
    indexInsta,
}