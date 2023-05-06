const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')
const crypto = require('crypto')
const methodOverride = require ('method-override')

const app = express()

app.use(express.static("public"))
app.use(methodOverride('_method'))
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
const { application } = require("express")
const exp = require("constants")
//mongoose.connect('mongodb://localhost/V&V')
mongoose.connect('mongodb+srv://software:PassWord1!@cluster0.yjqdrnw.mongodb.net/?retryWrites=true&w=majority')
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
})

const adminSchema = new mongoose.Schema({
    username: String,
    password: String,
})

const creditcardSchema = new mongoose.Schema({
    name: String,
    billingAddress: String,
    cardNumber: String,
    cvv: String,
    expirationDate: String
})

const CreditCard = mongoose.model("CreditCard",creditcardSchema)

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

app.get('/logout', function(req,res){
    req.logout(function(err){
        if (err){
            return next(err) }
        res.redirect('/login')
    })
})

const travelSchema = new mongoose.Schema({
    origin: String,
    destination: String,
    departure: Date,
    departureTime: String,
    return: Date,
    returnTime: String,
    passengername: String,
    phone: String,
    seatInput: String,
    email: String,
    status: String
})


const Travel = mongoose.model("Travel", travelSchema)



//Booking flights page retriever
app.get("/", async (req, res) => {
    if(req.isAuthenticated()){
        try{
            const destinations = await Destination.find({})
            //const seats = await Seat.find({})
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
    const departure_time = req.body.departureTime;
    const return_input = req.body.returnDate;
    const return_time = req.body.returnTime;
    const name_input = req.body.name;
    const email_input = req.body.email;
    const phone_input = req.body.phone;
    //seat_input = "placeholder"

    const flight = new Travel ({
        destination: destination_input,
        origin: origin_input,
        departure: departure_input,
        departureTime: departure_time,
        return: return_input,
        returnTime: return_time,
        passengername: name_input,
        email: email_input,
        phone: phone_input,
        status: 'unpaid'
        // seatInput: seat_input

    })
    flight.save()
    console.log(flight);
    res.render(`clientbookingsuccess`);
    //res.render('select-seats', {flight})
    //res.redirect(`/flights/${flight._id}`);

})


app.get('/edit/:id', async (req, res) => {
    const flights = await Travel.findById(req.params.id);
    res.render('select-seats', { flights: flights });
});

app.post('/update/:id', async (req,res)=>{
     let id = req.params.id
     selectedSeat = req.body.seat
     console.log(selectedSeat);
     console.log(id);
    // console.log(selectedSeat);
    try{
        await Travel.findByIdAndUpdate(id,{
            seatInput: selectedSeat
        }, {new: true})
        res.redirect("/makepayment")
    } catch(error){
        console.log(error.message);
        res.status(500).send({message: "Internal server error"})
    }
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


// Payment page retriever
app.get('/makepayment', async (req,res)=>{
    const price = Math.floor(Math.random() * 301) + 200;
    res.render('makepayment', {price})
})

app.post('/process-payment', (req, res) => {
    const cardNumber = req.body.cardNumber;
    const cvv = req.body.cvv;
    const name = req.body.ownerName;
    const billingAddress = req.body.billingAddress
    const expirationDate  = req.body.expirationDate;

    if (!cardNumber || cardNumber.length !== 16) {
        // Render an error page indicating that the card number is invalid
        res.render('payment-result', { success: false, errorMessage: 'Invalid card number length. Please make sure the card number has 16 digits.' });
        return;
      } else if (!cvv || cvv.length !== 3) {
        // Render an error page indicating that the CVV is invalid
        res.render('payment-result', { success: false, errorMessage: 'Invalid CVV. Please make sure the CVV has 3 digits.' });
        return;
      } else if (!expirationDate || !expirationDate.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
        // Render an error page indicating that the expiration date is invalid
        res.render('payment-result', { success: false, errorMessage: 'Invalid expiration date format. Please enter the date in the format MM/YY.' });
        return;
      } else {
        const [month, year] = expirationDate.split('/');
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1; // January is month 0
        const currentYear = currentDate.getFullYear() % 100; // Last two digits of the year
      
        if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
          // Render an error page indicating that the expiration date has already passed
          res.render('payment-result', { success: false, errorMessage: 'The entered expiration date has already passed. Please enter a valid date.' });
          return;
        }
      }
      // If no errors occur, continue with the payment processing
      res.render('payment-result', { success: true });
      
});





// ############################################## ADMIN SECTION ##############################################
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
      const flights = await Travel.find({})
      // Render the EJS file and pass the documents as a variable
      res.render('manageflights.ejs', { destinations, flights });
    } catch (err) {
      console.log(err);
      res.send('Error retrieving documents');
    }
});


let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}
app.listen(port,function(){
    console.log("Server has started successfully");
})