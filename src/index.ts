import * as dotenv from 'dotenv';
 import { Telegraf, Telegram} from 'telegraf';
import { myState } from './state';
import {handleStart, handleStartMain } from './action/handleStart';
import { initAll } from './action/initAll';
import axios from 'axios';
import { enterNumbersDocument, enterNumbersManual } from './action/validation';
import { Client } from './mongo/models/Client_model';
import { getClient, getClients } from './mongo/controllers/client_controller';
import {createReview} from './mongo/controllers/review_controller';
import { channel } from 'diagnostics_channel';
import { ChatMember } from 'telegraf/typings/core/types/typegram';
import { send } from 'process';
 

dotenv.config({path:"../.env"});
const {TOKEN,WEBHOOK,PORT,Channel} = process.env;

const bot = new Telegraf(TOKEN as string);

export let quary = "default";
initAll(bot);

bot.start(async(ctx)=>{  
  myState.reset();
  const client:Client = await getClient(ctx.message.from.id);
  if(client === undefined)
      ctx.reply("משהו השתבש להפעלה מחדש /start");
    else
    {     
      myState.setClient(client);
      handleStartMain(ctx);
    }
   
}).catch(err=>console.log(err));
bot.action('test',(ctx)=>{
    ctx.reply("Just a Test");
})



bot.help((ctx) => {
    ctx.reply('Send /start to receive a greeting');
    ctx.reply('Send /keyboard to receive a message with a keyboard');
    ctx.reply('Send /quit to stop the bot');
  });

bot.on('document',async(ctx)=>{
  if(myState.shouldReadDoc)
    {
      const image = await bot.telegram.getFileLink( ctx.message.document.file_id);
      try{
        const res =  await axios.get(image.href);       
        const dataRaw = res.data.replaceAll('\r','').replaceAll('-','')
        .replaceAll(' ',',').split('\n').map((row: string)=>row.split(','));       
        const data:string[] = [...new Set([].concat(...dataRaw).filter(f=>/^05\d([-]{0,1})\d{7}$/.test(f)))]
        console.log(myState.messagesToSend);
        myState.numbers.push(...data);
        myState.numbers = [...new Set(myState.numbers)]
        enterNumbersDocument(ctx);
      }
      catch(e:unknown)
        {
            ctx.reply("משהו השתבש נסה שנית");
        }
    }
    else
      await ctx.deleteMessage();
})
  bot.on('text',async (ctx)=>{               
    if(myState.quary === "feedback")
      {
        await createReview({
          ClientId: ctx.message.from.id as unknown  as string,
          Message: ctx.message.text,
          Read: false
        })
        ctx.reply("תגובתך נקלטה").then(()=> handleStartMain(ctx));
       
      }
      else if(myState.quary === "messageAll"){
         if(Channel)
            {
             const clients:Client[] = await getClients();
             clients.map((client:Client)=>{
              if(client.Id)
                {
                  if(ctx.message.from.id === client.Id)
                    bot.telegram.sendMessage(client.Id,"ההודעה נשלחה בהצלחה").then(()=> handleStartMain(ctx));
                  else
                    bot.telegram.sendMessage(client.Id,ctx.message.text);
                }
             }) 
             // Promise.all(clients.map(async(client:Client)=>{
              //   if(client.Id)
              //     {
              //       const member:ChatMember =  await bot.telegram.getChatMember(Channel,client.Id);
                   
              //       bot.telegram.sendMessage()
              //     }
              // }));
             
            }
            myState.setQuary("default");
      }
      else if(myState.quary === "addMessages"){
          if(isNaN(Number(ctx.message.text)))
          {
            await ctx.deleteMessage();
          }
          else
          {
           if(myState.client?.Messages)
              myState.client.Messages += Number(ctx.message.text);
           if(myState.client?._Messages)
              myState.client._Messages += Number(ctx.message.text);
            myState.update();
          }
      }
      else if(myState.messagesToSendQuary !== "")
      {
        const data:number = Number(ctx.message.text);       
        if(isNaN(data))
          {                        
            ctx.deleteMessage(ctx.message.message_id).then(()=>ctx.deleteMessage(ctx.message.message_id-1).then(
              ()=>ctx.replyWithChatAction("typing")).then(()=>ctx.reply("כמה מספרים תרצה לשלוח? אנא הזן מספר תקין בבקשה")));
          }          
        else
          {
            if(myState.messagesToSendQuary === "fromFile")
                {
                  myState.setShouldReadDoc(true);
                  await ctx.reply(`אנא אכנס קובץ עם מספרים בפורמט הבא\n05*-*******`);
                }
                else
              {
                await ctx.reply(`אנא רשום מספרים בפורמט הבא\n05*-*******`)
                myState.setQuary("manual");
              }
              myState.setMessagesToSend(data);
              myState.SetMessagesToSendQuary("");
          }
       
      }
      else if(myState.quary === "manual")
      {
        const dataRaw:any = ctx.message.text.replaceAll('\r','').replaceAll('-','')
        .replaceAll(' ',',').split('\n').map((row: string)=>row.split(','));       
        const data:string[] = [...new Set([].concat(...dataRaw).filter(f=>/^05\d([-]{0,1})\d{7}$/.test(f)))]
        console.log(myState.messagesToSend);
        myState.numbers.push(...data);
        myState.numbers = [...new Set(myState.numbers)]  
        ctx.reply(myState.numbers.length.toString());
        console.log(myState.client?.Messages!=undefined?(myState.client?.Messages<myState.numbers.length):"NONE")
        enterNumbersManual(ctx);
      }
      else
       ctx.deleteMessage();
})
  
  bot.launch({ webhook: { domain: WEBHOOK as string , port: Number(PORT)  } })
  .then(() => console.log("Webhook bot listening on port", Number(PORT)));
  

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));


