const mongoose = require('mongoose')
const userModel = require('../Models/userModel')

const { ObjectId } = mongoose.Schema.Types

const locationSchema = new mongoose.Schema({
    houseNumber: {
      type: String,
      trim: true,
    },
    street: {
      type: String,
      trim: true,
    },
    locality: {
      type: String,
      trim: true,
      required: true, // e.g., sector, colony, mohalla
    },
    landmark: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    district: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
      enum: {
        values: [
          "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
          "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
          "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
          "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
          "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir",
          "Ladakh", "Puducherry", "Chandigarh", "Andaman and Nicobar Islands", "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep"
        ],
        message: "Provided value: {VALUE} is invalid!"},
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
      match: /^[1-9][0-9]{5}$/, 
    },
    country: {
      type: String,
      default: "India"
    },
    coordinates: {
      lat: { 
        type: Number,
        min: -90,
        max: 90
      },
      lng: { 
        type: Number,
        min: -180,
        max: 180
      }
    }
  }, {strict: "throw", _id: false});  // setting _id false because it is embedded schema.
  

  const eventSchema = new mongoose.Schema({
    title: {
      type: String,
      required: [true, "Title is a required Field!"],
      minLength: 5,
      maxlength: 100,
      trim: true,
    },
    description: {
      type: String,
      maxlength: 2000,
      trim: true,
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Host ID is a required field!"],
      ref: 'User',
      validate: {
        validator: async function (hostId) {
            const exists = await userModel.exists({_id: hostId})
            return !!exists;
        },
        message: "Invalid Host ID!"
      },
      immutable: true
    },
    hostedBy: {
      type: String,
      required: [true, "Organiser (hostedBy) must be specified!"]
    },
    redirectLink: {
      type: String, 
      required: [true, "Redirect Link must be specified!"]
    },
    time: {
      type: Date,   // console.log(date.toLocaleTimeString('en-IN', {timeZone: "Asia/Kolkata"}))
      required: [true, "Event time must be specified!"]
    },
    location: {
      type: locationSchema,
      required: [function () {
        return this.mode === 'offline'
      }, "For offline mode, location must be specified!"],
    },
    mode: {
      type: String,
      enum: {
        values: ['online', 'offline'],
        message: "{VALUE} is not accepted value. Only ['online', 'offline'] are allowed."
      },
      required: [true, "Mode of event (['online', 'offline']) must be specified!"],
    },
    maxParticipants: {
      type: Number,
      min: [1, 'Min Limit should atleast be 1. Given, {VALUE}'],
      max: 10000,
    },
    registeredParticipants: {
      type: Number,
      default: 0,
      min: [0, 'Can only have minimum of 0 participants.'],
      validate: {
        validator: function (value) {
          return value <= this.maxParticipants;
        },
        message: 'Registered participants cannot exceed max limit!',
      },
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    tags: {
      type: [String],
      validate: {
        validator: function (arr) {
          return arr.length <= 10;
        },
        message: 'Maximum of 10 tags allowed',
      },
    },
  }, {
    strict: 'throw',
    timestamps: true,
  });

const eventModel = mongoose.model("Event", eventSchema)

module.exports = eventModel