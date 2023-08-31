import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import axios from "axios";
import _ from "lodash";
import { parse } from "path";
import session from "express-session";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";
import { stringify } from "querystring";

//create express app framework:
const app = express();
const port = 3000;

//set static file folder and initiate body-parser
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

//initialize the session middle-ware
app.use(
  session({
    secret: process.env.PASSPORT_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

//initialize passport to enable use for authentication
app.use(passport.initialize());
app.use(passport.session());

//Use mongoose to connect to a mongodb with password saved as environment variable
await mongoose.connect(
  `mongodb+srv://crunchySumo6960:${process.env.DB_PASSWORD}@cluster0.vwk3y8s.mongodb.net/coffeeDB`
);

//create the mongoose "Schema keyword"
const Schema = mongoose.Schema;

//create a coffee schema for new coffees to be stored in the 'coffees' collection
const scoreSchema = new Schema({
  userID: String,
  cupperName: String,
  cuppingDate: Date,
  purpose: String,
  coffeeId: { type: String, default: "none provided" },
  fragranceIntensity: { type: Number, min: 0, max: 15, default: 0 },
  fragranceScore: { type: Array, default: 0 },
  fragranceFinalScore: { type: Number, default: 0 },
  aromaIntensity: { type: Number, min: 0, max: 15, default: 0 },
  aromaScore: { type: Array, default: 0 },
  aromaFinalScore: { type: Number, default: 0 },
  smellCharacter: { type: Array, default: ["none provided"] },
  smellNotes: { type: String, default: "non provided" },
  flavorIntensity: { type: Number, min: 0, max: 15, default: 0 },
  flavorScore: { type: Array, default: 0 },
  flavorFinalScore: { type: Number, default: 0 },
  aftertasteIntensity: { type: Number, min: 0, max: 15, default: 0 },
  aftertasteScore: { type: Array, default: 0 },
  aftertasteFinalScore: { type: Number, default: 0 },
  flavorCharacter: { type: Array, default: ["none provided"] },
  taste: { type: Array, default: ["none provided"] },
  tasteNotes: { type: String, default: "non provided" },
  acidIntensity: { type: Number, min: 0, max: 15, default: 0 },
  acidityScore: { type: Array, default: 0 },
  acidityFinalScore: { type: Number, default: 0 },
  acidityCharacter: { type: Array, default: ["none provided"] },
  acidityNotes: { type: String, default: "non provided" },
  sweetnessIntensity: { type: Number, min: 0, max: 15, default: 0 },
  sweetnessScore: { type: Array, default: 0 },
  sweetnessFinalScore: { type: Number, default: 5 },
  sweetnessNotes: { type: String, default: "non provided" },
  mouthfeelIntensity: { type: Number, min: 0, max: 15, default: 0 },
  mouthfeelScore: { type: Array, default: 0 },
  mouthfeelFinalScore: { type: Number, default: 0 },
  mouthfeelCharacter: { type: Array, default: ["none provided"] },
  mouthfeelNotes: { type: String, default: "non provided" },
  extrinsicNotes: String,
  overallScore: { type: Array, default: 0 },
  overallFinalScore: { type: Number, default: 0 },
  nonUniformCups: { type: Array, default: 0 },
  defectiveCups: { type: Array, default: 0 },
  defectType: { type: Array, default: ["none"] },
  totalScore: Number,
});

//define the CoffeeModel to create the 'coffees' collection
const ScoreModel = new mongoose.model("Score", scoreSchema);

//create a user schema for new users to be stored in the 'users' collection and reference the coffee collection
const userSchema = new Schema({
  email: String,
  password: String,
});

//plugin used to salt and hash user passwords and save users into MongoDB users collection
userSchema.plugin(passportLocalMongoose);

//define the UserModel to create the 'users' collection
const UserModel = new mongoose.model("User", userSchema);

//passport-local-mongoose simplified code for creating a local strategy
passport.use(UserModel.createStrategy());

//serialize = create cookie and deserialize = open cookie and read user authentication
passport.serializeUser(UserModel.serializeUser());
passport.deserializeUser(UserModel.deserializeUser());

//create a coffee schema for coffee details
const coffeeSchema = new Schema({
  userID: String,
  country: String,
  region: String,
  city: String,
  variety: String,
  altitude: String,
  process: String,
  processNotes: String,
  producer: String,
  farm: String,
  providerName: String,
  providerNumber: Number,
  providerEmail: String,
  lastPrice: Number,
});

//define the CoffeeModel to create the 'coffee' collection
const CoffeeModel = new mongoose.model("Coffee", coffeeSchema);

//DEFINE RESTFUL APIs
app.get("/", (req, res) => {
  res.render("home.ejs");
});

app
  .route("/register")
  .get((req, res) => {
    res.render("register.ejs");
  })
  .post((req, res) => {
    //note: passport doesn't authenticate correctly if the name of the email input is "email" and not "username"
    UserModel.register({ username: req.body.username }, req.body.password, function (err, user) {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/dashboard");
        });
      }
    });
  });

