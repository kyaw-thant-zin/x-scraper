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
    "x": {
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
    
        },
    },
    "insta": {
        "profile": async (data) => {
            if(data == null) {
                return null
            }

            const dumpData = {}
            dumpData.insta_id = data.id
            dumpData.fbid = data.fbid
            dumpData.username = data.username
            dumpData.full_name = data.full_name
            dumpData.followers_count = data.edge_followed_by.count
            dumpData.followings_count = data.edge_follow.count
            dumpData.media_count = data.edge_owner_to_timeline_media.count
            dumpData.description = data.biography
            dumpData.profile_image_url = data.profile_pic_url_hd

            return dumpData
        }
    },
    "tt": {
        'profile': async (data) => {
            if(data == null) {
                return null
            }

            const dumpData = {}
            dumpData.ttid = data.user.id
            dumpData.uniqueId = data.user.uniqueId
            dumpData.nickname = data.user.nickname
            dumpData.followers_count = data.stats.followerCount
            dumpData.followings_count = data.stats.followingCount
            dumpData.friends_count = data.stats.friendCount
            dumpData.heart_count = data.stats.heartCount
            dumpData.video_count = data.stats.videoCount
            dumpData.avatar = data.user.avatarLarger
            dumpData.description = data.user.signature

            return dumpData

        }
    }
}


let browserGlobal
let contextGlobal
let pageGlobal

const io = global.io // Access io as a global variable

