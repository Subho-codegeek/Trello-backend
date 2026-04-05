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

const userModel = mongoose.model("user", userSchema);
const organisationModel = mongoose.model("organsiation", organisationSchema);

module.exports = {
    userModel,
    organisationModel
}