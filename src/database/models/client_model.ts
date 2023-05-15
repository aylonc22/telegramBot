import mongoose from 'mongoose'
const Schema = mongoose.Schema

const Client = new Schema(
    {
        Id: { type: Number, required: true,unique:true},
        Joined:{type:String,required:true},
        Messages: { type: Number, required: true},
        _Messages: { type: Number, required: true},
        Money: { type: Number, required: true},
        Link:{type:String,required:false},
        LinkId:{type:String,required:false},
        Disabled:{type:Boolean,required:true},
        Phones: {type:[String], required: false,unique:false}
                
    },
    { timestamps: true },
)

export interface ClientFirst{
    Id:number|undefined,
    Messages:number,
    _Messages:number, // All time messages
    Money:number,
    Joined:string,
    Link:string,
    LinkId:string,   
    Disabled:boolean,
    Admin:boolean,
    FirstName:string,
    LastName:string| undefined,
    UserName:string| undefined,
}

export interface Client{
    Id:number|undefined,
    Messages:number,
    _Messages:number, // All time messages
    Money:number,
    Joined:string,
    Link:string,
    LinkId:string,
    Phones:[String]|any,
    Disabled:boolean,
    Admin:boolean,
    FirstName:string,
    LastName:string | undefined,
    UserName:string | undefined,
}

module.exports = mongoose.model('client', Client);