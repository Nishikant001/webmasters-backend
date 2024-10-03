const express = require('express');
const router = express.Router();
const Course = require('../modals/Course'); // Assuming the model is in the 'models' folder

// Create a new course
router.post('/create', async (req, res) => {
    const { title, description, studentsEnrolled } = req.body;

    try {
        const newCourse = new Course({
            title,
            description,
            studentsEnrolled
           
        });

        const savedCourse = await newCourse.save();
        res.status(201).json(savedCourse);
    } catch (error) {
        res.status(400).json({ message: 'Error creating course', error });
    }
});

// Read all courses
router.get('/', async (req, res) => {
    try {
        const courses = await Course.find().populate('studentsEnrolled');
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching courses', error });
    }
});

// Read a specific course by ID
router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('studentsEnrolled');
        if (!course) return res.status(404).json({ message: 'Course not found' });

        res.status(200).json(course);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching course', error });
    }
});

// Update a course
router.put('/:id', async (req, res) => {
    const { title, description, studentsEnrolled, startDate, endDate } = req.body;

    try {
        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id,
            { title, description, studentsEnrolled, startDate, endDate },
            { new: true }
        );

        if (!updatedCourse) return res.status(404).json({ message: 'Course not found' });

        res.status(200).json(updatedCourse);
    } catch (error) {
        res.status(400).json({ message: 'Error updating course', error });
    }
});

// Delete a course
router.delete('/:id', async (req, res) => {
    try {
        const deletedCourse = await Course.findByIdAndDelete(req.params.id);

        if (!deletedCourse) return res.status(404).json({ message: 'Course not found' });

        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting course', error });
    }
});

module.exports = router;
