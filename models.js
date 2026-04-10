const mongoose = require("mongoose");
//mongoose.connect("mongodb+srv://subhamay:Subhamaypaul23@trello.yfamczr.mongodb.net/trello");

//schema and models

const userSchema = new mongoose.Schema({
    username: String,
    password: String
})

const organisationSchema = new mongoose.Schema({
    title: String,
    description: String,
    admin: mongoose.Types.ObjectId, //user with ID:1
    members: [mongoose.Types.ObjectId] //user with ID:2 is a member of this organisation
})

const boardSchema = new mongoose.Schema({
    title: String,
    organisationId: mongoose.Types.ObjectId //board belongs to organisation with ID:1,
})

const issueSchema = new mongoose.Schema({
    title: String,
    boardId: mongoose.Types.ObjectId, //issue belongs to board with ID:1
    state: String // IN_PROGRESS | DONE | NEXT_UP | ARCHEIVED
})

const userModel = mongoose.model("user", userSchema);
const organisationModel = mongoose.model("organsiation", organisationSchema);
const boardModel = mongoose.model("board", boardSchema);
const issueModel = mongoose.model("issue", issueSchema);

module.exports = {
    userModel,
    organisationModel,
    boardModel,
    issueModel
}