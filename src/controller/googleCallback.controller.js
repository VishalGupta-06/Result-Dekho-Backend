import { User } from "../model/user.model.js"
import { asyncHandler } from "../util/asyncHandler.js"
import { apiError } from "../util/apiError.js"
import { generateToken } from "../util/generateToken.js"
import { apiResponse } from "../util/apiResponse.js"

const googleCallback = asyncHandler(async (req, res) => {
    // console.log(req.user)

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new apiError(400, "There are some problem with google login")
    }

    const { accessToken, refreshToken } = await generateToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    res.status(200)
        .cookie("accessToken", accessToken, { httpOnly: true, secure: true , sameSite: "lax", })
        .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true , sameSite: "lax", })
        .redirect("http://localhost:5173/dashboard");


})

export { googleCallback }