// utils/scraper.js

/**
 * Required External Modules
 */
const moment = require('moment')
const { firefox } = require('playwright')
const puppeteer = require('puppeteer-extra')
const imageToBase64 = require("image-to-base64")
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

const getBase64 = async (link) => {
    const base64 = await imageToBase64(link);
    return `data:image/jpeg;base64,${base64}`;
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
            dumpData.profile_image_url = await getBase64(data.profile_pic_url_hd)

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
            dumpData.likes_count = data.stats.heartCount
            dumpData.video_count = data.stats.videoCount
            dumpData.avatar = await getBase64(data.user.avatarLarger)
            dumpData.description = data.user.signature
            dumpData.bioLink = data.user.bioLink?.link
            return dumpData

        }
    },
    "yt": {
        "profile": async (data) => {
            if(data == null) {
                return null
            }

            const dumpData = {}
            dumpData.avatar = data.avatar
            dumpData.banner = data.banner
            dumpData.desc = data.desc
            dumpData.joined = data.joined
            dumpData.link = data.link
            dumpData.subscribers = convertToNumber(data.subscribers.replace(' subscribers', ''))
            dumpData.title = data.title
            dumpData.videos = Number(data.videos.replace(',', ''))
            dumpData.views = Number(data.views.replace(',', '').replace(' views', ''))

            return dumpData
        }
    }
}


let browserGlobal
let contextGlobal
let pageGlobal
let requestCount = 0

const io = global.io // Access io as a global variable

const dummyPuppetter = {
    'insta': async () => {
        return new Promise(async (resovle, reject) => {
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
        
            try {
                await page.goto(`https://www.instagram.com/therock/`, { waitUntil: 'domcontentloaded'})
                await page.waitForTimeout(2000)
            } catch (error) {
                resovle(null)
            }

            await browserGlobal.close()
            resovle(null)
        })
    }   
}

