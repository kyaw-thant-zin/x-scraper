// controllers/auth.controller.js

/**
 * Required External Modules
 */
const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { Op } = require('sequelize')
const asyncHnadler = require('express-async-handler')

/**
 * Required Internal Modules
 */
const db = require('../models/index')


const User = db.users

// @desc POST check auth and refresh token
// @route POST /check-auth
// @access Private
const checkAuth = asyncHnadler( async (req, res) => {
    const decodedToken = req.decodedToken
    const token = generateToken(decodedToken.uuid)
    res.cookie('token', token, { httpOnly: true, maxAge: 4000 * 1000 })
    res.json({
        mode: 'auth'
    })
})

// @desc POST check sign in
// @route POST /sign-in
// @access Public
const signIn = asyncHnadler( async (req, res) => {

    const {email, password} = req.body

    const foundUser = await User.findOne({
        where: {
            [Op.or]: [
                { userName: email },
                { email: email }
            ]
        }
    })

    if(foundUser) {
        if((await bcrypt.compare(password, foundUser.password))) {
            const token = generateToken(foundUser.uuid)
            res.cookie('token', token, { httpOnly: true, maxAge: 4000 * 1000 })
            res.json({
                id: foundUser.uuid
            })
        } else {
            res.json({
                error: true,
                code: '02'
            })
        }
    } else {
        res.json({
            error: true,
            code: '01'
        })
    }

})

// @desc POST sign out
// @route POST /sign-out
// @access Private
const signout = asyncHnadler( async (req, res) => {
    res.cookie('token', '', { maxAge: 1 })
    res.json(true)
})

// Generate JWT
const generateToken = (uuid) => {
    const maxAge = 3600
    return jwt.sign({
        uuid: uuid
    }, process.env.TOKEN_SECRET, {
        expiresIn: maxAge
    })
}

module.exports = {
    checkAuth,
    signIn,
    signout
}


