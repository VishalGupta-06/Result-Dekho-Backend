import fs from 'fs';
// import pdfUse from 'pdf-parse';
import pdfUse from 'pdf-parse/lib/pdf-parse.js';
import exceljs from 'exceljs';
import path from 'path';
import { Profile } from '../src/model/profile.model.js'
import { apiError } from '../src/util/apiError.js';

function pdfToExcel() {


    async function main() {
        const folderPath = './document/processData'

        if (!fs.statSync(folderPath).isDirectory()) {
            throw new apiError(400, "Folder of processed Data not found");
        }

        const folder = fs.readdirSync(folderPath);


        for (let i = 0; i < folder.length; i++) {

            const yearFolder = path.join(folderPath, folder[i]);

            if (!fs.statSync(yearFolder).isDirectory()) {
                throw new apiError(400, "Folder of year not found");
            }

            const innerFolder = fs.readdirSync(yearFolder);

            for (let j = 0; j < innerFolder.length; j++) {

                const semFolder = path.join(yearFolder, innerFolder[j]);

                if (!fs.statSync(semFolder).isDirectory()) {
                    throw new apiError(400, "Folder of sem not found");
                }

                // console.log(semFolder);

                const info = [];

                const files = fs.readdirSync(semFolder)
                    .filter(file => path.extname(file) === '.pdf');

                if (files.length < 1) continue;

                for (const file of files) {
                    // console.log("Hello");
                    const studentData = await dataCollect(file);
                    info.push(studentData);
                }

                // console.log(info)

                // const format = await formatForMongoDB(info)
                // await storeExcelDataInMongoDB(format)
                await createExcel(info, semFolder)

                console.log("Excel Work is COMPLETED.............")


                async function dataCollect(file) {

                    const fin = path.join(semFolder, file);
                    const dataRead = fs.readFileSync(fin);
                    const data = await pdfUse(dataRead);
                    const text = data.text;
                    // console.log(text)
                    const [arr, _, semester] = filterData(text);
                    // console.log(arr);

                    let st = 0, ed = 0;
                    let name, rollNo, session, branch, cgpa, sgpa, result, batch;

                    for (let i = 0; i < arr.length; i++) {


                        if (arr[i] == ":Name") {
                            name = arr[i - 1];
                            rollNo = arr[i - 2];
                            session = arr[i - 3];
                            batch = rollNo.slice(0, 4);
                        }

                        if (arr[i] == "GRADE CARD") {
                            branch = arr[i + 1];
                            st = i + 2;
                        }

                        if (arr[i] == ":CGPASGPA:Result:") {
                            ed = i - 1;
                            cgpa = arr[arr.length - 6] || "";
                            sgpa = arr[arr.length - 5].slice(0, 4) || "";
                            result = arr[arr.length - 5].slice(4, 9) || "";
                            break;
                        }
                    }

                    let sub = [];

                    for (; st <= ed; st++) {
                        let str = arr[st];

                        if (str[1] == 'B') {
                            sub.push({
                                // sNo: str[3] || "",
                                code: str.slice(4, 10) || "",
                                subject: (str.slice(10, str.length - 2) || "").replace(/\s+/g, " ").trim(),
                                credit: str[str.length - 1] || "",
                                score: str.slice(0, 3) || ""
                            });
                        }

                        else if (/^[0-9]$/.test(str[2])) {
                            sub.push({
                                // sNo: str.slice(1, 3) || "",
                                code: str.slice(3, 9) || "",
                                subject: (str.slice(9, str.length - 2) || "").replace(/\s+/g, " ").trim(),
                                credit: str[str.length - 1] || "",
                                score: str[0] || ""
                            });
                        } else {
                            sub.push({
                                // sNo: str[1] || "",
                                code: str.slice(2, 8) || "",
                                subject: (str.slice(8, str.length - 2) || "").replace(/\s+/g, " ").trim(),
                                credit: str[str.length - 1] || "",
                                score: str[0] || ""
                            });
                        }
                    }

                    return {
                        Name: name,
                        rollNo: rollNo,
                        session: session,
                        branch: branch.replace(/\s+/g, " ").trim(),
                        CGPA: cgpa,
                        SGPA: sgpa,
                        result: result,
                        batch: batch,
                        Sem: semester,
                        subject: sub
                    };
                }

            }

        }
    }
    main();

    function filterData(text) {

        const arr = text.split('\n').map(l => l.trim()).filter(l => l !== '');

        const mp = new Map();
        const sem = ["FIRST", "SECOND", "THIRD", "FOURTH", "FIFTH", "SIXTH", "SEVENTH", "EIGHTH"]

        for (let i = 0; i < arr.length; i++) {
            mp.set(sem[i], "sem" + (i + 1));
        }

        // console.log(arr)
        // console.log(arr.length)

        let idx = 0;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] == ':') {
                idx = i;
                break;
            }
        }
        arr.splice(0, idx + 1)
        arr.splice(2, 2)

        let str = arr[8].split(" ")
        let pos = 0;
        for (let i = 0; i < str.length; i++) {
            if (str[i] == "-") {
                pos = i + 1;
                break;
            }

        }
        let semester = mp.get(str[pos]);
        let rollNo = arr[0];

        // console.log(rollNo)
        // console.log(arr.length)
        // console.log(semester)

        return [arr, rollNo, semester]
    }

    async function createExcel(info, semFolder) {

        const workbook = new exceljs.Workbook();

        for (let i = 0; i < info.length; i++) {


            const sheetName = String(info[i].branch).substring(0,31);
            let sheet1 = workbook.getWorksheet(sheetName);

            if (!sheet1) {

                // console.log(sheetName)

                const head = ['name', 'rollNo', 'branch', 'CGPA', 'SGPA', 'result', 'batch', 'sem'];
                const credit = ["", "", "", "", "", "", "", ""];
                for (let k = 0; k < info[i].subject.length; k++) {
                    head.push(info[i].subject[k].subject)
                    credit.push(Number(info[i].subject[k].credit))

                }

                sheet1 = workbook.addWorksheet(sheetName);
                sheet1.addRow(head);
                sheet1.addRow(credit)

            }

            const doc = [info[i].Name, info[i].rollNo,info[i].branch, Number(info[i].CGPA), Number(info[i].SGPA), info[i].result, Number(info[i].batch), info[i].Sem];

            for (let j = 0; j < info[i].subject.length; j++) {
                doc.push(info[i].subject[j].score)
            }
            sheet1.addRow(doc);

        }


        // const fileName = info[0].batch + "_" + info[0].Sem + ".xlsx";
        // const filePath = path.join(semFolder, fileName);


        // if (!fs.existsSync(filePath)) {
        //     fs.mkdirSync(filePath, { recursive: true });
        // }

        // await workbook.xlsx.writeFile(filePath);

        const folderPath = "./document/excelData";
        const fileName1 = info[0].batch + "_" + info[0].Sem + ".xlsx";
        const filePath1 = path.join(folderPath, fileName1);

        await workbook.xlsx.writeFile(filePath1);

        console.log(`Excel file is Created. FileName: ${fileName1}`);

    }

    async function formatForMongoDB(jsonFile) {

        const users = [];

        for (let i = 0; i < jsonFile.length; i++) {

            const student = jsonFile[i];
            const semKey = student.Sem;
            const subjects = student.subject;

            const userData = {
                _id: String(student.rollNo).toUpperCase().trim(),

                name: String(student.Name).toUpperCase().trim(),

                branch: String(student.branch).trim(),

                batch: Number(student.batch),

                marks: {
                    [semKey]: {
                        SGPA: Number(student.SGPA),
                        CGPA: Number(student.CGPA),
                        result: String(student.result).toUpperCase().trim(),
                        subjects: subjects
                    }
                }
            };
            users.push(userData);
        }
        return users;
    }

    async function storeExcelDataInMongoDB(filePath) {
        try {

            for (let i = 0; i < filePath.length; i++) {
                const student = filePath[i];
                console.log(student);

                const semKey = Object.keys(student.marks)[0];


                const updateData = {
                    [`marks.${semKey}`]: student.marks[semKey]
                };

                const existedUser = await Profile.findById(student._id);

                if (!existedUser) {
                    updateData.name = student.name;
                    updateData.branch = student.branch;
                    updateData.batch = student.batch;
                }

                await Profile.findByIdAndUpdate(
                    student._id,
                    {
                        $set: updateData
                    },
                    {
                        upsert: true,
                        returnDocument: "after"
                    }

                );

            }

            console.log("Excel data stored successfully in MongoDB");

        } catch (error) {
            console.log("Error while storing Excel data:", error);
        }
    }


}


export default pdfToExcel;