// const axios = require("axios");
// const fs = require("fs");
// const path = require("path");

import axios from "axios";
import fs from "fs";
import path from "path";

async function downloadPDF(id, sem) {

    const url =
        `http://192.172.245.90/StudentPortal/commanreport.aspx?pagetitle=gradecarde&path=crptNewGradecard.rpt&param=@P_IDNO=${id},@P_SEMESTERNO=${sem},@P_COLLEGE_CODE=12`;

    try {

        const response = await axios({
            url,
            method: "GET",
            responseType: "stream",
        });

        const location = "F:/Result2";

        if (!fs.existsSync(location)) {
            fs.mkdirSync(location, { recursive: true });
        }

        const newPath = path.join(
            location,
            `result_${id}_sem${sem}.pdf`
        );

        const writer = fs.createWriteStream(newPath);

        response.data.pipe(writer);

        // IMPORTANT
        return new Promise((resolve, reject) => {

            writer.on("finish", () => {
                console.log(`Downloaded: ${id} sem ${sem}`);
                resolve();
            });

            writer.on("error", (err) => {
                console.log(`Error for ${id}:`, err.message);
                reject(err);
            });

        });

    } catch (err) {
        console.log(`Request failed for ${id}:`, err.message);
    }
}

async function main() {

    for (let sem = 2; sem <= 8; sem++) {

        for (let id = 9360; id <= 19770; id++) {

            await downloadPDF(id, sem);

        }
    }

    console.log("All downloads complete");
}

main();