import { Telegraf, Context } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { myState } from "../state";
import { handleStart } from "./handleStart";
import {isMember} from './validation';

let bot:Telegraf<Context<Update>>;
let botPhoto:string;
export const initStartSendMessages = (b:Telegraf<Context<Update>>)=>{
    bot = b;       
    botPhoto = process.env.BotPhoto as string;
    bot.action('startSendMessages',async (ctx)=>{
        await ctx.deleteMessage();
        //creator" | "administrator" | "member" | "restricted" | "left" | "kicked        
        const isMemberFlag:string = await (await isMember(ctx.update.callback_query.from.id)).split(':')[0];
        if(isMemberFlag === "restricted" || isMemberFlag === "left")
            {
                handleStart(ctx,isMemberFlag);
                return;
            }

        const text:string =  "באיזו דרך תרצה לשלוח את ההודעות? בחר מהכפתורים:";
        ctx.replyWithPhoto({source:botPhoto}
            ,{caption:text,                
                reply_markup:{
                    inline_keyboard:[
                        [{text:"יש לי מאגר 🗃", callback_data:"sendTo-fromFile"}],
                        [{text:"הכנסת מספרים ידנית ✏️", callback_data:"sendTo-manual"}],
                        [{text:"שימוש במאגר הרובוט ⚡️", callback_data:"sendTo-fromBot"}],
                        [{text:`חזרה 🔙`, callback_data:"joined"}],                       
                    ]
                }        
            }    
      );
    })

    bot.action(/sendTo-[a-zA-Z]+/,async(ctx)=>{        
        const data = ctx.callbackQuery.data?.split('-')[1];
        myState.SetMessagesToSendQuary(data as string);
        ctx.replyWithChatAction("typing").then(()=>ctx.reply("כמה מספרים תרצה לשלוח?"));
        console.log(data)
    })
}



