const mongoose = require('mongoose');

const SuperAdminSchema = new mongoose.Schema({
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
        enum: ['superadmin'], // Fixed role
        default: 'superadmin'
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('SuperAdmin', SuperAdminSchema);
