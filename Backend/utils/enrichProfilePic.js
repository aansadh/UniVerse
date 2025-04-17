const enrichProfilePic = user => ({
    ...user,
    profilePic: `${process.env.baseURL}users/media/${user.profilePic}`
  });

module.exports = enrichProfilePic