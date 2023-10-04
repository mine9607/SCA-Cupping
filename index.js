import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import _ from "lodash";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import { ScoreModel, CoffeeModel } from "./lib/db-setup.js";
import UserModel from "./lib/session-setup.js";
import sum from "./utils/functions.js";

//create express app framework:
const app = express();
//do I comment out port 3000 when deploying???
const port = process.env.PORT || 3000;

//set static file folder and initiate body-parser
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

//Use mongoose to connect to a mongodb with password saved as environment variable
const connectDB = await mongoose.connect(
  `mongodb+srv://crunchySumo6960:${process.env.DB_PASSWORD}@cluster0.vwk3y8s.mongodb.net/coffeeDB`
);

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

//Test route API for JS function testing
app.get("/test-route", (req, res) => {
  res.render("test.ejs", { sum: sum });
});

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
      producer: req.body.producerName,
      farm: req.body.farm,
      providerName: req.body.providerName,
      providerPhone: req.body.providerPhone,
      providerEmail: req.body.providerEmail,
      coffeePrice: req.body.coffeePrice,
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
      const foundCoffees = await CoffeeModel.find({ userID: req.user.id });
      // sort coffees from db - could be used as a default sort on the db request
      // const aggCoffees = await CoffeeModel.aggregate().sort({ country: 1 });
      // const aggScores = await ScoreModel.aggregate().sort({ totalScore: -1 });

      res.render("dashboard.ejs", {
        users: foundUsers,
        coffees: foundCoffees,
        scores: foundScores,
        // coffeelist: aggCoffees,
        // scorelist: aggScores,
      });
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
