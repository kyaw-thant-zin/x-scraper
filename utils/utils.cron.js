const cron = require('cron')
const db = require('../models/index')
const { SCRAPER } = require('./scraper')

// Twitter
const X = db.x
const XDetail = db.xDetail
// Instagram
const Insta = db.insta
const InstaDetail = db.instaDetail
// TikTok
const Tt = db.tt
const TtDetail = db.ttDetail
// YouTube
const Yt = db.yt
const YtDetail = db.ytDetail


// Refresh Twitter
const refreshX = async () => {
    try {
        let x = await X.findAll({ 
            order: [
                ['id', 'DESC'],
            ],
        })

        for (let index = 0; index < x.length; index++) {
        
            // get account data
            const follower = x[index]
            const account = follower.account
            const userProfile = await SCRAPER.puppeteer.x.getProfile(account)
            if(userProfile != null) {
                // update the data
                const profileData = {
                    profile_banner_url: userProfile.profile_banner_url,
                    profile_image_url_https: userProfile.profile_image_url_https,
                }

                const xUpdate = await X.update(profileData, {
                    where: { id: follower.id },
                })
                if(xUpdate) {
    
                    // store the followers
                    const followerData = {
                        xId: follower.id,
                        name: userProfile.name,
                        following: userProfile.followings_count,
                        followers: userProfile.followers_count,
                        friends: userProfile.favourites_count,
                        media_count: userProfile.media_count,
                        statuses_count: userProfile.statuses_count,
                        description: userProfile.description,
                    }
    
                    const xDetail = await XDetail.create(followerData)
                } 
            } 
        }

    } catch (error) {
        
    }
}

// Refresh Instagram
const refreshInsta = async () => {
    try {
        let instas = await Insta.findAll({ 
            order: [
                ['id', 'DESC'],
            ],
        })

        for (let index = 0; index < instas.length; index++) {
        
            // get account data
            const follower = instas[index]
            const account = follower.username
            const userProfile = await SCRAPER.playwright.insta.getProfile(account)

            if(userProfile != null) {
                // update the data
                const profileData = {
                    profile_image_url: userProfile.profile_image_url,
                }
    
                const instaUpdate = await Insta.update(profileData, {
                    where: { id: follower.id },
                })
                if(instaUpdate) {
    
                    // store the followers
                    const followerData = {
                        instumId: follower.id,
                        name: userProfile.full_name,
                        following: userProfile.followings_count,
                        followers: userProfile.followers_count,
                        media_count: userProfile.media_count,
                        description: userProfile.description,
                    }
    
                    const instaDetail = await InstaDetail.create(followerData)
                } 
            } 
        }

    } catch (error) {
        
    }
}

// Refresh TikTok
const refreshTt = async () => {
    try {
        let tts = await Tt.findAll({ 
            order: [
                ['id', 'DESC'],
            ],
        })

        for (let index = 0; index < tts.length; index++) {
        
            // get account data
            const follower = tts[index]
            const account = follower.uniqueId
            const userProfile = await SCRAPER.playwright.tt.getProfile(account)

            if(userProfile != null) {

                // update the data
                const profileData = {
                    avatar: userProfile.avatar,
                }
    
                const ttUpdate = await Tt.update(profileData, {
                    where: { id: follower.id },
                })
                if(ttUpdate) {
    
                    // store the followers
                    const followerData = {
                        ttId: follower.id,
                        nickname: userProfile.nickname,
                        following: userProfile.followings_count,
                        followers: userProfile.followers_count,
                        friends: userProfile.friends_count,
                        likes_count: userProfile.likes_count,
                        media_count: userProfile.video_count,
                        description: userProfile.description,
                        biolink: userProfile.bioLink,
                    }
    
                    const ttDetail = await TtDetail.create(followerData)
                } 
            } 
        }

    } catch (error) {
        
    }
}

// Refresh YouTube
const refreshYt = async () => {
    try {
        let yts = await Yt.findAll({ 
            order: [
                ['id', 'DESC'],
            ],
        })

        for (let index = 0; index < yts.length; index++) {
        
            // get account data
            const follower = yts[index]
            const account = follower.account
            const userProfile = await SCRAPER.playwright.yt.getProfile(account)
            console.log(userProfile)
            if(userProfile != null) {

                // update the data
                const profileData = {
                    avatar: userProfile.avatar,
                    banner: userProfile.banner,
                }
    
                const ytUpdate = await Yt.update(profileData, {
                    where: { id: follower.id },
                })
                console.log(ytUpdate)
                if(ytUpdate) {
    
                    // store the followers
                    const followerData = {
                        ytId: follower.id,
                        title: userProfile.title,
                        subscribers: userProfile.subscribers,
                        views: userProfile.views,
                        media_count: userProfile.videos,
                        description: userProfile.desc,
                        link: userProfile.link,
                    }
    
                    const ytDetail = await YtDetail.create(followerData)
                    console.log(ytDetail)
    
                } 
            }
        }

    } catch (error) {
        
    }
}

const refreshAll = async () => {

    try {
        
        await refreshX()
        await refreshInsta()
        await refreshTt()
        await refreshYt()

    } catch (error) {
        
    }

}

const cronJob = new cron.CronJob(
    '0 23 * * *',  /* => 11PM of every day  */
    // '*/5 * * * *', /* => every 5 minutes  */
    async () => { 
        console.log('Running cron script...');
        try {
            await refreshAll()
            console.log('Cron script completed.')
        } catch (error) {
            console.error('Error running cron script:', error)
        }
    },
    'Asia/Tokyo', // timeZone
)

module.exports = cronJob