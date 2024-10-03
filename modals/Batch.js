const mongoose = require('mongoose');

const BatchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  course: { type: String, required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' },{ timestamps: true }],
});

module.exports = mongoose.model('Batch', BatchSchema);
