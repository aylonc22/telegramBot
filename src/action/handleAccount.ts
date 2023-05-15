import { Telegraf, Context } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { myState } from "../state";
import { handleStart } from "./handleStart";
import { isMember } from "./validation";
import { Client } from "../database/models/client_model";
import fs from 'fs'
import { getClient } from "../database/mysql/controllers/client_controller";

let bot:Telegraf<Context<Update>>;
let botPhoto:string;
export const initAccount = (b:Telegraf<Context<Update>>)=>{
    bot = b;       
    botPhoto = process.env.botPhoto as string;
    bot.action('account', async (ctx)=>{
        let state:myState = new myState(JSON.parse(fs.readFileSync(`./memory/${ctx.update.callback_query.from.id}.json`).toString()));
        state.setQuary("default");
        let clientBackup:Client | undefined|null = state.client;
        
        let  client = await getClient(ctx.update.callback_query.from.id.toString());        
        if(client)        
            state.setClient(client);           
        else
        client = clientBackup;
        state.updateJson();
        await ctx.deleteMessage();
        const isMemberFlag = await isMember(ctx.update.callback_query.from);
        if(isMemberFlag === "restricted" || isMemberFlag === "left")
            {
                handleStart(ctx,isMemberFlag);
                return;
            }                    
           const text:string =  `👤:*${ctx.from?.first_name}* \n🆔:${ctx.from?.id}\n🗓:${client !==undefined && client!==null? client.Joined:"שגיאה"}\n📩*balance*:*${client !==undefined && client!==null? client.Messages:"שגיאה"}*`;
        ctx.replyWithPhoto({source:botPhoto},
            { caption:text,parse_mode:"Markdown",
                reply_markup:{
                    inline_keyboard:[          
                        [{text:"הוספת הודעות לחשבון 💰", callback_data:"buy"}],
                        [{text:"עזרה 📄", url:process.env.Help_URL as string}],              
                        [{text:"חזרה 🔙", callback_data:"joined"}],                       
                    ]
                }        
            }    
      );
    });
}

