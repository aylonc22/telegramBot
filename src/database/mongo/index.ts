
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({path:"../.env"});
 mongoose.connect(process.env.MongoConnection as string)

.catch((e:Error)=>{
console.error('[Mongo] Connection error ',e.message)
})

const db = mongoose.connection;
export const initMongoDb = ()=>db.once('open',()=>console.log("[Mongo] Connection established!"));