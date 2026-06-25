import ExcelJS from "exceljs";
import { Profile } from "../src/model/profile.model.js";
import fs from "fs";
import path from "path";

async function storeToDatabase() {
  const folderPath = "./document/excelData";

  if (
    !fs.existsSync(folderPath) ||
    !fs.statSync(folderPath).isDirectory()
  ) {
    throw new Error("Folder of processed Data not found");
  }

  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    const excelFile = path.join(folderPath, file);

    await storeDatatoDatabaeFromExcel(excelFile);
  }

  console.log("Excel Files Uploaded Successfully");
}

async function storeDatatoDatabaeFromExcel(excelFile = "") {
  const workbook = new ExcelJS.Workbook();

  await workbook.xlsx.readFile(excelFile);

  for (let i = 1; i <= workbook.worksheets.length; i++) {
    const worksheet = workbook.getWorksheet(i);

    let headers = [];
    let credits = [];

    const operations = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        headers = row.values;
        return;
      }

      if (rowNumber === 2) {
        credits = row.values;
        return;
      }

      const data = {};

      row.eachCell((cell, colNumber) => {
        const key = headers[colNumber];

        data[key] = cell.value;
      });

      const fixedColumns = [
        "name",
        "rollNo",
        "branch",
        "CGPA",
        "SGPA",
        "result",
        "batch",
        "sem",
      ];

      const subjects = [];

      let creditIndex = 9;

      for (const key in data) {
        if (!fixedColumns.includes(key)) {
          subjects.push({
            subject: key || "",

            credit: Number(
              credits[creditIndex++] || 0
            ),

            score: String(
              data[key] || ""
            ),
          });
        }
      }

      const semester = Number(
        String(data.sem).replace(/[^\d]/g, "")
      );

      const studentID = String(
        data.rollNo
      ).trim();

      const commonFields = {
        studentID,

        name: data.name,

        branchFullName: data.branch,

        batch: Number(data.batch),

        branch: String(
          data.rollNo
        ).slice(6, 8),

        course: String(
          data.rollNo
        ).slice(4, 6),

        rollNo: Number(
          String(data.rollNo).slice(
            8,
            11
          )
        ),
      };

      const semesterData = {
        semester,

        sgpa: Number(data.SGPA),

        cgpa: Number(data.CGPA),

        result: data.result,

        subjects,
      };

      /*
        STEP 1:
        Create student if not exists
      */

      operations.push({
        updateOne: {
          filter: {
            studentID,
          },

          update: {
            $setOnInsert: {
              ...commonFields,

              marks: [],
            },
          },

          upsert: true,
        },
      });

      /*
        STEP 2:
        Update semester if exists
      */

      operations.push({
        updateOne: {
          filter: {
            studentID,

            "marks.semester":
              semester,
          },

          update: {
            $set: {
              ...commonFields,

              "marks.$":
                semesterData,
            },
          },
        },
      });

      /*
        STEP 3:
        Push semester if not exists
      */

      operations.push({
        updateOne: {
          filter: {
            studentID,

            "marks.semester": {
              $ne: semester,
            },
          },

          update: {
            $push: {
              marks:
                semesterData,
            },
          },
        },
      });
    });

    if (operations.length) {
      await Profile.bulkWrite(
        operations,
        {
          ordered: false,
        }
      );
    }

    console.log(
      `Worksheet ${i} Imported`
    );
  }

  console.log(
    "Excel Imported Successfully"
  );
}

export default storeToDatabase;