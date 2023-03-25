import { Telegraf, Context } from "telegraf"
import { Update } from "telegraf/typings/core/types/typegram"
import { initFeedback } from "./handleFeedback"
import { initSettings } from "./handleSettings"
import { initHandleStart } from "./handleStart"
import { initStartSendMessages } from "./handleStartSendMessages"
import { initValidation } from "./validation"
import { initMongoDb } from "../mongo"
import { initAccount } from "./handleAccount"
import { initPrice } from "./handlePrice"
import { initBuy } from "./handleBuy"
import { myState } from "../state"
import { handleStartMain } from "./handleStart";
import { isMember } from "./validation";
import { initShowReviews } from "./administrator/handleShowReviews"
import { initShowClientList } from "./administrator/handleClientsList"
import { initMessageAll } from "./administrator/handleMessageAll"

export const initAll =(b:Telegraf<Context<Update>>)=>{
   b.action("enterMore",async(ctx)=>{
         await ctx.deleteMessage();
         let text:string = `אנא הכנס קובץ עם ${myState.messagesToSend-myState.numbers.length} מספרים`
         if(myState.quary==="manual")
            text = `אנא הקלד ${myState.messagesToSend-myState.numbers.length} מספרים`;
         
         ctx.reply(text);

   })

   b.action("continue",async(ctx)=>
   {
      myState.setQuary("default");
      ctx.reply("התהליך מתקדם");
   })
   b.command('cancel',async(ctx)=>{       
     
      if(myState.quary!=="feedback")
         {
          myState.reset();
          await ctx.deleteMessage();
          handleStartMain(ctx,await isMember(ctx.message.from.id))
      }
      else            
             
              ctx.deleteMessage(ctx.message.message_id).then(()=>ctx.deleteMessage(ctx.message.message_id-1)).finally(
                  async()=>{
                      myState.reset();
                      handleStartMain(ctx,await isMember(ctx.message.from.id))
                  })
                       
  })
   initMessageAll(b);
   initValidation(b);
   initShowReviews(b);
   initShowClientList(b);
   initHandleStart(b);
   initStartSendMessages(b);
   initSettings(b);
   initFeedback(b); 
   initPrice(b);
   initMongoDb();
   initBuy(b);
   initAccount(b);
}