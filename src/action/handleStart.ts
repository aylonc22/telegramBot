import { Context, NarrowedContext, Telegraf } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { MountMap } from "telegraf/typings/telegram-types";
import { isMember } from './validation';
import { myState } from '../state';
import fs from 'fs';

let bot: Telegraf<Context<Update>>;
let Channel: string;
let botPhoto: string;
let help_url: string;
export const initHandleStart = (b: Telegraf<Context<Update>>) => {
    bot = b;
    Channel = process.env.Channel_URL as string;
    botPhoto = process.env.BotPhoto as string;
    help_url = process.env.Help_URL as string;
    bot.action('joined', async (ctx) => {
        let state:myState = new myState(JSON.parse(fs.readFileSync(`./memory/${ctx.update.callback_query.from.id}.json`).toString())); 
        state.SetMessagesToSendQuary("");
        state.updateJson();
        handleStart(ctx, await isMember(ctx.update.callback_query.from));
    });

    bot.action("showUserPanel", async (ctx) => {
        await ctx.deleteMessage().catch();
        const from = ctx.update.callback_query.from;
        const start = `היי ${from.first_name}, באמצעות בוט זה באפשרותך לשלוח הודעות SMS למספרי פלאפון ישראלים ללא כל הגבלה.
        לצפייה במחירים לחץ על הכפתור מחירים.
        לעזרה והסברים נוספים לחץ על הכפתור.
        להשארת משוב למנהל לחץ על משוב.                
        שימוש מהנה`;
        ctx.replyWithPhoto(
            { source: botPhoto }, {
            parse_mode: "Markdown",
            caption: start,
            reply_markup: {
                inline_keyboard: [
                    [{ text: "התחלת הפצת הודעות 💬", callback_data: "startSendMessages" }],
                    [{ text: "מחירים 💸", callback_data: "price" }],
                    [{ text: "הוספת הודעות לחשבון 💰", callback_data: "buy" }],
                    [{ text: "החשבון שלי 🧰", callback_data: "account" }],
                    [{ text: "הגדרות וכלים 🔧", callback_data: "settings" }],
                    [{ text: "עזרה 📄", url: process.env.Help_URL as string }],
                    [{ text: "משוב 💌", callback_data: "feedback" }],
                    [{ text: "חזרה 🔙", callback_data: "joined" }],
                ]
            }
        }
        );
    })
}
export const handleStart = async (ctx: NarrowedContext<Context, MountMap["callback_query"]>, status: string = "") => {
    let state:myState = new myState(JSON.parse(fs.readFileSync(`./memory/${ctx.update.callback_query.from.id}.json`).toString())); 
    await ctx.deleteMessage().catch();
    state.setQuary("default");
    state.updateJson();
    //creator" | "administrator" | "member" | "restricted" | "left" | "kicked
    const from = ctx.update.callback_query.from;
    status = status === "" ? await isMember(from) : status;
    //console.log("2",status);

    if (status.includes(":error") || status.includes("dead"))
        await ctx.reply("משהו השתבש להפעלה מחדש /start");
    else if (status.includes("disabled"))
        await ctx.reply(`הבוט מושבת אנא המתן או פנה לעזרה ${help_url}`);
    else {
        let start: string;
        if (status.includes("member")) {
            start = `היי ${from.first_name}, באמצעות בוט זה באפשרותך לשלוח הודעות SMS למספרי פלאפון ישראלים ללא כל הגבלה.
לצפייה במחירים לחץ על הכפתור מחירים.
לעזרה והסברים נוספים לחץ על הכפתור.
להשארת משוב למנהל לחץ על משוב.                
שימוש מהנה`;
            if (status.includes(":new"))
                start += "\n*מזל טוב קיבלת 3 הודעות במתנה*";
            ctx.replyWithPhoto(
                { source: botPhoto }, {
                parse_mode: "Markdown",
                caption: start,
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "התחלת הפצת הודעות 💬", callback_data: "startSendMessages" }],
                        [{ text: "מחירים 💸", callback_data: "price" }],
                        [{ text: "הוספת הודעות לחשבון 💰", callback_data: "buy" }],
                        [{ text: "החשבון שלי 🧰", callback_data: "account" }],
                        [{ text: "הגדרות וכלים 🔧", callback_data: "settings" }],
                        [{ text: "עזרה 📄", url: process.env.Help_URL as string }],
                        [{ text: "משוב 💌", callback_data: "feedback" }],
                        [{ text: "לערוץ העדכונים 🔔", url: process.env.Channel_URL as string }],
                    ]
                }
            }
            );
        }
        else if (status.includes("restricted")) {
            start = `היי ${from.first_name} 
                    על מנת להמשיך בהליך ההרשמה לבוט לחץ על הכפתור שמתחת להודעה על מנת להצטרף לערוץ! לאחר ההצטרפות לחץ על הכפתור הצטרפתי ✅ ותקבל 3 הודעות במתנה"`;
            ctx.replyWithPhoto({ source: botPhoto },
                {
                    caption: start,
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "לערוץ העדכונים", url: process.env.Channel_URL as string }],
                            [{ text: "הצטרפתי ✅", callback_data: "joined" }]
                        ]
                    }
                }
            );
        }

        else if (status.includes("left")) {
            start = `היי ${from.first_name} 
                    על מנת להמשיך להינות מהרובוט לחץ על הכפתור שמתחת להודעה על מנת להצטרף לערוץ!
                    כבר הצטפרת ועזבת...`;
            ctx.replyWithPhoto({ source: botPhoto },
                {
                    caption: start,
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "לערוץ העדכונים", callback_data: "test", url: process.env.Channel_URL as string }],
                            [{ text: "הצטרפתי ✅", callback_data: "joined" }]
                        ]
                    }
                }
            );
        }
            /* else*/ if (status.includes("creator") || status.includes("administrator")) {
            start = `היי ${from?.first_name} 
                    אתה נמצא בפאנל מנהלים!`;
            ctx.replyWithPhoto({ source: botPhoto },
                {
                    caption: start,
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "שליחת הודעת תפוצה 🚀", callback_data: "messageAll" }],
                            [{ text: "משובים 💌", callback_data: "showReviews" }],
                            [{ text: "רשימת משתמשים 👤", callback_data: "showClientsList" }],
                            [{ text: "פאנל משתמש 👤", callback_data: "showUserPanel" }],
                            [{ text: "השבתת הבוט ❌", callback_data: "disableBot&true" }],
                            [{ text: "הפעלת הבוט ✅", callback_data: "disableBot&false" }],

                        ]
                    }
                }
            );
        }


    }
}
export const handleStartMain = async (ctx: Context<Update>, status: string = "") => {
    let state:myState = new myState(JSON.parse(fs.readFileSync(`./memory/${ctx.message?.from.id}.json`).toString())); 
    state.setQuary("default");
    state.updateJson();
    //creator" | "administrator" | "member" | "restricted" | "left" | "kicked
    const from = ctx.message?.from;
    status = status === "" ? await isMember(from) : status;
    //console.log("1",status);
console.log(status);
    if (status.includes(":error") || status.includes("dead"))
        await ctx.reply("משהו השתבש להפעלה מחדש /start");
    else if (status.includes("disabled"))
        await ctx.reply(`הבוט מושבת אנא המתן או פנה לעזרה ${help_url}`);
    else {
        let start: string;

        if (status.includes("member")) {
            start = `היי ${from?.first_name}, באמצעות בוט זה באפשרותך לשלוח הודעות SMS למספרי פלאפון ישראלים ללא כל הגבלה.
לצפייה במחירים לחץ על הכפתור מחירים.
לעזרה והסברים נוספים לחץ על הכפתור.
להשארת משוב למנהל לחץ על משוב.                
שימוש מהנה`;
            if (status.includes(":new"))
                start += "\n*מזל טוב קיבלת 3 הודעות במתנה*";
            ctx.replyWithPhoto(
                { source: botPhoto }, {
                parse_mode: "Markdown",
                caption: start,
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "התחלת הפצת הודעות 💬", callback_data: "startSendMessages" }],
                        [{ text: "מחירים 💸", callback_data: "price" }],
                        [{ text: "הוספת הודעות לחשבון 💰", callback_data: "buy" }],
                        [{ text: "החשבון שלי 🧰", callback_data: "account" }],
                        [{ text: "הגדרות וכלים 🔧", callback_data: "settings" }],
                        [{ text: "עזרה 📄", url: process.env.Help_URL as string }],
                        [{ text: "משוב 💌", callback_data: "feedback" }],
                        [{ text: "לערוץ העדכונים 🔔", url: process.env.Channel_URL as string }],
                    ]
                }
            }
            );
        }
        else if (status.includes("restricted")) {
            start = `היי ${from?.first_name} 
    על מנת להמשיך בהליך ההרשמה לבוט לחץ על הכפתור שמתחת להודעה על מנת להצטרף לערוץ! לאחר ההצטרפות לחץ על הכפתור הצטרפתי ✅ ותקבל 3 הודעות במתנה"`;
            ctx.replyWithPhoto({ source: botPhoto },
                {
                    caption: start,
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "לערוץ העדכונים", callback_data: "test", url: process.env.Channel_URL as string }],
                            [{ text: "הצטרפתי ✅", callback_data: "joined" }]
                        ]
                    }
                }
            );
        }

        else if (status.includes("left")) {
            start = `היי ${from?.first_name} 
    על מנת להמשיך להינות מהרובוט לחץ על הכפתור שמתחת להודעה על מנת להצטרף לערוץ!
    כבר הצטפרת ועזבת...`;
            ctx.replyWithPhoto({ source: botPhoto },
                {
                    caption: start,
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "לערוץ העדכונים", callback_data: "test", url: process.env.Channel_URL as string }],
                            [{ text: "הצטרפתי ✅", callback_data: "joined" }]
                        ]
                    }
                }
            );
        }
 /* else*/ if (status.includes("creator") || status.includes("administrator")) {
            start = `היי ${from?.first_name} 
    אתה נמצא בפאנל מנהלים!`;
            ctx.replyWithPhoto({ source: botPhoto },
                {
                    caption: start,
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "שליחת הודעת תפוצה 🚀", callback_data: "messageAll" }],
                            [{ text: "משובים 💌", callback_data: "showReviews" }],
                            [{ text: "רשימת משתמשים 👤", callback_data: "showClientsList" }],
                            [{ text: "פאנל משתמש 👤", callback_data: "showUserPanel" }],
                            [{ text: "השבתת הבוט ❌", callback_data: "disableBot&true" }],
                            [{ text: "הפעלת הבוט ✅", callback_data: "disableBot&false" }],
                        ]
                    }
                }
            );
        }
    }
}