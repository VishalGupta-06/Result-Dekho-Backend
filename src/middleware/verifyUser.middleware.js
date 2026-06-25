import { asyncHandler } from "../util/asyncHandler.js"
import { apiError } from "../util/apiError.js"
import { User } from "../model/user.model.js"
import jwt from "jsonwebtoken"

const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.split(" ")[1]


        if (!token) {
            throw new apiError(401, "Unauthorized request")
        }

        const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        if (!decodedToken) {
            throw new apiError(401, "Someone has stolen token")
        }

        const user = await User.findById(decodedToken._id).select("-password -refreshToken")

        // console.log(user)

        if (!user) {
            throw new apiError(401, "Invalid Access Token")
        }

        req.user = user;
        next()

    } catch (error) {
        throw new apiError(401, error?.message || "Invalid access Token")
    }
})

export { verifyJWT }