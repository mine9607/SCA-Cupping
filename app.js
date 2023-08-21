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
  cupperName: String,
  cuppingDate: Date,
  purpose: String,
  coffeeId: { type: String, default: "123456" },
  fragranceIntensity: { type: Number, min: 0, max: 15, default: 2 },
  fragranceScore: { type: Array, default: 0 },
  fragranceFinalScore: {type: Number, default: 5},
  aromaIntensity: { type: Number, min: 0, max: 15, default: 4 },
  aromaScore: { type: Array, default: 0 },
  aromaFinalScore: {type: Number, default: 5},
  smellCharacter: { type: Array, default: ["fruity", "berry"] },
  smellNotes:String,
  flavorIntensity: { type: Number, min: 0, max: 15, default: 6 },
  flavorScore:{type: Array, default:0},
  flavorFinalScore: {type: Number, default: 5},
  aftertasteIntensity: { type: Number, min: 0, max: 15, default: 8 },
  aftertasteScore: {type: Array, default: 0},
  aftertasteFinalScore: { type: Number, default: 5 },
  flavorCharacter: { type: Array, default: ["sour", "fermented"] },
  taste: { type: Array, default: ["salty", "bitter"] },
  tasteNotes: String,
  acidIntensity: { type: Number, min: 0, max: 15, default: 10 },
  acidityScore: {type: Array, default: 0},
  acidityFinalScore: { type: Number, default: 5 },
  acidityCharacter: { type: Array, default: ["sweet", "lemon"] },
  acidityNotes: String,
  sweetnessIntensity: { type: Number, min: 0, max: 15, default: 12 },
  sweetnessScore: {type: Array, default: 0},
  sweetnessFinalScore: { type: Number, default: 5 },
  sweetnessNotes: String,
  mouthfeelIntensity: { type: Number, min: 0, max: 15, default: 14 },
  mouthfeelScore: {type: Array, default: 0},
  mouthfeelFinalScore: { type: Number, default: 5 },
  mouthfeelCharacter: { type: Array, default: ["silky", "velvety"] },
  mouthfeelNotes: String,
  extrinsicNotes: String,
  overallScore: {type: Array, default: 0},
  overallFinalScore: { type: Number, default: 5 },
  nonUniformCups: { type: Array, default: 0 },
  defectiveCups: { type: Array, default: 0 },
  defectType: { type: Array, default: ["moldy", "potato"] },
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

app.post("/score", async (req, res)=>{
  console.log(req.body);

  const fragrance = parseInt(req.body.fragranceFinalScore);
  const aroma = parseInt(req.body.aromaFinalScore);
  const flavor = parseInt(req.body.flavorFinalScore);
  const aftertaste = parseInt(req.body.aftertasteFinalScore);
  const acidity = parseInt(req.body.acidityFinalScore);
  const sweetness = parseInt(req.body.sweetnessFinalScore);
  const mouthfeel = parseInt(req.body.mouthfeelFinalScore);
  const overall = parseInt(req.body.overallFinalScore);

  let nonuniform;
  if(!req.body.nonuniformCup){
    nonuniform = 0;
  } else {
    nonuniform = req.body.nonuniformCup.length;
  }
  
  let defects;
  if(!req.body.defectCup){
    defects = 0;
  } else {
    defects = req.body.defectCup.length;
  }
  console.log(cupScore(fragrance, aroma, flavor, aftertaste, acidity, sweetness, mouthfeel, overall, nonuniform, defects));
})

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