const browserPuppeteer = {
    "x": {
        "getProfile": async (account) => {
            return new Promise(async (resovle, reject) => {
                if(io) {
                    io.emit('create-account', { message: "「"+account+"」: ページを開いている...." })
                }
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

                if(io) {
                    io.emit('create-account', { message: "「"+account+"」: ページを開いている...." })
                }
            
                await page.setRequestInterception(true)
            
                let userProfile = null

                page.on('request', request => {
                    const url = request.url()
                    request.continue()
                });
            
                page.on('response', async (response) => {
                    const url = response.url();
                    if(io) {
                        io.emit('create-account', { message: "「"+account+"」: リクエストを処理する...." })
                    }
                    // Check if the URL matches the desired pattern
                    if (url.includes('/UserByScreenName')) {
                    
                        // Check the response status
                        if (response.ok()) {
                            if(io) {
                                io.emit('create-account', { message: "「"+account+"」: プロフィールリクエストを受信しました...." })
                            }
                            try {
                                const data = await response.json()
                                if(data?.data?.user?.result?.legacy) {
                                    console.log('got data')
                                    if(io) {
                                        io.emit('create-account', { message: "「"+account+"」: プロフィールデータを取得しました...." })
                                    }
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
                    if(io) {
                        io.emit('create-account', { message: "「"+account+"」: プロフィールページに行く...." })
                    }
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
    }
}

const SCRAPER = {
    "puppeteer": {
        "x": {
            "getProfile": async (account) => {
                return new Promise(async (resovle, reject) => {
                    requestCount++
                    console.log(`Request Count: ${requestCount}`)
                    const res = await browserPuppeteer.x.getProfile(account)
                    console.log(res)
                    if(res) {
                        resovle(res)
                    } else {
                        await dummyPuppetter.insta()
                        const res = await browserPuppeteer.x.getProfile(account)
                        console.log(res)
                        if(res) {
                            resovle(res)
                        } else {
                            resovle(null)
                        }
                    }
                })
            }
        },
        "insta": {
            "getProfile": async (account) => {
                return new Promise(async (resovle, reject) => {
                    console.log(account)
                    if(io) {
                        io.emit('create-account-insta', { message: "「"+account+"」: ページを開いている...." })
                    }
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
                    await page.setRequestInterception(true)

                    if(io) {
                        io.emit('create-account-insta', { message: "「"+account+"」: ページを開いている...." })
                    }

                    page.on('request', request => {
                        const url = request.url()
                        request.continue()
                    });

                    let userProfile = null
                    page.on('response', async (response) => {
                        const url = response.url();
                        if(io) {
                            io.emit('create-account-insta', { message: "「"+account+"」: リクエストを処理する...." })
                        }
                        // Check if the URL matches the desired pattern
                        if (url.includes('https://www.instagram.com/api/v1/users/web_profile_info/?username')) {
                        
                            // Check the response status
                            if (response.ok()) {
                                if(io) {
                                    io.emit('create-account-insta', { message: "「"+account+"」: プロフィールリクエストを受信しました...." })
                                }
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
                        if(io) {
                            io.emit('create-account-insta', { message: "「"+account+"」: プロフィールページに行く...." })
                        }
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
                    if(io) {
                        io.emit('create-account-tt', { message: "「"+account+"」: ページを開いている...." })
                    }
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
                    await page.setRequestInterception(true)

                    if(io) {
                        io.emit('create-account-tt', { message: "「"+account+"」: ページを開いている...." })
                    }

                    page.on('request', request => {
                        const url = request.url()
                        request.continue()
                    });

                    let userProfile = null
                    page.on('response', async (response) => {
                        const url = response.url();
                        if(io) {
                            io.emit('create-account-tt', { message: "「"+account+"」: リクエストを処理する...." })
                        }
                        // Check if the URL matches the desired pattern
                        if (url.includes('https://www.tiktok.com/api/user/detail')) {
                        
                            // Check the response status
                            if (response.ok()) {
                                if(io) {
                                    io.emit('create-account-tt', { message: "「"+account+"」: プロフィールリクエストを受信しました...." })
                                }
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
                        if(io) {
                            io.emit('create-account-tt', { message: "「"+account+"」: プロフィールページに行く...." })
                        }
                        await page.goto(`https://www.tiktok.com/@${account}`, { waitUntil: 'domcontentloaded'})
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
        },
        "yt": {
            "getProfile": async (account) => {
                return new Promise(async (resovle, reject) => {
                    if(io) {
                        io.emit('create-account-yt', { message: "「"+account+"」: ページを開いている...." })
                    }
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
                    if(io) {
                        io.emit('create-account-yt', { message: "「"+account+"」: ページを開いている...." })
                    }
                    let userProfile = null
                
                    try {
                        if(io) {
                            io.emit('create-account-yt', { message: "「"+account+"」: プロフィールページに行く...." })
                        }
                        await page.goto(`https://www.youtube.com/@${account}/about`, { waitUntil: 'domcontentloaded' })
                    } catch (error) {
                        resovle(null)
                    }
    
                    // Extract the content of the script tag and evaluate it
                    userProfile = await page.evaluate(() => {
                        // Use a regular expression to extract the variable assignment
                        const scriptText = Array.from(document.querySelectorAll('script'))
                        .find(script => /var ytInitialData = \{/.test(script.textContent))?.textContent;

                        if (scriptText) {
                            // remove var ytInitialData = and ;
                            const jsonText = scriptText.replace(/^var ytInitialData = |;$/g, '')
                            const ytInitialData = JSON.parse(jsonText);
                            // Check if there's a "tabs" array
                            if (ytInitialData && ytInitialData.header && ytInitialData.contents && ytInitialData.contents.twoColumnBrowseResultsRenderer) {

                                const bYtInitialData = {
                                    'avatar': ytInitialData.header.c4TabbedHeaderRenderer.avatar.thumbnails[2].url,
                                    'banner': ytInitialData.header.c4TabbedHeaderRenderer.banner.thumbnails[2].url,
                                    'title': ytInitialData.header.c4TabbedHeaderRenderer.title,
                                    'subscribers': ytInitialData.header.c4TabbedHeaderRenderer.subscriberCountText.simpleText,
                                    'views': null,
                                    'videos': ytInitialData.header.c4TabbedHeaderRenderer.videosCountText.runs[0].text,
                                    'desc': ytInitialData.header.c4TabbedHeaderRenderer.tagline.channelTaglineRenderer.content,
                                    'link': ytInitialData.header.c4TabbedHeaderRenderer?.headerLinks?.channelHeaderLinksViewModel?.firstLink?.content,
                                    'joined': null
                                }
                                const tabs = ytInitialData?.contents?.twoColumnBrowseResultsRenderer?.tabs;
                        
                                if(tabs) {
                                    // Find the element with title 'About'
                                    const aboutTab = tabs.find(tab => tab.tabRenderer.title === 'About');
                            
                                    if (aboutTab) {
                                        // Access the desired content
                                        const content = aboutTab?.tabRenderer?.content?.sectionListRenderer?.contents[0]?.itemSectionRenderer?.contents[0]?.channelAboutFullMetadataRenderer;
                                        if(content) {
                                            bYtInitialData.views = content?.viewCountText?.simpleText
                                            bYtInitialData.joined = content?.joinedDateText?.runs[1]?.text
                                        }
                                    }
                                }

                                return bYtInitialData
                            }

                            return null;
                        }

                        return null; // Return null if the script wasn't found or the assignment was invalid.
                    });

                    await browserGlobal.close()

                    // beautify data
                    if(userProfile != null) {
                        console.log('all done')
                        const data = BEAUTIFY.yt.profile(userProfile)
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
                    if(io) {
                        io.emit('create-account', { message: "「"+account+"」: ページを開いている...." })
                    }
                    console.log(account)
                    const browserGlobal = await firefox.launch(config.projects.find(project => project.name === 'Desktop Firefox').use)
                    const contextGlobal = await browserGlobal.newContext()
                    const pageGlobal = await contextGlobal.newPage()
                    let userProfile = null
                    pageGlobal.on('response', async (response) => {
                        const url = response.url();
                        if(io) {
                            io.emit('create-account', { message: "「"+account+"」: リクエストを処理する...." })
                        }
                        if(url.includes('/UserByScreenName')) {
                            // console.log(url)
                        }
                
                        // Check if the URL matches the desired pattern
                        if ( url.includes('/UserByScreenName')) {
                            // Check the response status
                            if (response.ok()) {
                                if(io) {
                                    io.emit('create-account', { message: "「"+account+"」: プロフィールリクエストを受信しました...." })
                                }
                                try {
                                    const data = await response.json()
                                    if(data?.data?.user?.result?.legacy) {
                                        if(io) {
                                            io.emit('create-account', { message: "「"+account+"」: プロフィールデータを取得しました...." })
                                        }
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
                    
                    if(io) {
                        io.emit('create-account', { message: "「"+account+"」: プロフィールページに行く...." })
                    }

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
                    if(io) {
                        io.emit('create-account-insta', { message: "「"+account+"」: ページを開いている...." })
                    }
                    console.log(account)
                    const browserGlobal = await firefox.launch(config.projects.find(project => project.name === 'Desktop Firefox').use)
                    const contextGlobal = await browserGlobal.newContext()
                    const pageGlobal = await contextGlobal.newPage()

                    if(io) {
                        io.emit('create-account-insta', { message: "「"+account+"」: ページを開いている...." })
                    }

                    let userProfile = null
                    pageGlobal.on('response', async (response) => {
                        const url = response.url();
                        if(io) {
                            io.emit('create-account-insta', { message: "「"+account+"」: リクエストを処理する...." })
                        }
                        // Check if the URL matches the desired pattern
                        if (url.includes('https://www.instagram.com/api/v1/users/web_profile_info/?username')) {
                        
                            // Check the response status
                            if (response.ok()) {
                                if(io) {
                                    io.emit('create-account-insta', { message: "「"+account+"」: プロフィールリクエストを受信しました...." })
                                }
                                try {
                                    const res = await response.json()
                                    if(res?.data?.user) {
                                        if(io) {
                                            io.emit('create-account-insta', { message: "「"+account+"」: プロフィールデータを取得しました...." })
                                        }
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
                        if(io) {
                            io.emit('create-account-insta', { message: "「"+account+"」: プロフィールページに行く...." })
                        }
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
                    if(io) {
                        io.emit('create-account-tt', { message: "「"+account+"」: ページを開いている...." })
                    }
                    const browserGlobal = await firefox.launch(config.projects.find(project => project.name === 'Desktop Firefox').use)
                    const contextGlobal = await browserGlobal.newContext()
                    const pageGlobal = await contextGlobal.newPage()

                    if(io) {
                        io.emit('create-account-tt', { message: "「"+account+"」: ページを開いている...." })
                    }

                    let userProfile = null
                    pageGlobal.on('response', async (response) => {
                        const url = response.url();
                        if(io) {
                            io.emit('create-account-tt', { message: "「"+account+"」: リクエストを処理する...." })
                        }
                        // Check if the URL matches the desired pattern
                        if (url.includes('https://www.tiktok.com/api/user/detail')) {
                        
                            // Check the response status
                            if (response.ok()) {
                                if(io) {
                                    io.emit('create-account-tt', { message: "「"+account+"」: プロフィールリクエストを受信しました...." })
                                }
                                try {
                                    const res = await response.json()
                                    if(res?.userInfo) {
                                        if(io) {
                                            io.emit('create-account-tt', { message: "「"+account+"」: プロフィールデータを取得しました...." })
                                        }
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
                        if(io) {
                            io.emit('create-account-tt', { message: "「"+account+"」: プロフィールページに行く...." })
                        }
                        await pageGlobal.goto(`https://www.tiktok.com/@${account}`, { waitUntil: 'domcontentloaded' })
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
        },
        "yt": {
            "getProfile": async (account) => {
                return new Promise(async (resovle, reject) => {
                    console.log(account)
                    if(io) {
                        io.emit('create-account-yt', { message: "「"+account+"」: ページを開いている...." })
                    }
                    const browserGlobal = await firefox.launch(config.projects.find(project => project.name === 'Desktop Firefox').use)
                    const contextGlobal = await browserGlobal.newContext()
                    const pageGlobal = await contextGlobal.newPage()

                    if(io) {
                        io.emit('create-account-yt', { message: "「"+account+"」: ページを開いている...." })
                    }

                    let userProfile = null
                
                    try {
                        if(io) {
                            io.emit('create-account-yt', { message: "「"+account+"」: プロフィールページに行く...." })
                        }
                        await pageGlobal.goto(`https://www.youtube.com/@${account}/about`, { waitUntil: 'domcontentloaded' })
                    } catch (error) {
                        resovle(null)
                    }
    
                    // Extract the content of the script tag and evaluate it
                    userProfile = await pageGlobal.evaluate(() => {
                        // Use a regular expression to extract the variable assignment
                        const scriptText = Array.from(document.querySelectorAll('script'))
                        .find(script => /var ytInitialData = \{/.test(script.textContent))?.textContent;

                        if (scriptText) {
                            // remove var ytInitialData = and ;
                            const jsonText = scriptText.replace(/^var ytInitialData = |;$/g, '')
                            const ytInitialData = JSON.parse(jsonText);
                            // Check if there's a "tabs" array
                            if (ytInitialData && ytInitialData.header && ytInitialData.contents && ytInitialData.contents.twoColumnBrowseResultsRenderer) {

                                const bYtInitialData = {
                                    'avatar': ytInitialData.header.c4TabbedHeaderRenderer.avatar.thumbnails[2].url,
                                    'banner': ytInitialData.header.c4TabbedHeaderRenderer.banner.thumbnails[2].url,
                                    'title': ytInitialData.header.c4TabbedHeaderRenderer.title,
                                    'subscribers': ytInitialData.header.c4TabbedHeaderRenderer.subscriberCountText.simpleText,
                                    'views': null,
                                    'videos': ytInitialData.header.c4TabbedHeaderRenderer.videosCountText.runs[0].text,
                                    'desc': ytInitialData.header.c4TabbedHeaderRenderer.tagline.channelTaglineRenderer.content,
                                    'link': ytInitialData.header.c4TabbedHeaderRenderer?.headerLinks?.channelHeaderLinksViewModel?.firstLink?.content,
                                    'joined': null
                                }
                                const tabs = ytInitialData?.contents?.twoColumnBrowseResultsRenderer?.tabs;
                        
                                if(tabs) {
                                    // Find the element with title 'About'
                                    const aboutTab = tabs.find(tab => tab.tabRenderer.title === 'About');
                            
                                    if (aboutTab) {
                                        // Access the desired content
                                        const content = aboutTab?.tabRenderer?.content?.sectionListRenderer?.contents[0]?.itemSectionRenderer?.contents[0]?.channelAboutFullMetadataRenderer;
                                        if(content) {
                                            bYtInitialData.views = content?.viewCountText?.simpleText
                                            bYtInitialData.joined = content?.joinedDateText?.runs[1]?.text
                                        }
                                    }
                                }

                                return bYtInitialData
                            }

                            return ytInitialData;
                        }

                        return null; // Return null if the script wasn't found or the assignment was invalid.
                    });

                    await browserGlobal.close()

                    // beautify data
                    if(userProfile != null) {
                        console.log('all done')
                        const data = BEAUTIFY.yt.profile(userProfile)
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