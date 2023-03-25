import { Telegraf, Context } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { handleStart} from "./handleStart";
import { isMember } from "./validation";
import {myState} from '../state';

let bot:Telegraf<Context<Update>>;
let botPhoto:string;

export const initFeedback = (b:Telegraf<Context<Update>>)=>{    
    botPhoto = process.env.botPhoto as string;
    bot = b;       
    bot.action('feedback', async (ctx)=>{
        await ctx.deleteMessage();
        myState.setQuary(ctx.callbackQuery.data as string);        
        const isMemberFlag = await isMember(ctx.update.callback_query.from.id);
        if(isMemberFlag === "restricted" || isMemberFlag === "left")
            {
                handleStart(ctx,isMemberFlag);
                return;
            }           
            const text:string =  `*💌שליחת משוב למנהל:* 
יש לשלוח את המשוב בהודעה אחת בצורה מסודרת ומפורטת.
לביטול התהליך יש לשלוח /cancel`;
ctx.replyWithPhoto({source:botPhoto},
    { caption:text,parse_mode:"Markdown"}    
);
       
    });   
}

