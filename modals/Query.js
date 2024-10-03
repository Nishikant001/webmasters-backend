const mongoose = require('mongoose');

const QuerySchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    studentName: {
        type: String,
        required: true // Add this field to store the student's name
    },
   
}, { timestamps: true });

module.exports = mongoose.model('Query', QuerySchema);
