import axios from "axios";
import { Telegraf, Context } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { myState } from "../state";
import { handleStart } from "./handleStart";
import {isMember} from './validation';
import fs from 'fs';
import priceList from '../assets/priceList.json';

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
        let state:myState = new myState(JSON.parse(fs.readFileSync(`./memory/${ctx.update.callback_query.from.id}.json`).toString()));
        state.setQuary("default");
        state.messagesToSend = 0;
        state.numbers.length =  0;
        state.updateJson();
        await ctx.deleteMessage();
        //creator" | "administrator" | "member" | "restricted" | "left" | "kicked        
        const isMemberFlag:string = await (await isMember(ctx.update.callback_query.from)).split(':')[0];
        if(isMemberFlag === "restricted" || isMemberFlag === "left")
            {
                handleStart(ctx,isMemberFlag);
                return;
            }

            const text:string =  `*👇 מחירון מפורט הודעות אסמס 👇*

📩⚡️ ${priceList['1'].messages} הודעות - ${priceList['1'].money} ₪
📩⚡️ ${priceList['2'].messages} הודעות - ${priceList['2'].money} ₪
📩⚡️ ${priceList['3'].messages} הודעות - ${priceList['3'].money} ₪
📩⚡️ ${priceList['4'].messages} הודעות - ${priceList['4'].money} ₪
📩⚡️ ${priceList['5'].messages} הודעות - ${priceList['5'].money} ₪
📩⚡️ ${priceList['6'].messages} הודעות - ${priceList['6'].money} ₪
📩⚡️ ${priceList['7'].messages} הודעות מבצע חם - ${priceList['7'].money} ₪
                    
            *חשוב להדגיש:* לאחר קניית חבילה הודעות - היתרה שלכם נשמרת ברובוט ואתם לא חייבים להשתמש בכל היתרה שלכם בפעם אחת.`;
        ctx.replyWithPhoto({source:botPhoto}
            ,{caption:text,parse_mode:"Markdown",
                reply_markup:{
                    inline_keyboard:[   
                        [{text:`${priceList['1'].messages}`, callback_data:"transaction&1"},{text:`${priceList['2'].messages}`, callback_data:"transaction&2"}],                    
                        [{text:`${priceList['3'].messages}`, callback_data:"transaction&3"},{text:`${priceList['4'].messages}`, callback_data:"transaction&4"}],                    
                        [{text:`${priceList['5'].messages}`, callback_data:"transaction&5"},{text:`${priceList['6'].messages}`, callback_data:"transaction&6"}],                    
                        [{text:`${priceList['7'].messages}`, callback_data:"transaction&7"}],                                                                  
                        [{text:`חזרה 🔙`, callback_data:"joined"}],                       
                    ]
                }        
            }    
      );
    });

    bot.action(/transaction&[1-8]/,async(ctx)=>{
        let state:myState = new myState(JSON.parse(fs.readFileSync(`./memory/${ctx.update.callback_query.from.id}.json`).toString()));
        const data = ctx.callbackQuery.data?.split('&')[1]; 
        const currencyRes = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=ils");
        if(currencyRes.status!=200)
            ctx.sendMessage("זוהתה תקלה /start להפעלה מחדש");
        else
        {
            let money:number = currencyRes.data["tether"]["ils"];           
            const tronUriText:string = "`" + tronUri +"`"
            const text_1:string = `📌 כדי לבצע תשלום, שלח Usdt לכתובת הבאה. (הכסף יתווסף לחשבונך לאחר הזנת קוד העסקה).\n *ודא שאתה נמצא על רשת Tron\n*`
            const text_3:string =`\n🔻 *כתובת:*
${tronUriText}\n\n\n*⚠️ שים לב: אם תשלח סכום אחר או תכלול את עמלת העסקה בסכום זה, המערכת תתעלם מהתשלום!*`;
            switch (data) {
                case "1":{
                    state.needToPay = Math.round((priceList[1].money/money + Number.EPSILON) * 100) / 100;
                    state.needToPayCase = 1;
                    const text_2:string = "💰 *סכום:*\n" + "`"+(state.needToPay).toString()+ "` (Usdt)"
                    await ctx.replyWithPhoto({source:tronPhoto},{caption:text_1 + text_2 + text_3,parse_mode:"Markdown",reply_markup:{
                        inline_keyboard:[   
                            [{text:`אישור ✅`, callback_data:`handleCrypto&${state.needToPay}`}],                                                                                               
                            [{text:`ביטול 🔙`, callback_data:"1back"}],                       
                        ]
                    }}).then((res:any)=> state.deleteId.push(res.message_id));                      
                    break;}
            
                case "2":{
                    state.needToPay = Math.round((priceList[2].money/money + Number.EPSILON) * 100) / 100;
                    state.needToPayCase = 2;
                    const text_2:string = "💰 *סכום:*\n" + "`"+(state.needToPay).toString()+ "` (Usdt)"
                    await ctx.replyWithPhoto({source:tronPhoto},{caption:text_1 + text_2 + text_3,parse_mode:"Markdown",reply_markup:{
                        inline_keyboard:[   
                            [{text:`אישור ✅`, callback_data:`handleCrypto&${state.needToPay}`}],                                                                                               
                            [{text:`ביטול 🔙`, callback_data:"1back"}],                       
                        ]
                    }}).then((res:any)=> state.deleteId.push(res.message_id));                                   
                    break;}
                case "3":{
                    state.needToPay = Math.round((priceList[3].money/money + Number.EPSILON) * 100) / 100;
                    state.needToPayCase = 3;
                    const text_2:string = "💰 *סכום:*\n" + "`"+(state.needToPay).toString()+ "` (Usdt)"
                    await ctx.replyWithPhoto({source:tronPhoto},{caption:text_1 + text_2 + text_3,parse_mode:"Markdown",reply_markup:{
                        inline_keyboard:[   
                            [{text:`אישור ✅`, callback_data:`handleCrypto&${state.needToPay}`}],                                                                                               
                            [{text:`ביטול 🔙`, callback_data:"1back"}],                       
                        ]
                    }}).then((res:any)=> state.deleteId.push(res.message_id));                               
                    break;}
                case "4":
                   {
                     state.needToPay = Math.round((priceList[4].money/money + Number.EPSILON) * 100) / 100;
                     state.needToPayCase = 4;
                    const text_2:string = "💰 *סכום:*\n" + "`"+(state.needToPay).toString()+ "` (Usdt)"
                    await ctx.replyWithPhoto({source:tronPhoto},{caption:text_1 + text_2 + text_3,parse_mode:"Markdown",reply_markup:{
                        inline_keyboard:[   
                            [{text:`אישור ✅`, callback_data:`handleCrypto&${state.needToPay}`}],                                                                                               
                            [{text:`ביטול 🔙`, callback_data:"1back"}],                       
                        ]
                    }}).then((res:any)=> state.deleteId.push(res.message_id));       
                       
                    break;}
                case "5":
                  { 
                    state.needToPay = Math.round((priceList[5].money/money + Number.EPSILON) * 100) / 100;
                    state.needToPayCase = 5;
                  const text_2:string = "💰 *סכום:*\n" + "`"+(state.needToPay).toString()+ "` (Usdt)"
                  await ctx.replyWithPhoto({source:tronPhoto},{caption:text_1 + text_2 + text_3,parse_mode:"Markdown",reply_markup:{
                    inline_keyboard:[   
                        [{text:`אישור ✅`, callback_data:`handleCrypto&${state.needToPay}`}],                                                                                               
                        [{text:`ביטול 🔙`, callback_data:"1back"}],                       
                    ]
                }}).then((res:any)=> state.deleteId.push(res.message_id));         
                    break;}
                case "6":
                    {      
                        state.needToPay = Math.round((priceList[6].money/money + Number.EPSILON) * 100) / 100;
                        state.needToPayCase = 6;
                        const text_2:string = "💰 *סכום:*\n" + "`"+(state.needToPay).toString()+ "` (Usdt)"
                        await ctx.replyWithPhoto({source:tronPhoto},{caption:text_1 + text_2 + text_3,parse_mode:"Markdown",reply_markup:{
                            inline_keyboard:[   
                                [{text:`אישור ✅`, callback_data:`handleCrypto&${state.needToPay}`}],                                                                                               
                                [{text:`ביטול 🔙`, callback_data:"1back"}],                       
                            ]
                        }}).then((res:any)=> state.deleteId.push(res.message_id));           
                    break;}
                case "7":{
                    state.needToPay = Math.round((priceList[7].money/money + Number.EPSILON) * 100) / 100;
                    state.needToPayCase = 7;
                    const text_2:string = "💰 *סכום:*\n" + "`"+(state.needToPay).toString()+ "` (Usdt)"
                    await ctx.replyWithPhoto({source:tronPhoto},{caption:text_1 + text_2 + text_3,parse_mode:"Markdown",reply_markup:{
                        inline_keyboard:[   
                            [{text:`אישור ✅`, callback_data:`handleCrypto&${state.needToPay}`}],                                                                                               
                            [{text:`ביטול 🔙`, callback_data:"1back"}],                       
                        ]
                    }}).then((res:any)=> state.deleteId.push(res.message_id));                             
                    break;}
            }
        }   
        state.updateJson();
    })

   bot.action(/handleCrypto&*/,async (ctx)=>{
    let state:myState = new myState(JSON.parse(fs.readFileSync(`./memory/${ctx.update.callback_query.from.id}.json`).toString()));
    await ctx.reply("*לאחר שליחת התשלום אנא הקלד את קוד העסקה (hash code)*\n לביטול /cancel",{parse_mode:"Markdown"})
    .then((res:any)=>state.deleteId.push(res.message_id)); 
    const amount:number = Number(ctx.callbackQuery.data?.split('&')[1]); 
    console.log(amount);
    state.needToPay = amount * 1000000;
    state.setQuary("paymentVerification");   
    state.updateJson();
   });

   bot.action("1back", async(ctx)=>{
    await ctx.deleteMessage();
   })
}
// const handleCrypto = async(amount:number,ctx:any)=>{        
//     await ctx.sendMessage(`האם ברצונך להמשיך`,{parse_mode:"Markdown", reply_markup:{
//         inline_keyboard:[   
//             [{text:`אישור ✅`, callback_data:`handleCrypto&${amount}`}],                                                                                               
//             [{text:`ביטול 🔙`, callback_data:"joined"}],                       
//         ]
//     } }).then((res:any)=>myState.replyMessageId = res.message_id);
     
// }


