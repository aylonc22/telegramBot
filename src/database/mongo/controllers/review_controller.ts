import { Review } from "../../models/review_model";
const _Review = require('../../models/review_model');

export const createReview = async (Review:Review)=>{
    const review = new _Review(Review);
    if(!review)
        return "didnt work";
    try{
        
        const res = await  review.save();
        return res;
    }
    catch(e:unknown)
        {
            return "error";
        }
}

export const getReviews = async()=>{
    try{
        const res = await _Review.find({Read:false});
        return res;
    }
    catch(err)
    { 
        return undefined
    }
}
export const getReview = async(id:String)=>{
    try{
        const res = await _Review.findOne({_id:id});       
        return res;
    }
    catch(err)
    { 
        return undefined
    }
}

export const updateReview = async(id:string)=>{
    try{
       if(id != undefined)
            await _Review.updateOne({_id:id},{$set:{Read:true}})
    }
    catch{};
}