app
  .route("/login")
  .get((req, res) => {
    res.render("login.ejs");
  })
  .post((req, res) => {
    const user = new UserModel({
      username: req.body.username,
      password: req.body.password,
    });
    req.login(user, function (err) {
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/dashboard");
        });
      }
    });
  });

app
  .route("/coffee-form")
  .get((req, res) => {
    //check authentication to allow user to view the form
    if (req.isAuthenticated()) {
      res.render("coffee-form.ejs");
    } else {
      res.redirect("/login");
    }
  })
  .post((req, res) => {
    const newCoffee = new CoffeeModel({
      userID: req.user.id,
      country: req.body.country,
      region: req.body.region,
      city: req.body.city,
      variety: req.body.variety,
      altitude: req.body.altitude,
      process: req.body.process,
      processNotes: req.body.processNotes,
      producer: req.body.producer,
      farm: req.body.farm,
      providerName: req.body.providerName,
      providerPhone: req.body.providerNumber,
      providerEmail: req.body.providerEmail,
      lastprice: req.body.price,
    });

    newCoffee.save();
    res.redirect("/dashboard");
  });

app
  .route("/form")
  .get((req, res) => {
    //check authentication to allow user to view this page
    if (req.isAuthenticated()) {
      res.render("form.ejs");
    } else {
      res.redirect("/login");
    }
  })
  .post((req, res) => {
    //view all form inputs
    console.log(req.body);

    //assign form inputs to variables needed for totalScore calculation
    const fragrance = parseInt(req.body.fragranceFinalScore);
    const aroma = parseInt(req.body.aromaFinalScore);
    const flavor = parseInt(req.body.flavorFinalScore);
    const aftertaste = parseInt(req.body.aftertasteFinalScore);
    const acidity = parseInt(req.body.acidityFinalScore);
    const sweetness = parseInt(req.body.sweetnessFinalScore);
    const mouthfeel = parseInt(req.body.mouthfeelFinalScore);
    const overall = parseInt(req.body.overallFinalScore);

    // //Code to handle nonuniform = undefined in case of uniform cups
    let nonuniform;
    if (!req.body.nonuniformCup) {
      nonuniform = 0;
    } else {
      nonuniform = req.body.nonuniformCup.length;
    }
    // //code to handle defects = undefined in case of no defective cups
    let defects;
    if (!req.body.defectCup) {
      defects = 0;
    } else {
      defects = req.body.defectCup.length;
    }

    // // assign cupScore function value to totalScore variable to push to DB
    const totalScore = cupScore(
      fragrance,
      aroma,
      flavor,
      aftertaste,
      acidity,
      sweetness,
      mouthfeel,
      overall,
      nonuniform,
      defects
    );

    //create a cupping Score for a coffee and save to db
    const newScore = new ScoreModel({
      userID: req.user.id,
      cupperName: req.body.cupperName,
      cuppingDate: req.body.cuppingDate,
      purpose: req.body.purpose,
      coffeeId: req.body.coffeeID,
      fragranceIntensity: parseInt(req.body.fragranceIntensity),
      fragranceScore: req.body.fragranceScore,
      fragranceFinalScore: parseInt(req.body.fragranceFinalScore),
      aromaIntensity: parseInt(req.body.aromaIntensity),
      aromaScore: req.body.aromaScore,
      aromaFinalScore: parseInt(req.body.aromaFinalScore),
      smellCharacter: req.body.smellCharacter,
      smellNotes: req.body.smellNotes,
      flavorIntensity: parseInt(req.body.flavorIntensity),
      flavorScore: req.body.flavorScore,
      flavorFinalScore: parseInt(req.body.flavorFinalScore),
      aftertasteIntensity: parseInt(req.body.aftertasteIntensity),
      aftertasteScore: req.body.aftertasteScore,
      aftertasteFinalScore: parseInt(req.body.aftertasteFinalScore),
      flavorCharacter: req.body.flavorCharacter,
      taste: req.body.taste,
      tasteNotes: req.body.tasteNotes,
      acidIntensity: parseInt(req.body.acidIntensity),
      acidityScore: req.body.acidityScore,
      acidityFinalScore: parseInt(req.body.acidityFinalScore),
      acidityCharacter: req.body.acidityCharacter,
      acidityNotes: req.body.acidityNotes,
      sweetnessIntensity: parseInt(req.body.sweetnessIntensity),
      sweetnessScore: req.body.sweetnessScore,
      sweetnessFinalScore: parseInt(req.body.sweetnessFinalScore),
      sweetnessNotes: req.body.sweetnessNotes,
      mouthfeelIntensity: parseInt(req.body.mouthfeelIntensity),
      mouthfeelScore: req.body.mouthfeelScore,
      mouthfeelFinalScore: parseInt(req.body.mouthfeelFinalScore),
      mouthfeelCharacter: req.body.mouthfeelCharacter,
      mouthfeelNotes: req.body.mouthfeelNotes,
      extrinsicNotes: req.body.extrinsicNotes,
      overallScore: req.body.overallScore,
      overallFinalScore: parseInt(req.body.overallFinalScore),
      nonUniformCups: req.body.nonUniformCup,
      defectiveCups: req.body.defectCup,
      defectType: req.body.defectType,
      totalScore: totalScore,
    });

    newScore.save();
    res.redirect("/dashboard");
  });

