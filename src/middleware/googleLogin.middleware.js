import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../model/user.model.js";

const googleLogin = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, cb) => {
        try {
          if (!profile.emails[0].value.endsWith("@nitjsr.ac.in")) {
            return cb(
              new Error("Only NIT Jamshedpur emails is allowed"),
              null,
            );
          }

          const registration = profile.emails[0].value.slice(0, 11);
          let user = await User.findOne({ registration });

          if (!user) {
            await User.findOneAndUpdate(
              { registration },
              {
                $set: {
                  googleId: profile.id,
                },
              },
              {
                upsert: true,
                returnDocument: "after",
              },
            );
          }

          return cb(null, user);
        } catch (error) {
          return cb(error, null);
        }
      },
    ),
  );
};

export { googleLogin };
