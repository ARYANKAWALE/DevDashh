import mongoose from 'mongoose'

const platformSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
}, { timestamps: true })

export const Platform = mongoose.model('Platform', platformSchema)