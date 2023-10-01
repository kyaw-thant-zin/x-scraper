// middleware/auth.middleware.js

/**
 * Required External Modules
 */
const jwt = require("jsonwebtoken")

const requireAuth = (req, res, next) => {

    const token = req.cookies.token
    if(token) {
        jwt.verify(token, process.env.TOKEN_SECRET, (err, decodedToken) => {
            if(err) {
                res.json({
                    error: true,
                    code: err
                })
            } else {
                req.decodedToken = decodedToken
                next()
            }
        })
    } else {
        res.json({
            error: true,
            code: '01'
        })
    }

}

module.exports = { requireAuth }