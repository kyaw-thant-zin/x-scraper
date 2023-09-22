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
// @access Private
const index = asyncHnadler( async (req, res) => {
    console.log('this is api index')    

    // puppeteer
    // await SCRAPER.puppeteer.getProfile();
    // await SCRAPER.playwright.getProfile();

    res.json('Test Scraping')
})

// @desc POST /
// @route POST /
// @access Private
const store = asyncHnadler( async (req, res) => {
    const data = req.body

    res.json(data)
})






module.exports = {
    index,
    store
}