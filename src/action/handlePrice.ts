import { Telegraf, Context } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { handleStart } from "./handleStart";
import {isMember} from './validation';

let bot:Telegraf<Context<Update>>;
let botPhoto:string;
export const initPrice = (b:Telegraf<Context<Update>>)=>{
    bot = b;       
    botPhoto = process.env.BotPhoto as string;
    bot.action('price',async (ctx)=>{
        await ctx.deleteMessage();
        //creator" | "administrator" | "member" | "restricted" | "left" | "kicked        
        const isMemberFlag:string = await (await isMember(ctx.update.callback_query.from.id)).split(':')[0];
        if(isMemberFlag === "restricted" || isMemberFlag === "left")
            {
                handleStart(ctx,isMemberFlag);
                return;
            }

        const text:string =  `*👇 מחירון מפורט הודעות אסמס 👇*

📩⚡️ 1,000 הודעות - 90 ₪
📩⚡️ 2,500 הודעות - 200 ₪
📩⚡️ 5,000 הודעות - 370 ₪
📩⚡️ 10,000 הודעות - 750 ₪
📩⚡️ 20,000 הודעות - 1300 ₪
📩⚡️ 50,000 הודעות - 3,200 ₪
📩⚡️ 100,000 הודעות מבצע חם -5,000₪
        
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
