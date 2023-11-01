import axios from 'axios'
import { APP } from '@/config.js'
import Cookies from 'js-cookie'

const apiURL = APP.API.PREFIX
const baseURL = APP.API.ACTIVE_API_URL

const headers = {
    'Content-Type': 'application/json',
}

axios.defaults.withCredentials = true
const instance = axios.create({
    baseURL: baseURL,
})

instance.interceptors.request.use((config) => {
    const token = Cookies.get('auth_tkn');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    } else {
      delete config.headers['Authorization']
    }
    return config
})


export const API = {
    "auth": {
        "check": async() => {
            try {
                const response = await instance.post(apiURL+'/check-auth',  {headers: headers})
                return response.data
            } catch (error) {
                return error.response
            }
        },
        "signin": async (formData) => {
            const response = await instance.post(apiURL+'/sign-in', formData, {headers: headers})
            return response.data
        },
        "signout": async (id) => {
            const response = await instance.post(apiURL+'/sign-out', {headers: headers})
            return response
        }
    },
    "followers": {
        "get": async (id) => {
            const response = await instance.get(apiURL+'/x/'+id+'/detail', { headers: headers })
            return response.data
        },
        "getAll": async () => {
            const response = await instance.get(apiURL+'/x', { headers: headers })
            return response.data
        },
        "store": async (formData) => {
            headers['Content-Type'] = 'multipart/form-data'
            const response = await instance.post(apiURL+'/x/store', formData, {headers: headers})
            return response.data
        },
        "destroy": async (id) => {
            const response = await instance.delete(apiURL+'/x/'+id+'/destroy', {headers: headers})
            return response.data
        },
        "refreshAll": async () => {
            const response = await instance.post(apiURL+'/x/refresh-all', { headers: headers })
            return response.data
        },
        "refresh": async (account) => {
            const response = await instance.post(apiURL+'/x/refresh/'+account, { headers: headers })
            return response.data
        },
    },
    "insta": {
        "get": async (id) => {
            const response = await instance.get(apiURL+'/insta/'+id+'/detail', { headers: headers })
            return response.data
        },
        "getAll": async () => {
            const response = await instance.get(apiURL+'/insta', { headers: headers })
            return response.data
        },
        "store": async (formData) => {
            headers['Content-Type'] = 'multipart/form-data'
            const response = await instance.post(apiURL+'/insta/store', formData, {headers: headers})
            return response.data
        },
        "destroy": async (id) => {
            const response = await instance.delete(apiURL+'/insta/'+id+'/destroy', {headers: headers})
            return response.data
        },
        "refreshAll": async () => {
            const response = await instance.post(apiURL+'/insta/refresh-all', { headers: headers })
            return response.data
        },
        "refresh": async (account) => {
            const response = await instance.post(apiURL+'/insta/refresh/'+account, { headers: headers })
            return response.data
        },
    },
    "tt": {
        "get": async (id) => {
            const response = await instance.get(apiURL+'/tt/'+id+'/detail', { headers: headers })
            return response.data
        },
        "getAll": async () => {
            const response = await instance.get(apiURL+'/tt', { headers: headers })
            return response.data
        },
        "store": async (formData) => {
            headers['Content-Type'] = 'multipart/form-data'
            const response = await instance.post(apiURL+'/tt/store', formData, {headers: headers})
            return response.data
        },
        "destroy": async (id) => {
            const response = await instance.delete(apiURL+'/tt/'+id+'/destroy', {headers: headers})
            return response.data
        },
        "refreshAll": async () => {
            const response = await instance.post(apiURL+'/tt/refresh-all', { headers: headers })
            return response.data
        },
        "refresh": async (account) => {
            const response = await instance.post(apiURL+'/tt/refresh/'+account, { headers: headers })
            return response.data
        },
    },
    "yt": {
        "get": async (id) => {
            const response = await instance.get(apiURL+'/yt/'+id+'/detail', { headers: headers })
            return response.data
        },
        "getAll": async () => {
            const response = await instance.get(apiURL+'/yt', { headers: headers })
            return response.data
        },
        "store": async (formData) => {
            headers['Content-Type'] = 'multipart/form-data'
            const response = await instance.post(apiURL+'/yt/store', formData, {headers: headers})
            return response.data
        },
        "destroy": async (id) => {
            const response = await instance.delete(apiURL+'/yt/'+id+'/destroy', {headers: headers})
            return response.data
        },
        "refreshAll": async () => {
            const response = await instance.post(apiURL+'/yt/refresh-all', { headers: headers })
            return response.data
        },
        "refresh": async (account) => {
            const response = await instance.post(apiURL+'/yt/refresh/'+account, { headers: headers })
            return response.data
        },
    }
}

