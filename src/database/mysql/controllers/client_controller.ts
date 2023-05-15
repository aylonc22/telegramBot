import mysql from 'mysql2';
import * as dotenv from 'dotenv';

dotenv.config({ path: "../.env" });
import { Client } from '../../models/client_model';


const { host, user, password, dataBase } = process.env

export const createClient = async (client: Client) => {
    const con = mysql.createConnection({
        host: host,
        user: user,
        password: password,
        database: dataBase,
    });
   
    const sql = `INSERT INTO client (Id,Joined,Messages,_Messages,Money,Link,LinkId,Disabled,Phones,FirstName,LastName,UserName) VALUES ('${client.Id}','${client.Joined}','${client.Messages}','${client._Messages}','${client.Money}',${client.Link ? "'" + client.Link + "'" : "null"},${client.LinkId ? "'" + client.LinkId + "'" : "null"},${client.Disabled},${client.Phones.length > 0 ? "'" + JSON.stringify(client.Phones) : "null"},'${client.FirstName}',${client.LastName ? "'" + client.LastName + "'" : "null"},${client.UserName ? "'" + client.UserName + "'" : "null"})`;
    let res = undefined;
    await con.promise().query(sql).then((response: any) => {
        res = client;
    }).catch(err => {
        if (!err.toString().includes('client.Id_UNIQUE'))
            console.log(err);
    });
    con.end();
    return res;
}

export const getClient = async (clientID: string | undefined) => {
    const con = mysql.createConnection({
        host: host,
        user: user,
        password: password,
        database: dataBase,
    });
    const sql = `Select * from client WHERE Id=${clientID}`
    let res: Client | undefined | null;
    await con.promise().query(sql).then((response: any) => {
        const raw = response[0][0];       
        if (raw)
            res = {
                Id: raw.Id,
                Joined: raw.Joined,
                Messages: Number(raw.Messages),
                _Messages: Number(raw._Messages),
                Money: Number(raw.Money),
                Link: raw.Link != null ? raw.Link : '',
                LinkId: raw.LinkId != null ? raw.LinkId : '',
                Disabled: raw.Disabled == 0 ? false : true,
                Phones: raw.Phones != null ? raw.Phones : [],
                Admin: raw.Admin == 0 ? false:true,
                FirstName: raw.FirstName,
                LastName: raw.LastName!=null?raw.LastName:undefined,
                UserName:raw.UserName!=null?raw.UserName:undefined,
            };
        else
            res = null;

    }).catch(err => {
        if (!err.toString().includes('client.Id_UNIQUE')) {
            console.log(err);
            res = undefined
        }
    });
    con.end();
    return res;
}

export const getClients = async()=>{
    const con = mysql.createConnection({
        host: host,
        user: user,
        password: password,
        database: dataBase,
    });
    
    const sql = `Select * from client`
    let res: Client[] | undefined | null;
    await con.promise().query(sql).then((response: any) => {
        const raw = response[0];          
        if(raw.length>0)
        res = raw.map((r:Client|any)=>{          
            if (r)
           return { 
                Id: r.Id,
                Joined: r.Joined,
                Messages: Number(r.Messages),
                _Messages: Number(r._Messages),
                Money: Number(r.Money),
                Link: r.Link != null ? r.Link : '',
                LinkId: r.LinkId != null ? r.LinkId : '',
                Disabled: r.Disabled == 0 ? false : true,
                Phones: r.Phones != null ? r.Phones : [],
                Admin:r.Admin == 0 ? false:true,
                FirstName: r.FirstName,
                LastName: r.LastName!=null?r.LastName:undefined,
                UserName:r.UserName!=null?r.UserName:undefined,
            };       
        })  
        else
        res = null;  
        

    }).catch(err => {
        if (!err.toString().includes('client.Id_UNIQUE')) {
            console.log(err);
            res = undefined
        }
    });
    con.end();
    return res;
}

export const updateClient = async (client: Client) => {
    const con = mysql.createConnection({
        host: host,
        user: user,
        password: password,
        database: dataBase,
    });

    const sql = `UPDATE client SET Messages='${client.Messages}',_Messages='${client._Messages}',Money='${client.Money}' WHERE Id=${client.Id}`
    let res;
    await con.promise().query(sql).then((response: any) => {
        res = undefined;
    }).catch(err => {
        console.log(err);
        res = err
    });
    con.end();
    return res;
}

export const updateAdmin = async (client:Client) => {
    const con = mysql.createConnection({
        host: host,
        user: user,
        password: password,
        database: dataBase,
    });
    const boolToNum:number = !client.Admin?1:0;
    const sql = `UPDATE client SET Admin='${boolToNum}' WHERE Id='${client.Id}'`
    let res;
    await con.promise().query(sql).then((response: any) => {        
        res = !client.Admin;
    }).catch(err => {
        console.log(err);
        res = err
    });
    con.end();
    return res;
}


export const insertLink = async(clientID:string,link:string,linkID:string)=>{
    const con = mysql.createConnection({
        host: host,
        user: user,
        password: password,
        database: dataBase,
    });
   
    const sql = `UPDATE client SET Link='${link}',LinkId='${linkID}' WHERE Id=${clientID}`
    let res;
    await con.promise().query(sql).then((response: any) => {
        res = undefined;
    }).catch(err => {
        console.log(err);
        res = err
    });
    con.end();
    return res;
}

export const insertNumbers = async(clientID:string,numbers:string[])=>{
    const con = mysql.createConnection({
        host: host,
        user: user,
        password: password,
        database: dataBase,
    });
   
    const sql = `UPDATE client SET Phones='${JSON.stringify(numbers)}' WHERE Id=${clientID}`
    let res;
    await con.promise().query(sql).then((response: any) => {
        res = undefined;
    }).catch(err => {
        console.log(err);
        res = err
    });
    con.end();
    return res;
}

export const _disableClient = async(client:Client)=>{
    const con = mysql.createConnection({
        host: host,
        user: user,
        password: password,
        database: dataBase,
    });
   
   
    const sql = `UPDATE client SET Disabled='${!client.Disabled?1:0}' WHERE Id=${client.Id}`
    let res;
    await con.promise().query(sql).then((response: any) => {  
        client.Disabled = !client.Disabled;       
        res = !client.Disabled;
    }).catch(err => {
        console.log(err);
        res = err
    });
    con.end();
    return res;
}

export const disableClient = async(clientID:number,flag:boolean)=>{    
    const con = mysql.createConnection({
        host: host,
        user: user,
        password: password,
        database: dataBase,
    });
   
    const sql = `UPDATE client SET Disabled='${flag?1:0}' WHERE Id=${clientID}`
    let res;
    await con.promise().query(sql).then((response: any) => {
        res = undefined;
    }).catch(err => {
        console.log(err);
        res = err
    });
    con.end();
    return res;
}
