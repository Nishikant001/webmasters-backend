require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');  // Don't forget to import bcrypt

// Initialize the app
const app = express();

// Middleware
app.use(bodyParser.json());  // Parse incoming JSON requests
app.use(cors());

// MongoDB connection using environment variable
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("MongoDB Connected");
    createDefaultSuperAdmin();  // Call the function to create Super Admin
}).catch((err) => console.log(err));

// Import SuperAdmin Model (Make sure it's defined correctly)
const SuperAdmin = require('./modals/SuperAdmin');

// Function to create a default SuperAdmin if one does not exist
const createDefaultSuperAdmin = async () => {
    try {
        const superAdminExists = await SuperAdmin.findOne({ role: 'superadmin' });
        if (!superAdminExists) {
            const hashedPassword = await bcrypt.hash(process.env.SUPERADMIN_PASSWORD, 10);

            const superAdmin = new SuperAdmin({
                name: process.env.SUPERADMIN_NAME,
                email: process.env.SUPERADMIN_EMAIL,
                password: hashedPassword,
                role: 'superadmin'  // Ensure that role is defined
            });

            await superAdmin.save();
            console.log('Default Super Admin created successfully');
        } else {
            console.log('Super Admin already exists');
        }
    } catch (error) {
        console.error('Error creating default super admin:', error);
    }
};

// Import routes
const studentRoutes = require('./routes/StudentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const batchRoutes = require('./routes/batch');
const resultsRoutes = require('./routes/resultRoutes');
const courseRoutes = require('./routes/courseRoutes');

// Use routes
app.use('/students', studentRoutes);
app.use('/admin', adminRoutes);
app.use('/attendance', attendanceRoutes);  // Fixed typo to /attendance
app.use('/batch', batchRoutes);  // Changed path to /batch for batch routes
app.use('/results', resultsRoutes);  // Changed path to /batch for batch routes
app.use('/course', courseRoutes);  // Changed path to /course for batch routes

// Start the server on the port defined in the environment variable
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
