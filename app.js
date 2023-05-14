require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));


mongoose.connect("mongodb://127.0.0.1:27017/userDB")

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

//this is the key that the encryption use to encrypt

                                //this is the enviroment 
userSchema.plugin(encrypt,{secret: process.env.SECRET, encryptedFields:["password"]});
const User = new mongoose.model("User", userSchema);



app.get("/", function (req, res) {
    res.render("home")    
});

//login
app.route("/login")
.get(function (req, res) {
    res.render("login")    
})
.post(function(req,res) {
    console.log(req.body.username)
    User.findOne({email: req.body.username}).then(function(foundUser) {
        console.log(foundUser)
        if(req.body.password === foundUser.password){
            res.render("secrets")
        }else{
            res.send("user 404")
        }
    })    
})


//register
app.route("/register")
.get(function (req, res) {
    res.render("register")    
})
.post(function(req, res){
    const user = new User ({
        email: req.body.username,
        password: req.body.password
    });
    user.save().then(function(suscess){
        if(suscess){
            res.send("suscess");
        }else{
            res.send("error 404")
        }
    })
})





app.listen(3000,function(){
    console.log("Working on port 3000");
})