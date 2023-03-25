import mongoose from 'mongoose'
const Schema = mongoose.Schema

const Phone = new Schema(
    {
        Phone: { type: String, required: true,unique:true},       
    },
    { timestamps: true },
)

module.exports = mongoose.model('phone', Phone);