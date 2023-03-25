import { Telegraf, Context } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { handleStart } from "./handleStart";
import { isMember } from "./validation";

let bot:Telegraf<Context<Update>>;
let botPhoto:string;
export const initSettings = (b:Telegraf<Context<Update>>)=>{
    bot = b;       
    botPhoto = process.env.botPhoto as string;
    bot.action('settings', async (ctx)=>{
        await ctx.deleteMessage();
        const isMemberFlag = await isMember(ctx.update.callback_query.from.id);
        if(isMemberFlag === "restricted" || isMemberFlag === "left")
            {
                handleStart(ctx,isMemberFlag);
                return;
            }
            const text:string =  "⚙️ אתה בתפריט ההגדרות:";
        ctx.replyWithPhoto(
            {source:botPhoto},{caption:text,
                reply_markup:{
                    inline_keyboard:[
                        [{text:"שמירת המספרים ששלחת ✅", callback_data:"settings"}],
                        [{text:"קישור לקליקים 🔗", callback_data:"test"}],
                        [{text:"המספרים ששלחת 👁", callback_data:"test"}],
                        [{text:"חזרה 🔙", callback_data:"joined"}],                       
                    ]
                }        
            }    
      );
    });
}

