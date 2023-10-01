import mongoose from "mongoose";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";
import userSchema from "./db-setup.js";

//plugin used to salt and hash user passwords and save users into MongoDB users collection
userSchema.plugin(passportLocalMongoose);

//define the UserModel to create the 'users' collection
const UserModel = new mongoose.model("User", userSchema);

//passport-local-mongoose simplified code for creating a local strategy
passport.use(UserModel.createStrategy());

//serialize = create cookie and deserialize = open cookie and read user authentication
passport.serializeUser(UserModel.serializeUser());
passport.deserializeUser(UserModel.deserializeUser());

export default UserModel;
