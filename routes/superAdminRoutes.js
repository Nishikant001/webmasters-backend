const express = require('express');
const Attendance = require('../modals/Attendance');
const bcrypt = require('bcryptjs');
const Student = require('../modals/Student');
const Admin = require('../modals/Admin');
const Course = require('../modals/Course');
const router = express.Router();

const jwt = require('jsonwebtoken');
const SuperAdmin = require('../modals/SuperAdmin');

// SuperAdmin Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the superadmin by email
        const superAdmin = await SuperAdmin.findOne({ email });

        if (!superAdmin) {
            return res.status(404).json({ message: 'SuperAdmin not found' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, superAdmin.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create and return JWT token (Optional)
        const token = jwt.sign(
            { id: superAdmin._id, role: superAdmin.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});



// Route: Create a new admin (Super Admin only)
router.post('/admin', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const adminExists = await Admin.findOne({ email });
        if (adminExists) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAdmin = new Admin({
            name,
            email,
            password: hashedPassword
        });

        await newAdmin.save();
        res.status(201).json({ message: 'Admin created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Route: Update an admin's details (Super Admin only)
router.put('/admin/:adminId', async (req, res) => {
    const { adminId } = req.params;
    const { name, email, password } = req.body;

    try {
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        admin.name = name || admin.name;
        admin.email = email || admin.email;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            admin.password = await bcrypt.hash(password, salt);
        }

        await admin.save();
        res.status(200).json({ message: 'Admin updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Route: Delete an admin (Super Admin only)
router.delete('/admin/:adminId', async (req, res) => {
    const { adminId } = req.params;

    try {
        const admin = await Admin.findByIdAndDelete(adminId);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        res.status(200).json({ message: 'Admin deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Route: View all admins (Super Admin only)
router.get('/admins', async (req, res) => {
    try {
        const admins = await Admin.find().select('-password');  // Exclude password field
        res.status(200).json(admins);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Route: View all admin attendance
router.get('/attendance/admins', async (req, res) => {
    try {
        const attendanceRecords = await Attendance.find({ userType: 'Admin' }).populate('userId', 'name email');
        res.status(200).json(attendanceRecords);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Route: View all student attendance
router.get('/attendance/students', async (req, res) => {
    try {
        const attendanceRecords = await Attendance.find({ userType: 'Student' }).populate('userId', 'name email');
        res.status(200).json(attendanceRecords);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Route: Create a new course (Super Admin only)
router.post('/course', async (req, res) => {
    const { title, description, startDate, endDate } = req.body;

    try {
        const newCourse = new Course({
            title,
            description,
            startDate,
            endDate
        });

        await newCourse.save();
        res.status(201).json({ message: 'Course created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Route: Update course details (Super Admin only)
router.put('/course/:courseId', async (req, res) => {
    const { courseId } = req.params;
    const { title, description, startDate, endDate } = req.body;

    try {
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        course.title = title || course.title;
        course.description = description || course.description;
        course.startDate = startDate || course.startDate;
        course.endDate = endDate || course.endDate;

        await course.save();
        res.status(200).json({ message: 'Course updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Route: Delete a course (Super Admin only)
router.delete('/course/:courseId', async (req, res) => {
    const { courseId } = req.params;

    try {
        const course = await Course.findByIdAndDelete(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Route: View all courses (Super Admin only)
router.get('/courses', async (req, res) => {
    try {
        const courses = await Course.find();
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Route: Update student's fees (Super Admin only)
router.put('/fees/update', async (req, res) => {
    const { studentId, amountPaid } = req.body;

    try {
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Update fees
        student.paidFees += amountPaid;
        student.remainingFees = student.totalFees - student.paidFees;

        await student.save();

        res.status(200).json({
            message: 'Fees updated successfully',
            paidFees: student.paidFees,
            remainingFees: student.remainingFees
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;
