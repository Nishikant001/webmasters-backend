const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../modals/Admin');
const Student = require('../modals/Student');
const Course = require('../modals/Course');
const Query = require('../modals/Query');
const Notification = require('../modals/Notification');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;  // Use a secure secret in production

// Admin Authentication routes...

// Route: Create a new student account (Admin)
router.post('/students', async (req, res) => {
    const { name, email, password } = req.body;

    const studentExists = await Student.findOne({ email });
    if (studentExists) {
        return res.status(400).json({ message: 'Student already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newStudent = new Student({
        name,
        email,
        password: hashedPassword
    });

    try {
        await newStudent.save();
        res.status(201).json({ message: 'Student account created successfully', student: newStudent });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Route: Get all students
router.get('/students', async (req, res) => {
    const students = await Student.find();
    res.status(200).json(students);
});

// Route: Update a student's account
router.put('/students/:studentId', async (req, res) => {
    const { studentId } = req.params;
    const { name, email, password } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
        return res.status(404).json({ message: 'Student not found' });
    }

    student.name = name || student.name;
    student.email = email || student.email;

    if (password) {
        const salt = await bcrypt.genSalt(10);
        student.password = await bcrypt.hash(password, salt);
    }

    await student.save();
    res.status(200).json({ message: 'Student updated successfully', student });
});

// Route: Delete a student account
router.delete('/students/:studentId', async (req, res) => {
    const { studentId } = req.params;

    const student = await Student.findByIdAndDelete(studentId);
    if (!student) {
        return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({ message: 'Student account deleted successfully' });
});

// Route: Get all notifications
router.get('/notifications', async (req, res) => {
    const notifications = await Notification.find().populate('studentId', 'name email').sort({ createdAt: -1 });
    res.status(200).json(notifications);
});

// Route: Mark notification as read
router.put('/notifications/:notificationId/read', async (req, res) => {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ message: 'Notification marked as read' });
});

// Route: Admin posts exam results for a student
router.post('/post-result', async (req, res) => {
    const { studentId, courseId, marksObtained, totalMarks, grade } = req.body;

    try {
        const student = await Student.findById(studentId);
        const course = await Course.findById(courseId);

        if (!student || !course) {
            return res.status(404).json({ message: 'Student or course not found' });
        }

        const newResult = new Result({
            studentId,
            courseId,
            marksObtained,
            totalMarks,
            grade
        });

        await newResult.save();

        res.status(201).json({ message: 'Result posted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Route: Mark admin's own attendance
router.post('/admin/attendance', async (req, res) => {
    const { adminId, status } = req.body;

    try {
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Mark attendance for the admin
        const attendance = new Attendance({
            userId: adminId,
            userType: 'Admin',
            status
        });
        await attendance.save();

        res.status(201).json({ message: 'Admin attendance marked successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Route: Mark student attendance
router.post('/student/attendance', async (req, res) => {
    const { studentId, status } = req.body;

    try {
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Mark attendance for the student
        const attendance = new Attendance({
            userId: studentId,
            userType: 'Student',
            status
        });
        await attendance.save();

        res.status(201).json({ message: 'Student attendance marked successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Route: View admin's own attendance
router.get('/admin/attendance/:adminId', async (req, res) => {
    const { adminId } = req.params;

    try {
        const attendanceRecords = await Attendance.find({ userId: adminId, userType: 'Admin' });
        res.status(200).json(attendanceRecords);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Route: View student's attendance
router.get('/student/attendance/:studentId', async (req, res) => {
    const { studentId } = req.params;

    try {
        const attendanceRecords = await Attendance.find({ userId: studentId, userType: 'Student' });
        res.status(200).json(attendanceRecords);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


// Route: Admin Signup
router.post('/admin/signup', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if admin already exists
        const adminExists = await Admin.findOne({ email });
        if (adminExists) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new admin
        const newAdmin = new Admin({
            name,
            email,
            password: hashedPassword,
            role: 'admin' // Default role as admin
        });

        await newAdmin.save();

        // Generate JWT
        const token = jwt.sign({ id: newAdmin._id, role: newAdmin.role }, JWT_SECRET, {
            expiresIn: '1h' // Token expiry time
        });

        res.status(201).json({
            message: 'Admin account created successfully',
            token,
            admin: { id: newAdmin._id, name: newAdmin.name, email: newAdmin.email }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


// Route: Admin Login
router.post('/admin/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if admin exists
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign({ id: admin._id, role: admin.role }, JWT_SECRET, {
            expiresIn: '1h'
        });
        // Include role in the response
        const role = admin.role;
        const joining=admin.createdAt // Assuming the 'role' field exists in the Student schema
      

        res.status(200).json({
            message: 'Logged in successfully',
            token,
            admin: { id: admin._id, name: admin.name, email: admin.email,role,joining }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
// Route: Get admin by ID
router.get('/admin/:adminId', async (req, res) => {
    const { adminId } = req.params;

    try {
        // Find the admin by ID
        const admin = await Admin.findById(adminId).select('-password'); // Exclude password from the result
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Route: Update admin details
router.put('/admin/:adminId', async (req, res) => {
    const { adminId } = req.params;
    const { name, email, password } = req.body;

    try {
        // Find the admin by ID
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Update fields if provided
        admin.name = name || admin.name;
        admin.email = email || admin.email;

        // If password is provided, hash it before saving
        if (password) {
            const salt = await bcrypt.genSalt(10);
            admin.password = await bcrypt.hash(password, salt);
        }

        // Save the updated admin
        await admin.save();

        res.status(200).json({ message: 'Admin updated successfully', admin });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});




module.exports = router;
