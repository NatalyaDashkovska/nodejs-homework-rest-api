const User = require('./user-schema');
// const contacts = require('./contacts.json')
// const { ObjectID } = require('mongodb');
// const db = require('./db');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();
const fs = require('fs').promises;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
require('dotenv').config();
const SECRET_KEY = process.env.JWT_SECRET_KEY;
const findUserById = async id => {
  // console.log(id);
  return await User.findById(id);
};

const findUserByEmail = async email => {
  // console.log(email);

  return await User.findOne({ email });
};

const addUser = async body => {
  const user = new User(body);
  return user.save();
};

const updateToken = async (userId, token) => {
  return await User.updateOne({ _id: userId }, { token });
};

const login = async ({ email, password }) => {
  // console.log(email);
  const user = await findUserByEmail(email);
  if (!user || !user.validPassword(password)) {
    return null;
  }
  const id = user.id;
  const payload = { id };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
  await updateToken(id, token);
  return token;
};
const logout = async id => {
  return await updateToken(id, null);
};

const current = async id => {
  const user = await findUserById(id);

  return { email: user.email, subscription: user.subscription };
};

const updateSubscriptionById = async (userId, body) => {
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { ...body },
    {
      new: true,
    },
  );

  return updatedUser;
};

const updateAvatar = async (userId, pathFile) => {
  console.log(userId);
  console.log(pathFile);
  return await User.updateOne({ _id: userId }, { avatar: pathFile });
};
// const uploadCloud = pathFile => {
//   return new Promise((resolve, reject) => {
//     cloudinary.uploader.upload(
//       pathFile,
//       { folder: 'avatars' },
//       (error, result) => {
//         // console.log(result);
//         if (error) reject(error);
//         if (result) resolve(result);
//       },
//     );
//   });
// };

// const getAvatar = async userId => {
//   const { avatar, idCloud } = await User.findOne({ _id: userId });
//   return { avatar, idCloud };
// };

module.exports = {
  findUserById,
  findUserByEmail,
  addUser,
  updateToken,
  login,
  logout,
  updateSubscriptionById,
  current,
  updateAvatar,
};
