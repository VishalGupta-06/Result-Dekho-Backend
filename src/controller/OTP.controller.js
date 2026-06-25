import { asyncHandler } from "../util/asyncHandler.js";
import { apiError } from "../util/apiError.js";
import nodemailer from "nodemailer"
import { OTP } from "../model/otp.model.js";
import { User } from "../model/user.model.js";

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

const sendOTP = asyncHandler(async (req, res) => {
  const { registration } = req.body;

  verifyRegistrationNo(registration);

  // console.log("qwert")

  const existedUser = await User.findOne({ registration })

  // console.log("hekk")
    
    if (existedUser?.password) {
        throw new apiError(409, "User allready exist")
    }

  const alreadyHaveOTP = await OTP.findOne({registration});

  if (alreadyHaveOTP) {
  await OTP.deleteOne({ registration });
}
  

  const emailID = registration.toLowerCase() + "@nitjsr.ac.in";

    // console.log(emailID);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const sendOTP = async (email, otp , registration ) => {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Your OTP",
      html: `
      <h2>OTP Verification</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP will expire in 2 minutes.</p>
    `,
    });
    await OTP.create({registration,otp,});
  };

  const otp = Math.floor(100000 + Math.random() * 900000);

  await sendOTP(emailID , otp , registration);

  return res.json({
    success: true,
    message: "OTP sent successfully",
  });


});

export { sendOTP };
