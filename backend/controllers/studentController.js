import studentModel from '../models/studentModel.js';

export const getStudents = async (req, res) => {
  try {
    const students = await studentModel.find({});
    res.json({ success: true, students });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};