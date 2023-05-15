import { Context, NarrowedContext, Telegraf } from "telegraf";
import { MountMap } from "telegraf/typings/telegram-types";
import { Update, User } from "telegraf/typings/core/types/typegram";

import { myState } from "../state";
import { Client } from "../database/models/client_model";
import { createClient, getClient } from "../database/mysql/controllers/client_controller";
import fs from 'fs';

let bot: Telegraf<Context<Update>>;
let Channel: string;

export const initValidation = (b: Telegraf<Context<Update>>) => {
    bot = b;
    Channel = process.env.Channel as string;
}

export const isMember = async (user: User | undefined) => {
    let state:myState = new myState(JSON.parse(fs.readFileSync(`./memory/${user?.id}.json`).toString())); 
    let res = { user: {}, status: "" };
    let flag: boolean = true;
    try {
        res = await bot.telegram.getChatMember(Channel, user?.id as number);
    }
    catch (err) {
        flag = false;       
    }
    if (res.status !== "restricted" && res.status !== "left" && state.client === null && flag) {
        const date = new Date();
        const clientRes = await createClient({
            Id: user?.id, _Messages: 3, Messages: 3, Joined: date.getDate().toString() + "/" + (date.getMonth()+1).toString() + "/" + date.getFullYear().toString(), Money: 0,
            Phones: [], Link: "", LinkId: "", Disabled: false,Admin:false,FirstName:user!.first_name,LastName:user?.last_name,UserName:user?.username,
        })
        if (clientRes != undefined && clientRes != null) {
            state.setClient(clientRes);
            state.updateJson();
            return res.status + ":new"
        }
        else
            return res.status + ":error";
    }
    else
        if (!flag) {           
            const client: Client | undefined | null = await getClient(user?.id.toString());
            if(client === null)
                {
                    const date = new Date();
                    const clientRes = await createClient({
                        Id: user?.id, _Messages: 3, Messages: 3, Joined: date.getDate().toString() + "/" + (date.getMonth()+1).toString() + "/" + date.getFullYear().toString(), Money: 0,
                        Phones: [], Link: "", LinkId: "", Disabled: false,Admin:false,FirstName:user!.first_name,LastName:user?.last_name,UserName:user?.username,
                    })
                    if (clientRes != undefined && clientRes != null) {
                        state.setClient(clientRes);
                        state.updateJson();
                        return  "member:new"
                    }
                    else
                        return res.status + ":error";
                }
                else if(client && !client.Disabled)
                    return client.Admin?"administrator":"member";                    
        }
        else if (state.client == undefined) // אם הבוט התאפס 
        {
            const client: Client | undefined | null = await getClient(user?.id?.toString());
            if (client == undefined || client == null)
                return res.status + ":dead";
            else
                {
                    state.setClient(client);
                    state.updateJson();
                }
        }

    const client: Client | undefined | null = await getClient(state.client?.Id?.toString());
    if (client && client.Disabled)
        return res.status + ":disabled";

    return res.status;
}

export const enterNumbersDocument = (ctx: NarrowedContext<Context, MountMap["document"]>) => {
    let state:myState = new myState(JSON.parse(fs.readFileSync(`./memory/${ctx.message.from.id}.json`).toString())); 
    if (state.messagesToSend > state.numbers.length) {
        ctx.deleteMessage(ctx.message.message_id).then(() => ctx.deleteMessage(ctx.message.message_id - 1)).then(() => ctx.deleteMessage(ctx.message.message_id - 2)).then(() => ctx.deleteMessage(ctx.message.message_id - 3))
            .then(() => ctx.deleteMessage(ctx.message.message_id - 4)).finally(() =>
                ctx.reply(`נקלטו ${state.numbers.length} מספרים האם ברצונך להמשיך או להכניס עוד ${state.messagesToSend - state.numbers.length} מספרים לביטול /cancel`, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "המשך ✅", callback_data: "send" }],
                            [{ text: "השלם מספרים ↩️", callback_data: "enterMore" }],
                        ]
                    }
                })).catch(e => { console.log(e.response.description) })

    }
    else
        if (state.messagesToSend <= state.numbers.length)
            ctx.deleteMessage(ctx.message.message_id).then(() => ctx.deleteMessage(ctx.message.message_id - 1)).then(() => ctx.deleteMessage(ctx.message.message_id - 2)).then(() => ctx.deleteMessage(ctx.message.message_id - 3))
                .then(() => ctx.deleteMessage(ctx.message.message_id - 4)).finally(() => {
                    state.setShouldReadDoc(false);
                    if (state.client?.Messages != undefined && state.client?.Messages >= state.numbers.length)
                        ctx.reply(`הכנסת ${state.numbers.length} מספרים. ברשותך ${state.client?.Messages} הודעות, אם ברצונך לשלוח כמות הודעות גדולה יותר אנא רכוש עוד הודעות. אם ברצונך להמשיך את התהליך עם כמות ההודעות הנוכחית שלך לחץ המשך`, {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "הוספת הודעות לחשבון 💰", callback_data: "buy" }],
                                    [{ text: "המשך ✅", callback_data: "send" }],
                                ]
                            }
                        })

                    ctx.reply(`אתה הולך לשלוח ל-${state.numbers.length} מספרי טלפון הודעה לביטול /cancel`,
                        {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "המשך ✅", callback_data: "send_EnterSender" }],
                                    [{ text: `חזרה 🔙`, callback_data: "startSendMessages" }],
                                ]
                            }
                        }
                    );
                }).catch(e => { console.log(e.response.description) });
        else
            ctx.reply(`כמות המספרים שהוכנסו גדולה מכמות ההודעות שנרכשו
תוכל לשלוח את כמות ההודעות המקסימלית שבחשבונך או שתוכל לרכוש עוד הודעות`,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "המשך ✅", callback_data: "send_EnterSender" }],
                            [{ text: "הוספת הודעות לחשבון 💰", callback_data: "buy" }],
                        ]
                    }
                }
            );
            state.updateJson();
}

