const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    studentsEnrolled: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
   
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);
