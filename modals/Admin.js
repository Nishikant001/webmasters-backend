const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
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
    role: {
        type: String,
        enum: ['student', 'admin', 'superadmin'], // Define possible roles
        default: 'admin' // Set default role as 'student'
    }
}, { timestamps: true });

module.exports = mongoose.model('Admin', AdminSchema);
