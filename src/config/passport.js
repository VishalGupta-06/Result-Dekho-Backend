import passport from "passport";
import { googleLogin } from "../middleware/googleLogin.middleware.js";

googleLogin(passport);