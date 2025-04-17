const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema.Types

const validateId = {
            validator: async function (userId) {
                const userExists = await mongoose.model('User').findById(userId)
                return userExists != null;
            },
            message: "Invalid UserID: User not found!"
        }

const friendshipSchema = new mongoose.Schema({
    requester: { 
        type: ObjectId, 
        ref: "User", 
        required: true,
        validate: validateId,
        immutable: true
    },
    recipient: { 
        type: ObjectId, 
        ref: "User", 
        required: true,
        validate: validateId,
        immutable: true
    },
    status: { 
        type: String, 
        enum: ["pending", "accepted", "declined", "blocked"], 
        default: "pending" 
    }
}, {strict: "throw", timestamps: true})

friendshipSchema.index({requester: 1, recipient: 1}, {unique: true})
friendshipSchema.index({recipient: 1, requester: 1}, {unique: true})

const friendshipModel = mongoose.model("Friendship", friendshipSchema)

module.exports = friendshipModel