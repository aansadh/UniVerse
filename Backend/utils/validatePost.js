const PostModel = require('../Models/postModel')
const mongoose = require('mongoose')

module.exports = async (userId) => {
    try {
        if(!mongoose.Types.ObjectId.isValid(userId))
            return null;

        const postExists = await PostModel.exists({_id: userId})
        return postExists;
    } catch(error) {
        console.log('Error occurred! Error: ', error)
        return null;
    }
}
