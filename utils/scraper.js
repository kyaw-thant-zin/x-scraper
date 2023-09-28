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


let browserGlobal
let contextGlobal

const SCRAPER = {
    "puppeteer": {
        "getProfile": async (account) => {
            const browser = await puppeteer.launch({ 
                headless: true,
                defaultViewport: { width: 1366, height: 768 },
                args: [
                    '--disable-dev-shm-usage', // Disable shared memory usage
                    '--no-sandbox', // Disable sandboxing for Linux
                    '--disable-gpu',
                    '--disable-features=site-per-process'
                ],
                ignoreHTTPSErrors: true
            })
            const page = await browser.newPage()
        
            await page.setRequestInterception(true)
        
            let userProfile = null

            page.on('request', request => {
                const url = request.url()
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
                return userProfile
            }
        },
        "getProfileRefresh": async (account, accountList, index) => {
            if(index == 0) {
                browserGlobal = await puppeteer.launch({ 
                    headless: true,
                    defaultViewport: { width: 1366, height: 768 },
                    args: [
                        '--disable-dev-shm-usage', // Disable shared memory usage
                        '--no-sandbox', // Disable sandboxing for Linux
                        '--disable-gpu',
                        '--disable-features=site-per-process'
                    ],
                    ignoreHTTPSErrors: true
                })
            }

            let userProfile = null

            const page = await browserGlobal.newPage()
            await page.setRequestInterception(true)
        
            page.on('request', request => {
                const url = request.url()
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
                    }
                }
            });
        
            await page.goto(`https://twitter.com/${account}`, { waitUntil: 'networkidle0'})
            
            if(index == accountList - 1) {
                await browserGlobal.close()
            }

            // beautify data
            if(userProfile != null) {
                const data = BEAUTIFY.profile(userProfile)
                return data
            } else {
                return userProfile
            }
        }
    },
    "playwright": {
        "getProfile": async (account) => {
            const browser = await firefox.launch(config.projects.find(project => project.name === 'Desktop Firefox Refresh').use)
            const context = await browser.newContext()
            const page = await context.newPage()
        
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
                    }    
                }
            });
            await page.goto('https://twitter.com/'+account, { waitUntil: 'load' });
            await browser.close()


            // beautify data
            if(userProfile != null) {
                const data = BEAUTIFY.profile(userProfile)
                return data
            } else {
                return userProfile
            }
        },
        "getProfileRefresh": async (account, accountList, index) => {
            if(index == 0) {
                browserGlobal = await firefox.launch(config.projects.find(project => project.name === 'Desktop Firefox').use)
                contextGlobal = await browserGlobal.newContext()
            }

            let userProfile = null

            const page = await contextGlobal.newPage()
        
            page.on('response', async (response) => {
                const url = response.url();
        
                // Check if the URL matches the desired pattern
                if (url.includes('https://twitter.com/i/api/graphql/') && url.includes('/UserByScreenName')) {

                    console.log('detect url')
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
                    }    
                }
            });
            await page.goto('https://twitter.com/'+account, { waitUntil: 'load' });
            
            if(index == accountList - 1) {
                await browserGlobal.close()
            }

            // beautify data
            if(userProfile != null) {
                const data = BEAUTIFY.profile(userProfile)
                return data
            } else {
                return userProfile
            }
        }
    }
}

module.exports = {
    SCRAPER,
    convertToNumber
}