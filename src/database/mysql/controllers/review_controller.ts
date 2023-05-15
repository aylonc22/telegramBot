import mysql from 'mysql2';
import * as dotenv from 'dotenv';

dotenv.config({ path: "../.env" });
import { Review,ReviewFromDB } from '../../models/review_model';



const { host, user, password, dataBase } = process.env


export const createReview = async (Review: Review) => {
    const con = mysql.createConnection({
        host: host,
        user: user,
        password: password,
        database: dataBase,
    });
   
    const sql = `INSERT INTO review (ClientId, Message) VALUES ('${Review.ClientId}','${Review.Message}')`;
    let res = undefined

    await con.promise().query(sql).then((response: any) => {
        console.log(response);
    }).catch(err => {
        console.log(err);
        res = err;
    });
    con.end();
    return res;
}

export const getReview = async (id: String) => {
    const con = mysql.createConnection({
        host: host,
        user: user,
        password: password,
        database: dataBase,
    });
    
    const sql = `SELECT * FROM review WHERE Id=${id}`;
    let res:ReviewFromDB|null|undefined;

    await con.promise().query(sql).then((response: any) => {        
       const raw = response[0][0]
        if (raw)
            res = { ClientId:raw.ClientId,
                _id:raw.Id,
                Message:raw.Message,
                Read:raw.Read==1?true:false,};
        else
            res = null;
    }).catch(err => {
        console.log(err);
        res = err;
    });
    con.end();
    return res;
}

export const getReviews = async () => {
    const con = mysql.createConnection({
        host: host,
        user: user,
        password: password,
        database: dataBase,
    });
   
    const sql = `SELECT * FROM review WHERE Flag = false `;
    let res:ReviewFromDB[]|any = undefined   
    await con.promise().query(sql).then((response: any) => {      
        if (response[0].length > 0)
            res = response[0].map((r: any) => {               
                if (r) return {
                    ClientId:r.ClientId,
                    _id:r.Id,
                    Message:r.Message,
                    Read:false,
                }
            });        
    }).catch(err => {
        console.log(err);
        res = err;
    });   
    con.end();
    return res;
}


export const updateReview = async(id:string)=>{
    const con = mysql.createConnection({
        host: host,
        user: user,
        password: password,
        database: dataBase,
    });
    
    const sql = `UPDATE review SET Flag=true WHERE Id='${id}'`;
    let res = undefined;

    await con.promise().query(sql).then((response: any) => {
       
    }).catch(err => {
        console.log(err);
        res = err;
    });
    con.end();
    return res;
}