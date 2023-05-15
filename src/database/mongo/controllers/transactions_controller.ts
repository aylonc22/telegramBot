import { Transactions } from "../../models/transaction_ids";
const _Transactions = require("../../models/transaction_ids");

export const createTransactionID = async (Transaction:Transactions)=>{
    const transaction = new _Transactions(Transaction);
    if(!transaction)
        return "didnt work";
    
      
        const res = await  transaction.save().catch((err:any)=>{
            if(err.code !== 11000)
                return err;
        });

        return res;                
}
//checks if transaction is in the db or not
// if true its exist if false its not
export const getTransactionID =async (TransactionID:string) => {
    try{

        const res = await _Transactions.findOne({Id:TransactionID});        
        if(res)
            return true
        return false;
    }
    catch(err){        
        return undefined;
    }
}