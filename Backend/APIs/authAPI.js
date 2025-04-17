require('dotenv').config()
const express = require('express')
const jwt = require('jsonwebtoken')
const bcryptjs = require('bcryptjs')
const UserModel = require('../Models/userModel')
const expressAsyncHandler = require('express-async-handler')
const userModel = require('../Models/userModel')
const authenticator = require('../Middlewares/authentication')

const auth = express.Router()

auth.post('/login', expressAsyncHandler(async (req, res)=>{
    const {email, password} = req.body

    if(!email || !password)
        return res.status(400).send({message: "All credentials are required"})

    let user = await UserModel.findOne({email: email}, {__v: false})

    if(!user) 
        return res.status(404).send({message: "User Not Found."})
    else {
        let compareRes = await bcryptjs.compare(password, user.password)

        if(!compareRes) {
            return res.status(400).send({message: "Invalid user credentials"})
        } else {
            const signedToken = jwt.sign(
                {email: user.email, _id: user._id},
                process.env.jwtSecretKey,
                {expiresIn: '1d', algorithm: 'HS256'} // seconds
            )
            res.cookie("jwtToken", signedToken, {
                maxAge: 24 * 60 * 60 * 1000,
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                // path: "/"
                sameSite: "Strict"
            })
        }
        delete user.password
        res.send({message: "Successfully logged In!", user: user})
    } 
}))

auth.post('/signup', expressAsyncHandler(async (req, res) => {
    const {email, password, firstName, lastName, bio} = req.body

    if(!password || !email || !firstName)
        return res.status(400).send({message: "All fields are required"})
    
    let alreadyExists = await userModel.findOne({email: email})
    if(alreadyExists)
        return res.status(400).send({message: "The user already exists. Please log in."})

    const hashedPassword = await bcryptjs.hash(password, 10)

    let newUser = new UserModel({
        email: email,
        password: hashedPassword,
        firstName: firstName,
        lastName: lastName,
        bio: bio
    })

    await newUser.save()
    res.status(201).send({message: "User saved successfully!"})
}))

auth.post('/logout', expressAsyncHandler(async (req, res)=> {
    res.clearCookie("jwtToken", {
        httpOnly: true,
        sameSite: "Strict",
        secure: process.env.NODE_ENV === 'production',
        // path: "/"
    })

    res.send({message: 'Successfully logged out!'})
}))

auth.get('/me', authenticator, expressAsyncHandler(async (req, res) => {
    const userId = req.user._id

    const userDetails = await userModel.findById(userId, {__v: false, password: false})
                                       .lean()
    if(!userDetails)
        res.status(404).send({message: "User Not Found!"})

    userDetails.profilePic = `${process.env.baseURL}users/media/${userDetails.profilePic}`

    res.send({message: "Fetched User Details!", user: userDetails})
}))

module.exports = auth