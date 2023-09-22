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

// @desc GET /
// @route GET /
// @access Public
const index = asyncHnadler( async (req, res) => {
    console.log('this is api index')    

    // puppeteer
    await SCRAPER.puppeteer.getProfile();
    // await SCRAPER.playwright.getProfile();

    res.send('Test Scraping')
})






module.exports = {
    index,
}