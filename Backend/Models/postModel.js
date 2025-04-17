const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema.Types

const postSchema = new mongoose.Schema({
    uploader: {
        type: ObjectId,  
        ref: "User",
        required: true,
        validate: {
            validator: async function (userId) {
                const userExists = await mongoose.model('User').findById(userId).lean()
                return userExists != null;
            },
            message: "Invalid UserID: User not found!"
        }
    },
    description: {
        type: String,
        trim: true,
        maxLength: 300
    },
    media: String,  
    likes: {
        type: [ObjectId],
        ref: "User",
        default: []
    },  
},{strict: "throw", timestamps: true})

postSchema.index({uploader: 1, updatedAt: -1})

const postModel = mongoose.model("Post", postSchema)

module.exports = postModel