app
  .route("/dashboard")
  .get(async (req, res) => {
    //check authentication to allow user to view this page
    if (req.isAuthenticated()) {
      //show user data
      // console.log(req.user);
      //show user id
      // console.log(req.user.id);
      //get all coffee scores from the coffeeDB
      const foundScores = await ScoreModel.find({ userID: req.user.id });
      const foundUsers = await UserModel.find({ _id: req.user.id });
      const foundCoffees = await CoffeeModel.find({});

      res.render("dashboard.ejs", { users: foundUsers, coffees: foundCoffees, scores: foundScores });
    } else {
      res.redirect("/login");
    }
  })
  .post()
  .put()
  .delete();

//Define the logout functionality of the application
app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }

    res.redirect("/");
  });
});

//Define the port for the app to listen on
app.listen(port, () => {
  console.log(`Server is listening on port: ${port}`);
});

//Function to calculate the cup score on the "form.ejs" page after submitting
function cupScore(fragrance, aroma, flavor, aftertaste, acidity, sweetness, mouthfeel, overall, nonuniform, defects) {
  const numbers = [fragrance, aroma, flavor, aftertaste, acidity, sweetness, mouthfeel, overall];

  const sum = numbers.reduce((accumulator, currentValue) => {
    return accumulator + currentValue;
  }, 0);

  const score = 0.65625 * sum + 52.75 - (2 * nonuniform + 4 * defects);

  return score;
}
