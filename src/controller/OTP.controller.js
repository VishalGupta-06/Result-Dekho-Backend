import { asyncHandler } from "../util/asyncHandler.js";
import { apiError } from "../util/apiError.js";
import { OTP } from "../model/otp.model.js";
import { User } from "../model/user.model.js";
import { BrevoClient } from "@getbrevo/brevo";

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

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
    isNaN(roll) ||
    roll > 120 ||
    !branch.includes(brch) ||
    !course.includes(cus) ||
    isNaN(year) ||
    !batch.includes(year)
  ) {
    throw new apiError(409, "Please enter valid Registration Number");
  }
};

const sendOTP = asyncHandler(async (req, res) => {
  const { registration } = req.body;

  verifyRegistrationNo(registration);

  const existedUser = await User.findOne({ registration });

  if (existedUser?.password) {
    throw new apiError(409, "User allready exist");
  }

  const alreadyHaveOTP = await OTP.findOne({ registration });

  if (alreadyHaveOTP) {
    await OTP.deleteOne({ registration });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);
  const emailID = registration.toLowerCase() + "@nitjsr.ac.in";

  const sendOtpEmail = async (email, otp, registration) => {
    await brevo.transactionalEmails.sendTransacEmail({
      sender: {
        name: "Result Dekho",
        email: process.env.EMAIL,
      },
      to: [
        {
          email: email,
        },
      ],
      subject: "OTP for Result Dekho",
      htmlContent: `
    <h2>OTP Verification</h2>
    <h1>${otp}</h1>
    <p>This OTP will expire in 5 minutes.</p>
  `,
    });

    await OTP.create({ registration, otp });
  };

  await sendOtpEmail(emailID, otp, registration);

  return res.json({
    success: true,
    message: "OTP sent successfully",
  });
});

export { sendOTP };
