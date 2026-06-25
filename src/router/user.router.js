import { Router } from "express"
import { registerUser } from "../controller/user.controller.js"
import { upload } from "../middleware/multer.middleware.js"
import { userLogIn , userLogOut} from "../controller/log.controller.js"
import { verifyJWT } from "../middleware/verifyUser.middleware.js"
import { dashboard } from "../controller/dashboard.controller.js"
import { searchbox } from "../controller/searchbox.controller.js"
import {sendOTP } from "../controller/OTP.controller.js"
import { verifyOTP } from "../controller/verifyOTP.controller.js"
import { currentUser } from "../controller/currentUser.controller.js"
import { home } from "../controller/home.controller.js"

const router = Router()


router.route("/login").post(userLogIn)
router.route("/signup").post(sendOTP);
router.route("/signout").post( verifyJWT , userLogOut);
router.route("/finalSignUp").post(registerUser);
router.route("/OTP-verify").post(verifyOTP);
router.route("/dashboard").post(dashboard)
router.route("/searchbox").post(searchbox)
router.route("/current-user").post(verifyJWT , currentUser)
router.route("/home").post(verifyJWT , home)

export default router