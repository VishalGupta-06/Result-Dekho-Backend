import { asyncHandler } from "../util/asyncHandler.js"
import { Profile } from "../model/profile.model.js";
import { apiResponse } from "../util/apiResponse.js";

const currentUser = asyncHandler(async (req , res )=>{

    const stId = req.user;

    console.log(stId.registration)

    const info = await Profile.findOne({studentID : (stId.registration).toUpperCase() }).select( "-_id -__v")

    if( !info ){
        return res.json(
            new apiResponse(
                400,
                "Not found",
                "Please upload your data"
            )
        )
    }

     return res.json(
            new apiResponse(
                200,
                info
            )
        )

    
})

export { currentUser }