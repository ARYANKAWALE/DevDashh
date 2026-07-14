import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    username:{
        required:true,
        type:String,
        unique:true,
        lowercase:true,
    },
    email:{
        required:true,
        unique:true,
        type:String,
        lowercase:true,
        match: [/^\s*[\w\-\.]+@([\w\-]+\.)+[\w\-]{2,4}\s*$/, 'Please provide a valid email address'],
    },
    password:{
        required:true,
        trim:true,
        minLength:6,
        maxLength:100
    },
},{timestamps:true})

userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        username: this.username,
        email: this.email,
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id,
    },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",userSchema)