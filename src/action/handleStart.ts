import { Context, NarrowedContext, Telegraf } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { MountMap } from "telegraf/typings/telegram-types";
import {isMember} from './validation';
import {myState} from '../state';

let bot:Telegraf<Context<Update>>;
let Channel:string;
let botPhoto:string;
export const initHandleStart = (b:Telegraf<Context<Update>>)=>{
    bot = b;
    Channel = process.env.Channel_URL as string;   
    botPhoto = process.env.BotPhoto as string;
    bot.action('joined', async (ctx)=>{      
        myState.SetMessagesToSendQuary("");
        handleStart(ctx,await isMember(ctx.update.callback_query.from.id) )
    })
}
export const handleStart = async(ctx: NarrowedContext<Context, MountMap["callback_query"]>,status:string = "")=>{ 
    await ctx.deleteMessage();
    myState.setQuary("default");
    //creator" | "administrator" | "member" | "restricted" | "left" | "kicked
    const from =  ctx.update.callback_query.from;
    status =  status === "" ? await isMember(from.id) : status;   
    console.log("2",status);
    if(status.includes(":new"))
        await ctx.sendMessage("מזל טוב קיבלת 5 הודעות במתנה");
    let start:string;
    
        if( status.includes("creator") || status.includes("member"))
           {           
                start =   `היי ${from.first_name}, באמצעות בוט זה באפשרותך לשלוח הודעות SMS למספרי פלאפון ישראלים ללא כל הגבלה.
לצפייה במחירים לחץ על הכפתור מחירים.
לעזרה והסברים נוספים לחץ על הכפתור.
להשארת משוב למנהל לחץ על משוב.                
שימוש מהנה`;
                ctx.replyWithPhoto(
                    {source:botPhoto},{
                        caption:start,
                        reply_markup:{
                            inline_keyboard:[
                                [{text:"התחלת הפצת הודעות 💬", callback_data:"startSendMessages"}],
                                [{text:"מחירים 💸", callback_data:"price"}],
                                [{text:"הוספת הודעות לחשבון 💰", callback_data:"buy"}],
                                [{text:"החשבון שלי 🧰", callback_data:"account"}],
                                [{text:"הגדרות וכלים 🔧", callback_data:"settings"}],
                                [{text:"עזרה 📄", callback_data:"test"}],
                                [{text:"משוב 💌", callback_data:"feedback"}]
                            ]
                        }        
                    }    
              );}
              else if(status.includes("restricted"))
                { 
                    start =   `היי ${from.first_name} 
                    על מנת להמשיך בהליך ההרשמה לבוט לחץ על הכפתור שמתחת להודעה על מנת להצטרף לערוץ! לאחר ההצטרפות לחץ על הכפתור הצטרפתי ✅ ותקבל 5 הודעות במתנה"`;
                    ctx.replyWithPhoto({source:botPhoto},
                        {
                            caption:start,
                            reply_markup:{
                                inline_keyboard:[
                                    [{text:"לערוץ העדכונים", callback_data:"test" ,url:process.env.Channel_URL as string}],
                                    [{text:"הצטרפתי ✅", callback_data:"joined"}]
                                ]
                            }        
                        }    
                );
                }
            
            else if(status.includes("left"))
            { 
                    start =   `היי ${from.first_name} 
                    על מנת להמשיך להינות מהרובוט לחץ על הכפתור שמתחת להודעה על מנת להצטרף לערוץ!
                    כבר הצטפרת ועזבת...`;
                    ctx.replyWithPhoto({source:botPhoto},
                        { caption:start,
                            reply_markup:{
                                inline_keyboard:[
                                    [{text:"לערוץ העדכונים", callback_data:"test" ,url:process.env.Channel_URL as string}],
                                    [{text:"הצטרפתי ✅", callback_data:"joined"}]
                                ]
                            }        
                        }    
                );
                }   
            /* else*/ if( status.includes("creator") ||status.includes("administrator")) 
                { 
                    start =   `היי ${from?.first_name} 
                    אתה נמצא בפאנל מנהלים!`;
                    ctx.replyWithPhoto({source:botPhoto},
                        { caption:start,
                            reply_markup:{
                                inline_keyboard:[                                    
                                    [{text:"שליחת הודעת תפוצה", callback_data:"messageAll" }],
                                    [{text:"משובים", callback_data:"showReviews" }],
                                    [{text:"רשימת משתמשים", callback_data:"showClientsList"}],
                                    
                                ]
                            }        
                        }    
                );
                }         
                
               
}
export const handleStartMain = async(ctx:Context<Update>,status:string = "")=>{        
    myState.setQuary("default");
    //creator" | "administrator" | "member" | "restricted" | "left" | "kicked
    const from = ctx.message?.from;    
    status =  status === "" ? await isMember(from?.id) : status;   
    console.log("1",status);
    if(status.includes(":new"))
       await ctx.sendMessage("מזל טוב קיבלת 5 הודעות במתנה");
    let start:string;
    
        if( status.includes("creator") || status.includes("member"))
           { 
            start =   `היי ${from?.first_name}, באמצעות בוט זה באפשרותך לשלוח הודעות SMS למספרי פלאפון ישראלים ללא כל הגבלה.
לצפייה במחירים לחץ על הכפתור מחירים.
לעזרה והסברים נוספים לחץ על הכפתור.
להשארת משוב למנהל לחץ על משוב.                
שימוש מהנה`;
ctx.replyWithPhoto(
    {source:botPhoto},{
        caption:start,
        reply_markup:{
            inline_keyboard:[
                [{text:"התחלת הפצת הודעות 💬", callback_data:"startSendMessages"}],
                [{text:"מחירים 💸", callback_data:"price"}],
                [{text:"הוספת הודעות לחשבון 💰", callback_data:"buy"}],
                [{text:"החשבון שלי 🧰", callback_data:"account"}],
                [{text:"הגדרות וכלים 🔧", callback_data:"settings"}],
                [{text:"עזרה 📄", callback_data:"test"}],
                [{text:"משוב 💌", callback_data:"feedback"}]
            ]
        }        
    }    
);}
else if(status.includes("restricted"))
{ 
    start =   `היי ${from?.first_name} 
    על מנת להמשיך בהליך ההרשמה לבוט לחץ על הכפתור שמתחת להודעה על מנת להצטרף לערוץ! לאחר ההצטרפות לחץ על הכפתור הצטרפתי ✅ ותקבל 5 הודעות במתנה"`;
    ctx.replyWithPhoto({source:botPhoto},
        {
            caption:start,
            reply_markup:{
                inline_keyboard:[
                    [{text:"לערוץ העדכונים", callback_data:"test" ,url:process.env.Channel_URL as string}],
                    [{text:"הצטרפתי ✅", callback_data:"joined"}]
                ]
            }        
        }    
);
}

else if(status.includes("left"))
{ 
    start =   `היי ${from?.first_name} 
    על מנת להמשיך להינות מהרובוט לחץ על הכפתור שמתחת להודעה על מנת להצטרף לערוץ!
    כבר הצטפרת ועזבת...`;
    ctx.replyWithPhoto({source:botPhoto},
        { caption:start,
            reply_markup:{
                inline_keyboard:[
                    [{text:"לערוץ העדכונים", callback_data:"test" ,url:process.env.Channel_URL as string}],
                    [{text:"הצטרפתי ✅", callback_data:"joined"}]
                ]
            }        
        }    
);
}
 /* else*/ if( status.includes("creator") ||status.includes("administrator")) 
{ 
    start =   `היי ${from?.first_name} 
    אתה נמצא בפאנל מנהלים!`;
    ctx.replyWithPhoto({source:botPhoto},
        { caption:start,
            reply_markup:{
                inline_keyboard:[                   
                    [{text:"שליחת הודעת תפוצה", callback_data:"messageAll" }],
                    [{text:"משובים", callback_data:"showReviews" }],
                    [{text:"רשימת משתמשים", callback_data:"showClientsList"}],
                    
                ]
            }        
        }    
);
}                                       
}