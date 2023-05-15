import * as dotenv from 'dotenv';
import { Context, Telegraf, Telegram } from 'telegraf';
import { myState } from './state';
import { handleStart, handleStartMain } from './action/handleStart';
import { initAll } from './action/initAll';
import fs from 'fs';
import axios from 'axios';
import { deleteMessages, enterNumbersDocument, enterNumbersManual } from './action/validation';
import { Client } from './database/models/client_model';
import { createLink, deleteLink, deleteRecipientList, deleteSender, getDeliveryReport, getRecipientList, getSender, monitorLink } from './action/handleMessageWhizApi';
import { Update } from 'telegraf/typings/core/types/typegram';
import priceList from './assets/priceList.json';
import brandAndCorporation from './assets/brandAndCorporation.json';
import { generateRandomSender } from './action/handleStartSendMessages';
import { getClient, getClients, insertLink } from './database/mysql/controllers/client_controller';
import { getPhones } from './database/mysql/controllers/phone_controller';
import { createReview } from './database/mysql/controllers/review_controller';
import { createTransactionID, getTransactionID } from './database/mysql/controllers/transactions_controller';


dotenv.config({ path: "../.env" });
const { TOKEN, WEBHOOK, PORT, Channel, TronUri, MessageWhizApiKey } = process.env;

const bot = new Telegraf(TOKEN as string);

export let quary = "default";
initAll(bot);

bot.start(async (ctx) => {
  //  const res =await  monitorLink(MessageWhizApiKey as string," https://sms-activate.org")  ;
  //  console.log(res.data);
  //const res = await getSender(MessageWhizApiKey as string);  
  //console.log(res);
  let state:myState = new myState();
  
  // state.reset();  
  // if(fs.existsSync(`./memory/${ctx.message.from.id}.json`))
  //   state = JSON.parse(fs.readFileSync(`./memory/${ctx.message.from.id}.json`).toString());
  // else  
    fs.writeFileSync(`./memory/${ctx.message.from.id}.json`,JSON.stringify(state));
  await getClients();
  const client: Client | undefined | null = await getClient(ctx.message.from.id.toString());   
  if (client === undefined) // if there was an error in the server
    ctx.reply("משהו השתבש להפעלה מחדש /start");
  else {       
    state.setClient(client);
    state.updateJson();
    handleStartMain(ctx);
  }
}).catch(err => console.log("start error", err));


bot.help((ctx) => {
  ctx.reply('Send /start to start the bot');
});

bot.on('sticker', async (ctx) => await ctx.deleteMessage());

