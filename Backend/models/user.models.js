import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    username:{
        required:true,
        type:String,
    },
    email:{
        unique:true,
        required:true,
        lowercase:true,
        type:String,
        match: [/^\s*[\w\-\.]+@([\w\-]+\.)+[\w\-]{2,4}\s*$/, 'Please provide a valid email address'],
        minLength: [5, 'Email must be at least 5 characters long'],
        maxLength: [255, 'Email cannot exceed 255 characters']
    },
    password:{
        required:true,
        trim:true,
        min:6,
        max:16
    }
},{timestamps:true})

export const User = mongoose.model("User",userSchema)