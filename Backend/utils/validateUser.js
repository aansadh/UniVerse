const UserModel = require('../Models/userModel')
const mongoose = require('mongoose')

module.exports = async (userId) => {
    try {
        if(!mongoose.Types.ObjectId.isValid(userId))
            return null;

        const userExists = await UserModel.exists({_id: userId})
        return userExists;
    } catch(error) {
        console.log('Error occurred! Error: ', error)
        return null;
    }
}
