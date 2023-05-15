import mongoose from 'mongoose'
const Schema = mongoose.Schema

const Phone = new Schema(
    {
        Phone: { type: String, required: true,unique:true}, 
        Used:{type:Boolean, require:true}      
    },
    { timestamps: true },
)

export interface Phone{
    Phone:string,
    Used:boolean,// if used already today true else false
}
module.exports = mongoose.model('phone', Phone);