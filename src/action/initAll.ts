import { Telegraf, Context } from "telegraf"
import { Update } from "telegraf/typings/core/types/typegram"
import { initFeedback } from "./handleFeedback"
import { initSettings } from "./handleSettings"
import { initHandleStart } from "./handleStart"
import { initStartSendMessages } from "./handleStartSendMessages"
import { initValidation } from "./validation"
import { initMongoDb } from "../database/mongo/index";
import { initAccount } from "./handleAccount"
import { initPrice } from "./handlePrice"
import { initBuy } from "./handleBuy"
import { myState } from "../state"
import { handleStartMain } from "./handleStart";
import { isMember } from "./validation";
import { initShowReviews } from "./administrator/handleShowReviews"
import { initShowClientList } from "./administrator/handleClientsList"
import { initMessageAll } from "./administrator/handleMessageAll"
import { initLinks } from "./handleLink"
import { initMySql } from "../database/mysql"
import fs from 'fs'

export const initAll =(b:Telegraf<Context<Update>>)=>{
   b.action("enterMore",async(ctx)=>{
      let state:myState = new myState(JSON.parse(fs.readFileSync(`./memory/${ctx.update.callback_query.from.id}.json`).toString())); 
         await ctx.deleteMessage();
         let text:string = `אנא הכנס קובץ עם ${state.messagesToSend-state.numbers.length} מספרים`
         if(state.quary==="manual")
            text = `אנא הקלד ${state.messagesToSend-state.numbers.length} מספרים`;
         
         ctx.reply(text);

   })

   b.command('cancel',async(ctx)=>{  
      let state:myState = new myState(JSON.parse(fs.readFileSync(`./memory/${ctx.message.from.id}.json`).toString()));      
     
      if(state.quary!=="feedback")
         {
          state.reset();
          await ctx.deleteMessage();
          handleStartMain(ctx,await isMember(ctx.message.from))
      }
      else            
             
              ctx.deleteMessage(ctx.message.message_id).then(()=>ctx.deleteMessage(ctx.message.message_id-1)).finally(
                  async()=>{
                      state.reset();
                      handleStartMain(ctx,await isMember(ctx.message.from))
                  })
                       
  })
  initMongoDb();
  initMySql();
   initMessageAll(b);
   initValidation(b);
   initLinks(b);
   initShowReviews(b);
   initShowClientList(b);
   initHandleStart(b);
   initStartSendMessages(b);
   initSettings(b);
   initFeedback(b); 
   initPrice(b);
   initBuy(b);
   initAccount(b);
}