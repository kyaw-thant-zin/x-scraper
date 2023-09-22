// utils/scraper.js

/**
 * Required External Modules
 */
const { firefox } = require('playwright')
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const asyncHnadler = require('express-async-handler')

puppeteer.use(StealthPlugin())

/**
 * Required Internal Modules
 */
const config = require("../playwright.config")

/**
 * Scrpaing Functions
 */
const convertToNumber = (str) => {
    // Remove commas and convert K, M, B to corresponding multipliers
    const cleanedStr = str.replace(/,/g, '').replace(/K/g, 'e3').replace(/M/g, 'e6').replace(/B/g, 'e9');
    
    // Parse the cleaned string to a number
    const number = parseFloat(cleanedStr);
    
    return isNaN(number) ? null : number;
}

const SCRAPER = {
    "puppeteer": {
        "getProfile": async () => {
            const browser = await puppeteer.launch({ headless: false })
            const page = await browser.newPage()
        
            await page.setRequestInterception(true)
        
            page.on('request', request => {
        
                const url = request.url()
                if (url.includes('https://twitter.com/i/api/graphql/') && url.includes('/UserByScreenName')) {
                    console.log('Intercepted Request URL:', url);
                }
        
                request.continue();
            });
        
            page.on('response', async (response) => {
                const url = response.url();
        
                // Check if the URL matches the desired pattern
                if (url.includes('https://twitter.com/i/api/graphql/') && url.includes('/UserByScreenName')) {
                    console.log('Intercepted Request URL:', url);
                    const data = await response.text()
                    console.log(data);
                    // Capture the response
                    // const response = await request.response();
                    // const responseData = await response.json();
                    // console.log('Response:', responseData);
                }
            });
        
            await page.goto('https://twitter.com/LITMOON_JPN', { waitUntil: 'networkidle0'})
            await page.screenshot({ path: 'testresult.png', fullPage: true })
            await browser.close()
            console.log(`All done, check the screenshot. ✨`)
        }
    },
    "playwright": {
        "getProfile": async () => {
            const browser = await firefox.launch(config.projects.find(project => project.name === 'Desktop Firefox').use)
            const context = await browser.newContext()
            const page = await context.newPage()
        
            // page.on('request', request => {
            //     console.log('>>', request.method(), request.url())
            // });
            page.on('response', async (response) => {
                const url = response.url();
        
                // Check if the URL matches the desired pattern
                if (url.includes('https://twitter.com/i/api/graphql/') && url.includes('/UserByScreenName')) {
                    console.log('Intercepted Request URL:', url);
                    const data = await response.json()
                    console.log(data);
                }
                // console.log('<<', response.status(), response.url())
            });
        
            const URLS = [
                'LITMOON_JPN',
                'KariMen_idol',
                'Bellflora_beast',
                'uugirlsofficial',
                'uug2official'
            ]
            await page.goto('https://twitter.com/'+'LITMOON_JPN', { waitUntil: 'load' });
        
            // const f = []
              
            // for (let i = 0; i < URLS.length; i++) {
            //     const url = URLS[i];
            //     await page.goto('https://twitter.com/'+url, { waitUntil: 'load' });
            //     // following
            //     const followings = await page.waitForSelector(`a[href="/${url}/following"]`);
            //     let followingCount = 0
            //     if (followings) {
            //         const innerText = await followings.innerText();
            //         if(innerText != null && innerText != undefined) {
            //             followingCount = convertToNumber(innerText.replace(' Following', ''))
            //             console.log(url+' - '+followingCount+' Following')
            //         }
            //     } else {
            //         console.log(`No element found for URL: ${url}`);
            //     }
        
            //     console.log('---------------------------')
        
            //     // follower
            //     let followerCount = 0
            //     const followers = await page.waitForSelector(`a[href="/${url}/verified_followers"]`);
            //     if (followers) {
            //         const innerText = await followers.innerText();
            //         if(innerText != null && innerText != undefined) {
            //             followerCount = convertToNumber(innerText.replace(' Followers', ''))
            //             console.log(url+' - '+followerCount + ' Followers')
            //         }
            //     } else {
            //         console.log(`No element found for URL: ${url}`);
            //     }
        
            //     console.log('---------------------------')
        
            //     await page.screenshot({ path: `example${i + 1}.png` });
        
            //     f.push({
            //         'user': url,
            //         'Following': followingCount,
            //         'Followers': followerCount
            //     })
        
            // }
        
            // // await page.goto('https://twitter.com/LITMOON_JPN')
            // // await page.screenshot({ path: 'example.png' })
        
            await browser.close()
        
            // const formattedData = JSON.stringify(f, null, 2)
        }
    }
}

module.exports = {
    SCRAPER,
    convertToNumber
}