const SCRAPER = {
    "puppeteer": {
        "x": {
            "getProfile": async (account) => {
                return new Promise(async (resovle, reject) => {
                    io.emit('create-account', { message: "「"+account+"」: ページを開いている...." })
                    console.log(account)
    
                    const browserGlobal = await puppeteer.launch({ 
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
                    const page = await browserGlobal.newPage()
    
                    io.emit('create-account', { message: "「"+account+"」: ページを開いている...." })
                
                    await page.setRequestInterception(true)
                
                    let userProfile = null
    
                    page.on('request', request => {
                        const url = request.url()
                        request.continue()
                    });
                
                    page.on('response', async (response) => {
                        const url = response.url();
                        io.emit('create-account', { message: "「"+account+"」: リクエストを処理する...." })
                        // Check if the URL matches the desired pattern
                        if (url.includes('/UserByScreenName')) {
                        
                            // Check the response status
                            if (response.ok()) {
                                io.emit('create-account', { message: "「"+account+"」: プロフィールリクエストを受信しました...." })
                                try {
                                    const data = await response.json()
                                    if(data?.data?.user?.result?.legacy) {
                                        console.log('got data')
                                        io.emit('create-account', { message: "「"+account+"」: プロフィールデータを取得しました...." })
                                        userProfile = data?.data?.user?.result?.legacy
                                    }
                                    // Process the response data as needed
                                } catch (error) {
                                    console.error('Error parsing response JSON:')
                                }
                            } else {
                                console.error('Response error (status code:', response.status(), ')')
                            }
                        }
                    });
                
                    try {
                        io.emit('create-account', { message: "「"+account+"」: プロフィールページに行く...." })
                        await page.goto(`https://twitter.com/${account}`, { waitUntil: 'domcontentloaded'})
                    } catch (error) {
                        resovle(null)
                    }
    
                    try {
                        console.log('wait for response')
                        await page.waitForResponse(response => response.url().includes('/UserByScreenName'))
                        await page.waitForTimeout(3000);
                    } catch (error) {
                        resovle(null)
                    }
    
                    await browserGlobal.close()
    
                    // beautify data
                    if(userProfile != null) {
                        console.log('All done!-------')
                        const data = BEAUTIFY.x.profile(userProfile)
                        console.log(data)
                        resovle(data)
                    } else {
                        resovle(userProfile)
                    }
                })
    
    
            }
        },
        "insta": {
            "getProfile": async (account) => {
                return new Promise(async (resovle, reject) => {
                    console.log(account)
                    const browserGlobal = await puppeteer.launch({ 
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
                    const page = await browserGlobal.newPage()
                    await page.setRequestInterception(true)
                    page.on('request', request => {
                        const url = request.url()
                        request.continue()
                    });

                    let userProfile = null
                    page.on('response', async (response) => {
                        const url = response.url();
                        // Check if the URL matches the desired pattern
                        if (url.includes('https://www.instagram.com/api/v1/users/web_profile_info/?username')) {
                        
                            // Check the response status
                            if (response.ok()) {
                                try {
                                    const res = await response.json()
                                    if(res?.data?.user) {
                                        userProfile = res.data.user
                                    }
                                } catch (error) {
                                    console.error('Error parsing response JSON:')
                                }
                            } else {
                                console.error('Response error (status code:', response.status(), ')')
                            }
                        }
                    });
                
                    try {
                        console.log('go to page')
                        await page.goto(`https://www.instagram.com/${account}/`, { waitUntil: 'domcontentloaded'})
                    } catch (error) {
                        resovle(null)
                    }
    
                    try {
                        console.log('wait for response')
                        await page.waitForResponse(response => response.url().includes('https://www.instagram.com/api/v1/users/web_profile_info/?username'))
                        await page.waitForTimeout(3000);
                    } catch (error) {
                        resovle(null)
                    }

                    await browserGlobal.close()

                    // beautify data
                    if(userProfile != null) {
                        console.log('all done')
                        const data = BEAUTIFY.insta.profile(userProfile)
                        resovle(data)
                    } else {
                        resovle(userProfile)
                    }
                })
            }
        },
        "tt": {
            "getProfile": async (account) => {
                return new Promise(async (resovle, reject) => {
                    console.log(account)
                    const browserGlobal = await puppeteer.launch({ 
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
                    const page = await browserGlobal.newPage()
                    await page.setRequestInterception(true)
                    page.on('request', request => {
                        const url = request.url()
                        request.continue()
                    });

                    let userProfile = null
                    page.on('response', async (response) => {
                        const url = response.url();
                        // Check if the URL matches the desired pattern
                        if (url.includes('https://www.tiktok.com/api/user/detail')) {
                        
                            // Check the response status
                            if (response.ok()) {
                                try {
                                    const res = await response.json()
                                    if(res?.userInfo) {
                                        userProfile = res.userInfo
                                    }
                                } catch (error) {
                                    console.error('Error parsing response JSON:')
                                }
                            } else {
                                console.error('Response error (status code:', response.status(), ')')
                            }
                        }
                    });
                
                    try {
                        console.log('go to page')
                        await page.goto(`https://www.tiktok.com/${account}`, { waitUntil: 'domcontentloaded'})
                    } catch (error) {
                        resovle(null)
                    }
    
                    try {
                        console.log('wait for response')
                        await page.waitForResponse(response => response.url().includes('https://www.tiktok.com/api/user/detail'))
                        await page.waitForTimeout(3000);
                    } catch (error) {
                        resovle(null)
                    }

                    await browserGlobal.close()

                    // beautify data
                    if(userProfile != null) {
                        console.log('all done')
                        const data = BEAUTIFY.tt.profile(userProfile)
                        resovle(data)
                    } else {
                        resovle(userProfile)
                    }
                })
            }
        }
    },
    "playwright": {
        "x": {
            "getProfile": async (account) => {
                return new Promise(async (resovle, reject) => {
                    io.emit('create-account', { message: "「"+account+"」: ページを開いている...." })
                    console.log(account)
                    const browserGlobal = await firefox.launch(config.projects.find(project => project.name === 'Desktop Firefox').use)
                    const contextGlobal = await browserGlobal.newContext()
                    const pageGlobal = await contextGlobal.newPage()
                    let userProfile = null
                    pageGlobal.on('response', async (response) => {
                        const url = response.url();
                        io.emit('create-account', { message: "「"+account+"」: リクエストを処理する...." })
                        if(url.includes('/UserByScreenName')) {
                            // console.log(url)
                        }
                
                        // Check if the URL matches the desired pattern
                        if ( url.includes('/UserByScreenName')) {
                            // Check the response status
                            if (response.ok()) {
                                io.emit('create-account', { message: "「"+account+"」: プロフィールリクエストを受信しました...." })
                                try {
                                    const data = await response.json()
                                    if(data?.data?.user?.result?.legacy) {
                                        io.emit('create-account', { message: "「"+account+"」: プロフィールデータを取得しました...." })
                                        userProfile = data?.data?.user?.result?.legacy
                                        console.log('got data : ')
                                        console.log(userProfile)
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
                    
                    io.emit('create-account', { message: "「"+account+"」: プロフィールページに行く...." })
                    try {
                        console.log('go to page')
                        await pageGlobal.goto('https://twitter.com/'+account, { waitUntil: 'domcontentloaded' });
                    } catch (error) {
                        resovle(null)
                    }
    
                    try {
                        console.log('wait for response')
                        await pageGlobal.waitForResponse(response =>  response.url().includes('/UserByScreenName'))
                        await pageGlobal.waitForTimeout(3000);
                    } catch (error) {
                        resovle(null)
                    }
    
                    console.log('passed')
    
                    await browserGlobal.close()
    
    
                    // beautify data
                    if(userProfile != null) {
                        const data = BEAUTIFY.x.profile(userProfile)
                        console.log(data)
                        resovle(data)
                    } else {
                        resovle(userProfile)
                    }
                })
            },
        },
        "insta": {
            "getProfile": async (account) => {
                return new Promise(async (resovle, reject) => {
                    console.log(account)
                    const browserGlobal = await firefox.launch(config.projects.find(project => project.name === 'Desktop Firefox').use)
                    const contextGlobal = await browserGlobal.newContext()
                    const pageGlobal = await contextGlobal.newPage()

                    let userProfile = null
                    pageGlobal.on('response', async (response) => {
                        const url = response.url();
                        // Check if the URL matches the desired pattern
                        if (url.includes('https://www.instagram.com/api/v1/users/web_profile_info/?username')) {
                        
                            // Check the response status
                            if (response.ok()) {
                                try {
                                    const res = await response.json()
                                    if(res?.data?.user) {
                                        userProfile = res.data.user
                                    }
                                } catch (error) {
                                    console.error('Error parsing response JSON:')
                                }
                            } else {
                                console.error('Response error (status code:', response.status(), ')')
                            }
                        }
                    });

                    try {
                        console.log('go to page')
                        await pageGlobal.goto(`https://www.instagram.com/${account}/`, { waitUntil: 'domcontentloaded' });
                    } catch (error) {
                        resovle(null)
                    }
    
                    try {
                        console.log('wait for response')
                        await pageGlobal.waitForResponse(response =>  response.url().includes('https://www.instagram.com/api/v1/users/web_profile_info/?username'))
                        await pageGlobal.waitForTimeout(3000);
                    } catch (error) {
                        resovle(null)
                    }

                    await browserGlobal.close()

                    // beautify data
                    if(userProfile != null) {
                        console.log('All done!')
                        const data = BEAUTIFY.insta.profile(userProfile)
                        resovle(data)
                    } else {
                        resovle(userProfile)
                    }
                })
            }
        },
        "tt": {
            "getProfile": async (account) => {
                return new Promise(async (resovle, reject) => {
                    console.log(account)
                    const browserGlobal = await firefox.launch(config.projects.find(project => project.name === 'Desktop Firefox').use)
                    const contextGlobal = await browserGlobal.newContext()
                    const pageGlobal = await contextGlobal.newPage()

                    let userProfile = null
                    pageGlobal.on('response', async (response) => {
                        const url = response.url();
                        // Check if the URL matches the desired pattern
                        if (url.includes('https://www.tiktok.com/api/user/detail')) {
                        
                            // Check the response status
                            if (response.ok()) {
                                try {
                                    const res = await response.json()
                                    if(res?.userInfo) {
                                        userProfile = res.userInfo
                                    }
                                } catch (error) {
                                    console.error('Error parsing response JSON:')
                                }
                            } else {
                                console.error('Response error (status code:', response.status(), ')')
                            }
                        }
                    });
                
                    try {
                        console.log('go to page')
                        await pageGlobal.goto(`https://www.tiktok.com/${account}`, { waitUntil: 'domcontentloaded' })
                    } catch (error) {
                        resovle(null)
                    }
    
                    try {
                        console.log('wait for response')
                        await pageGlobal.waitForResponse(response => response.url().includes('https://www.tiktok.com/api/user/detail'))
                        await pageGlobal.waitForTimeout(3000);
                    } catch (error) {
                        resovle(null)
                    }

                    await browserGlobal.close()

                    // beautify data
                    if(userProfile != null) {
                        console.log('all done')
                        const data = BEAUTIFY.tt.profile(userProfile)
                        resovle(data)
                    } else {
                        resovle(userProfile)
                    }
                })
            }
        }
    }
}

module.exports = {
    SCRAPER,
    convertToNumber
}