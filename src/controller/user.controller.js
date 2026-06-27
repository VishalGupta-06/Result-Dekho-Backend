import { asyncHandler } from "../util/asyncHandler.js";
import { apiError } from "../util/apiError.js";
import { User } from "../model/user.model.js";
import uploadOnCloudinary from "../util/cloudinary.js";
import { apiResponse } from "../util/apiResponse.js";
import { generateToken } from "../util/generateToken.js";
import bcrypt from "bcrypt";


const registerUser = asyncHandler(async (req, res) => {
  const { registration, password } = req.body;

  if ([registration, password].some((field) => field?.trim() === "")) {
    throw new apiError(400, "All fields are required");
  }

  const hashedPassword = await bcrypt.hash(password, 10);


  const user = await User.findOneAndUpdate(
    { registration },
    {
      $set: {
        password: hashedPassword,
      },
    },
    {
      upsert: true,
      new: true,
    },
  );

  const { accessToken, refreshToken } = await generateToken(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if (!loggedInUser) {
    throw new apiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      httpOnly: true, secure: true , sameSite: "none"
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true, secure: true , sameSite: "none"
    })
    .json(
      new apiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in Successfully",
      ),
    );
});

export { registerUser };
