const multer = require('multer')
const path = require('path')
const fs = require('fs')

const uploadsFolderPath = path.join(__dirname, '..', 'uploads') 

try {
    if (!fs.existsSync(uploadsFolderPath)) {
        console.log("Folder does not exist! Creating Folder...")
        fs.mkdirSync(uploadsFolderPath);
    }
} catch (err) {
    console.error(err);
}

const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        const uniqueFileName = Date.now() + '-' + req.user._id + '-' + Math.floor(Math.random() * 1E9)
        cb(null, uniqueFileName + path.extname(file.originalname))
    }
})

const upload = multer({storage: storage})

const uploader = (fieldName) => {
    return (req, res, next) => {
    upload.single(fieldName)(req, res, (error) => {
        if(!req.file)
            return next()
        if(error)
            return res.status(500).send({message: "Couldn't upload file", error})
        next()
    })}
}

module.exports = uploader


//// NOTE:
// This method of upload without checking the file extension and verifying the magic bits is still
// prone to various attacks like csrf and xxs. use fileFilter for that. To be explored furthur.