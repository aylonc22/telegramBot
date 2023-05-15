import mysql from 'mysql2';
import * as dotenv from 'dotenv';

dotenv.config({ path: "../.env" });
import { Phone } from '../../models/phone_model';


const { host, user, password, dataBase } = process.env


export const getPhones = async(amount:number)=>{
    const con = mysql.createConnection({
        host: host,
        user: user,
        password: password,
        database: dataBase,
    });
    
    const sql = `SELECT *  FROM phone WHERE  Used=0 ORDER BY RAND()
    LIMIT ${amount}`;
    let res:string[]| undefined = [];
    await con.promise().query(sql).then((response: any) => {
       if(response[0].length>0)
            res = response[0].map((phone:Phone)=>phone.Phone);
        console.log(res);
    }).catch(err => {       
            console.log(err);
            res = undefined;
    });
    con.end();
    return res;
}

export const addPhones = async(Phones:String[])=>{
    const con = mysql.createConnection({
        host: host,
        user: user,
        password: password,
        database: dataBase,
    });
   
    const sql = `INSERT INTO phone (Phone,Used) VALUE ? `;
    let res = undefined
    
    await con.promise().query(sql,[Phones.map(p=>[p.toString(),0])]).then((response: any) => {
       
    }).catch(err => {       
            console.log(err);
            res = err;
    });
    con.end();
    return res;
}


export const changeToUsed = async(number:string)=>{
    const con = mysql.createConnection({
        host: host,
        user: user,
        password: password,
        database: dataBase,
    });
   
    const sql:string = `UPDATE phone  SET Used=1 WHERE Phone=${number}`;

    let res = undefined
    
    await con.promise().query(sql).then((response: any) => {
       
    }).catch(err => {       
            console.log(err);
            res = err;
    });
    con.end();
    return res;
}