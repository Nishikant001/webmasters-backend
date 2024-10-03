const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    // New field for storing enrolled courses
    enrolledCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'  // Reference to the Course model
    }],
     // New fields for fee management
     totalFees: {
        type: Number,
        required: true,
        default: 0 // Set a default value
    },
    paidFees: {
        type: Number,
        required: true,
        default: 0 // Set a default value
    },
    remainingFees: {
        type: Number,
        required: true,
        default: 0 // Set a default value
    },
    role: {
        type: String,
        enum: ['student', 'admin', 'superadmin'], // Define possible roles
        default: 'student' // Set default role as 'student'
    }
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);
