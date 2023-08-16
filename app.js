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
const coffeeSchema = new Schema({
  coffeeId: { type: String, default: "coffee" },
  fragrancePoints: { type: Number, default: 0 },
  aromaPoints: { type: Number, default: 2 },
  smell: { type: Array, default: ["floral", "fruity"] },
  flavorPoints: { type: Number, default: 4 },
  aftertastePoints: { type: Number, default: 6 },
  flavor: { type: Array, default: ["sour", "green/vegetative"] },
  taste: { type: Array, default: ["salty", "bitter"] },
  acidityPoints: { type: Number, default: 8 },
  acidType: { type: Array, default: ["sweet", "lemon"] },
  sweetnessPoints: { type: Number, default: 10 },
  mouthfeelPoints: { type: Number, default: 12 },
  mouthfeel: { type: Array, default: ["sweet", "lemon"] },
});

//define the CoffeeModel to create the 'coffees' collection
const CoffeeModel = new mongoose.model("Coffee", coffeeSchema);

//testing inserting of new coffee to the 'coffees collection
const defaultCoffee = new CoffeeModel({});
defaultCoffee.save();

//create a user schema for new users to be stored in the 'users' collection and reference the coffee collection
const userSchema = new Schema({
  email: { type: String, default: "test@123.com" },
  password: { type: String, default: "123" },
  googleId: String,
  secret: String,
  coffee: coffeeSchema,
});

//define the UserModel to create the 'users' collection
const UserModel = new mongoose.model("User", userSchema);

//testing inserting of new user to the 'users' collection
const defaultUser = new UserModel({});
defaultUser.save();

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/form", (req, res) => {
  res.render("descriptiveform.ejs");
});

app.post("/data", async (req, res) => {
  console.log(req.body);
});

app.listen(port, () => {
  console.log(`Server is listening on port: ${port}`);
});
