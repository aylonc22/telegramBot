import { Phone } from "../../models/phone_model";
const _Phone = require("../../models/phone_model");
export const getPhones = async(amount:number)=>{
    try
    {
        const data = await _Phone.aggregate([{ $sample: { size: amount } }]);
        const res = data.map((d:Phone)=>d.Phone);
        return res;
    }
    catch(err)
    {
        console.log(err);
        return undefined;
    }
}

export const addPhones = async(Phones:String[])=>{
    const res = await Promise.all((Phones.map(async phone=>{
        const _phone = new _Phone({Phone:phone});

        if(!_phone)
            return false;
        try{
            await _phone.save();
            return true;
        }
        catch(err)
        {
            return false;
        }        
    })));   
}