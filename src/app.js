import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app = express()

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials:true
}))


app.use(express.json())
app.use(express.urlencoded({ extended: true , limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//route import 
import router from "./router/user.router.js"
import { router1 } from "./router/google.router.js"

//SignUp
app.use("/api" , router);

//Google login
app.use("/auth" , router1)


app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Something went wrong",
    errors: err.errors || [],
  });
});



export { app }