import fs from "fs";
import path from "path";
import pdf from "pdf-parse/lib/pdf-parse.js";

// import pdf from "pdf-parse";

async function filterPdf() {
  const storeHere = "./document/processData";

  // Making new folder
  if (!fs.existsSync(storeHere)) {
    fs.mkdirSync(storeHere);
  }

  const createFolder = async (files) => {
    try {
      //Read PDF
      const temp = fs.readFileSync(files);
      const data = await pdf(temp);

      const text = data.text;

      const [arr, rollNo, semester] = filterData(text);
      // console.log(arr)

      if (arr.length <= 13) return;

      const ug_pg = rollNo.slice(4, 6);
      if (ug_pg !== "UG") return;

      // console.log(ug_pg)
      // console.log(rollNo, semester)

      if (!rollNo && !semester) {
        console.log("there is some error with PDF");
        console.log(files);
      }

      let batch = rollNo.slice(0, 4);

      const batchFolder = path.join(storeHere, batch);
      if (!fs.existsSync(batchFolder)) {
        fs.mkdirSync(batchFolder);
      }

      const semFolder = path.join(batchFolder, semester);
      if (!fs.existsSync(semFolder)) {
        fs.mkdirSync(semFolder);
      }

      const oldPath = files;
      const NayaPath = `${rollNo}.pdf`;
      const newPath = path.join(semFolder, NayaPath);

      fs.copyFileSync(oldPath, newPath);

      //   const oldPath = files;
      //   const fileName = path.basename(oldPath);
      //   const newPath = path.join(semFolder, fileName);
      //   fs.copyFileSync(oldPath, newPath);


    } catch (error) {
      console.log(error);
    }
  };

  const files = fs
    .readdirSync("./document/rawData")
    .filter((file) => path.extname(file) === ".pdf");

  for (const file of files) {
    const fullPath = path.join("./document/rawData", file);
    await createFolder(fullPath);
  }

  console.log("Done");

  function filterData(text) {
    const arr = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l !== "");

    // console.log(arr)
    // console.log(arr.length)

    let idx = 0;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] == ":") {
        idx = i;
        break;
      }
    }
    arr.splice(0, idx + 1);
    arr.splice(2, 2);

    let str = arr[8].split(" ");
    let pos = 0;
    for (let i = 0; i < str.length; i++) {
      if (str[i] == "-") {
        pos = i + 1;
        break;
      }
    }
    let semester = str[pos];
    let rollNo = arr[0];

    // console.log(rollNo)
    // console.log(arr.length)
    // console.log(semester)

    return [arr, rollNo, semester];
  }
}

export default filterPdf;
