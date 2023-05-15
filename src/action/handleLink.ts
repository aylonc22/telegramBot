import { Telegraf, Context } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { handleStart } from "./handleStart";
import { isMember } from "./validation";
import { myState } from "../state";
import { Client } from "../database/models/client_model";

import { monitorLink } from "./handleMessageWhizApi";
import fs from 'fs';
import { getClient } from "../database/mysql/controllers/client_controller";

let bot: Telegraf<Context<Update>>;
let botPhoto: string;
let MessageWhizApiKey: string;
export const initLinks = (b: Telegraf<Context<Update>>) => {
    bot = b;
    botPhoto = process.env.botPhoto as string;
    MessageWhizApiKey = process.env.MessageWhizApiKey as string;
    bot.action('link', async (ctx) => {
        let state:myState = new myState(JSON.parse(fs.readFileSync(`./memory/${ctx.update.callback_query.from.id}.json`).toString()));
        state.setQuary("default");        
        await ctx.deleteMessage();
        const isMemberFlag = await isMember(ctx.update.callback_query.from);
        if (isMemberFlag === "restricted" || isMemberFlag === "left") {
            handleStart(ctx, isMemberFlag);
            return;
        }
        const client: Client|undefined|null = await getClient(state.client?.Id?.toString());
        if (client !== undefined && client!== null)
            state.client = client;
            state.updateJson();
        const monitor = await monitorLink(MessageWhizApiKey, state.client?.Link as string);         
        const text: string = `תפריט קליקים 👆
כתובת במעקב:${state.client?.Link !== "" && state.client?.Link !== undefined ? state.client?.Link : "אין"}
כמות הלחיצות על הכתובת:${monitor.success ? monitor.data.result.clicks : "0"}`;
        ctx.replyWithPhoto(
            { source: botPhoto }, {
            caption: text,
            reply_markup: {
                inline_keyboard: [
                    [{ text: " יצירת לינק חדש🔗", callback_data: "startCreateLink" }],
                    [{ text: "חזרה 🔙", callback_data: "settings" }],
                ]
            }
        }
        );
    });
    bot.action('startCreateLink', async (ctx) => {
        let state:myState = new myState(JSON.parse(fs.readFileSync(`./memory/${ctx.update.callback_query.from.id}.json`).toString()));
        if (state.client?._Messages && state.client._Messages < 5000)
            ctx.reply("כדי ליצור לינק צריך 5000 הודעות לפחות");
        else {
            state.setQuary("startCreateLink");
            ctx.reply("אנא הכנס את הכתובת המלאה שתרצה לעקוב אחריה");
            state.updateJson();
        }
    });
}



