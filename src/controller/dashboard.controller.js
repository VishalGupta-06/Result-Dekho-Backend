import { asyncHandler } from "../util/asyncHandler.js";
import { Profile } from "../model/profile.model.js";

const dashboard = asyncHandler(async (req, res) => {
  const { branch, year } = req.body;

  // console.log(branch);
  // console.log(sem);
  // console.log(year);

  const branchMap = new Map();

  branchMap.set("CE", "CE");
  branchMap.set("EE", "EE");
  branchMap.set("ECE", "EC");
  branchMap.set("ECM", "CM");
  branchMap.set("CSE", "CS");
  branchMap.set("ME", "ME");
  branchMap.set("MM", "MM");
  branchMap.set("PIE", "PI");

 

  if (!branch) branch = "PIE";
  if (!year) batch = 2024;

  let query = {};

  // console.log( "branch :" ,branchMap.get(branch));
  // console.log("BAtch :" , Number(year));
  // console.log( "Sem :" ,sem.toLowerCase());
  // console.log( "Sem :" ,sem);

  if (branch !== "ALL") {
    query.branch = branchMap.get(branch);
  }
  if (year !== "ALL") {
    query.batch = Number(year);
  }

  const data = await Profile.find(query).select("-_id -__v");

  return res.json(data);
});

export { dashboard };
