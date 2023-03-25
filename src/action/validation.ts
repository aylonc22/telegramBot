import { Context, NarrowedContext, Telegraf } from "telegraf";
import { MountMap } from "telegraf/typings/telegram-types";
import { Update } from "telegraf/typings/core/types/typegram";
import {createClient} from '../mongo/controllers/client_controller';
import { myState } from "../state";

let bot:Telegraf<Context<Update>>;
let Channel:string;

export const initValidation = (b:Telegraf<Context<Update>>)=>{
    bot = b;
    Channel = process.env.Channel as string;    
}

export const isMember = async (userId:number | undefined)=>{
    const res = await bot.telegram.getChatMember(Channel,userId as number)
    if(res.status !== "restricted" && res.status !== "left") 
        {
            const clientRes = await createClient({Id:userId ,_Messages:5,Messages:5,Joined:new Date(),Money:0})
            if(clientRes!=undefined)                           
                 return res.status + ":new"                
        }
   return res.status;
}

export const enterNumbersDocument = (ctx:NarrowedContext<Context, MountMap["document"]>)=>{
    if(myState.messagesToSend > myState.numbers.length)
            {
              ctx.deleteMessage(ctx.message.message_id).then(()=>ctx.deleteMessage(ctx.message.message_id-1)).then(()=>ctx.deleteMessage(ctx.message.message_id-2)).then(()=>ctx.deleteMessage(ctx.message.message_id-3))
              .then(()=>ctx.deleteMessage(ctx.message.message_id-4)).finally(()=>
              ctx.reply(`נקלטו ${myState.numbers.length} מספרים האם ברצונך להמשיך או להכניס עוד ${myState.messagesToSend-myState.numbers.length} מספרים לביטול /cancel`,{ reply_markup:{
                inline_keyboard:[
                    [{text:"המשך ✅", callback_data:"continue"}],
                    [{text:"השלם מספרים ↩️", callback_data:"enterMore"}],                                                            
                ]
            } })).catch(e=>{console.log(e.response.description)})
                
        }
        else
        if(myState.messagesToSend <= myState.numbers.length)
        ctx.deleteMessage(ctx.message.message_id).then(()=>ctx.deleteMessage(ctx.message.message_id-1)).then(()=>ctx.deleteMessage(ctx.message.message_id-2)).then(()=>ctx.deleteMessage(ctx.message.message_id-3))
        .then(()=>ctx.deleteMessage(ctx.message.message_id-4)).finally(()=>{
            myState.setShouldReadDoc(false);
            if(myState.client?.Messages!=undefined && myState.client?.Messages< myState.numbers.length)
                ctx.reply(`הכנסת ${myState.numbers.length} מספרים. ברשותך ${myState.client?.Messages} הודעות, אם ברצונך לשלוח כמות הודעות גדולה יותר אנא רכוש עוד הודעות. אם ברצונך להמשיך את התהליך עם כמות ההודעות הנוכחית שלך לחץ המשך`,{
                    reply_markup:{
                        inline_keyboard:[                           
                            [{text:"הוספת הודעות לחשבון 💰", callback_data:"buy"}],
                            [{text:"המשך ✅", callback_data:"continue"}],                           
                        ]
                    }    
                })
        }).catch(e=>{console.log(e.response.description)})
}

export const enterNumbersManual = (ctx:NarrowedContext<Context, MountMap["text"]>)=>{
    if(myState.messagesToSend > myState.numbers.length)
            {
              ctx.deleteMessage(ctx.message.message_id).then(()=>ctx.deleteMessage(ctx.message.message_id-1)).then(()=>ctx.deleteMessage(ctx.message.message_id-2)).then(()=>ctx.deleteMessage(ctx.message.message_id-3))
              .then(()=>ctx.deleteMessage(ctx.message.message_id-4)).finally(()=>
              ctx.reply(`נקלטו ${myState.numbers.length} מספרים האם ברצונך להמשיך או להכניס עוד ${myState.messagesToSend-myState.numbers.length} מספרים לביטול /cancel`,{ reply_markup:{
                inline_keyboard:[
                    [{text:"המשך ✅", callback_data:"continue"}],
                    [{text:"השלם מספרים ↩️", callback_data:"enterMore"}],                                                            
                ]
            } })).catch(e=>{console.log(e.response.description)})
                
        }
        else
        if(myState.client?.Messages!=undefined && myState.client?.Messages< myState.numbers.length)
        ctx.deleteMessage(ctx.message.message_id).then(()=>ctx.deleteMessage(ctx.message.message_id-1)).then(()=>ctx.deleteMessage(ctx.message.message_id-2)).then(()=>ctx.deleteMessage(ctx.message.message_id-3))
        .then(()=>ctx.deleteMessage(ctx.message.message_id-4)).finally(()=>{
            myState.setShouldReadDoc(false);
            if(myState.messagesToSend < myState.numbers.length)
                ctx.reply(`הכנסת ${myState.numbers.length} מספרים. ברשותך ${myState.client?.Messages} הודעות, אם ברצונך לשלוח כמות הודעות גדולה יותר אנא רכוש עוד הודעות. אם ברצונך להמשיך את התהליך עם כמות ההודעות הנוכחית שלך לחץ המשך`,{
                    reply_markup:{
                        inline_keyboard:[                           
                            [{text:"הוספת הודעות לחשבון 💰", callback_data:"buy"}],
                            [{text:"המשך ✅", callback_data:"continue"}],                           
                        ]
                    }    
                })

                else
                ctx.reply("מתקדמים");
        }).catch(e=>{console.log(e.response.description)})
}



