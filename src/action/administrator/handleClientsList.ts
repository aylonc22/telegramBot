import * as dotenv from 'dotenv';
import { Telegraf, Context, Telegram } from "telegraf";
import { ChatMember, Update } from "telegraf/typings/core/types/typegram";
import { getClient, getClients } from '../../mongo/controllers/client_controller';
import { Client } from '../../mongo/models/Client_model';
import { myState } from '../../state';
import { handleStart } from "../handleStart";
import { isMember } from "../validation";

dotenv.config({path:"../../.env"})
const {Channel} = process.env;
let CHANNEL = "00000";
if(Channel)
    CHANNEL = Channel;
let bot:Telegraf<Context<Update>>;
let botPhoto:string;
export const initShowClientList = (b:Telegraf<Context<Update>>)=>{
    bot = b;       
    botPhoto = process.env.botPhoto as string;
    bot.action('showClientsList', async (ctx)=>{              
        await ctx.deleteMessage();
        const isMemberFlag = await isMember(ctx.update.callback_query.from.id);
        if(isMemberFlag === "restricted" || isMemberFlag === "left")
            {
                handleStart(ctx,isMemberFlag);
                return;
            }  
        const clients = await getClients();               
           const text:string = ` רשימת יוזרים
           /start כדי לחזור `;
        ctx.replyWithPhoto({source:botPhoto},
            { caption:text,parse_mode:"Markdown",
                reply_markup:{
                    inline_keyboard: await Promise.all(clients.map(async(client:Client)=>{                      
                        const user = await bot.telegram.getChatMember(CHANNEL,Number(client.Id));                        
                        return[{text:`${user.user.first_name} ${user.user.last_name}`, callback_data:`client:${client.Id}`}]}))                    
                }        
            }    
      );
    });

    bot.action(/client:*/,async(ctx)=>{    
        const id = ctx.callbackQuery.data?.split(':')[1];
        if(id)
        {
            await ctx.deleteMessage();
            const client:Client = await getClient(Number(id));             
            const chatMember:ChatMember = await bot.telegram.getChatMember(CHANNEL,Number(client.Id));         
            let text:string = "";
            if(client)
                text = `👤: ${chatMember.user.first_name} ${chatMember.user.last_name} ${chatMember.user.username ? `|| @${chatMember.user.username}`:""}
🗓: ${client.Joined.toLocaleDateString([], {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
               })} 
💳: ${client._Messages}
💰: ${client.Money}`;
                ctx.replyWithPhoto({source:botPhoto}
                    ,{caption:text,parse_mode:"Markdown",
                        reply_markup:{
                            inline_keyboard:[
                                [{text:"הכנסה ידנית", callback_data:`addMessages&${id}`}],   
                                [{text:`חזרה 🔙`, callback_data:`showClientsList`}]                                                  
                            ]
                        }        
                    }    
              );

        }
    });
    bot.action(/addMessages&*/,async(ctx)=>{
        const id = ctx.callbackQuery.data?.split('&')[1];
        if(id)
        {            
            myState.setClientId(Number(id));
            myState.setQuary("addMessages");
            ctx.sendMessage('אנא כתוב כמה הודעות תרצה להוסיף \nלביטול התהליך יש לשלוח /cancel');
        }
    })
}

