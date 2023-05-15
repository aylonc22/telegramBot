import { Telegraf, Context } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { handleStart} from "../handleStart";
import { isMember } from "../validation";
import {myState} from '../../state';
import fs from 'fs';

let bot:Telegraf<Context<Update>>;
let botPhoto:string;

export const initMessageAll = (b:Telegraf<Context<Update>>)=>{    
    botPhoto = process.env.botPhoto as string;
    bot = b;       
    bot.action('messageAll', async (ctx)=>{
        let state:myState = new myState(JSON.parse(fs.readFileSync(`./memory/${ctx.update.callback_query.from.id}.json`).toString()));
        await ctx.deleteMessage();
        state.setQuary(ctx.callbackQuery.data as string);  
        state.updateJson();
        console.log(state.quary);
        const isMemberFlag = await isMember(ctx.update.callback_query.from);
        if(isMemberFlag === "restricted" || isMemberFlag === "left")
            {
                handleStart(ctx,isMemberFlag);
                return;
            }           
            const text:string =  `*שליחת הודעת תפוצה:* 
יש לשלוח את ההודעה בצורה מסודרת ומפורטת.
לביטול התהליך יש לשלוח /cancel`;
ctx.replyWithPhoto({source:botPhoto},
    { caption:text,parse_mode:"Markdown"}    
);
       
    });   
}

