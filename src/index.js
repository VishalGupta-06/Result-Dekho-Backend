// import dotenv from "dotenv"
// dotenv.config({
//     path: './.env'
// })                                        //It is not working

import "dotenv/config";
import connectDB from "./db/index.js"
import { app } from "./app.js"

import "./config/passport.js"
import pdfToExcel from "../admin/pdfToExcel&DB.js"
import filterPdf from "../admin/filterPdf.js";
import storeToDatabase from "../admin/exceltoDB.js"
import filterData from "../admin/filterData.js";

const PORT = process.env.PORT || 8000

connectDB()
.then( ()=>{
    app.listen(PORT, () =>{
        console.log( ` Server is connected on ${PORT} `)
        // pdfToExcel();
        // storeToDatabase();
        // filterData()
    })
})
.catch( (err) =>{
    console.log("MongoDB is connection is failed !!!" , err )
})