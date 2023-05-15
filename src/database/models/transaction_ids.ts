import mongoose from 'mongoose'
const Schema = mongoose.Schema

const Transactions = new Schema(
    {
        Id: { type: String, required: true},
       
    },
    { timestamps: true },
)


export interface Transactions{       
    Id: String,   
}

module.exports = mongoose.model('transactions', Transactions);