// require('dotenv').config()
const bcrypt = require('bcrypt');
const saltRounds = 10;
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));


mongoose.connect("mongodb://127.0.0.1:27017/userDB")

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

//this is the key that the encryption use to encrypt

//this is the enviroment
// userSchema.plugin(encrypt,{secret: process.env.SECRET, encryptedFields:["password"]});

//i trade this for another more security methodo
const User = new mongoose.model("User", userSchema);



app.get("/", function (req, res) {
    res.render("home")
});

//login
app.route("/login")
    .get(function (req, res) {
        res.render("login", { Title: "" })
    })
    .post(function (req, res) {

        console.log(req.body.username)
        User.findOne({ email: req.body.username }).then(function (foundUser) {
            console.log(foundUser)

            bcrypt.compare(req.body.password, foundUser.password).then(function (result) {
                if (result === true) { res.render("secrets") } else {

                    res.render("login", { Title: "notFound" })
                }
            });
        });
    });


//register
app.route("/register")
    .get(function (req, res) {
        res.render("register")
    })
    .post(function (req, res) {
        bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
            const user = new User({
                email: req.body.username,
                password: hash
            });
            user.save().then(function (suscess) {
                if (suscess) {
                    res.render("secrets")
                } else {
                    res.send("error 404")
                }
            })
        });
    })





app.listen(3000, function () {
    console.log("Working on port 3000");
})