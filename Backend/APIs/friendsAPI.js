const express = require('express')
const FriendshipModel = require('../Models/friendshipModel')
const expressAsyncHandler = require('express-async-handler')
const authenticateUser = require('../Middlewares/authentication')
const UserModel = require('../Models/userModel')

const friendship = express.Router()

friendship.use(authenticateUser)

friendship.post('/request', expressAsyncHandler(async (req, res) => {
    const {recipientId} = req.body
    const requesterId = req.user._id

    if(!requesterId || !recipientId || requesterId.equals(recipientId))
        return res.status(400).send({message: "RecipientId is required! (Verify if requesterId === recipientId)"})

    // check for whether the relation already exists to be implemented
    const existingRel = await FriendshipModel.findOne({
        $or: [
            {requester: requesterId, recipient: recipientId}, 
            {requester: recipientId, recipient: requesterId}
        ]
    })

    if(existingRel) {
        return res.status(400).send({message: "A relationship already exists. (Already requested)", status: existingRel.status})
    } else {
        const friendshipObj = new FriendshipModel({
            requester: requesterId, 
            recipient: recipientId, 
            status: 'pending'
        })
        await friendshipObj.save()
        res.status(201).send({ message: "Requested successfully!" })
    }
}))

// this request handler returns friends of both: current session user and other users.
friendship.get(['/:id', '/'], expressAsyncHandler(async (req, res) => {
    const userId = (req.path === '/' ? req.user._id : req.params.id)
    const userExists = await UserModel.findById(userId)
    
    if(!userExists)
        return res.status(404).send({message: "User not found!"})

    const friends = await FriendshipModel.find({
        $or: [
            {requester: userId, status: 'accepted'}, 
            {recipient: userId, status: 'accepted'}
        ]
    }).populate('requester recipient', '_id firstName lastName bio profilePic').lean()

    if(!friends.length)
        return res.status(404).send({message: "No friends!"})
    res.send({ message: "Friends fetched!", payload: friends })
}))

friendship.patch('/accept', expressAsyncHandler(async (req, res) => {
    const recipientId = req.user._id
    const { requesterId } = req.body

    if(!requesterId || !recipientId || requesterId === recipientId)
        return res.status(400).send({message: "RecipientId is required! (Verify if requesterId === recipientId)"})

    let updatedFriendship = await FriendshipModel.findOneAndUpdate({requester: requesterId, recipient: recipientId}, {status : 'accepted'})
    if(!updatedFriendship)
        return res.status(404).send({message: "No friend request found!"})
    res.send({message: "Friendship accepted successfully!"})
}))

friendship.get('/pending', expressAsyncHandler(async (req, res) => {
    const userId = req.user._id

    // assuming that the id is valid since user has authenticated.
    let friends = await FriendshipModel.find({
        $or: [{requester: userId, status: 'pending'}, {recipient: userId, status: 'pending'}]
    })

    if(!friends.length) {
        return res.status(404).send({message: "No users with pending status found!"})
    } else {
        res.send({message: "Users found", payload: friends})
    }
}))

module.exports = friendship