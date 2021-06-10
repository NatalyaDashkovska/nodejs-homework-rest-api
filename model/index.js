const Contact = require('./schemas');
// const contacts = require('./contacts.json')
// const { ObjectID } = require('mongodb');
// const db = require('./db');

const listContacts = async () => {
  // console.log(db);
  return await Contact.find({});
};

const getContactById = async contactId => {
  return await Contact.findOne({ _id: contactId });
};

const removeContact = async contactId => {
  return await Contact.findByIdAndRemove({ _id: contactId });
};

const addContact = async body => {
  return await Contact.create(body);
};

const updateContact = async (contactId, body) => {
  const record = await Contact.findByIdAndUpdate(
    { _id: contactId },
    { ...body },

    { new: true },
  );
  return record;
};

const updateStatusContact = async (contactId, body) => {
  const record = await Contact.findByIdAndUpdate(
    { _id: contactId },
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
