// controllers/followers.controller.js

/**
 * Required External Modules
 */
const express = require("express")
const { chromium, firefox, devices } = require('playwright')
const asyncHnadler = require('express-async-handler')


/**
 * Required Internal Modules
 */
const config = require("../playwright.config")

// @desc GET /
// @route GET /
// @access Public
const index = asyncHnadler( async (req, res) => {
    console.log('this is api index')    
    const browser = await firefox.launch(config.projects.find(project => project.name === 'Desktop Firefox').use)
    const context = await browser.newContext()
    const page = await context.newPage()

    // Enable request interception
    await context.route('**/*', (route) => {
        const request = route.request();
        const url = request.url();
        
        // Block CSS, image, and font requests
        if (url.endsWith('.css') || url.endsWith('.jpg') || url.endsWith('.png') || url.endsWith('.svg') || url.endsWith('.woff2')) {
        route.abort('aborted');
        } else {
        route.continue();
        }
    });

    const URLS = [
        'LITMOON_JPN',
        'KariMen_idol',
        'Bellflora_beast',
        'uugirlsofficial',
        'uug2official'
    ]

    const f = []
      
    for (let i = 0; i < URLS.length; i++) {
        const url = URLS[i];
        await page.goto('https://twitter.com/'+url, { waitUntil: 'load' });
        // following
        const followings = await page.waitForSelector(`a[href="/${url}/following"]`);
        let followingCount = 0
        if (followings) {
            const innerText = await followings.innerText();
            if(innerText != null && innerText != undefined) {
                followingCount = convertToNumber(innerText.replace(' Following', ''))
                console.log(url+' - '+followingCount+' Following')
            }
        } else {
            console.log(`No element found for URL: ${url}`);
        }

        console.log('---------------------------')

        // follower
        let followerCount = 0
        const followers = await page.waitForSelector(`a[href="/${url}/verified_followers"]`);
        if (followers) {
            const innerText = await followers.innerText();
            if(innerText != null && innerText != undefined) {
                followerCount = convertToNumber(innerText.replace(' Followers', ''))
                console.log(url+' - '+followerCount + ' Followers')
            }
        } else {
            console.log(`No element found for URL: ${url}`);
        }

        console.log('---------------------------')

        await page.screenshot({ path: `example${i + 1}.png` });

        f.push({
            'user': url,
            'Following': followingCount,
            'Followers': followerCount
        })

    }

    // await page.goto('https://twitter.com/LITMOON_JPN')
    // await page.screenshot({ path: 'example.png' })

    await browser.close()

    const formattedData = JSON.stringify(f, null, 2)
    res.send('<pre>'+formattedData+'</pre>')
})

function convertToNumber(str) {
    // Remove commas and convert K, M, B to corresponding multipliers
    const cleanedStr = str.replace(/,/g, '').replace(/K/g, 'e3').replace(/M/g, 'e6').replace(/B/g, 'e9');
    
    // Parse the cleaned string to a number
    const number = parseFloat(cleanedStr);
    
    return isNaN(number) ? null : number;
}


module.exports = {
    index,
}