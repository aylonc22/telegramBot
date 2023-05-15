
import { Client } from "./database/models/client_model";
import { updateClient } from "./database/mysql/controllers/client_controller";
import fs from 'fs';

interface MyState {
    quary: string,   // current state
    messagesToSend: number,
    messagesToSendQuary: string,
    clientForAdd?: Client | undefined, // saves client id when admin wants to add messages
    numbers: string[],
    legalName: boolean,
    shouldReadDoc: boolean,
    client?: Client | undefined | null,
    needToPay: number,
    needToPayCase: number,
    replyMessageId: number,
    messageContent: string,
    senderName: string,
    deleteId: number[],
    decrement: number
    setQuary: (quary: string) => void,
    setMessagesToSend: (messages: number) => void,
    SetMessagesToSendQuary: (quary: string) => void,
    setShouldReadDoc: (flag: boolean) => void,
    reset: () => void,
    update: (n: number) => Promise<boolean>,
    setClient: (client: Client | undefined | null) => void,
    setClientForAdd: (client: Client) => void,
    updateJson: () => void;
}

export class myState implements MyState {
    public quary: string;
    public messagesToSend: number;
    public clientForAdd: Client |undefined;
    public messagesToSendQuary: string;
    public shouldReadDoc: boolean;
    public numbers: string[];
    public client: Client | undefined | null;
    public needToPay: number;
    public needToPayCase: number;
    public replyMessageId: number;
    public legalName: boolean;
    public messageContent: string;
    public decrement: number;
    public deleteId: number[];
    public senderName: string;
    constructor(state?:myState){
        this.quary = state?.quary ?? "default";
        this.messagesToSend = state?.messagesToSend ?? 0;
        this.clientForAdd = state?.clientForAdd ?? undefined;
        this.messagesToSendQuary = state?.messagesToSendQuary ?? "";
        this.shouldReadDoc = state?.shouldReadDoc ?? false;
        this.numbers = state?.numbers ?? [];
        this.client = state?.client ?? undefined;
        this.needToPay = state?.needToPay ?? -1;
        this.needToPayCase = state?.needToPayCase ?? 0;
        this.replyMessageId = state?.replyMessageId ?? 0;
        this.legalName = state?.legalName ?? true;
        this.messageContent = state?.messageContent ?? "";
        this.decrement = state?.decrement ?? 1;
        this.deleteId = state?.deleteId ?? [-1];
        this.senderName = state?.senderName ?? "";
    }
    
    setQuary(quary: string) {
        this.quary = quary;
    };
    setMessagesToSend(messages: number) {
        this.messagesToSend = messages;
    };
    SetMessagesToSendQuary(quary: string): void {
        this.messagesToSendQuary = quary;
    };
    reset() {
        this.quary = "default";
        this.messagesToSend = 0;
        this.messagesToSendQuary = "";
        this.numbers.length = 0;
        this.shouldReadDoc = false;
        this.senderName = "";
        this.messageContent = "";
        this.deleteId = [-1];
        this.decrement = 1;
        this.legalName = true;
        this.updateJson();
    };
    setShouldReadDoc(flag: boolean) {
        this.shouldReadDoc = flag;
    };
    async update(n: number) {
        if (n === 1) {
            if (this.client) {
                let res = await updateClient(this.client);
                if (res != undefined) {
                    console.log(res);
                    return false;
                }
                return true;
            }
            return false;
        }
        if (n === 2) {
            if (this.clientForAdd) {
                let res = await updateClient(this.clientForAdd);
                if (res != undefined) {
                    console.log(res);
                    return false;
                }
                return true;
            }
            return false;
        }
        return false;
    };
    setClient(client: Client | undefined | null) {       // Client | undefined | null       

        this.client = client;
    };
    setClientForAdd(client: Client | undefined) { // Client | undefined | null       
        this.clientForAdd = client;
    };

    updateJson() {
        try {
            if (this.client)
                fs.writeFileSync(`./memory/${this.client.Id}.json`, JSON.stringify(this));
        }
        catch { console.log("error updating JSON") }
    }
}