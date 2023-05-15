import axios from "axios";


export const createRecipientList = async(MessageWhizApiKey:string,numbers:string[])=>{
  
    const name:string = Math.random().toString(36).substring(2,14);
   const res = await  axios.post("http://sms.mmdsmart.com/api/3/recipientList/numbers",{name:name,numbers:numbers},{headers:{apikey:MessageWhizApiKey}})
    .then(res=>{ return{success:true,data:res.data.result.recipient_list_id}}).catch(err=>{return {success:false,data:err}});
    return res;
}


export const getRecipientList =async (MessageWhizApiKey:string) => {
    axios.get("http://sms.mmdsmart.com/api/3/RecipientList",{headers:{apikey:MessageWhizApiKey}})
    .then(res=>{
       console.log(res.data);
    }).catch(err=>console.log(err));
}


export const deleteRecipientList = async(MessageWhizApiKey:string,recipientId:string) =>{ 
  const res = await  axios.delete(`http://sms.mmdsmart.com/api/3/RecipientList/${recipientId}`,{headers:{apikey:MessageWhizApiKey}})
    .then(res=>true).catch(err=>{console.log("err");return false;});

    return res;
}


export const createCampaign = async(MessageWhizApiKey:string)=>{
    const name:string = Math.random().toString(36).substring(2,14);
   const res = await  axios.post("http://sms.mmdsmart.com/api/3/campaign",{name:name},{headers:{apikey:MessageWhizApiKey}})
    .then(res=>{return {success:true,data:res.data.result.id}}).catch(err=>{return {success:false,data:err}});
    return res;
}


export const deleteCampaign = async(MessageWhizApiKey:string,campaignId:string) =>{   
     const res = await axios.delete(`http://sms.mmdsmart.com/api/3/campaign/${campaignId}`,{headers:{apikey:MessageWhizApiKey}})
     .then(res=>true).catch(err=>{console.log("err");return false;});

     return res;
 }


 export const createSender = async(MessageWhizApiKey:string,name:string)=>{  
   const res = await  axios.post("http://sms.mmdsmart.com/api/3/sender",{name:name},{headers:{apikey:MessageWhizApiKey}})
    .then(res=>{return{success:true,data:res.data.result.id}}).catch(err=>{return{success:false,data:err}});
    return res;
}

export const getSender =async (MessageWhizApiKey:string) => {
   const res = await axios.get("http://sms.mmdsmart.com/api/3/sender",{headers:{apikey:MessageWhizApiKey}})
    .then(res=>{return{success:true,data:res.data.result}}).catch(err=>{return{success:false,data:err}});

    return res;
}
export const deleteSender = async(MessageWhizApiKey:string,senderId:string) =>{      
    const res = await axios.delete(`http://sms.mmdsmart.com/api/3/sender/${senderId}`,{headers:{apikey:MessageWhizApiKey}})
     .then(res=>true).catch(err=>{return false;});

     return res;
 }


 export const createBroadcast = async(MessageWhizApiKey:string,campaign_id:string,senderId:string,recipient_list_id:string,message:string)=>{
    const name:string = Math.random().toString(36).substring(2,14);
   const res = await  axios.post("http://sms.mmdsmart.com/api/3/Broadcast",{name:name,campaign_id:campaign_id,broadcast_type:11,sender_ids:senderId,recipient_list_ids:recipient_list_id,message_body:message},{headers:{apikey:MessageWhizApiKey}})
    .then(res=>{return {success:true,data:res.data}}).catch(err=>{return{success:false,data:err.response}});
    return res;
}


export const createLink = async(MessageWhizApiKey:string,uri:string)=>{
    const name:string = Math.random().toString(36).substring(2,14);
    const res = await  axios.post("http://sms.mmdsmart.com/api/3/link",{name:name,url:uri},{headers:{apikey:MessageWhizApiKey}})
    .then(res=>{return {success:true,data:res.data}}).catch(err=>{return{success:false,data:err}});
    return res;

}

export const monitorLink =async (MessageWhizApiKey:string,uri:string) => {
    const res = await  axios.post("https://sms.mmdsmart.com/api/3/details/linkConversion",{url:uri},{headers:{apikey:MessageWhizApiKey}})
    .then(res=>{return {success:true,data:res.data}}).catch(err=>{return{success:false,data:err}});
    return res;
}


export const deleteLink = async (MessageWhizApiKey:string,id:string)=>{
    const res = await  axios.delete(`http://sms.mmdsmart.com/api/3/link/${id}`,{headers:{apikey:MessageWhizApiKey}})
    .then(res=>{return {success:true,data:res.data}}).catch(err=>{return{success:false,data:err}});
    return res;
}

export const getDeliveryReport = async (MessageWhizApiKey:string,id:string)=>{
    const res = await axios.post("http://sms.mmdsmart.com/api/3/DeliveryReport",{bid:id},{headers:{apikey:MessageWhizApiKey}})
    .then(res=>{return {success:true,data:res.data}}).catch(err=>{return{success:false,data:err}});
    return res;
}


export const getFinalDeliveryReport = async (MessageWhizApiKey:string,id:string)=>{
    let ret;   
        
    while(!ret){
        await new Promise((val)=>setTimeout(val,5000))            
        const res = await getDeliveryReport(MessageWhizApiKey,id);
        if(res.success && res.data.result.length > 0)                
            ret = res;                                                 
    }
    
    return ret;
}