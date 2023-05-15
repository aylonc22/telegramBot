import { Telegraf, Context } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { handleStart } from "./handleStart";
import { isMember } from "./validation";

import { myState } from "../state";
import fs from 'fs';
import { insertNumbers } from "../database/mysql/controllers/client_controller";

let bot:Telegraf<Context<Update>>;
let botPhoto:string;
export const initSettings = (b:Telegraf<Context<Update>>)=>{
    bot = b;       
    botPhoto = process.env.botPhoto as string;
    bot.action('settings', async (ctx)=>{
        let state:myState = new myState(JSON.parse(fs.readFileSync(`./memory/${ctx.update.callback_query.from.id}.json`).toString())); 
        state.setQuary("default");
        state.updateJson();       
        await ctx.deleteMessage();
        const isMemberFlag = await isMember(ctx.update.callback_query.from);
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
                        [{text:"שמירת המספרים ששלחת ✅", callback_data:"saveNumbers"}],
                        [{text:"קישור לקליקים 🔗", callback_data:"link"}],                        
                        [{text:"חזרה 🔙", callback_data:"joined"}],                       
                    ]
                }        
            }    
      );
    });

    bot.action("saveNumbers",async(ctx)=>{
        let state:myState = new myState(JSON.parse(fs.readFileSync(`./memory/${ctx.update.callback_query.from.id}.json`).toString())); 
        if(state.client?.Id)
        {
            const res = await insertNumbers(state.client.Id.toString(),state.numbers);
            if(res === undefined)
                ctx.reply("המספרים נוספו בהצלחה");
            else
            ctx.reply("חלה שגיאה בשרת אנא נסה שנית");
        }
    });

}

