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
        dumpData.created_at = data?.created_at ? moment(data.created_at, 'ddd MMM DD HH:mm:ss Z YYYY').format('YYYY/MM/DD'):null

        return dumpData

    }
}


let browserGlobal
let contextGlobal
let pageGlobal

const io = global.io // Access io as a global variable

const SCRAPER = {
    "puppeteer": {
        "getProfile": async (account, index, length) => {
            return new Promise(async (resovle, reject) => {
                console.log('index: '+index+' | length: '+length)
                io.emit('create-account', { message: "ページを開いている...." })
                console.log(account)

                // check the count of tab
                if (index !== 0 && index % 10 === 0) {
                    await browserGlobal.close()
                    browserGlobal = await puppeteer.launch({ 
                        headless: false,
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

                if(index == 0) {
                    browserGlobal = await puppeteer.launch({ 
                        headless: false,
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
                const page = await browserGlobal.newPage()

                io.emit('create-account', { message: "ページを開いている...." })
            
                await page.setRequestInterception(true)
            
                let userProfile = null

                page.on('request', request => {
                    const url = request.url()
                    request.continue()
                });
            
                page.on('response', async (response) => {
                    const url = response.url();
                    io.emit('create-account', { message: "リクエストを処理する...." })
                    // Check if the URL matches the desired pattern
                    if (url.includes('/UserByScreenName')) {
                    
                        // Check the response status
                        if (response.ok()) {
                            io.emit('create-account', { message: "プロフィールリクエストを受信しました...." })
                            try {
                                const data = await response.json()
                                if(data?.data?.user?.result?.legacy) {
                                    io.emit('create-account', { message: "プロフィールデータを取得しました...." })
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
            
                try {
                    io.emit('create-account', { message: "プロフィールページに行く...." })
                    await page.goto(`https://twitter.com/${account}`, { waitUntil: 'domcontentloaded'})
                } catch (error) {
                    resovle(null)
                }

                try {
                    console.log('wait for response')
                    await page.waitForResponse(response => response.url().includes('https://twitter.com/i/api/graphql/') && response.url().includes('/UserByScreenName'))
                    await page.waitForTimeout(3000);
                } catch (error) {
                    resovle(null)
                }

                if(index == length - 1) {
                    await browserGlobal.close()
                }

                // beautify data
                if(userProfile != null) {
                    const data = BEAUTIFY.profile(userProfile)
                    resovle(data)
                } else {
                    resovle(userProfile)
                }
            })


        },
        "getProfileRefresh": async (account, accountList, index) => {
            return new Promise(async (resovle, reject) => {
                console.log(account)

                // check the count of tab
                if (index !== 0 && index % 10 === 0) {
                    await browserGlobal.close()
                    browserGlobal = await puppeteer.launch({ 
                        headless: false,
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

                if(index == 0) {
                    browserGlobal = await puppeteer.launch({ 
                        headless: false,
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
                    if(url.includes('/UserByScreenName')) {
                        console.log(url)
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
            
                try {
                    await page.goto(`https://twitter.com/${account}`, { waitUntil: 'domcontentloaded'})
                } catch (error) {
                    resovle(null)
                }

                try {
                    console.log('wait for response')
                    await page.waitForResponse(response => response.url().includes('https://twitter.com/i/api/graphql/') && response.url().includes('/UserByScreenName'))
                    await page.waitForTimeout(3000);
                } catch (error) {
                    resovle(null)
                }
                
                if(index == accountList - 1) {
                    await browserGlobal.close()
                }

                // beautify data
                if(userProfile != null) {
                    const data = BEAUTIFY.profile(userProfile)
                    resovle(data)
                } else {
                    resovle(userProfile)
                }
            })
        }
    },
    "playwright": {
        "getProfile": async (account, index, length) => {
            return new Promise(async (resovle, reject) => {
                console.log('index: '+index+' | length: '+length)
                io.emit('create-account', { message: "ページを開いている...." })
                console.log(account)
                if(index == 0) {
                    browserGlobal = await firefox.launch(config.projects.find(project => project.name === 'Desktop Firefox').use)
                    contextGlobal = await browserGlobal.newContext()
                    pageGlobal = await contextGlobal.newPage()
                }
                let userProfile = null
                pageGlobal.on('response', async (response) => {
                    const url = response.url();
                    io.emit('create-account', { message: "リクエストを処理する...." })
                    if(url.includes('/UserByScreenName')) {
                        // console.log(url)
                    }
            
                    // Check if the URL matches the desired pattern
                    if (url.includes('https://twitter.com/i/api/graphql/') && url.includes('/UserByScreenName')) {
                        // Check the response status
                        if (response.ok()) {
                            io.emit('create-account', { message: "プロフィールリクエストを受信しました...." })
                            try {
                                const data = await response.json()
                                if(data?.data?.user?.result?.legacy) {
                                    io.emit('create-account', { message: "プロフィールデータを取得しました...." })
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
                
                io.emit('create-account', { message: "プロフィールページに行く...." })
                try {
                    console.log('go to page')
                    await pageGlobal.goto('https://twitter.com/'+account, { waitUntil: 'domcontentloaded' });
                } catch (error) {
                    resovle(null)
                }

                try {
                    console.log('wait for response')
                    await pageGlobal.waitForResponse(response => response.url().includes('https://twitter.com/i/api/graphql/') && response.url().includes('/UserByScreenName'))
                    await pageGlobal.waitForTimeout(3000);
                } catch (error) {
                    resovle(null)
                }

                console.log('passed')

                if(index == length - 1) {
                    await browserGlobal.close()
                }


                // beautify data
                if(userProfile != null) {
                    const data = BEAUTIFY.profile(userProfile)
                    resovle(data)
                } else {
                    resovle(userProfile)
                }
            })
        },
        "getProfileRefresh": async (account, accountList, index) => {
            return new Promise(async (resovle, reject) => {
                console.log(account)
                if(index == 0) {
                    browserGlobal = await firefox.launch(config.projects.find(project => project.name === 'Desktop Firefox').use)
                    contextGlobal = await browserGlobal.newContext()
                    pageGlobal = await contextGlobal.newPage()
                }

                let userProfile = null

            
                pageGlobal.on('response', async (response) => {
                    const url = response.url();

                    if(url.includes('/UserByScreenName')) {
                        console.log(url)
                    }
            
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


                try {
                    await pageGlobal.goto('https://twitter.com/'+account, { waitUntil: 'domcontentloaded' });
                } catch (error) {
                    resovle(null)
                }

                try {
                    console.log('wait for response')
                    await pageGlobal.waitForResponse(response => response.url().includes('https://twitter.com/i/api/graphql/') && response.url().includes('/UserByScreenName'))
                    await pageGlobal.waitForTimeout(3000);
                } catch (error) {
                    resovle(null)
                }
                
                if(index == accountList - 1) {
                    await browserGlobal.close()
                }

                // beautify data
                if(userProfile != null) {
                    const data = BEAUTIFY.profile(userProfile)
                    resovle(data)
                } else {
                    resovle(userProfile)
                }
            })
        }
    }
}

module.exports = {
    SCRAPER,
    convertToNumber
}