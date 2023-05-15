import mysql from 'mysql2';
import * as dotenv from 'dotenv';

dotenv.config({ path: "../.env" });
import { Transactions } from '../../models/transaction_ids';


const { host, user, password, dataBase } = process.env



export const createTransactionID = async (Transaction:Transactions)=>{
    const con = mysql.createConnection({
        host: host,
        user: user,
        password: password,
        database: dataBase,
    });
    
    const sql = `INSERT INTO transactions (Id) VALUES ('${Transaction.Id}') `;
    let res = undefined
    
    await con.promise().query(sql).then((response: any) => {
       
    }).catch(err => {       
        if (err.code!="ER_DUP_ENTRY")
        console.log(err.code);
    });
    con.end();
    return res;            
}

//checks if transaction is in the db or not
// if true its exist if false its not
export const getTransactionID =async (TransactionID:string) => {
    const con = mysql.createConnection({
        host: host,
        user: user,
        password: password,
        database: dataBase,
    });
    
    const sql = `SELECT * FROM transactions WHERE Id='${TransactionID}'`;
    let res = undefined
    
    await con.promise().query(sql).then((response: any) => {        
       if(response[0][0])
            res = true
            else
                res = false;
    }).catch(err => {           
            console.log(err);
    });
    con.end();
    return res;  
}
