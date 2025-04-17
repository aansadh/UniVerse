require('dotenv').config()
const jwt = require('jsonwebtoken')

const authenticateUser = (req, res, next) => {
    const token = req.cookies.jwtToken
    if(!token)
        return res.status(401).send({message: "Unauthorized: Please login to proceed!"})

    try {
        const decodedContent = jwt.verify(token, process.env.jwtSecretKey, {algorithms: ["HS256"]})
        req.user = decodedContent
        next()
    } catch(error) {
        return res.status(403).json({message: "Invalid session!"})
    } 
}

module.exports = authenticateUser