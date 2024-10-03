const express = require('express');
const router = express.Router();
const Result = require('../modals/Result');
const Student = require('../modals/Student');

// Route: Admin posts exam results for a student
router.post('/results', async (req, res) => {
    const { studentId, marksObtained, totalMarks, grade, status, comments } = req.body;

    try {
        // Fetch the student and their name from the database
        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Create a new result with student name
        const newResult = new Result({
            studentId,
            studentName: student.name, // Automatically set the student name
            marksObtained,
            totalMarks,
            grade,
            status,
            comments
        });

        // Save the result to the database
        await newResult.save();

        res.status(201).json({ message: 'Result posted successfully', result: newResult });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


// Route: Get all results by studentId
router.get('/results/:studentId', async (req, res) => {
    const { studentId } = req.params;

    try {
        // Find all results for the given studentId
        const results = await Result.find({ studentId });

        if (results.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;
