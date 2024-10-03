const express = require('express');
const Attendance = require('../modals/Attendance');
const Batch = require('../modals/Batch');
const Student = require('../modals/Student');

const router = express.Router();

// Route: Get all batches
router.get('/batches', async (req, res) => {
  try {
    const batches = await Batch.find().populate('students');
    res.status(200).json(batches);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching batches', error });
  }
});

// Route: Submit attendance for a batch
router.post('/attendance', async (req, res) => {
    const { batchId, date, attendance } = req.body;
  
    try {
      // Find the batch by ID and populate the students
      const batch = await Batch.findById(batchId).populate('students');
      if (!batch) {
        return res.status(404).json({ message: 'Batch not found' });
      }
  
      // Map over the students and create attendance records including student name
      const attendanceRecords = batch.students.map((student) => ({
        studentId: student._id,
        studentName: student.name, // Include student name in the record
        batchId: batch._id,
        date: new Date(date),
        status: attendance[student.name] || 'Absent', // Use the provided attendance status or mark as 'Absent'
      }));
  
      // Insert the attendance records into the Attendance collection
      await Attendance.insertMany(attendanceRecords);
  
      res.status(201).json({ message: 'Attendance submitted successfully', attendanceRecords });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  });
  

// Route: Get attendance for a specific student
router.get('/attendance/student/:studentId', async (req, res) => {
  const { studentId } = req.params;

  try {
    const attendanceRecords = await Attendance.find({ studentId }).populate('batchId');
    res.status(200).json(attendanceRecords);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance records', error });
  }
});

// Route: Get attendance for a specific batch
router.get('/attendance/batch/:batchId', async (req, res) => {
  const { batchId } = req.params;

  try {
    const attendanceRecords = await Attendance.find({ batchId }).populate('studentId');
    res.status(200).json(attendanceRecords);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance records', error });
  }
});

module.exports = router;
