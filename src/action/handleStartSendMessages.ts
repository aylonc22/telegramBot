import { Telegraf, Context } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { insertNumbers } from "../database/mongo/controllers/client_controller";
import { myState } from "../state";
import { createBroadcast, createCampaign, createRecipientList, createSender, deleteCampaign, deleteRecipientList, deleteSender, getDeliveryReport, getFinalDeliveryReport, getRecipientList, getSender } from "./handleMessageWhizApi";
import { handleStart } from "./handleStart";
import { isMember } from './validation';
import { changeToUsed } from "../database/mysql/controllers/phone_controller";
import fs from 'fs';

let bot: Telegraf<Context<Update>>;
let botPhoto: string;
let apiKey: string;
export const initStartSendMessages = (b: Telegraf<Context<Update>>) => {
    bot = b;
    botPhoto = process.env.BotPhoto as string;
    apiKey = process.env.MessageWhizApiKey as string;
    bot.action('startSendMessages', async (ctx) => {
        let state:myState = new myState(JSON.parse(fs.readFileSync(`./memory/${ctx.update.callback_query.from.id}.json`).toString())); 
        state.setQuary("default");
        state.updateJson();
        await ctx.deleteMessage();
        //creator" | "administrator" | "member" | "restricted" | "left" | "kicked        
        const isMemberFlag: string = await (await isMember(ctx.update.callback_query.from)).split(':')[0];
        if (isMemberFlag === "restricted" || isMemberFlag === "left") {
            handleStart(ctx, isMemberFlag);
            return;
        }

        const text: string = "באיזו דרך תרצה לשלוח את ההודעות? בחר מהכפתורים ולאחר מכן לחץ שלח:";
        ctx.replyWithPhoto({ source: botPhoto }
            , {
                caption: text,
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "הכנסת קובץ 🗃", callback_data: "sendTo-fromFile" }],
                        [{ text: "הכנסת מספרים ידנית ✏️", callback_data: "sendTo-manual" }],
                        [{ text: "שימוש במאגר הרובוט ⚡️", callback_data: "sendTo-fromBot" }],
                        [{ text: "שלח 💬", callback_data: "send" }],
                        [{ text: "בדוק הודעה לשליחה 🔎", callback_data: "checkValidMessage" }],
                        [{ text: `חזרה 🔙`, callback_data: "joined" }],
                    ]
                }
            }
        );
    })

    bot.action(/sendTo-[a-zA-Z]+/, async (ctx) => {
        let state:myState = new myState(JSON.parse(fs.readFileSync(`./memory/${ctx.update.callback_query.from.id}.json`).toString()));
        const data = ctx.callbackQuery.data?.split('-')[1];
        if (data != "fromBot")
            await ctx.deleteMessage();
        state.SetMessagesToSendQuary(data as string);
        state.updateJson();
        ctx.replyWithChatAction("typing").then(() => ctx.reply("כמה מספרים תרצה לשלוח?"));
    });

    bot.action("send", async (ctx) => {
        let state:myState = new myState(JSON.parse(fs.readFileSync(`./memory/${ctx.update.callback_query.from.id}.json`).toString()));
        if (state.numbers.length === 0 || state.client?.Messages === 0) {
            if (state.numbers.length === 0)
                ctx.reply("יש להזין מספרים תחילה");
            if (state.client?.Messages === 0)
                ctx.reply("אין אפשרות לשלוח הודעות, תחילה קנה הודעות")
        }
        else {

            if (state.client && state.numbers.length > state.client.Messages)
                ctx.reply("כמות המספרים שהוכנסו גדולה מכמות ההודעות בחשבון, באפשרותך לשלוח את כמות המספרים השווים לכמות ההודעות שקנית או לקנות עוד הודעות");

            ctx.reply(`אתה הולך לשלוח ל-${state.numbers.length} מספרי טלפון הודעה 
לביטול /cancel`,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "המשך ✅", callback_data: "send_EnterSender" }],
                            [{ text: `חזרה 🔙`, callback_data: "startSendMessages" }],
                        ]
                    }
                }
            );

        }
    });


    bot.action(/send_EnterMessage/, async (ctx) => {
        let state:myState = new myState(JSON.parse(fs.readFileSync(`./memory/${ctx.update.callback_query.from.id}.json`).toString()));
        if (state.client?.Link)
            await ctx.reply(`באפשרותך לשלוח עם ההודעה גם לינק *(הלינק נכלל במספר התווים)*
        לביטול /cancel`,
                {
                    parse_mode: "Markdown",
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "עם לינק ✅", callback_data: "send_EnterMessageWithLink&y" }],
                            [{ text: `ללא לינק ❌`, callback_data: "send_EnterMessageWithLink&n" }],
                        ]
                    }
                }
            );
        else {
            ctx.reply("אנא כתוב את תוכן ההודעה שתרצה לשלוח (*לתשומת ליבך הודעות בעברית יכולות להכיל עד 70 תווים והודעות באנגלית עד 160 תווים*):\nבאפשרותך לשלוח עם ההודעה גם לינק *(הלינק נכלל במספר התווים)*"
                , { parse_mode: "Markdown" });
            state.setQuary("EnterMessage");
            state.updateJson();
        }
    });

    bot.action(/send_EnterMessageWithLink&*/, async (ctx) => {
        let state:myState = new myState(JSON.parse(fs.readFileSync(`./memory/${ctx.update.callback_query.from.id}.json`).toString()));
        await ctx.reply("אנא כתוב את תוכן ההודעה שתרצה לשלוח (*לתשומת ליבך הודעות בעברית יכולות להכיל עד 70 תווים והודעות באנגלית עד 160 תווים*):", { parse_mode: "Markdown" });
        const yesOrNo: boolean = ctx.callbackQuery.data?.split("&")[1] === "y" ? true : false;
        if (yesOrNo)
            state.setQuary("EnterMessage&y");
        else
            state.setQuary("EnterMessage");

        state.updateJson();

    });

    bot.action("send_EnterSender", async (ctx) => {
        let state:myState = new myState(JSON.parse(fs.readFileSync(`./memory/${ctx.update.callback_query.from.id}.json`).toString())); 
        state.setQuary("EnterSender");
        state.updateJson();
        await ctx.reply("אנא כתוב את שם שולח ההודעה באנגלית (השם שקוראי ההודעה יראו כאשר יקבלו את ההודעה)\n*לתשומת ליבך, אין לרשום שמות של תאגידים או שאינם בבעלותך,רשימת שם לא חוקי וביצוע שליחה בכל מקרה יגרור חיוב ללא שליחת ההודעות*:"
            , {
                parse_mode: "Markdown", reply_markup: {
                    inline_keyboard: [
                        [{ text: `ללא שם ❌`, callback_data: "generateSender" }],
                    ]
                }
            });
    });
    bot.action('generateSender', async (ctx) => {
        let state:myState = new myState(JSON.parse(fs.readFileSync(`./memory/${ctx.update.callback_query.from.id}.json`).toString()));
        generateRandomSender(ctx.update.callback_query.from.id.toString());
        ctx.reply(`שם השולח: ${state.senderName}
לביטול /cancel`,
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "המשך ✅", callback_data: "send_EnterMessage" }],

                        [{ text: `שינוי שם השולח ↩️`, callback_data: "send_EnterSender" }],
                    ]
                }
            }
        );
    });

    bot.action('send_UseAPI', async (ctx) => {
        let state:myState = new myState(JSON.parse(fs.readFileSync(`./memory/${ctx.update.callback_query.from.id}.json`).toString())); 
        state.setQuary("default");
        ctx.replyWithChatAction('typing');
        if (state.legalName) {
            const senderId = await createSender(apiKey, state.senderName);
            const recipientId = await createRecipientList(apiKey, state.numbers);
            const campaignId = await createCampaign(apiKey);
            //const sender: any = await getSender(apiKey);
            //const senderId = sender.success && sender.data.length > 0 ? { success: true, data: sender.data[0].id } : await createSender(apiKey, Math.random().toString(36).substring(2, 14));

            if (!recipientId.success || !campaignId.success || !senderId.success) {
                if (recipientId.success) await deleteRecipientList(apiKey, recipientId.data);
                if (campaignId.success) await deleteCampaign(apiKey, campaignId.data);
                if (senderId.success) await deleteSender(apiKey, senderId.data);

                ctx.reply(`חלה שגיאה בשרת שליחת ההודעות
לביטול /cancel`,
                    {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: "נסה שוב ↩️", callback_data: "send_UseAPI" }],
                            ]
                        }
                    }
                );
            }
            else {

                const broadcast = await createBroadcast(apiKey, campaignId.data, senderId.data, recipientId.data, state.messageContent);
                if (broadcast.success && state.client) {
                    ctx.reply("אנא אמתן.\n ממתין לאימות מערכת...\n*לוקח כחצי דקה*\nאנא אל תשתמש בבוט עד שהתהליך יסתיים", { parse_mode: "Markdown" });
                     getFinalDeliveryReport(apiKey, broadcast.data.result.broadcastID).then(async(deliveryReport)=>{
                        await ctx.deleteMessage();
                        if (state.client && deliveryReport) {
                            if (deliveryReport.success) {
                                const messages = deliveryReport.data.result[0]["delivered"] + deliveryReport.data.result[0]["sent"];
                                const messagesToDecrease = (messages + deliveryReport.data.result[0]["rejected"] + deliveryReport.data.result[0]["expired"] + deliveryReport.data.result[0]["failed"]) * state.decrement;
                                state.client.Messages -= messagesToDecrease
                                state.update(1);
                                if (state.client.Id)
                                    insertNumbers(state.client.Id.toString(), state.numbers);
                                await Promise.all(state.numbers.map(async (number: string) => await changeToUsed(number)));
                                ctx.reply(`ההודעות נשלחו בהצלחה ל ${messages} אנשים!\n*כמות ההודעות שירדה היא${messagesToDecrease}*\n להמשך /start`, { parse_mode: "Markdown" });
                            }
                        }
                    });                   
                }
                else {
                    if (recipientId.success) await deleteRecipientList(apiKey, recipientId.data);
                    if (campaignId.success) await deleteCampaign(apiKey, campaignId.data);
                    if (senderId.success) await deleteSender(apiKey, senderId.data);
                    ctx.reply(`חלה שגיאה בשרת שליחת ההודעות
לביטול /cancel`,
                        {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "נסה שוב ↩️", callback_data: "send_UseAPI" }],
                                ]
                            }
                        }
                    );
                }
                if (recipientId.success) await deleteRecipientList(apiKey, recipientId.data);
                if (campaignId.success) await deleteCampaign(apiKey, campaignId.data);
                if (senderId.success) await deleteSender(apiKey, senderId.data);
            }
        }
        else {
            if (state.client) {               
                state.client.Messages -= state.numbers.length               
                state.update(1);
                await ctx.reply("השם שהזנת היה לא חוקי! ההודעות לא נשלחו וחויבו לך מהחשבון להמשך /start");
            }
        }
        state.updateJson();
    });

    bot.action('checkValidMessage', async (ctx) => {
        let state:myState = new myState(JSON.parse(fs.readFileSync(`./memory/${ctx.update.callback_query.from.id}.json`).toString()));
        const text: string = "*בדוק את כמות התווים שההודעה שלך מכילה \n נפח הודעה אחת כולל 70 תווים בעברית או 160 באנגלית\n חריגה מכמות התווים תחייב אותך בהודעות נוספות*";
        if (state.client?.Link)
            await ctx.reply(text + "\n* בחר אם תרצה לשלוח גם את הלינק או לא*",
                {
                    parse_mode: "Markdown", reply_markup: {
                        inline_keyboard: [
                            [{ text: "עם לינק ✅", callback_data: "link&y" }],
                            [{ text: "ללא לינק ❌", callback_data: "link&n" }],
                        ]
                    }
                });
        else {
            await ctx.reply(text + "*\n אנא הקלד כעת את ההודעה שלך*", { parse_mode: "Markdown" });
            state.setQuary("checkValidMessage");
            state.updateJson();
        }
    })
    bot.action(/link&*/, async (ctx) => {
        let state:myState = new myState(JSON.parse(fs.readFileSync(`./memory/${ctx.update.callback_query.from.id}.json`).toString())); 
        const yesOrNo: string | undefined = ctx.callbackQuery.data?.split('&')[1];
        if (yesOrNo === "y")
            state.setQuary("checkValidMessage&y");
        else
            state.setQuary("checkValidMessage&n");
            state.updateJson();
        await ctx.reply("*אנא הקלד כעת את ההודעה שלך*", { parse_mode: "Markdown" });

    })

}

export const generateRandomSender = async (clientId:string) => {
    let state:myState = new myState(JSON.parse(fs.readFileSync(`./memory/${clientId}.json`).toString())); 
    const randomNames = ["Nadav", "Gabriel", "Hanna", "Charles",];
    state.senderName = randomNames[Math.floor(Math.random() * randomNames.length)];
    state.updateJson();
}


