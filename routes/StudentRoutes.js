const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../modals/Student');
const Course = require('../modals/Course');
const Query = require('../modals/Query');
const Notification = require('../modals/Notification');
const Result = require('../modals/Result');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;  // Use a secure secret in production

// Route: Register a student
router.post('/register', async (req, res) => {
    const { name, email, password ,age,gender,role} = req.body;

    const studentExists = await Student.findOne({ email });
    if (studentExists) {
        return res.status(400).json({ message: 'Student already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newStudent = new Student({
        role,
        name,
        email,
        password: hashedPassword,
        age,
        gender
    });

    try {
        await newStudent.save();
        res.status(201).json({ message: 'Student registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Route: Login a student
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the student by email
        const student = await Student.findOne({ email });
        if (!student) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: student._id }, JWT_SECRET, { expiresIn: '1h' });

        // Include role in the response
        const role = student.role; // Assuming the 'role' field exists in the Student schema
        const studentId = student._id;

        // Send token and role back to client
        res.status(200).json({ message: 'Logged in successfully', token, role,studentId });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


// Route: Get student details by ID
router.get('/student/:studentId', async (req, res) => {
    const { studentId } = req.params;

    try {
        // Find the student by ID
        const student = await Student.findById(studentId).select('-password'); // Exclude password from response
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Return the student details
        res.status(200).json(student);
    } catch (error) {
        console.error('Error fetching student details:', error);
        res.status(500).json({ message: 'Server error' });
    }
});



// Route: Enroll in a course
router.post('/enroll-course', async (req, res) => {
    const { studentId, courseId } = req.body;

    try {
        // Find the course
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Find the student
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Check if the student is already enrolled in the course
        if (course.studentsEnrolled.includes(studentId)) {
            return res.status(400).json({ message: 'Student is already enrolled in this course' });
        }

        // Add the student to the course's enrolled students list
        course.studentsEnrolled.push(studentId);
        await course.save();

        // Add the course to the student's enrolled courses list
        student.enrolledCourses.push(courseId);
        await student.save();

        // Create a new notification for course enrollment
        const newNotification = new Notification({
            studentId: studentId,
            type: 'Enrollment',
            message: `${student.name} has enrolled in the course: ${course.title}`
        });
        await newNotification.save();

        res.status(200).json({ message: 'Enrolled in course successfully' });
    } catch (error) {
        console.error('Error enrolling student in course:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route: Get results for a logged-in student
router.get('/results/:studentId', async (req, res) => {
    const { studentId } = req.params;

    try {
        // Find the student's results
        const results = await Result.find({ studentId }).populate('courseId', 'title');
        if (!results || results.length === 0) {
            return res.status(404).json({ message: 'No results found for this student' });
        }

        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching results:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route: View fees for a student
router.get('/fees/:studentId', async (req, res) => {
    const { studentId } = req.params;

    try {
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json({
            
            remainingFees: student.remainingFees
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});



router.post('/submit-query', async (req, res) => {
    const { studentId, message } = req.body;
    
    console.log(req.body); // Check if studentId is actually being sent to the backend
    const student = await Student.findById(studentId);
    if (!studentId) {
        return res.status(400).json({ error: 'StudentId is required' });
    }
    

    const newQuery = new Query({
        studentId,
        studentName: student.name,
        message
    });

    await newQuery.save();

    
    const newNotification = new Notification({
        studentId: studentId,
        type: 'Query Submission',
        message: `${student.name} has submitted a new query: "${message}"`
    });
    await newNotification.save();

    res.status(201).json({ message: 'Query submitted successfully' });
});

// Route: Get all students
router.get('/students', async (req, res) => {
    try {
        // Fetch all students
        const students = await Student.find().select('-password'); // Exclude passwords
        res.status(200).json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route: Update a student by ID
router.put('/student/:studentId', async (req, res) => {
    const { studentId } = req.params;
    const { name, email, age, gender, enrolledCourses, totalFees, paidFees, remainingFees, role } = req.body;

    try {
        // Find and update the student
        const updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            {
                name,
                email,
                age,
                gender,
                enrolledCourses,
                totalFees,
                paidFees,
                remainingFees,
                role
            },
            { new: true, runValidators: true } // Return updated student and run schema validation
        );

        if (!updatedStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json({ message: 'Student updated successfully', updatedStudent });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route: Delete a student by ID
router.delete('/student/:studentId', async (req, res) => {
    const { studentId } = req.params;

    try {
        // Find and delete the student
        const deletedStudent = await Student.findByIdAndDelete(studentId);

        if (!deletedStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ message: 'Server error' });
    }
});




module.exports = router;
