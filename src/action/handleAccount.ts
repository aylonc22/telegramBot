import { Telegraf, Context } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { myState } from "../state";
import { handleStart } from "./handleStart";
import { isMember } from "./validation";

let bot:Telegraf<Context<Update>>;
let botPhoto:string;
export const initAccount = (b:Telegraf<Context<Update>>)=>{
    bot = b;       
    botPhoto = process.env.botPhoto as string;
    bot.action('account', async (ctx)=>{
        const client = myState.client;
        await ctx.deleteMessage();
        const isMemberFlag = await isMember(ctx.update.callback_query.from.id);
        if(isMemberFlag === "restricted" || isMemberFlag === "left")
            {
                handleStart(ctx,isMemberFlag);
                return;
            }                    
           const text:string =  `👤:*${ctx.from?.first_name}* \n🆔:${ctx.from?.id}\n🗓:${client !==undefined? client.Joined.toLocaleDateString([], {
               day: '2-digit',
               month: '2-digit',
               year: 'numeric',
          }):"שגיאה"}\n💳:*${client !==undefined? client.Messages:"שגיאה"}*`;
        ctx.replyWithPhoto({source:botPhoto},
            { caption:text,parse_mode:"Markdown",
                reply_markup:{
                    inline_keyboard:[                        
                        [{text:"חזרה 🔙", callback_data:"joined"}],                       
                    ]
                }        
            }    
      );
    });
}

