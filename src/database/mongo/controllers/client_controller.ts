import { Client } from "../../models/client_model";
const _Client = require('../../models/Client_model');

export const createClient = async (Client:Client)=>{
    const client = new _Client(Client);
    if(!client)
        return "didnt work";
    
      
        const res = await  client.save().catch((err:any)=>{
            console.log(err);
            if(err.code !== 11000)
            { 
                console.log("create client");
                return err;
            }
        });
       

        return res;                
}

export const updateClient = async(client:Client)=>{
    try{
        const res = await _Client.updateOne(
            { Id : client.Id },
            { $set: { Messages:client.Messages, _Messages:client._Messages, Money:client.Money} }
         );     
              
        return undefined;
    }
    catch(err){       
        return err;
    }
}

export const insertLink = async(clientID:string,link:string,linkID:string)=>{
    try{
        const res = await _Client.updateOne(
            { Id : clientID },
            { $set: { Link:link,LinkId:linkID} }
         );     
              return undefined;
    }
    catch(err){
        return err;
    }
}

export const insertNumbers = async(clientID:string,numbers:string[])=>{
    try{       
        
        const res = await _Client.updateOne(
            { Id : clientID },
            { $addToSet: { Phones:numbers} }
         );     
              
        return undefined;
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
        
        console.log("get client error",err);
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

export const _disableClient = async(clientID:number)=>{
    try{       
        
       const res = await _Client.findOne({Id:clientID},(err:any,client:any)=>{
            client.Disabled = !client.Disabled;
             client.save();
       }).clone();
       return res.Disabled;
    }
    catch(err){       
        return err;
    }
}

export const disableClient = async(clientID:number,flag:boolean)=>{
    try{       
        
        const res = await _Client.updateOne(
            { Id : clientID },
            { $set: { Disabled:flag} }
         );     
              
        return res;
    }
    catch(err){       
        return err;
    }
}