import axios from "axios";
import { Telegraf, Context } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { myState } from "../state";
import { handleStart } from "./handleStart";
import {isMember} from './validation';

let bot:Telegraf<Context<Update>>;
let botPhoto:string;
let tronPhoto:string;
let tronUri:string;
let message_id:number;
export const initBuy = (b:Telegraf<Context<Update>>)=>{
    bot = b;       
    botPhoto = process.env.BotPhoto as string;
    tronPhoto = process.env.TronPhoto as string;
    tronUri = process.env.TronUri as string;
    bot.action('buy',async (ctx)=>{
        myState.messagesToSend = 0;
        myState.numbers.length =  0;
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
📩⚡️ 20,000 הודעות - 1,300 ₪
📩⚡️ 50,000 הודעות - 3,200 ₪
📩⚡️ 100,000 הודעות מבצע חם -5,000₪
        
*חשוב להדגיש:* לאחר קניית חבילה הודעות - היתרה שלכם נשמרת ברובוט ואתם לא חייבים להשתמש בכל היתרה שלכם בפעם אחת.`;
        ctx.replyWithPhoto({source:botPhoto}
            ,{caption:text,parse_mode:"Markdown",
                reply_markup:{
                    inline_keyboard:[   
                        [{text:`1,000`, callback_data:"transaction&1"},{text:`2,500`, callback_data:"transaction&2"}],                    
                        [{text:`5,000`, callback_data:"transaction&3"},{text:`10,000`, callback_data:"transaction&4"}],                    
                        [{text:`20,000`, callback_data:"transaction&5"},{text:`50,000`, callback_data:"transaction&6"}],                    
                        [{text:`100,000`, callback_data:"transaction&7"}],                       
                        [{text:`ליותר 🔺`, callback_data:"joined"}],                       
                        [{text:`חזרה 🔙`, callback_data:"joined"}],                       
                    ]
                }        
            }    
      );
    });

    bot.action(/transaction&[1-8]/,async(ctx)=>{
        const data = ctx.callbackQuery.data?.split('&')[1]; 
        const currencyRes = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=ils");
        if(currencyRes.status!=200)
            ctx.sendMessage("זוהתה תקלה /start להפעלה מחדש");
        else
        {
            let money:number = currencyRes.data["tether"]["ils"];           
            const tronUriText:string = "`" + tronUri +"`"
            const text_1:string = `📌 כדי לבצע תשלום, שלח ביטקוין לכתובת הבאה. (הכסף יתווסף לחשבונך לאחר אישור).\n`
            const text_3:string =`\n🔻 *כתובת:*
${tronUriText}\n\n\n*⚠️ שים לב: אם תשלח סכום אחר או תכלול את עמלת העסקה בסכום זה, המערכת תתעלם מהתשלום! לאחר שעת המתנה העסקה מבוטלת!*`;
            switch (data) {
                case "1":
                   const text_2:string = "💰 *סכום:*\n" + "`"+(Math.round((1000/money + Number.EPSILON) * 100) / 100).toString()+ "` (Tether)"
                   await ctx.replyWithPhoto({source:tronPhoto},{caption:text_1 + text_2 + text_3,parse_mode:"Markdown"}).then(res=> message_id=res.message_id);
                   handleCrypto(Math.round((1000/money + Number.EPSILON) * 100) / 100,ctx);
                    // ctx.reply("1,000 הודעות חדשות").then(()=>handleStart(ctx));               
                    // if(myState.client?.Messages)
                    //     {
                    //         myState.client.Messages += 1000; 
                    //         myState.client.Money += 90;
                    //     }       
                    // if(myState.client?._Messages)
                    //     myState.client._Messages += 1000;
                    
                    // myState.update();        
                    break;
            
                case "2":
                    ctx.reply("2,500 הודעות חדשות").then(()=>handleStart(ctx));
                    if(myState.client?.Messages)
                       { 
                         myState.client.Messages += 2500;  
                         myState.client.Money += 200;
                       }      
                    if(myState.client?._Messages)
                        myState.client._Messages += 2500;
                
                    myState.update();               
                    break;
                case "3":
                    ctx.reply("5,000 הודעות חדשות").then(()=>handleStart(ctx));        
                    if(myState.client?.Messages)
                       {
                         myState.client.Messages += 5000; 
                         myState.client.Money += 370;
                       }       
                    if(myState.client?._Messages)
                        myState.client._Messages += 5000;
                
                    myState.update();       
                    break;
                case "4":
                    ctx.reply("10,000 הודעות חדשות").then(()=>handleStart(ctx));        
                    if(myState.client?.Messages)
                      { 
                         myState.client.Messages += 10000; 
                         myState.client.Money += 750;
                      }      
                    if(myState.client?._Messages)
                        myState.client._Messages += 10000;
                
                    myState.update();       
                    break;
                case "5":
                   ctx.reply("20,000 הודעות חדשות").then(()=>handleStart(ctx));        
                   if(myState.client?.Messages)
                    { 
                        myState.client.Messages += 20000;
                        myState.client.Money += 1300;
                    }        
                    if(myState.client?._Messages)
                         myState.client._Messages += 20000;
               
                    myState.update();      
                    break;
                case "6":
                    ctx.reply("50,000 הודעות חדשות").then(()=>handleStart(ctx));   
                    if(myState.client?.Messages)
                    {
                         myState.client.Messages += 50000;
                         myState.client.Money += 3200;
                    }        
                    if(myState.client?._Messages)
                        myState.client._Messages += 50000;
                
                    myState.update();             
                    break;
                case "7":
                    ctx.reply("100,000 הודעות חדשות").then(()=>handleStart(ctx)); 
                    if(myState.client?.Messages)
                        {
                            myState.client.Messages += 100000;
                            myState.client.Money += 5000;
                        }        
                    if(myState.client?._Messages)
                        myState.client._Messages += 100000;               
                    myState.update();           
                    break;
            }
        }   
        
    })
   
}
const handleCrypto = async(amount:number,ctx:any)=>{    
    let min:number = 59;
    let sec:number = 55;
    await ctx.sendMessage(`⌚️*הזמן שנותר לך לשלם:* 60 דקות, 0 שניות 
💡 *סטטוס התשלום:* ממתין לקבלת התשלום.
הסטטוס מתעדכן מידי 5 שניות.`,{reply_to_message_id:message_id,parse_mode:"Markdown"}).then((res:any)=>message_id = res.message_id);
    const checker = setInterval(async()=>{
        const text:string = `⌚️*הזמן שנותר לך לשלם:* ${min} דקות, ${sec} שניות 
💡 *סטטוס התשלום:* ממתין לקבלת התשלום.
הסטטוס מתעדכן מידי 5 שניות.`
    await bot.telegram.editMessageText((await ctx.getChat()).id,message_id,undefined,text,{parse_mode:"Markdown"});
    if(min===0 && sec === 0)
        {
            await bot.telegram.editMessageText((await ctx.getChat()).id,message_id,undefined,"*העסקה בוטלה*",{parse_mode:"Markdown"});
            clearInterval(checker);
        }
    else if(sec===0)
    {
        min--;
        sec=50
    }
    else
        sec-=5;
    },5000)
    

}


