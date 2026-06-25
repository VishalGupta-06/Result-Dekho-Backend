import { asyncHandler } from "../util/asyncHandler.js";
import { OTP } from "../model/otp.model.js";


const verifyOTP = asyncHandler(async (req, res) => {
  const { registration, OTPPin } = req.body;
  
  const input = Number(OTPPin.join(""));
  const user = await OTP.findOne({ registration });

  if (!user) {
    return res.status(300).json({
      success: false,
      message: "OTP expired or invalid",
    });
  }

  if (user.otp !== input) {
    return res.status(400).json({
      success: false,
      message: "Incorrect OTP",
    });
  }

  await OTP.deleteOne({ registration });

  return res.json({
    success: true,
    message: "OTP verified successfully",
  });
});

export {verifyOTP}