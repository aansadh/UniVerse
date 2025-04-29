require("dotenv").config();
const express = require("express");
const postModel = require("../Models/postModel");
const authenticator = require("../Middlewares/authentication");
const uploader = require("../Middlewares/mediaUploadMiddleware"); // handles posting of data (images)
const expressAsyncHandler = require("express-async-handler");
const fs = require("fs"); // fs = file system
const path = require("path");
const mongoose = require("mongoose");
const enrichProfilePic = require("../utils/enrichProfilePic");

const posts = express.Router();

posts.use(authenticator); // protected Route

posts.post(
  "/",
  uploader("media"),
  expressAsyncHandler(async (req, res) => {
    const fileName = req.file?.filename;
    const description = req.body.description?.trim();

    if (!fileName && !description)
      return res.status(400).send({
        message: "Must provide atleast an image or description to upload.",
      });

    let postDetails = {};
    fileName && (postDetails.media = fileName);
    description && (postDetails.description = description);
    const post = new postModel({ ...postDetails, uploader: req.user._id });
    let savedDoc = await post.save();
    savedDoc = await savedDoc.populate(
      "uploader",
      "firstName lastName profilePic"
    );
    savedDoc.uploader = enrichProfilePic(savedDoc.uploader);

    delete savedDoc.__v;
    savedDoc.liked = false;
    savedDoc.likesCount = 0;
    delete savedDoc.likes;

    res.send({ message: "Successfully uploaded post!", payload: savedDoc });
  })
);

//// Get all posts.
posts.get(
  ["/", "/search"],
  expressAsyncHandler(async (req, res) => {
    const isNum = (num) => {
      return typeof num === "number" && !isNaN(num);
    };

    const baseURL = `${process.env.baseURL}users/media/`;
    const userId = req.user._id;

    let { lastUpdatedAt, limit, lastId } = req.query;

    // Validate lastId
    if (
      (lastUpdatedAt && !lastId) ||
      (!!lastId && !mongoose.Types.ObjectId.isValid(lastId))
    )
      res.status(400).send({
        message:
          "Invalid UserId: LastId must be provided! If already provided, check the format!",
      });
    else if (lastId) lastId = new mongoose.Types.ObjectId(`${lastId}`);

    // parse limit
    let parsedLimit = parseInt(`${limit}`) || 10;
    !isNum(parsedLimit) && (parsedLimit = 10);

    // parse lastUpdatedAt
    if (!lastUpdatedAt || isNaN(Date.parse(lastUpdatedAt))) {
      lastUpdatedAt = new Date();
    } else {
      lastUpdatedAt = new Date(lastUpdatedAt);
    }

    let reqFields = {};
    if (req.path === "/search") {
      const allowedFields = new Set(["uploader"]);
      reqFields = req.query;

      reqFields = Object.fromEntries(
        Object.keys(reqFields)
          .filter(
            (key) =>
              allowedFields.has(key) && reqFields[key] !== "" && reqFields[key]
          )
          .map((key) => {
            if (!mongoose.Types.ObjectId.isValid(reqFields[key]))
              return res.status(400).send({ message: "Invalid Uploader Id" });
            if (key === "uploader" && reqFields[key]) {
              return [key, new mongoose.Types.ObjectId(`${reqFields[key]}`)];
            }
            return [key, reqFields[key]];
          })
      );
    }

    const allPosts = await postModel.aggregate([
      {
        $match: {
          ...reqFields,
          $or: [
            {
              updatedAt: { $lt: lastUpdatedAt },
            },
            {
              updatedAt: { $lte: lastUpdatedAt },
              _id: { $lt: lastId },
            },
          ],
        },
      },
      { $sort: { updatedAt: -1, _id: -1 } },
      { $limit: Number(parsedLimit) },
      { $unset: "__v" },
      {
        $lookup: {
          from: "users",
          pipeline: [
            {
              $project: {
                firstName: true,
                lastName: true,
                profilePic: true,
              },
            },
            {
              $set: {
                profilePic: {
                  $concat: [baseURL, "$profilePic"],
                },
              },
            },
          ],
          localField: "uploader",
          foreignField: "_id",
          as: "uploader",
        },
      },
      { $unwind: "$uploader" },
      {
        $addFields: {
          likesCount: { $size: "$likes" },
          isLiked: {
            $cond: [
              { $in: [new mongoose.Types.ObjectId(`${userId}`), "$likes"] },
              true,
              false,
            ],
          },
        },
      },
      { $unset: "likes" },
    ]);

    // let allPosts = await postModel.find()
    //                               .populate("uploader", "firstName lastName profilePic")
    //                               .lean()

    // allPosts = allPosts.map((post) => {
    //     const profilePicURL = baseURL + post.uploader.profilePic
    //     const updatedPosts = {
    //         ...post,
    //         uploader: {
    //             ...post.uploader,
    //             profilePic: profilePicURL
    //         },
    //         liked: post.likes.map((id) => id.toString()).includes(userId) || false,
    //         likesCount: post.likes.length || 0
    //     }
    //     delete updatedPosts.likes
    //     return updatedPosts
    // })

    // better to use aggregation.

    // since baseURL is directly being appended without any sanitation this is still (even after aggregation) prone to various attacks.

    res.send({
      message: `All Posts until the cursor pointer: ${lastUpdatedAt} fetched!`,
      posts: allPosts,
      pagination: {
        nextCursor: {
          lastUpdatedAt: allPosts?.[allPosts.length - 1].updatedAt,
          lastId: allPosts?.[allPosts.length - 1]._id,
        },
        size: allPosts?.length || 0,
        hasMore: allPosts?.length === parsedLimit,
      },
      devMessage:
        "Remember that this payload only consists of media fileName which must be accessed by another request. In real time, possibly, caches are used to optimise this.",
    });
  })
);

