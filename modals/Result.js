const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    studentName: {
        type: String,
        required: true
    },
    marksObtained: {
        type: Number,
        required: true
    },
    totalMarks: {
        type: Number,
        required: true
    },
    grade: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pass', 'Fail'], // Pass or Fail status based on the result
        required: true
    },
    comments: {
        type: String,
        default: '' // Optional field for any additional comments or notes
    }
}, { timestamps: true });

module.exports = mongoose.model('Result', ResultSchema);
