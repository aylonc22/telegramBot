import * as dotenv from 'dotenv';
import { Telegraf, Context, Telegram } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { getReview, getReviews, updateReview } from "../../mongo/controllers/review_controller";
import { handleStart } from "../handleStart";
import { isMember } from "../validation";
import { ReviewFromMongo} from '../../mongo/models/review_model';

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
        const _id2 = ctx.callbackQuery.data?.split(':')[1];
        if(_id2)
            updateReview(_id2);
        await ctx.deleteMessage();
        const isMemberFlag = await isMember(ctx.update.callback_query.from.id);
        if(isMemberFlag === "restricted" || isMemberFlag === "left")
            {
                handleStart(ctx,isMemberFlag);
                return;
            }  
        const reviews = await getReviews();               
           const text:string = ` משובים
           /start כדי לחזור `;
        ctx.replyWithPhoto({source:botPhoto},
            { caption:text,parse_mode:"Markdown",
                reply_markup:{
                    inline_keyboard: await Promise.all(reviews.map(async(review:ReviewFromMongo)=>{                      
                        const user = await bot.telegram.getChatMember(CHANNEL,Number(review.ClientId));                        
                        return[{text:`משוב מ: ${user.user.first_name} ${user.user.last_name}`, callback_data:`review:${review._id}`}]}))                    
                }        
            }    
      );
    });

    bot.action(/review:*/,async(ctx)=>{    
        const _id = ctx.callbackQuery.data?.split(':')[1];
        if(_id)
        {
            await ctx.deleteMessage();
            const review:ReviewFromMongo = await getReview(_id);            
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