// posts.get('/media/:filename', (req, res) => {
//     const file = path.resolve('uploads', req.params.filename)

//     if (!fs.existsSync(file)) {
//       return res.status(404).send("File not found")
//     }

//     const ext = path.extname(file).toLowerCase()

//     const mimeTypes = {
//       '.mp4': 'video/mp4',
//       '.mov': 'video/quicktime',
//       '.jpg': 'image/jpeg',
//       '.jpeg': 'image/jpeg',
//       '.png': 'image/png',
//       '.webp': 'image/webp',
//     }

//     const contentType = mimeTypes[ext] || 'application/octet-stream'
//     res.setHeader('Content-Type', contentType)
//     res.sendFile(file)

//     // Note: There can be potential inconsistency issues that may arise leading to broken links. There is a scope of improvement.
//   })

posts.get(
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

// posts.get('/search', expressAsyncHandler(async (req, res) => {
//     const allowedFields = new Set(['uploader'])
//     let reqFields = req.query

//     reqFields = Object.fromEntries(
//         Object.keys(reqFields)
//             .filter((key) =>  allowedFields.has(key) && (reqFields[key] !== '') && reqFields[key] )
//             .map((key) => [key, reqFields[key]])
//     )

//     // regex injection attack prone!

//     const result = await postModel.find(reqFields)
//                                   .populate('uploader', '_id firstName')
//                                   .lean()
//                                 //   .explain('executionStats')

//     res.send({message: "Fetched the posts.", attributes: reqFields, payload: result})
// }))

posts.post(
  "/like-unlike/:id",
  expressAsyncHandler(async (req, res) => {
    const userId = req.user._id;
    const postId = req.params.id;

    // console.log("type of userId: ", typeof userId)

    let isLiked = await postModel
      .findOne({ _id: postId, likes: new mongoose.Types.ObjectId(`${userId}`) })
      .lean();

    const updatedDoc = isLiked
      ? { $pull: { likes: userId } }
      : { $addToSet: { likes: userId } };

    const finalDoc = await postModel
      .findByIdAndUpdate(postId, updatedDoc, { new: true })
      .lean();

    if (!finalDoc)
      return res
        .status(400)
        .send({ message: "Invalid post Id! Post not found!" });

    res.send({
      message: isLiked ? "Unliked successfully!" : "Liked successfully!",
      likesCount: finalDoc?.likes?.length || 0,
      finalDoc: finalDoc,
    });
  })
);

// delete post by id.
posts.delete(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const postId = req.params.id;
    const userId = req.user._id;

    console.log("postId : ", postId);

    const postDetails = await postModel.findById(postId).lean();
    if (!postDetails)
      return res.status(404).send({ message: "Invalid postId" });

    if (!postDetails.uploader?.equals(userId))
      return res.status(403).send({
        message: "You are not allowed to delete posts of other users!",
      });

    if (postDetails.media && postDetails.media !== "Default.svg") {
      const filePath = path.join(__dirname, "..", "uploads", postDetails.media);

      fs.access(filePath, fs.constants.F_OK, (error) => {
        if (error)
          return res.status(404).send({
            message:
              "Some error has occurred while retrieving the file. Couldn't delete file!",
            error: error,
          });
      });

      fs.unlink(filePath, (error) => {
        if (error)
          return res
            .status(500)
            .send({ message: "Couldn't delete media.", error: error });
      });
    }

    const deleteRes = await postModel.findByIdAndDelete(postId);

    res.send({ message: "Successfully Deleted Post" });
  })
);

// GET post details by postId
posts.get(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const postId = req.params.id;

    const postDetails = await postModel.findById(postId).lean();
    if (!postDetails)
      return res.status(404).send({ messsage: "Post Not Found!" });

    res.send({ message: "Post found!", payload: postDetails });
  })
);

module.exports = posts;