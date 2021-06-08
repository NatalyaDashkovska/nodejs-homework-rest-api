const low = require("lowdb");
const path = require("path");
const FileSync = require("lowdb/adapters/FileSync");
// import low from "lowdb";

const adapter = new FileSync(
  path.join(__dirname, "..", "model", "contacts.json")
);

const db = low(adapter);

db.defaults({ contacts: [] }).write();

module.exports = db;
