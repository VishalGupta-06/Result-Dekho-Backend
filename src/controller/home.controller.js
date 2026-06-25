import { asyncHandler } from "../util/asyncHandler.js";
import { Profile } from "../model/profile.model.js";
import { apiError } from "../util/apiError.js";
import { apiResponse } from "../util/apiResponse.js";

const home = asyncHandler(async( req , res )=>{

    console.log(req.user);

    const {registration} = req.user;

   const reg = registration.toUpperCase();

    const info = await Profile.findOne({studentID:reg});

    if( ! info ){
        throw new apiError(
            401 ,
            "Your Info is not Available... PLease connect admit for further details...."
        )
    }

    return res.json(
        new apiResponse(
            200,
            info,
            "Fetch successfully"
        )
    )
})

export { home };