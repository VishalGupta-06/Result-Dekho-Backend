import mongoose, { Schema } from "mongoose";

const subjectSchema = new Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
    },

    credit: {
      type: Number,
      required: true,
    },

    score: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const semesterSchema = new Schema(
  {
    semester: {
      type: Number,
      required: true,
    },

    sgpa: {
      type: Number,
      required: true,
    },

    cgpa: {
      type: Number,
      required: true,
    },

    result: {
      type: String,
      required: true,
      trim: true,
    },

    subjects: {
      type: [subjectSchema],
      default: [],
    },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    studentID: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    batch: {
      type: Number,
      required: true,
    },

    branchFullName: {
      type: String,
      required: true,
    },

    branch: {
      type: String,
      required: true,
    },

    course: {
      type: String,
      required: true,
    },

    rollNo: {
      type: Number,
      required: true,
    },

    marks: {
      type: [semesterSchema],
      default: [],
    },
  },
  { timestamps: false },
);

export const Profile = mongoose.model("Profile", userSchema);