export const enterNumbersManual = (ctx: NarrowedContext<Context, MountMap["text"]>) => {
    let state:myState = new myState(JSON.parse(fs.readFileSync(`./memory/${ctx.message.from.id}.json`).toString()));   
    if (state.messagesToSend > state.numbers.length) {
        ctx.deleteMessage(ctx.message.message_id).then(() => ctx.deleteMessage(ctx.message.message_id - 1)).then(() => ctx.deleteMessage(ctx.message.message_id - 2)).then(() => ctx.deleteMessage(ctx.message.message_id - 3))
            .then(() => ctx.deleteMessage(ctx.message.message_id - 4)).finally(() =>
                ctx.reply(`נקלטו ${state.numbers.length} מספרים האם ברצונך להמשיך או להכניס עוד ${state.messagesToSend - state.numbers.length} 
מספרים לביטול /cancel`, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "המשך ✅", callback_data: "send" }],
                            [{ text: "השלם מספרים ↩️", callback_data: "enterMore" }],
                        ]
                    }
                })).catch(e => { console.log(e.response.description) })

    }
    else
        if (state.client && state.client.Messages >= state.numbers.length)
            ctx.deleteMessage(ctx.message.message_id).then(() => ctx.deleteMessage(ctx.message.message_id - 1)).then(() => ctx.deleteMessage(ctx.message.message_id - 2)).then(() => ctx.deleteMessage(ctx.message.message_id - 3))
                .then(() => ctx.deleteMessage(ctx.message.message_id - 4)).finally(() => {
                    state.setShouldReadDoc(false);
                    if (state.messagesToSend < state.numbers.length)

                        ctx.reply(`הכנסת ${state.numbers.length} מספרים. ברשותך ${state.client?.Messages} הודעות, אם ברצונך לשלוח כמות הודעות גדולה יותר אנא רכוש עוד הודעות. אם ברצונך להמשיך את התהליך עם כמות ההודעות הנוכחית שלך לחץ המשך`, {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "הוספת הודעות לחשבון 💰", callback_data: "buy" }],
                                    [{ text: "המשך ✅", callback_data: "send" }],
                                ]
                            }
                        })
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

                }).catch(e => { console.log(e.response.description) });
        else
            ctx.reply(`כמות המספרים שהוכנסו גדולה מכמות ההודעות שנרכשו
תוכל לשלוח את כמות ההודעות המקסימלית שבחשבונך או שתוכל לרכוש עוד הודעות`,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "המשך ✅", callback_data: "send_EnterSender" }],
                            [{ text: "הוספת הודעות לחשבון 💰", callback_data: "buy" }],
                        ]
                    }
                }
            );
            state.updateJson();
}

export const deleteMessages = async (ctx: Context<Update>) => {
    let state:myState = new myState(JSON.parse(fs.readFileSync(`./memory/${ctx.message?.from.id}.json`).toString())); 
    const res = await Promise.all(state.deleteId.map(async (id) => await ctx.deleteMessage(id).then(res => res).catch(err => console.log(err))));
    state.deleteId = [-1];
    state.updateJson();

}


