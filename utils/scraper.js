// utils/scraper.js

/**
 * Required External Modules
 */
const moment = require('moment')
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

const BEAUTIFY = {
    "profile": async (data) => {

        if(data == null) {
            return null
        }

        const dumpData = {}
        dumpData.name = data?.name ? data.name:null
        dumpData.followers_count = data?.followers_count ? data.followers_count:0
        dumpData.followings_count = data?.friends_count ? data.friends_count:0
        dumpData.favourites_count = data?.favourites_count ? data.favourites_count:0
        dumpData.media_count = data?.media_count ? data.media_count:0
        dumpData.statuses_count = data?.statuses_count ? data.statuses_count:0
        dumpData.description = data?.description ? data.description:null
        dumpData.profile_banner_url = data?.profile_banner_url ? data.profile_banner_url:null
        dumpData.profile_image_url_https = data?.profile_image_url_https ? data.profile_image_url_https:null
        dumpData.created_at = data?.created_at ? moment(data.created_at, 'ddd MMM DD HH:mm:ss Z YYYY').format('DD-MM-YYYY'):null

        return dumpData

    }
}

const SCRAPER = {
    "puppeteer": {
        "getProfile": async (account) => {
            const browser = await puppeteer.launch({ headless: false })
            const page = await browser.newPage()
        
            await page.setRequestInterception(true)
        
            let userProfile = null

            page.on('request', request => {
                const url = request.url()
                if (url.includes('https://twitter.com/i/api/graphql/') && url.includes('/UserByScreenName')) {
                    // console.log('Intercepted Request URL:', url);
                }
                request.continue()
            });
        
            page.on('response', async (response) => {
                const url = response.url();
                
                // Check if the URL matches the desired pattern
                if (url.includes('https://twitter.com/i/api/graphql/') && url.includes('/UserByScreenName')) {
                  
                    // Check the response status
                    if (response.ok()) {
                    
                        try {
                            const data = await response.json()
                            if(data?.data?.user?.result?.legacy) {
                                userProfile = data?.data?.user?.result?.legacy
                            }
                            // Process the response data as needed
                        } catch (error) {
                            console.error('Error parsing response JSON:', error)
                        }
                    } else {
                        console.error('Response error (status code:', response.status(), ')')
                        // Handle response error (e.g., log, retry, etc.)
                    }
                }
            });
        
            await page.goto(`https://twitter.com/${account}`, { waitUntil: 'networkidle0'})
            await browser.close()

            // beautify data
            if(userProfile != null) {
                const data = BEAUTIFY.profile(userProfile)
                return data
            } else {
                return null
            }
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