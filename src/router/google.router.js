import express from "express"
import passport from "passport"
import { googleCallback } from "../controller/googleCallback.controller.js"

const router1 = express.Router()

router1.route("/google").get(passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" }))
router1.route("/google/callback").get(passport.authenticate("google", { session: false }), googleCallback)


export { router1 }