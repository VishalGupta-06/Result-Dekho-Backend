import { Profile } from "../src/model/profile.model.js";
// import { asyncHandler } from "../src/util/asyncHandler";

const defactDataRollNo = [];

async function filterData() {
  const data = await Profile.find({}).select("-_id -__v");

  console.log(data.length);

  for (let i = 0; i < data.length; i++) {
    if (data[i].batch === 2023 && data[i].marks.length !== 6) {
      defactDataRollNo.push(data[i].studentID);
    }
    if (data[i].batch === 2024 && data[i].marks.length !== 4) {
      defactDataRollNo.push(data[i].studentID);
    }
  }

//   console.log(defactDataRollNo);

  const result = await Profile.deleteMany({
    studentID: { $in: defactDataRollNo },
  });

  console.log(`Deleted ${result.deletedCount} documents`);
}

export default filterData;
