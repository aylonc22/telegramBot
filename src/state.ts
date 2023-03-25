import { updateClient } from "./mongo/controllers/client_controller";
import { Client } from "./mongo/models/Client_model";

interface MyState{
    quary:string,   
    messagesToSend:number,   
    messagesToSendQuary:string,
    clientId:number, // saves client id when admin wants to add messages
    numbers: string[],    
    shouldReadDoc:boolean,
    client:Client|undefined,
    setQuary:(quary:string)=>void,
    setMessagesToSend:(messages:number)=>void,   
    SetMessagesToSendQuary:(quary:string)=>void,
    setShouldReadDoc:(flag:boolean)=>void,
    reset:()=>void,
    update:()=>void,
    setClient:(client:Client)=>void,
    setClientId:(id:number)=>void,
}

export let myState:MyState = {
    quary: "default",    
    messagesToSend: 0,   
    clientId:-1,
    messagesToSendQuary: "",
    shouldReadDoc:false,
    numbers:[],
    client:undefined,        
    setQuary(quary) {
        this.quary = quary;
    },   
    setMessagesToSend(messages) {
        this.messagesToSend = messages;
    },
    SetMessagesToSendQuary(quary: string): void {
        this.messagesToSendQuary = quary;
    },
    reset(){
        this.quary = "default";       
        this.messagesToSend = 0;
        this.messagesToSendQuary = "";
       this.numbers.length = 0;
        this.shouldReadDoc = false;        
    },   
    setShouldReadDoc(flag) {
        this.shouldReadDoc = flag;
    },
    update(){
        if(this.client)
            updateClient(this.client);
    },
    setClient(client){
        this.client = client;        
    },   
    setClientId(id) {
        this.clientId = id;
    },
    
    
}