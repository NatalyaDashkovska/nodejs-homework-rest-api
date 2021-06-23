const Contact = require('./schemas');
// const contacts = require('./contacts.json')
// const { ObjectID } = require('mongodb');
// const db = require('./db');

const listContacts = async (userId, { limit = 20, offset = 0 }) => {
  const { docs: contacts, totalDocs: total } = await Contact.paginate(
    { owner: userId },
    {
      limit,
      offset,

      populate: {
        path: 'owner',
        select: ' name email subscription  -_id',
      },
    },
  );
  return { contacts, total, limit: Number(limit), offset: Number(offset) };
};

const getContactById = async (userId, contactId) => {
  return await Contact.findOne({ _id: contactId }, { owner: userId }).populate({
    path: 'owner',
    select: ' name email subscription -_id',
  });
};

const removeContact = async (userId, contactId) => {
  // console.log(contactId);
  return await Contact.findByIdAndRemove({ _id: contactId, owner: userId });
};

const addContact = async (body, userId) => {
  return await Contact.create({ ...body, owner: userId });
};

const updateContact = async (userId, contactId, body) => {
  const record = await Contact.findByIdAndUpdate(
    { _id: contactId, owner: userId },
    { ...body },

    { new: true },
  );
  return record;
};

const updateStatusContact = async (userId, contactId, body) => {
  const record = await Contact.findByIdAndUpdate(
    { _id: contactId, owner: userId },
    { ...body },
    { new: true },
  );
  return record;
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
};
