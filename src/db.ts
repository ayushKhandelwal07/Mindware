import mongoose , {model , Schema} from "mongoose";
import { DATABASE_URL } from "./config";

try{
        mongoose.connect(DATABASE_URL);
        console.log("Database connected");
}catch(err){
        console.log("Error while connectiong the database")
}


const UserSchema = new Schema({
        username : {type : String , require : true},
        password : {type : String , require : true}
});

const contentSchema = new Schema({
        link : String,
        type : String,
        title : String,
        tags : [{ type : mongoose.Types.ObjectId , ref : "Tag" }],
        userId : [{ type : mongoose.Types.ObjectId, ref : "User", required : true}]
});


const LinkSchema = new Schema({
        hash : String,
        userId : [{ type : mongoose.Types.ObjectId , ref : "User" , required : true }]
});

export const Content = model("Content", contentSchema);
export const User = model("User" , UserSchema);
export const Link = model("Link", LinkSchema);