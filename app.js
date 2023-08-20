import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import axios from "axios";
import _ from "lodash";

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
  coffeeId: { type: String, default: "coffee" },
  fragranceIntensity: { type: Number, min: 0, max: 15, default: 2 },
  fragranceQuality: { type: Number, default: 5 },
  aromaIntensity: { type: Number, min: 0, max: 15, default: 4 },
  aromaQuality: { type: Number, default: 5 },
  smellCharacter: { type: Array, default: ["floral", "fruity"] },
  flavorIntensity: { type: Number, min: 0, max: 15, default: 6 },
  flavorQuality: { type: Number, default: 5 },
  aftertasteIntensity: { type: Number, min: 0, max: 15, default: 8 },
  aftertasteQuality: { type: Number, default: 5 },
  flavorCharacter: { type: Array, default: ["sour", "green/vegetative"] },
  tasteSense: { type: Array, default: ["salty", "bitter"] },
  acidIntensity: { type: Number, min: 0, max: 15, default: 10 },
  acidQuality: { type: Number, default: 5 },
  acidCharacter: { type: Array, default: ["sweet", "lemon"] },
  sweetnessIntensity: { type: Number, min: 0, max: 15, default: 12 },
  mouthfeelIntensity: { type: Number, min: 0, max: 15, default: 14 },
  mouthfeelQuality: { type: Number, default: 5 },
  mouthfeelCharacter: { type: Array, default: ["sweet", "lemon"] },
  nonUniformCups: { type: Number, min: 0, max: 5, default: 0 },
  defectiveCups: { type: Number, min: 0, max: 5, default: 0 },
  defectType: { type: Array, default: ["moldy", "phenolic", "potato"] },
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
  googleId: String,
  secret: String,
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

//define home route API requests
app
  .route("/")
  .get((req, res) => {
    res.render("home.ejs");
  })
  .post()
  .put()
  .patch()
  .delete();

app.get("/form", (req, res) => {
  res.render("testlayout.ejs");
});

app.route("/users").get().post().put().patch().delete();
app.route("/coffee").get().post().put().patch().delete();
app
  .route("/cupScore")
  .get()
  .post((req, res) => {
    console.log(req.body);
  })
  .put()
  .patch()
  .delete();

app.post("/data", async (req, res) => {
  console.log(req.body);
});

app.listen(port, () => {
  console.log(`Server is listening on port: ${port}`);
});

function cupScore(fragrance, aroma, flavor, aftertaste, acidity, sweetness, mouthfeel, overall, nonuniform, defects) {
  const numbers = [fragrance, aroma, flavor, aftertaste, acidity, sweetness, mouthfeel, overall];

  const sum = numbers.reduce((accumulator, currentValue) => {
    return accumulator + currentValue;
  }, 0);

  const score = 0.65625 * sum + 52.75 - (2 * nonuniform + 4 * defects);

  return score;
}

// const fragrance = req.body.fragranceQuality;
// const aroma = req.body.aromaQuality;
// const flavor = req.body.flavorQuality;
// const aftertaste = req.body.aftertasteQuality;
// const acidity = req.body.acidQuality;
// const sweetness = req.body.sweetnessQuality;
// const mouthfeel = req.body.mouthfeelQuality;
// const overall = req.body.overallQuality;
// const nonuniform = req.body.nonuniformCount;
// const defects = req.body.defectCount;

// const score = cupScore(
//   fragrance,
//   aroma,
//   flavor,
//   aftertaste,
//   acidity,
//   sweetness,
//   mouthfeel,
//   overall,
//   nonuniform,
//   defects
// );
// console.log(score);
