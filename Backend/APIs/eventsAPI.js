const express = require('express')
const EventModel = require('../Models/eventModel')
const authenticator = require('../Middlewares/authentication')
const uploader = require('../Middlewares/mediaUploadMiddleware')
const expressAsyncHandler = require('express-async-handler')

const event = express.Router()

event.use(authenticator)

event.post('/', uploader, expressAsyncHandler(async (req, res) => {
    const userId = req.user._id
    const validFields = ["title", "description", "hostedBy", "redirectLink", "time", "location", "mode", "maxParticipants", "registeredParticipants", "status", "tags"]  
    const eventDetails = {}
    validFields.forEach((key) => {
        eventDetails[key] = req.body[key]
    })
    let eventDoc = new EventModel({...eventDetails, hostId: userId})
    try {
        await eventDoc.save()
    } catch(error) {
        res.status(400).send(error.errors)
    }

    res.send({message: "Event saved Successfully!"})
}))

event.get('/', expressAsyncHandler(async (req, res) => {
    const allEvents = await EventModel.find()
                                .populate("hostId", "firstName _id")
                                .lean()
    
    res.send({message: "Fetched all events.", payload: allEvents})
}))

event.delete('/:id', expressAsyncHandler(async (req, res) => {
    const eventId = req.params.id
    const userId = req.user._id
    const eventHostId = await EventModel.findById(eventId, 'hostId').lean()
    if(!eventHostId)
        return res.status(404).send({message: "Event not found!"})
    if(userId != eventHostId.hostId) 
        return res.status(403).send({message: "Protected Resource: You are not allowed to perform this operation!"})
    
    await EventModel.findByIdAndDelete(eventId)
    res.send({message: "Event successfully Deleted!"})
}))

event.get('/search', expressAsyncHandler(async (req, res) => {
    const allowedFields = new Set(['hostedBy', 'hostId'])
    let reqFields = req.query
    console.log("query: ", req.query)

    reqFields = Object.fromEntries(
        Object.keys(reqFields)
            .filter((key) =>  allowedFields.has(key) && (reqFields[key] !== '') && reqFields[key] )
            .map((key) => [key, reqFields[key]])
    )

    const result = await EventModel.find(reqFields).lean()
    res.send({message: "Fetched the events.", attributes: reqFields, payload: result})
}))

module.exports = event