bot.on('document', async (ctx) => {
  let state:myState = new myState(JSON.parse(fs.readFileSync(`./memory/${ctx.message.from.id}.json`).toString()));
  if (state.shouldReadDoc) {
    const image = await bot.telegram.getFileLink(ctx.message.document.file_id);
    try {
      const res = await axios.get(image.href);
      const dataRaw = res.data.replaceAll('\r', '').replaceAll('-', '')
        .replaceAll(' ', ',').split('\n').map((row: string) => row.split(','));
      const data: string[] = [...new Set([].concat(...dataRaw).filter(f => /^9725\d([-]{0,1})\d{7}$|^05\d([-]{0,1})\d{7}$/.test(f)))]
      console.log(state.messagesToSend);
      state.numbers.push(...data);
      state.numbers = state.numbers.map(number=>/^05\d([-]{0,1})\d{7}$/.test(number)?"972"+number.substring(1):number);
      state.numbers = [...new Set(state.numbers)];
      state.updateJson();
      enterNumbersDocument(ctx);
    }
    catch (e: unknown) {
      ctx.reply("משהו השתבש נסה שנית");
    }
  }
  else
    await ctx.deleteMessage();
})
bot.on('text', async (ctx) => {
  let state:myState = new myState(JSON.parse(fs.readFileSync(`./memory/${ctx.message.from.id}.json`).toString()));
  if (state.quary === "feedback") {
    await createReview({
      ClientId: ctx.message.from.id as unknown as string,
      Message: ctx.message.text,
      Read: false
    })
    ctx.reply("תגובתך נקלטה").then(() => handleStartMain(ctx));

  }
  else if (state.quary.includes("checkValidMessage")) {
    const yesOrNo: boolean = state.quary.split("&")[1] === "y" ? true : false
    const isHebrew: boolean = (/[\u0590-\u05FF]/).test(ctx.message.text);
    if (isHebrew)
      ctx.reply(`ההודעה שלך מכילה תווים בעברית ואורכה ${yesOrNo && state.client?.Link ? ctx.message.text.length + state.client?.Link.length : ctx.message.text.length} תווים \n לכל מספר שתשלח הודעה זו תחויב על ${Math.ceil((yesOrNo && state.client?.Link ? ctx.message.text.length + state.client?.Link.length : ctx.message.text.length) / 70)} הודעות. להמשך /start`)
    else
      ctx.reply(`אורכה של ההודעה שלך הוא  ${yesOrNo && state.client?.Link ? ctx.message.text.length + state.client?.Link.length : ctx.message.text.length} תווים \n לכל מספר שתשלח הודעה זו תחויב על ${Math.ceil((yesOrNo && state.client?.Link ? ctx.message.text.length + state.client?.Link.length : ctx.message.text.length) / 160)} הודעות. להמשך /start`)
    state.setQuary("default");   
  }
  else if (state.quary.includes("EnterMessage")) {
    state.decrement = 1;
    state.messageContent = ctx.message.text;
    const isHebrew: boolean = (/[\u0590-\u05FF]/).test(ctx.message.text);
    let hasEnough: boolean = true;
    if (state.quary === "EnterMessage&y") {
      state.messageContent += `\n{{link:${state.client?.LinkId}}}`
      const chars: number = state.messageContent.length;
      if (isHebrew) {
        const neededMessages = state.numbers.length * Math.ceil((chars) / 70);
        state.decrement = neededMessages;
        if (state.client && neededMessages <= state.client?.Messages)
          ctx.reply(`ההודעה שלך מכילה תווים בעברית ואורכה ${chars} תווים \n לכל מספר שתשלח הודעה זו תחויב על ${Math.ceil((chars) / 70)} הודעות.`);
        else if (state.client?.Messages)
          hasEnough = false;
      }
      else {
        const neededMessages = state.numbers.length * Math.ceil((chars) / 160);
        state.decrement = neededMessages;
        if (state.client && neededMessages <= state.client?.Messages)
          ctx.reply(`אורכה של ההודעה שלך הוא  ${chars} תווים \n לכל מספר שתשלח הודעה זו תחויב על ${Math.ceil((chars) / 160)} הודעות.`);
         else if (state.client?.Messages)
          hasEnough = false;
      }
    }
    else {
      const chars: number =  ctx.message.text.length;
      if (isHebrew) {
        const neededMessages = state.numbers.length * Math.ceil((chars) / 70);
        state.decrement = neededMessages;
        if (state.client && neededMessages <= state.client?.Messages)
          ctx.reply(`ההודעה שלך מכילה תווים בעברית ואורכה ${chars} תווים \n לכל מספר שתשלח הודעה זו תחויב על ${Math.ceil((chars) / 70)} הודעות.`);
        else if (state.client?.Messages)
          hasEnough = false;
      }
      else {
        const neededMessages = state.numbers.length * Math.ceil((chars) / 160);
        state.decrement = neededMessages;
        if (state.client && neededMessages <= state.client?.Messages)
          ctx.reply(`אורכה של ההודעה שלך הוא  ${chars} תווים \n לכל מספר שתשלח הודעה זו תחויב על ${Math.ceil((chars) / 160)} הודעות.`);
         else if (state.client?.Messages)
          hasEnough = false;
      }
    }
    if (hasEnough)
      ctx.reply(`תוכן ההודעה: ${state.messageContent}
לביטול /cancel`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "סיום ושליחה ✅", callback_data: "send_UseAPI" }],
              [{ text: `שינוי הודעה ↩️`, callback_data: "send_EnterMessage" }],
            ]
          }
        }
      );
    else
      ctx.reply(`*כמות ההודעות שברשותך לא מספיקה, קצר את ההודעה לכמות המתאימה או רכוש עוד הודעות*
לביטול /cancel`,
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "הוספת הודעות לחשבון 💰", callback_data: "buy" }],
              [{ text: `שינוי הודעה ↩️`, callback_data: "send_EnterMessage" }],
            ]
          }
        }
      );

  }
  else if (state.quary === "EnterSender") {
    state.senderName = ctx.message.text;
    if(!state.senderName && state.client?.Id)
      generateRandomSender(state.client.Id.toString());
    if(brandAndCorporation.map(f=>f.toLocaleLowerCase()).includes(state.senderName.toLowerCase()))
      state.legalName = false;
      else
      state.legalName = true;
      const text:string =state.legalName?`שם השולח: ${state.senderName}
      לביטול /cancel`:"*שם השולח לא חוקי!, במידה ותמשיך בתהליך ההודעות לא ישלחו וירדו לך מהחשבון!!*";
    ctx.reply(text,
      {
        parse_mode:"Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "המשך ✅", callback_data: "send_EnterMessage" }],

            [{ text: `שינוי שם השולח ↩️`, callback_data: "send_EnterSender" }],
          ]
        }
      }
    );
  }
  else if (state.quary === "startCreateLink") {
    if (state.client?.LinkId !== "")
      await deleteLink(MessageWhizApiKey as string, state.client?.LinkId as string);
    const url: string = ctx.message.text;
    const res = await createLink(MessageWhizApiKey as string, url);    
    if (!res.success)
      ctx.reply("חלה שגיאה הכנס כתובת שוב או /cancel לביטול");
    else {
      if (state.client && state.client.Id) {
        state.client.Link = res.data.result.url;
        state.client.LinkId = res.data.result.id;
        const linkRes = await insertLink(state.client.Id.toString(), state.client.Link, state.client.LinkId);
        if (linkRes == undefined) {
          state.setQuary("default");
          await ctx.reply("הלינק נשמר בהצלחה להמשך /start");
        }
        else
          await ctx.reply("התרחשה שגיאה בשרת אנא אכנס את הלינק בשנית או /start להפעלה מחדש");
      }
    }
  }
  else if (state.quary === "paymentVerification") {
    state.setQuary("temp");  
    const transaction_id: string = ctx.message.text;
    state.deleteId.push(ctx.message.message_id);
    const isIn: boolean | undefined = await getTransactionID(transaction_id);
    let message_id: number | undefined;
    if (!isIn && isIn != undefined) {
      // Mainnet	https://api.trongrid.io
      //Nile Testnet	https://nile.trongrid.io
      await ctx.sendMessage(`⌚️*הזמן שנותר לאימות המערכת:* 20 דקות, 0 שניות 
         💡 *סטטוס:* ממתין לאימות מערכת.
         הסטטוס מתעדכן מידי 5 שניות.`, { parse_mode: "Markdown" }).then((res: any) => message_id = res.message_id);
       _confirmation(message_id, transaction_id, ctx).then(async(confirmationRes)=>{
        let res;
      if (!confirmationRes)
        res = await axios.get(`https://api.trongrid.io/v1/accounts/${TronUri}/transactions/trc20?only_to=true`);
      if ((res && res.statusText === "OK") || confirmationRes) {
        let transaction;
        if (confirmationRes)
          transaction = confirmationRes;
        else
          transaction = res?.data.data.find((t: any) => t.transaction_id === transaction_id);
        if (transaction) {
          console.log(transaction.value);
          console.log(state.needToPay);

          if (transaction.value != state.needToPay) {
            ctx.reply("הועבר סכום שגוי, העסקה בוטלה. פנה לעזרה אם חלה טעות\n להפעלת הבוט מחדש /start");
            state.setQuary("default");
            state.needToPay = -1;
          }
          else {
            await createTransactionID({ Id: transaction_id });
            switch (state.needToPayCase) {
              case 1:

                if (state.client?.Messages) {
                  state.client.Messages += priceList[1].messages;
                  state.client.Money += priceList[1].money;
                }
                if (state.client?._Messages)
                  state.client._Messages += priceList[1].messages;

                if (!state.update(1))
                  ctx.reply("חלה שגיאה בהוספת ההודעות /start לניסיון מחדש");
                else
                  ctx.reply(`${priceList[1].messages} הודעות חדשות\n להמשך הפעלת הבוט /start`);
                break;

              case 2:
                if (state.client?.Messages) {
                  state.client.Messages += priceList[2].messages;
                  state.client.Money += priceList[2].money;
                }
                if (state.client?._Messages)
                  state.client._Messages += priceList[2].messages;

                if (!state.update(1))
                  ctx.reply("חלה שגיאה בהוספת ההודעות /start לניסיון מחדש");
                else
                  ctx.reply(`${priceList[2].messages} הודעות חדשות\n להמשך הפעלת הבוט /start`);
                break;
              case 3:
                if (state.client?.Messages) {
                  state.client.Messages += priceList[3].messages;
                  state.client.Money += priceList[3].money;
                }
                if (state.client?._Messages)
                  state.client._Messages += priceList[3].messages;

                if (!state.update(1))
                  ctx.reply("חלה שגיאה בהוספת ההודעות /start לניסיון מחדש");
                else
                  ctx.reply(`${priceList[3].messages} הודעות חדשות\n להמשך הפעלת הבוט /start`);
                break;
              case 4:
                if (state.client?.Messages) {
                  state.client.Messages += priceList[4].messages;
                  state.client.Money += priceList[4].money;
                }
                if (state.client?._Messages)
                  state.client._Messages += priceList[4].messages;

                if (!state.update(1))
                  ctx.reply("חלה שגיאה בהוספת ההודעות /start לניסיון מחדש");
                else
                  ctx.reply(`${priceList[4].messages} הודעות חדשות\n להמשך הפעלת הבוט /start`);
                break;
              case 5:
                if (state.client?.Messages) {
                  state.client.Messages += priceList[5].messages;
                  state.client.Money += priceList[5].money;
                }
                if (state.client?._Messages)
                  state.client._Messages += priceList[5].messages;

                if (!state.update(1))
                  ctx.reply("חלה שגיאה בהוספת ההודעות /start לניסיון מחדש");
                else
                  ctx.reply(`${priceList[5].messages} הודעות חדשות\n להמשך הפעלת הבוט /start`);
                break;
              case 6:
                if (state.client?.Messages) {
                  state.client.Messages += priceList[6].messages;
                  state.client.Money += priceList[6].money;
                }
                if (state.client?._Messages)
                  state.client._Messages += priceList[6].messages;

                if (!state.update(1))
                  ctx.reply("חלה שגיאה בהוספת ההודעות /start לניסיון מחדש");
                else
                  ctx.reply(`${priceList[6].messages} הודעות חדשות\n להמשך הפעלת הבוט /start`);
                break;
              case 7:
                if (state.client?.Messages) {
                  state.client.Messages += priceList[7].messages;
                  state.client.Money += priceList[7].money;
                }
                if (state.client?._Messages)
                  state.client._Messages += priceList[7].messages;
                if (!state.update(1))
                  ctx.reply("חלה שגיאה בהוספת ההודעות /start לניסיון מחדש");
                else
                  ctx.reply(`${priceList[7].messages} הודעות חדשות\n להמשך הפעלת הבוט /start`);
                break;
            }
            await bot.telegram.editMessageText((await ctx.getChat()).id, state.replyMessageId, undefined, "💡*סטטוס התשלום*: הושלם", { parse_mode: "Markdown" });
            await deleteMessages(ctx);
            state.setQuary("default");
            state.needToPay = -1;
            state.needToPayCase = 0;

          }
        }
        else {
          ctx.reply("הקוד שהוזן לא נמצא במערכת, אנא בדוק את תקינות הקוד ונסה בשנית\nלהתחלה מחדש /start");
          state.setQuary("paymentVerification");
        }
      }
      else {
        ctx.reply("התרחשה שגיאה אנא נסה שוב מאוחר יותר או פנה לעזרה\nלהתחלה מחדש /start");
        state.setQuary("default");
      }
       });      
      
    }
    else if (isIn) {
      ctx.reply("הוזן קוד שכבר נקלט במערכת בעבר, אנא הכנס קוד תקין\nלהתחלה מחדש /start");
      state.setQuary("paymentVerification");
    }
    else {
      ctx.reply("יש תקלה בשרת אנא נסה שוב או פנה לעזרה\nלהתחלה מחדש /start");
      state.setQuary("paymentVerification");
    }


  }
  else if (state.quary === "messageAll") {
    if (Channel) {
      const clients: Client[] | null | undefined = await getClients();
      if(clients)
      clients.map((client: Client) => {       
        if (client.Id) {
          if (ctx.message.from.id == client.Id)
            bot.telegram.sendMessage(client.Id, "ההודעה נשלחה בהצלחה").then(() => handleStartMain(ctx));
          else
            bot.telegram.sendMessage(client.Id, ctx.message.text);
        }
      });
    }
    state.setQuary("default");
  }
  else if (state.quary === "addMessages") {
    if (isNaN(Number(ctx.message.text))) {
      await ctx.deleteMessage();
    }
    else {
      console.log(state.client);
      if (state.clientForAdd?.Messages)
        state.clientForAdd.Messages += Number(ctx.message.text);
      if (state.clientForAdd?._Messages)
        state.clientForAdd._Messages += Number(ctx.message.text);
      if (!state.update(2))
        ctx.reply("חלה שגיאה בהוספת ההודעות אנא נסה שוב");
      else {
        ctx.reply(`התווספו בהצלחה ${Number(ctx.message.text)} הודעות חדשות`);
        if (state.clientForAdd?.Id)
          bot.telegram.sendMessage(state.clientForAdd.Id, `תתחדש! מנהל הוסיף לך ${Number(ctx.message.text)} הודעות חדשות`);
        state.setQuary("default");
      }
    }
  }
  else if (state.messagesToSendQuary !== "") {
    const data: number = Number(ctx.message.text);
    const phoneNumber: string = ctx.message.text;   
    if (isNaN(data) || /^9725\d([-]{0,1})\d{7}$|^05\d([-]{0,1})\d{7}$/.test(phoneNumber)) {
      ctx.deleteMessage(ctx.message.message_id).then(() => ctx.deleteMessage(ctx.message.message_id - 1).then(
        () => ctx.replyWithChatAction("typing")).then(() => ctx.reply("כמה מספרים תרצה לשלוח? אנא הזן מספר תקין בבקשה")));
    }
    else {
      if (state.messagesToSendQuary === "fromFile") {
        state.setShouldReadDoc(true);
        await ctx.reply(`אנא אכנס קובץ עם מספרים בפורמט הבא\n9725*-*******\nאו\n05*-*******`);
      }
      else if (state.messagesToSendQuary === "fromBot") {
        const phones: string[] = await getPhones(data);
        if (!phones)
          ctx.reply("חלה שגיאה בשרת אנא נסה שנית");
        else {
          if (phones.length < data)
            ctx.reply(`לבוט יש רק ${phones.length} מספרים תוכל להשלים את הכמות שרצית בדרכים האחרות`);
          else
            ctx.reply(`${phones.length} מספרים התווספו!`);
          state.numbers.push(...phones);
          state.numbers = [...new Set(state.numbers)];
          state.numbers = state.numbers.map(number=>/^05\d([-]{0,1})\d{7}$/.test(number)?"972"+number.substring(1):number);
        }
      }

      else {
        await ctx.reply(`אנא רשום מספרים בפורמט הבא\n9725*-*******\nאו\n05*-*******`)
        state.setQuary("manual");
      }
      state.setMessagesToSend(data);
      state.SetMessagesToSendQuary("");
    }

  }
  else if (state.quary === "manual") {
    const dataRaw: any = ctx.message.text.replaceAll('\r', '').replaceAll('-', '')
      .replaceAll(' ', ',').split('\n').map((row: string) => row.split(','));
    const data: string[] = [...new Set([].concat(...dataRaw).filter(f => /^9725\d([-]{0,1})\d{7}$|^05\d([-]{0,1})\d{7}$/.test(f)))]   
    state.numbers.push(...data);
    state.numbers = state.numbers.map(number=>/^05\d([-]{0,1})\d{7}$/.test(number)?"972"+number.substring(1):number);    
    state.numbers = [...new Set(state.numbers)];
   state.updateJson();
    enterNumbersManual(ctx);
  }
  else if (state.quary === "temp") { }
  else
    ctx.deleteMessage();

   state.updateJson();
})
//{ webhook: { domain: WEBHOOK as string, port: Number(PORT) } }
bot.launch()
  .then(() => console.log("Webhook bot listening on port", Number(PORT)));


