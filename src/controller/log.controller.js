import { asyncHandler } from "../util/asyncHandler.js";
import { apiError } from "../util/apiError.js"
import { User } from "../model/user.model.js"
import { apiResponse } from "../util/apiResponse.js";
import { generateToken } from "../util/generateToken.js"


const branch = ["pi", "ce", "ec", "cm", "me", "mm", "cs", "ee"];
const course = ["ug", "pg"];
const batch = [2024, 2025];

const verifyRegistrationNo = (registration) => {
  if (registration.length != 11) {
    throw new apiError(409, "Please enter valid Registration Number");
  }
  registration = registration.toLowerCase();
  let year = Number(registration.slice(0, 4));
  let cus = registration.slice(4, 6);
  let brch = registration.slice(6, 8);
  let roll = Number(registration.slice(8, 11));

  if (
    roll == NaN ||
    roll > 120 ||
    !branch.includes(brch) ||
    !course.includes(cus) ||
    year == NaN ||
    !batch.includes(year)
  ) {
    throw new apiError(409, "Please enter valid Registration Number");
  }
};



const userLogIn = asyncHandler(async (req, res) => {

    const { registration, password } = req.body;

    verifyRegistrationNo(registration);

    if (!registration) {
        throw new apiError(400, "Resgistration is required")
    }

    const user = await User.findOne({ registration })

    if (!user) {
        throw new apiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid ) {
        throw new apiError(401, "Invalid Password")
    }

    const { accessToken, refreshToken } = await generateToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    return res
        .status(200)
        .cookie("accessToken", accessToken, { httpOnly: true, secure: true , sameSite: "lax",})
        .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true , sameSite: "lax",})
        .json(
            new apiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged in Successfully"
            )
        )

})

const userLogOut = asyncHandler(async (req, res) => {
    //chech wheather user is loggedin or not
    //delete refresh token

    if (!req.user) {
        throw new apiError(401, "There is some error while verifying")
    }

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    return res
        .status(200)
        .clearCookie("accessToken", { httpOnly: true, secure: true })
        .clearCookie("refreshToken", { httpOnly: true, secure: true })
        .json(new apiResponse(200, {}, "User is logged out"))
})

export { userLogIn, userLogOut }