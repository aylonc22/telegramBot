import * as dotenv from 'dotenv';
import { Telegraf, Context } from "telegraf";
import { ChatMember, Update } from "telegraf/typings/core/types/typegram";
import { Client } from '../../database/models/client_model';
import { myState } from '../../state';
import { handleStart } from "../handleStart";
import { isMember } from "../validation";
import { _disableClient, disableClient, getClient, getClients, updateAdmin } from '../../database/mysql/controllers/client_controller';
import { addPhones } from '../../database/mysql/controllers/phone_controller';
import fs from 'fs';

dotenv.config({ path: "../../.env" })
const { Channel } = process.env;
// myState.setQuary("default");
let CHANNEL = "00000";
if (Channel)
    CHANNEL = Channel;
let bot: Telegraf<Context<Update>>;
let botPhoto: string;
let help_url: string;
export const initShowClientList = (b: Telegraf<Context<Update>>) => {
    bot = b;
    botPhoto = process.env.botPhoto as string;
    help_url = process.env.Help_URL as string;
    bot.action('showClientsList', async (ctx) => {
        let state:myState = new myState(JSON.parse(fs.readFileSync(`./memory/${ctx.update.callback_query.from.id}.json`).toString()));
        await ctx.deleteMessage();
        const isMemberFlag = await isMember(ctx.update.callback_query.from);
        if (isMemberFlag === "restricted" || isMemberFlag === "left" || !state.client?.Admin) {
            handleStart(ctx, isMemberFlag);
            return;
        }
        const clients = await getClients();
        const text: string = ` רשימת יוזרים
           /start כדי לחזור `;
        if(clients)
           ctx.replyWithPhoto({ source: botPhoto },
            {
                caption: text, parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: await Promise.all(clients.map(async (client: Client) => {                      
                        //const user = await bot.telegram.getChatMember(CHANNEL, Number(client.Id));
                        return [{ text: `👤 ${client.FirstName} ${client.LastName ? client.LastName : ""}`, callback_data: `client:${client.Id}` }]
                    }))
                }
            }
        );
        else
        ctx.replyWithPhoto({ source: botPhoto },
            {
                caption: "אין משתמשים", parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [[{text:`חזרה 🔙`, callback_data:"joined"}]],
                }
            }
        );
    });

    bot.action(/client:*/, async (ctx) => {
        const id = ctx.callbackQuery.data?.split(':')[1];
        if (id) {
            await ctx.deleteMessage().catch();
            const client: Client | null | undefined = await getClient(id);
            if (client) {
                console.log(client);
                // const chatMember: ChatMember = await bot.telegram.getChatMember(CHANNEL, Number(client.Id));
                let text: string = `👤: ${client.FirstName ? client.FirstName : ""} ${client.LastName ? client.LastName : ""} ${client.UserName ? `|| @${client.UserName}` : ""}
🗓: ${client.Joined} 
💳: ${client._Messages}
💰: ${client.Money}`;
                ctx.replyWithPhoto({ source: botPhoto }
                    , {
                        caption: text, parse_mode: "Markdown",
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: "הכנסת הודעות ידנית 📝", callback_data: `addMessages&${id}` }],
                                [{ text: "הכנסת מספרים למאגר ☎️", callback_data: `addPhones` }],
                                [{ text: client.Admin ? "הסר הרשאות מנהל ❌" : "תן הראשות מנהל ✅", callback_data: `setAdmin&${id}` }],
                                [{ text: !client.Disabled ? "השבתת הבוט ❌" : "הפעלת הבוט ✅", callback_data: `disableBot&${id}` }],
                                [{ text: `חזרה 🔙`, callback_data: `showClientsList` }]
                            ]
                        }
                    }
                );

            }
            else
            await ctx.reply("חלה שגיאה בשרת /start להפעלה מחדש");
        }
    });
    bot.action(/addMessages&*/, async (ctx) => {
        let state:myState = new myState(JSON.parse(fs.readFileSync(`./memory/${ctx.update.callback_query.from.id}.json`).toString()));
        const id = ctx.callbackQuery.data?.split('&')[1];
        if (id) {
            const client: Client | undefined | null = await getClient(id);
            if (client) {
                state.setClientForAdd(client);
                state.setQuary("addMessages");
                await ctx.sendMessage('אנא כתוב כמה הודעות תרצה להוסיף \nלביטול התהליך יש לשלוח /cancel');
            }
            else
                await ctx.sendMessage("משתמש לא נמצא");
        }
        state.updateJson();
    })

    bot.action("addPhones", async (ctx) => {
        let state:myState = new myState(JSON.parse(fs.readFileSync(`./memory/${ctx.update.callback_query.from.id}.json`).toString()));
        if (state.numbers) {
            const res = await addPhones(state.numbers);
            ctx.reply("המספרים נוספו בהצלחה");
            state.updateJson();
        }
    });

    bot.action(/disableBot&*/, async (ctx) => {
        let state:myState = new myState(JSON.parse(fs.readFileSync(`./memory/${ctx.update.callback_query.from.id}.json`).toString()));
        const idOrFlag = ctx.callbackQuery.data?.split('&')[1];
        if (state.client?.Id == idOrFlag)
            await ctx.reply("אתה לא יכול להשבית את עצמך!");
        else {
            if (Number(idOrFlag) && idOrFlag) {
                const client: Client | null | undefined = await getClient(idOrFlag)
                if (client) {
                     const res = await _disableClient(client);
                    const _text: string =  typeof(res) == 'boolean' && !res ? `הבוט מושבת אנא המתן או פנה לעזרה ${help_url}` : `הבוט חזר לפעול, שימוש נעים!`
                    await bot.telegram.sendMessage(idOrFlag, _text);
                    await ctx.deleteMessage();

                    //const chatMember: ChatMember = await bot.telegram.getChatMember(CHANNEL, Number(client.Id));
                    let text: string = "";
                    if (client)
                     text = `👤: ${client.FirstName ? client.FirstName : ""} ${client.LastName ? client.LastName : ""} ${client.UserName ? `|| @${client.UserName}` : ""}
🗓: ${client.Joined} 
💳: ${client._Messages}
💰: ${client.Money}`;
                    ctx.replyWithPhoto({ source: botPhoto }
                        , {
                            caption: text, parse_mode: "Markdown",
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "הכנסת הודעות ידנית 📝", callback_data: `addMessages&${idOrFlag}` }],
                                    [{ text: "הכנסת מספרים למאגר ☎️", callback_data: `addPhones` }],               
                                    [{ text: !client.Admin ? "הסר הרשאות מנהל ❌" : "תן הראשות מנהל ✅", callback_data: `setAdmin&${idOrFlag}` }],
                                    [{ text: !client.Disabled ? "השבתת הבוט ❌" : "הפעלת הבוט ✅", callback_data: `disableBot&${idOrFlag}` }],
                                    [{ text: `חזרה 🔙`, callback_data: `showClientsList` }]
                                ]
                            }
                        }
                    );
                }
                else
                    await ctx.reply("חלה שגיאה בשרת /start להפעלה מחדש");
            }
            else {
                const clients: Client[] | null | undefined = await getClients();
                if (clients) {
                    const disableClients = clients.filter((client: Client) => client.Id != state.client?.Id);
                    await Promise.all(disableClients.map(async (client: Client) => {
                        const id = Number(client.Id);
                        await disableClient(id, idOrFlag === "true" ? true : false);                        
                        const _text: string = idOrFlag === "true" ? `הבוט מושבת אנא המתן או פנה לעזרה ${help_url}` : `הבוט חזר לפעול, שימוש נעים!`
                        await bot.telegram.sendMessage(id, _text);
                    }));
                    if (idOrFlag === "true")
                        await ctx.reply("השבתה של הבוט בוצעה בהצלחה!");
                    else
                        await ctx.reply("הפעלה מחדש של הבוט בוצעה בהצלחה!");
                }
                else
                    await ctx.reply("חלה שגיאה בשרת /start להפעלה מחדש");
            }
        }
    });

    bot.action(/setAdmin&*/,async(ctx)=>{
        let state:myState = new myState(JSON.parse(fs.readFileSync(`./memory/${ctx.update.callback_query.from.id}.json`).toString()));
        const id = ctx.callbackQuery.data?.split('&')[1];
        if (state.client?.Id == id)
            await ctx.reply("אתה לא יכול להשבית את עצמך!");
            else
        if (Number(id) && id) {
            const client: Client | null | undefined = await getClient(id)
            if (client) {
                const res = await updateAdmin(client);
                const _text: string = typeof(res) == 'boolean' && !res ? `הרשאות מנהל הוסרו!` : `הרשאות מנהל נוספו!`
                await bot.telegram.sendMessage(id, _text);
                await ctx.deleteMessage();

                //const chatMember: ChatMember = await bot.telegram.getChatMember(CHANNEL, Number(client.Id));
                let text: string = "";
                if (client)
                 text = `👤: ${client.FirstName ? client.FirstName : ""} ${client.LastName ? client.LastName : ""} ${client.UserName ? `|| @${client.UserName}` : ""}
🗓: ${client.Joined} 
💳: ${client._Messages}
💰: ${client.Money}`;
                ctx.replyWithPhoto({ source: botPhoto }
                    , {
                        caption: text, parse_mode: "Markdown",
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: "הכנסת הודעות ידנית 📝", callback_data: `addMessages&${id}` }],
                                [{ text: "הכנסת מספרים למאגר ☎️", callback_data: `addPhones` }],
                                [{ text: !client.Admin ? "הסר הרשאות מנהל ❌" : "תן הראשות מנהל ✅", callback_data: `setAdmin&${id}` }],
                                [{ text: !client.Disabled ? "השבתת הבוט ❌" : "הפעלת הבוט ✅", callback_data: `disableBot&${id}` }],
                                [{ text: `חזרה 🔙`, callback_data: `showClientsList` }]
                            ]
                        }
                    }
                );
            }
            else
                await ctx.reply("חלה שגיאה בשרת /start להפעלה מחדש");
        }
        
    })
}

