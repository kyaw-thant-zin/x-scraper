import dayjs from 'dayjs'
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { API } from '@/api/index.js'
import relativeTime from 'dayjs/plugin/relativeTime'

export const useFollowerStore = defineStore('follower', () => {

    const _loading = ref(false)
    const _success = ref(false)
    const _error = ref(false)
    const _followers = ref(null)

    dayjs.extend(relativeTime)

    const storeLoading = (loading) => {
        _loading.value = loading
    }

    const storeError = (error) => {
        _error.value = error
    }

    const storeSuccess = (success) => {
        _success.value = success
    }

    const storeRows = (data) => {
        const beautifyData = []
        if(data != null) {
            data.forEach(element => {
                const dumpData = {}
                dumpData.id = element.id
                dumpData.account = element.account
                dumpData.followers = element.followers
                dumpData.following = element.following
                dumpData.media = element.media_count
                dumpData.tt_created_at = element.tt_created_at
                dumpData.last_detection = dayjs(element.updateTimestamp).fromNow()
                dumpData.action = ''
                beautifyData.push(dumpData)
            })
        }
        return beautifyData
    }

    const storeDetail = (data) => {
        const profile = {
            bg: data?.profile_banner_url,
            img: data?.profile_image_url_https,
            name: data?.name,
            account: data?.account,
            desc: data?.description,
            following: data?.following,
            followers: data?.followers,
            friends: data?.friends,
            media: data?.media_count,
            statuses: data?.statuses_count,
            joined: data?.tt_created_at
        }
        return profile
    }

    const handleGetAll = async () => {
        storeLoading(true)
        const response = await API.followers.getAll()
        storeLoading(false)
        return storeRows(response)
    }

    const handleGet = async (id) => {
        storeLoading(true)
        const response = await API.followers.get(id)
        storeLoading(false)
        return storeDetail(response)
    }

    const handleStore = async (formData) => {
        storeLoading(true)
        const response = await API.followers.store(formData)
        if(response?.success) {
            storeSuccess(true)
        } else {
            storeError(true)
        }
        storeLoading(false)
    }

    const handleDestroy = async (id) => {
        storeLoading(true)
        const response = await API.followers.destroy(id)
        if(response?.success) {
            storeSuccess(true)
        } else {
            storeError(true)
        }
        storeLoading(false)
    }

    return {
        _followers,
        _success,
        _error,
        _loading,
        storeError,
        storeSuccess,
        handleGetAll,
        handleGet,
        handleStore,
        handleDestroy,
    }

})

