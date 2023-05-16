const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

//this sets is only to the autentication parameters
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));


// https://www.npmjs.com/package/express-session
//this function is responsable to cache the cookie and keep the user logged
app.use(session({
    secret: "Just a random name.",
    resave: false,
    saveUninitialized: false
}));
//this is to initialize the module that grab the passport and salt him
app.use(passport.initialize());
app.use(passport.session());

//connection with the dataBase
mongoose.connect("mongodb://127.0.0.1:27017/userDB")

//creating a new schema to be ascess by the database
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

//like the other apps of autentication that we've used this is to create a mongoose schema to the passport
userSchema.plugin(passportLocalMongoose);

//implementing the schema to the mongoose model
const User = new mongoose.model("User", userSchema);

//these three var come from the documentation the first i guess that's to catch the passport and 
//hash him
passport.use(User.createStrategy());
//this is to pack the information in format of cokkie
passport.serializeUser(User.serializeUser());
//this is to unpack the information
passport.deserializeUser(User.deserializeUser());

//initial page
app.get("/", function (req, res) {
    res.render("home")
});

//login
app.route("/login")
    .get(function (req, res) {
        res.render("login")
    })
    //this first parameter was a sollution that daniel gave to fix a bug about the login that was cached 
    //even if the user logout
    .post(passport.authenticate("local"), function (req, res) {
        const user = new User({
            username: req.body.username,
            password: req.body.password
        });
        //if the user match with the user that have in the database we log him on the page
        req.login(user, (err) => {
            if (err) {
                res.render("login");
            } else {
                passport.authenticate("local")(req, res, function() {
                    res.redirect("/secrets");
                });
            }
        });
    });


//register
app.route("/register")
    .get(function (req, res) {
        res.render("register")
    })
    .post(function (req, res) {
        //This is a function of the module mongoose-local-passport that is like create a new objetct 
        //and do more one things that's authenticate the user and cache them to stay logged
        User.register({username: req.body.username, active: false}, req.body.password, function(err, user) {
            if (err) {res.send("Error")}
            else{
                passport.authenticate("local")(req, res, function(){
                    res.render("secrets");
                })
            }
              // Value 'result' is set to false. The user could not be authenticated since the user is not active
            });
    })
    //this is to in case of the user try to acess a page that is inside the app the systemy check if he is logged
    app.get('/secrets', function (req, res) {
        //this first parameter was a sollution that daniel gave to fix a bug about the login that was cached 
         //even if the user logout
        res.set(
            'Cache-Control', 
            'no-cache, private, no-store, must-revalidate, max-stal e=0, post-check=0, pre-check=0'
        );
        if (req.isAuthenticated()) {
            res.render('secrets');
        } else {
            console.log('user does not exist');
            res.redirect('/login');
        }
    });

//Logout   
app.get("/logout", (req, res, next) => {
	req.logout(function(err) {
		if (err) {
			return next(err);
		}
		res.redirect('/');
	});
});


app.listen(3000, function () {
    console.log("Working on port 3000");
})