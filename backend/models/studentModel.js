import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, required: true },
    cohort: {type: String, required: true},
    studentId: {type: Number, required: true},
    major: {type: String, required: true},
    about: { type: String, required:true },
    dob: { type: String, required: true},
    gender: { type: String, required: true},
    address: { type: Object, required: true },
    // date: { type: Number, required: true },
    // slot_booked: { type: Object, default: {} },

},{minimize: false});

// const doctorModel = mongoose.model.doctor || mongoose.model('Doctor', doctorSchema);
const studentModel = mongoose.models.Student || mongoose.model('Student', studentSchema);
export default studentModel 