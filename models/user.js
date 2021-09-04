const { type } = require("express/lib/response");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username:{
        type: String,
        required:true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        unique: true
    },
    mo_no: {
        type: Number,
        required: true
    },
    img:{
        type:String,
        required:true,
        unique: true
    },
    task:[
       {
           description:String,
           completed: Boolean,
           time: Date
       }
    ]
}, { timestamps:true });

const User = mongoose.model('User',userSchema);
module.exports = User;