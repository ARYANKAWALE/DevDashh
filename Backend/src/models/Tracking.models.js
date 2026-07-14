import mongoose from 'mongoose'

const trackingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        trim:true,
    },
    leetcodeUsername: {
        type: String,
        required: true,
    },
    githubUsername: {
        type: String,
    },
    leetcodeSolved: {
        type: Number,
    },
    githubRepos: {
        type: Number,
    },
},{timestamps:true})

export const Tracking = mongoose.model('Tracking', trackingSchema)