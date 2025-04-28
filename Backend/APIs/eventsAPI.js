const express = require("express");
const EventModel = require("../Models/eventModel");
const authenticator = require("../Middlewares/authentication");
const uploader = require("../Middlewares/mediaUploadMiddleware");
const expressAsyncHandler = require("express-async-handler");
require("dotenv").config();
const path = require('path')
const fs = require('fs')

const event = express.Router();

event.use(authenticator);

event.post(
  "/",
  uploader("media"),
  expressAsyncHandler(async (req, res) => {
    const userId = req.user._id;
    const validFields = [
      "title",
      "description",
      "hostedBy",
      "redirectLink",
      "time",
      "location",
      "mode",
      "maxParticipants",
      "registeredParticipants",
      "status",
      "tags",
    ];
    const postFields = req.body;
    const eventDetails = {};
    validFields.forEach((key) => {
      eventDetails[key] = postFields[key];
    //   console.log("From forEach event post: ", postFields[key]);
    });

    // console.log("Finally eventDetails: ", eventDetails);

    
    let eventDoc = new EventModel({ ...eventDetails, hostId: userId, media: req.file?.filename });
    try {
      await eventDoc.save();
    } catch (error) {
      res.status(400).send(error.errors);
    }

    res.send({ message: "Event saved Successfully!" });
  })
);

event.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    const baseURL_image = process.env.baseURL + "events/media/";

    const allEvents = await EventModel.aggregate([
    //   {
    //     $match: {
    //       $or: [
    //         {
    //           updatedAt: { $lt: lastUpdatedAt },
    //         },
    //         {
    //           updatedAt: { $lte: lastUpdatedAt },
    //           _id: { $lt: lastId },
    //         },
    //       ],
    //     },
    //   },
      { $sort: { _id: -1 } },
      //   { $limit: Number(parsedLimit) },
      { $unset: "__v" },
      {
        $lookup: {
          from: "users",
          pipeline: [
            {
              $project: {
                firstName: true,
                lastName: true,
              },
            },
          ],
          localField: "hostId",
          foreignField: "_id",
          as: "hostId",
        },
      },
      { $unwind: "$hostId" },
      {
        $set: {
          media: { $concat: [baseURL_image, "$media"] },
        },
      },
      { $unset: "likes" },
    ]);

    res.send({ message: "Fetched all events.", payload: allEvents });
  })
);

event.get(
  "/media/:fileName",
  expressAsyncHandler(async (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, "..", "uploads", fileName);

    fs.access(filePath, fs.constants.F_OK, (error) => {
      if (error)
        return res.status(404).send({
          message: "Some error has occurred while retrieving the file.",
          error: error,
        });
    });

    res.sendFile(filePath);
  })
);

event.delete(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const eventId = req.params.id;
    const userId = req.user._id;
    const eventHostId = await EventModel.findById(eventId, "hostId").lean();
    if (!eventHostId)
      return res.status(404).send({ message: "Event not found!" });
    if (userId != eventHostId.hostId)
      return res
        .status(403)
        .send({
          message:
            "Protected Resource: You are not allowed to perform this operation!",
        });

    await EventModel.findByIdAndDelete(eventId);
    res.send({ message: "Event successfully Deleted!" });
  })
);

event.get(
  "/search",
  expressAsyncHandler(async (req, res) => {
    const allowedFields = new Set(["hostedBy", "hostId"]);
    let reqFields = req.query;
    console.log("query: ", req.query);

    reqFields = Object.fromEntries(
      Object.keys(reqFields)
        .filter(
          (key) =>
            allowedFields.has(key) && reqFields[key] !== "" && reqFields[key]
        )
        .map((key) => [key, reqFields[key]])
    );

    const result = await EventModel.find(reqFields).lean();
    res.send({
      message: "Fetched the events.",
      attributes: reqFields,
      payload: result,
    });
  })
);

module.exports = event;
