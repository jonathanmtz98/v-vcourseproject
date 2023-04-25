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
})

const adminSchema = new mongoose.Schema({
    username: String,
    password: String,
})

const Admin = mongoose.model("Admin", adminSchema)

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
                res.redirect("/manageclientflights");
            })
        }
    })
})

//Register new users
app.get("/signup", function(req, res){
    res.render("signup")
})

app.post("/signup", function(req,res){
    User.register({username: req.body.username, role: 'user'}, req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.redirect("/signup")
        } else{
            passport.authenticate("local")(req,res, function(){
                res.redirect("/manageclientflights")
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

//Booking flights page retriever
app.get("/", async (req, res) => {
    if(req.isAuthenticated()){
        try{
            const destinations = await Destination.find({})
            res.render('clientPage.ejs', {destinations})
    
        } catch (err){
            console.log(err);
            res.send("Error retrieving available destinations")
        }}
    else{
        res.redirect("/login")//Force the user to login in order to access the main page
    }
});


//This function is in charge of booking a new flight (form)
app.post("/", async (req,res) =>{
    const destination_input = req.body.destinations;
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
    res.render(`clientbookingsuccess`);
})

//This function retrieves main GUI for clients, where they can decide to book a flight or view flights
app.get("/manageclientflights", function(req,res){
    res.render('manageclientflights')
})

//This function is in charge of getting all flights and displaying them 
app.get('/viewflights', async (req, res) => {
    //res.render('manageflights')
    try {
        // Find all documents in the collection
        const flights = await Travel.find({});
        // Render the EJS file and pass the documents as a variable
        res.render('viewflights.ejs', { flights });
      } catch (err) {
        console.log(err);
        res.send('Error retrieving documents');
      }
  });
  
//This function is in charge of canceling (deleting) a booked flight  
app.get('/delete/:id', async (req, res) => {
    const elementId = req.params.id;
    try {
      const deletedElement = await Travel.findByIdAndDelete(elementId);
      console.log(`Element with ID ${elementId} deleted`);
      //res.send(`Element with ID ${elementId} deleted`);
      res.redirect("/viewflights")
    } catch (err) {
      console.log(err);
      res.status(500).send('Error deleting element');
    }
});
  

// ################# ADMIN SECTION ##################
const destinationSchema = new mongoose.Schema({
    destination: String
})

const Destination = mongoose.model("Destination", destinationSchema)

//Manage Flights
app.get("/adminhome", function(req,res){
    res.render('adminhome')
});

//This function is for the admin to add a new destination into the system
app.post("/adminhome", function(req,res){
    const destination_input = req.body.destination;
    const flight = new Destination ({
        destination: destination_input,
    })
    flight.save()
    console.log(flight);
    //res.send(`Changes has been applied`);
    res.render("success")
});


//Retrieve admin login page
app.get("/adminlogin", function(req, res){
    res.render("adminlogin")
})

//This function is in charge of logging in as an admin
app.post("/adminlogin",function(req, res){
    const admin = new Admin({
        username: req.body.username,
        password:req.body.password
    })

    req.login(admin, function(err){
        if (err){
            console.log(err);
        } else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/manageflights");
            })
        }
    })
})


//This function is to show flights in the admin gui so he decides to add or delete more
app.get("/manageflights", async (req,res)=> {
    //res.render('manageflights')
        try {
      // Find all documents in the collection
      const destinations = await Destination.find({});
      // Render the EJS file and pass the documents as a variable
      res.render('manageflights.ejs', { destinations });
    } catch (err) {
      console.log(err);
      res.send('Error retrieving documents');
    }
});






// app.get('/', async (req, res) => {
//     try {
//       // Find all documents in the collection
//       const myDocuments = await MyModel.find({});
//       // Render the EJS file and pass the documents as a variable
//       res.render('index.ejs', { myDocuments });
//     } catch (err) {
//       console.log(err);
//       res.send('Error retrieving documents');
//     }
//   });


let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}
app.listen(port,function(){
    console.log("Server has started successfully");
})