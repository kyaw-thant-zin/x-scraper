import { ref } from 'vue'
import { defineStore } from 'pinia'
import { API } from '@/api/index.js'
// import Cookies from 'js-cookie'

export const useAuthStore = defineStore('auth', () => {

    const _loading = ref(false)
    const _success = ref(false)
    const _error = ref(false)
    const _user = ref(null)

    const storeLoading = (loading) => {
        _loading.value = loading
    }

    const storeError = (error) => {
        _error.value = error
    }

    const storeSuccess = (success) => {
        _success.value = success
    }

    const storeUser = (user) => {
        _user.value = user
    }

    const handleCheck = async () => {
        const response = await API.auth.check()
        return response
    }

    const handleSignIn = async (formData) => {

        storeLoading(true)
        const response = await API.auth.signin(formData)
        if(response?.error && response.error) {
            // fail
            storeError(true)
        } else {
            // success
            storeSuccess(true)
        }
        storeLoading(false)

    }

    const handleSignOut = async () => {
        const response = await API.auth.signout()
        return response
    }

    return {
        _user,
        _loading,
        _success,
        _error,
        storeSuccess,
        storeError,
        handleSignIn,
        handleSignOut,
        handleCheck
    }

})