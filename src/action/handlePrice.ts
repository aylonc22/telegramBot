import { Telegraf, Context } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { handleStart } from "./handleStart";
import {isMember} from './validation';
import { myState } from "../state";
import priceList from '../assets/priceList.json';
import fs from 'fs';

let bot:Telegraf<Context<Update>>;
let botPhoto:string;
export const initPrice = (b:Telegraf<Context<Update>>)=>{      
    bot = b;       
    botPhoto = process.env.BotPhoto as string;
    bot.action('price',async (ctx)=>{
        let state:myState = new myState(JSON.parse(fs.readFileSync(`./memory/${ctx.update.callback_query.from.id}.json`).toString())); 
        state.setQuary("default");
        state.updateJson();
        await ctx.deleteMessage();
        //creator" | "administrator" | "member" | "restricted" | "left" | "kicked        
        const isMemberFlag:string = await (await isMember(ctx.update.callback_query.from)).split(':')[0];
        if(isMemberFlag === "restricted" || isMemberFlag === "left")
            {
                handleStart(ctx,isMemberFlag);
                return;
            }

        const text:string =  `*👇 מחירון מפורט הודעות אסמס 👇*

📩⚡️ ${priceList['1'].messages} הודעות - ${priceList['1'].money} ₪
📩⚡️ ${priceList['2'].messages} הודעות - ${priceList['2'].money} ₪
📩⚡️ ${priceList['3'].messages} הודעות - ${priceList['3'].money} ₪
📩⚡️ ${priceList['4'].messages} הודעות - ${priceList['4'].money} ₪
📩⚡️ ${priceList['5'].messages} הודעות - ${priceList['5'].money} ₪
📩⚡️ ${priceList['6'].messages} הודעות - ${priceList['6'].money} ₪
📩⚡️ ${priceList['7'].messages} הודעות מבצע חם - ${priceList['7'].money} ₪
        
*חשוב להדגיש:* לאחר קניית חבילה הודעות - היתרה שלכם נשמרת ברובוט ואתם לא חייבים להשתמש בכל היתרה שלכם בפעם אחת.`;
        ctx.replyWithPhoto({source:botPhoto}
            ,{caption:text,parse_mode:"Markdown",
                reply_markup:{
                    inline_keyboard:[                       
                        [{text:`חזרה 🔙`, callback_data:"joined"}],                       
                    ]
                }        
            }    
      );
    })
}
