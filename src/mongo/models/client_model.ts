import mongoose from 'mongoose'
const Schema = mongoose.Schema

const Client = new Schema(
    {
        Id: { type: Number, required: true,unique:true},
        Joined:{type:Date,required:true},
        Messages: { type: Number, required: true},
        _Messages: { type: Number, required: true},
        Money: { type: Number, required: true},
                
    },
    { timestamps: true },
)

export interface Client{
    Id:number|undefined,
    Messages:number,
    _Messages:number, // All time messages
    Money:number,
    Joined:Date,
}

module.exports = mongoose.model('client', Client);