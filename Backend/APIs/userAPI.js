require("dotenv").config();
const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const users = express.Router();
const UserModel = require("../Models/userModel");
const authenticateUser = require("../Middlewares/authentication");
const userModel = require("../Models/userModel");
const uploader = require("../Middlewares/mediaUploadMiddleware");
const path = require("path");
const fs = require("fs");
const postModel = require("../Models/postModel");

users.use(authenticateUser);

users.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    const baseURL = process.env.baseURL + "users/media/";

    const allUsers = await UserModel.aggregate([
      {
        $project: {
          _id: true,
          firstName: true,
          lastName: true,
          profilePic: {
            $concat: [baseURL, "$profilePic"],
          },
        },
      },
    ]);

    res.send({ message: "Users fetched!", payload: allUsers });
  })
);

users.get(
  ["/profile", "/profile/:id"],
  expressAsyncHandler(async (req, res) => {
    const path = req.path;
    const userId = path === "/profile" ? req.user._id : req.params.id; // you are able to access this because authenticateUser middleware has already decoded the jwtToken
    let userDetails = await UserModel.findById(userId, {
      __v: false,
      password: false,
      email: false,
    }).lean();
    if (!userDetails)
      return res.status(404).send({ message: "User not found!" });

    userDetails.profilePic = `${process.env.baseURL}users/media/${userDetails.profilePic}`;

    res.send({ message: "Data fetched successfully!", payload: userDetails });
  })
);

users.patch(
  "/update",
  uploader("profilePic"),
  expressAsyncHandler(async (req, res) => {
    const allowedUpdates = new Set(["email", "firstName", "lastName", "bio"]);
    let requestedUpdates = req.body;
    const fileName = req.file?.filename;
    // update password will be implemented later
    // not tested!
    requestedUpdates = Object.fromEntries(
      Object.keys(requestedUpdates)
        .filter(
          (key) =>
            allowedUpdates.has(key) &&
            requestedUpdates[key] !== "" &&
            requestedUpdates[key]
        )
        .map((key) => [key, requestedUpdates[key]])
    );

    fileName && (requestedUpdates.profilePic = fileName);

    const updateRes = await userModel.findByIdAndUpdate(
      req.user._id,
      { $set: requestedUpdates },
      { runValidators: true }
    );
    if (!updateRes) return res.status(404).send({ message: "User not found!" });
    res.send({ message: "Details updated successfully!" });
  })
);

// mime types are not checked. Prone to attacks.
users.get(
  "/media/:fileName",
  expressAsyncHandler(async (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, "..", "uploads", fileName);

    try {
      fs.access(filePath, fs.constants.F_OK, (error) => {
        if (error)
          return res
            .status(404)
            .send({
              message: "Some error has occurred while retrieving the file.",
              error: error,
            });
      });
    } catch (error) {
        console.log("Some error has occurred! ERROR: ", error)
        return res
            .status(404)
            .send({
              message: "Some error has occurred while retrieving the file.",
              error: error,
            });
    }

    res.sendFile(filePath);
  })
);

users.delete(
  "/delete",
  expressAsyncHandler(async (req, res) => {
    const userID = req.user._id;
    const deleteRes = await UserModel.findByIdAndDelete(userID);
    if (!deleteRes) return res.status(404).send({ message: "User not found!" });

    // this part needs to be handled with care.

    // deleting all the posts by this user.
    const deletePostRes = await postModel.deleteMany({
      uploader: userID,
    });
    const postMsg = `Successfully Deleted ${deletePostRes.deletedCount} posts!`;
    // events need to be taken care of.

    res.clearCookie("jwtToken", {
      httpOnly: true,
      sameSite: "Strict",
      secure: process.env.NODE_ENV === "production",
      // path: "/"
    });

    res.send({
      message: `Account deleted successfully! Deleted message: ${postMsg}`,
    });
  })
);

users.get(
  "/search",
  expressAsyncHandler(async (req, res) => {
    const allowedFields = new Set(["firstName", "lastName"]);
    let requestedFields = req.query;
    requestedFields = Object.fromEntries(
      Object.keys(requestedFields)
        .filter(
          (key) =>
            allowedFields.has(key) &&
            requestedFields[key] !== "" &&
            requestedFields[key]
        )
        .map((key) => [key, requestedFields[key]])
    );
    // The operation and security here might be improved by deciding projections.
    const reqUsers = await UserModel.find(requestedFields, {
      _id: true,
      firstName: true,
      lastName: true,
      profilePic: true,
    });
    if (!reqUsers.length)
      return res.status(404).send({ message: "No users found!" });
    res.send({ message: "Users found!", payload: reqUsers });
  })
);

module.exports = users;
