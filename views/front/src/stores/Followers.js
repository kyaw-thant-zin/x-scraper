import { ref } from 'vue'
import { defineStore } from 'pinia'
import { API } from '@/api/index.js'

export const useFollowerStore = defineStore('follower', () => {

    const _loading = ref(false)
    const _success = ref(false)
    const _error = ref(false)
    const _followers = ref(null)

    const storeLoading = (loading) => {
        _loading.value = loading
    }

    const storeError = (error) => {
        _error.value = error
    }

    const storeSuccess = (success) => {
        _success.value = success
    }

    const storeList = (areas) => {
        
    }

    const handleGetAll = async () => {
        storeLoading(true)
        const response = await API.followers.getAll()
        storeAreas(response)
        storeLoading(false)
    }

    const handleGet = (id) => {

    }

    const handleStore = async (formData) => {
        storeLoading(true)
        const response = await API.followers.store(formData)
        console.log(response)
        if(response) {
            storeSuccess(true)
        } else {
            storeError(true)
        }
        storeLoading(false)
    }

    const handelUpdate = async (id, formData) => {
        storeLoading(true)
        const response = await API.followers.update(id, formData)
        if(response) {
            storeSuccess(true)
        } else {
            storeError(true)
        }
        storeLoading(false)
    }

    const handleDestroy = async (id) => {
        storeLoading(true)
        const response = await API.followers.destroy(id)
        if(response) {
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
        handelUpdate,
        handleDestroy,
    }

})

