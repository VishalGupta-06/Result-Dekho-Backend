import { Profile } from "../model/profile.model.js";
import { asyncHandler } from "../util/asyncHandler.js";
import { apiResponse } from "../util/apiResponse.js";
import { apiError } from "../util/apiError.js";

const searchbox = asyncHandler( async (req , res)=>{

    try {
        
        const {value} = req.body;
        
        if( !value ){
            return res.json([]);
        }
    
        const students = await Profile.find({
          $or: [
            { name: { $regex: value, $options: "i" } },
            { studentID: { $regex: value, $options: "i" } }
          ]
        })
        .select("-_id  -__v")
          .limit(20);
            res.json(students);
    } catch (error) {
        console.log("Error" , error)
        throw new apiError(200,"Data is missing");
    }
})

export {searchbox}