const User = require('./user-schema');
// const contacts = require('./contacts.json')
// const { ObjectID } = require('mongodb');
// const db = require('./db');
const jwt = require('jsonwebtoken');
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
  console.log(email);
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

module.exports = {
  findUserById,
  findUserByEmail,
  addUser,
  updateToken,
  login,
  logout,
  updateSubscriptionById,
  current,
};
