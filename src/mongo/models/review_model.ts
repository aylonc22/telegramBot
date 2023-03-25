import mongoose from 'mongoose'
const Schema = mongoose.Schema

const Review = new Schema(
    {
        ClientId: { type: String, required: true},
        Message: { type: String, required: true},
        Read:{type:Boolean,require:true}
    },
    { timestamps: true },
)

export interface ReviewFromMongo{    
    _id:string,
    ClientId: String,
    Message:string,
    Read:Boolean
}
export interface Review{       
    ClientId: String,
    Message:string,
    Read:Boolean
}

module.exports = mongoose.model('review', Review);