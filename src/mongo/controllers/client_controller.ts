import { Client } from "../models/Client_model";
const _Client = require('../models/Client_model');

export const createClient = async (Client:Client)=>{
    const client = new _Client(Client);
    if(!client)
        return "didnt work";
    
      
        const res = await  client.save().catch((err:any)=>{
            if(err.code !== 11000)
                return err;
        });

        return res;                
}

export const updateClient = async(client:Client)=>{
    try{
        const res = await _Client.updateOne(
            { Id : client.Id },
            { $set: { Messages:client.Messages, _Messages:client._Messages, Money:client.Money} }
         );     
              
        return res;
    }
    catch(err){
        return err;
    }
}

export const getClient =async (clientID:number|undefined) => {
    try{

        const res = await _Client.findOne({Id:clientID});        
        return res;
    }
    catch(err){        
        return undefined;
    }
}

export const getClients = async()=>{
    try{
        const res =  _Client.find();
        return res;
    }
    catch(err){
        return undefined
    }
}