process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

const _confirmation = async (message_id: number | undefined, transaction_id: string, ctx: Context<Update>) => {
  let state:myState = new myState(JSON.parse(fs.readFileSync(`./memory/${ctx.message?.from.id}.json`).toString()));
  let ret;
  let looper: boolean = true;
  let min: number = 19;
  let sec: number = 55;

  while (looper) {

    await new Promise(resolve => setTimeout(resolve, 5000));
    const text: string = `⌚️*הזמן שנותר לאימות המערכת:* ${min} דקות, ${sec} שניות 
💡 *סטטוס:* ממתין לאימות מערכת.
*אנא אל תשתמש בבוט בזמן זה*
הסטטוס מתעדכן מידי 5 שניות.`
    await bot.telegram.editMessageText((await ctx.getChat()).id, message_id, undefined, text, { parse_mode: "Markdown" }).then((res:any)=>{state.replyMessageId = res.message_id}).catch(() => console.log("here"));
    const res = await axios.get(`https://api.trongrid.io/v1/accounts/${TronUri}/transactions/trc20?only_to=true`);
    if (res.statusText == "OK") {
      const transaction = res.data.data.find((t: any) => t.transaction_id === transaction_id);
      if (transaction) {
        ret = transaction;
        looper = false;
      }
    }
    if (min === 0 && sec === 0) {
      await bot.telegram.editMessageText((await ctx.getChat()).id, message_id, undefined, "*העסקה בוטלה*", { parse_mode: "Markdown" });
      await deleteMessages(ctx);
      looper = false;
    }
    else if (sec === 0) {
      min--;
      sec = 50
    }
    else
      sec -= 5;

  }
  state.updateJson();
  return ret;
}
