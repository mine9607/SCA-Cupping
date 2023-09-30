import mongoose from "mongoose";
// import { Schema } from "mongoose";

//Use mongoose to connect to a mongodb with password saved as environment variable
const connectDB = await mongoose.connect(
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

//create a user schema for new users to be stored in the 'users' collection and reference the coffee collection
const userSchema = new Schema({
  email: String,
  password: String,
});

// create a coffee schema for coffee details
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

//define the CoffeeModel to create the 'coffees' collection
const ScoreModel = new mongoose.model("Score", scoreSchema);

//define the CoffeeModel to create the 'coffee' collection
const CoffeeModel = new mongoose.model("Coffee", coffeeSchema);

export default userSchema;
export { ScoreModel, CoffeeModel };
