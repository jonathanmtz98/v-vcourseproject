const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')
const crypto = require('crypto')

const app = express()

app.use(express.static("public"))
app.set('view engine','ejs')
app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
}))

app.use(passport.initialize());
app.use(passport.session());

const mongoose = require ("mongoose")
//mongoose.connect("mongodb://localhost:27017/test")
mongoose.connect('mongodb://localhost/V&V')

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    secret: String,
    key: String
})

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema)

passport.use(User.createStrategy())

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


app.use(passport.initialize());
app.use(passport.session());


//Handle user login
app.get("/login", function(req, res){
    res.render("login")
})

app.post("/login",function(req, res){
    const user = new User({
        username: req.body.username,
        password:req.body.password
    })

    req.login(user, function(err){
        if (err){
            console.log(err);
        } else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/");
            })
        }
    })
})

//Register new users
app.get("/signup", function(req, res){
    res.render("signup")
})

app.post("/signup", function(req,res){
    User.register({username: req.body.username}, req.body.password, function(err,user){
        if(err){
            console.log(err);
            res.redirect("/signup")
        } else{
            passport.authenticate("local")(req,res, function(){
                res.redirect("/")
            })
        }
    })
})


const travelSchema = new mongoose.Schema({
    origin: String,
    destination: String,
    departure: Date,
    return: Date,
    passengername: String,
    phone: String,
    email: String,
    seat: String,
})


const Travel = mongoose.model("Travel", travelSchema)

//Main Page
app.get("/", function(req,res){
    if(req.isAuthenticated()){
        res.render("home")
    }
    else{
        res.redirect("/login")//Force the user to login in order to access the main page
    }
    //res.render("home")
})

app.post("/", function(req,res){
    const destination_input = req.body.destination;
    const origin_input = req.body.origin;
    const departure_input = req.body.departure;
    const return_input = req.body.returnDate;
    const name_input = req.body.name;
    const email_input = req.body.email;
    const phone_input = req.body.phone;
    const seat_input = req.body.seatSelection;


    const flight = new Travel ({
        destination: destination_input,
        origin: origin_input,
        departure: departure_input,
        return: return_input,
        passengername: name_input,
        email: email_input,
        phone: phone_input,
        seat: seat_input
    })
    flight.save()

    console.log(flight);
    res.send(`Thanks for booking! Your trip has been confirmed.`);
});



let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}
app.listen(port,function(){
    console.log("Server has started successfully");
})