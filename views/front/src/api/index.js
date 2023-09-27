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
            const response = await instance.get(apiURL+'/followers/'+id+'/detail', { headers: headers })
            return response.data
        },
        "getAll": async () => {
            const response = await instance.get(apiURL+'/followers', { headers: headers })
            return response.data
        },
        "store": async (formData) => {
            const response = await instance.post(apiURL+'/followers/store', formData, {headers: headers})
            return response.data
        },
        "destroy": async (id) => {
            const response = await instance.delete(apiURL+'/followers/'+id+'/destroy', {headers: headers})
            return response.data
        },
        "refresh": async () => {
            const response = await instance.post(apiURL+'/followers/refresh', { headers: headers })
            return response.data
        },
    },
}

