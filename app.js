import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import axios from "axios";
import _ from "lodash";

//create express app framework:
const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

//Use mongoose to connect to a mongodb with password saved as environment variable
await mongoose.connect(`mongodb+srv://crunchySumo6960:${process.env.DB_PASSWORD}@cluster0.vwk3y8s.mongodb.net/usersDB`);

//create the mongoose "Schema keyword"
const Schema = mongoose.Schema;

//create a simple database schema to hold new users (defines the properties of objects which follow this schema)
const userSchema = new Schema({
  email: String,
  password: String,
  googleId: String,
  secret: String,
});

const coffeeSchema = new Schema({
  coffeeId: String,
  password: String,
  googleId: String,
  secret: String,
});

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
