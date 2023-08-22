import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import axios from "axios";
import _ from "lodash";
import { parse } from "path";
import passport from "passport";
import bcrypt from "bcrypt";
const saltRounds = 10;

//create express app framework:
const app = express();
const port = 3000;

//set static file folder and initiate body-parser
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

//Use mongoose to connect to a mongodb with password saved as environment variable
await mongoose.connect(
  `mongodb+srv://crunchySumo6960:${process.env.DB_PASSWORD}@cluster0.vwk3y8s.mongodb.net/coffeeDB`
);

//create the mongoose "Schema keyword"
const Schema = mongoose.Schema;

//create a coffee schema for new coffees to be stored in the 'coffees' collection
const scoreSchema = new Schema({
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

//testing inserting of new coffee to the 'coffees collection
const defaultScore = new ScoreModel({});
//defaultScore.save();

//create a user schema for new users to be stored in the 'users' collection and reference the coffee collection
const userSchema = new Schema({
  email: { type: String, default: "test@123.com" },
  password: { type: String, default: "123" },
});

//define the UserModel to create the 'users' collection
const UserModel = new mongoose.model("User", userSchema);

//testing inserting of new user to the 'users' collection
const defaultUser = new UserModel({});
//defaultUser.save();

//create a coffee schema for coffee details
const coffeeSchema = new Schema({
  country: String,
  region: String,
  city: String,
  variety: String,
  process: String,
  producer: String,
  providerName: String,
  providerNumber: Number,
  providerEmail: String,
});

//define the CoffeeModel to create the 'coffee' collection
const CoffeeModel = new mongoose.model("Coffee", coffeeSchema);

//testing inserting a new coffee in the 'coffee' collection
const defaultCoffee = new CoffeeModel({});
//defaultCoffee.save();

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
    bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
      const newUser = new UserModel({
        email: req.body.email,
        password: hash,
      });

      newUser.save();
      res.redirect("/");
    });
  });

app
  .route("/login")
  .get((req, res) => {
    res.render("login.ejs");
  })
  .post(async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    //compare user email and password against registered list of users
    //to query a database without error handling
    const foundUser = await UserModel.findOne({ email: email });
    console.log(foundUser);
    if (foundUser) {
      bcrypt.compare(password, foundUser.password, function (err, result) {
        if (result === true) {
          res.render("dashboard.ejs");
        }
      });
    }

    //to query a database use the "try", "await", "catch" syntax for error handling
    // try {
    //   const foundUser = await UserModel.findOne({ email: email });
    //   console.log(foundUser);
    // } catch (error) {
    //   console.log("Error:", error);
    // }
  });

app
  .route("/form")
  .get((req, res) => {
    res.render("form.ejs");
  })
  .post((req, res) => {
    //view all form inputs
    console.log(req.body);

    //assign form inputs to variables nee3ded for totalScore calculation
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

    const newScore = new ScoreModel({
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
