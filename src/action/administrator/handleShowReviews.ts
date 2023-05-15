import * as dotenv from 'dotenv';
import { Telegraf, Context, Telegram } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { handleStart } from "../handleStart";
import { isMember } from "../validation";
import { ReviewFromDB} from '../../database/models/review_model';
import { myState } from '../../state';
import { getReview, getReviews, updateReview } from '../../database/mysql/controllers/review_controller';
import fs from 'fs';
import { getClient } from '../../database/mysql/controllers/client_controller';

dotenv.config({path:"../../.env"})
const {Channel} = process.env;
let CHANNEL = "00000";
if(Channel)
    CHANNEL = Channel;
let bot:Telegraf<Context<Update>>;
let botPhoto:string;
export const initShowReviews = (b:Telegraf<Context<Update>>)=>{
    bot = b;       
    botPhoto = process.env.botPhoto as string;
    bot.action(/showReviews:*/, async (ctx)=>{   
        let state:myState = new myState(JSON.parse(fs.readFileSync(`./memory/${ctx.update.callback_query.from.id}.json`).toString())); 
        state.setQuary("default");   
        const _id2 = ctx.callbackQuery.data?.split(':')[1];
        if(_id2)
            updateReview(_id2);
        await ctx.deleteMessage();
        const isMemberFlag = await isMember(ctx.update.callback_query.from);
        if(isMemberFlag === "restricted" || isMemberFlag === "left")
            {
                handleStart(ctx,isMemberFlag);
                return;
            }  
        const reviews = await getReviews();               
           const text:string = ` משובים
           /start כדי לחזור `;
       if(reviews)
       ctx.replyWithPhoto({source:botPhoto},
        { caption:text,parse_mode:"Markdown",
            reply_markup:{
                inline_keyboard: await Promise.all(reviews.map(async(review:ReviewFromDB)=>{                      
                    const user = await getClient(review.ClientId.toString())                        
                    return[{text:`משוב מ: ${user?.FirstName} ${user?.LastName}`, callback_data:`review:${review._id}`}]}))                    
            }        
        }    
  );
  else
  ctx.replyWithPhoto({ source: botPhoto },
    {
        caption: "אין משובים", parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: [[{text:`חזרה 🔙`, callback_data:"joined"}]],
        }
    }
);
state.updateJson();
    });

    bot.action(/review:*/,async(ctx)=>{    
        const _id = ctx.callbackQuery.data?.split(':')[1];
        if(_id)
        {
            await ctx.deleteMessage();
            const review:ReviewFromDB|null|undefined = await getReview(_id);            
            let text = "";
            if(review)
                text = review.Message;
                ctx.replyWithPhoto({source:botPhoto}
                    ,{caption:text,parse_mode:"Markdown",
                        reply_markup:{
                            inline_keyboard:[   
                                [{text:`✅ מאשר קריאה`, callback_data:`showReviews:${_id}`}]                                                  
                            ]
                        }        
                    }    
              );

        }
    })   
}

