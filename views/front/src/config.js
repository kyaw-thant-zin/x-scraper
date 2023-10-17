
import { AES } from 'crypto-js'
import CryptoJS from 'crypto-js'

const LCOAL_SITE_URL = 'http://localhost:8000'
const SERVER_SITE_URL = 'http://v157-7-137-45.myvps.jp'
const LOCAL_PUBLIC_SITE_URL = 'http://localhost:8000'
const SERVER_PUBLIC_SITE_URL = 'http://v157-7-137-45.myvps.jp'
const LOCAL_URL = 'http://localhost:8000'
const SERVER_URL = 'http://v157-7-137-45.myvps.jp'
const SECRET_KEY = '+@V0.1'
const SERVER_PREFIX = '/xfollowers/api'
const LOCAL_PREFIX = '/api'


export const APP = {
    'ACTIVE_PUBLIC_SITE_URL': LOCAL_PUBLIC_SITE_URL,
    'ACTIVE_SITE_URL': LCOAL_SITE_URL,
    'SECRET_KEY': SECRET_KEY,
    'encryptID': (id) => {
        // Encrypt the ID
        const encryptedId = AES.encrypt(id.toString(), SECRET_KEY).toString();
        // URL-encode the encrypted ID with UTF-8 support
        const encodedEncryptedId = encodeURIComponent(encryptedId);
        return encodedEncryptedId;
    },
    'decryptID': (encryptedID) => {
        // URL-decode the encodedEncryptedId
        const decodedEncryptedId = decodeURIComponent(encryptedID);
        // Decrypt the encoded and encrypted ID
        const decryptedId = AES.decrypt(decodedEncryptedId, SECRET_KEY).toString(CryptoJS.enc.Utf8);
        return decryptedId;
    },
    'API': {
        'PREFIX': LOCAL_PREFIX,
        'LOCAL_URL': LOCAL_URL,
        'SERVER_URL': SERVER_URL,
        'ACTIVE_API_URL': LOCAL_URL,
    }
}