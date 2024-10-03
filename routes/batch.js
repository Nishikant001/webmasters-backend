const express = require('express');
const router = express.Router();
const Batch = require('../modals/Batch');
const Student = require('../modals/Student');

// Route: Create a new batch
router.post('/batch', async (req, res) => {
    const { name, course, studentIds } = req.body;

    try {
        // Create a new batch with the provided data
        const newBatch = new Batch({
            name,
            course,
            students: studentIds
        });

        // Save the new batch to the database
        await newBatch.save();

        res.status(201).json({ message: 'Batch created successfully', batch: newBatch });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Route: Get all batches
router.get('/batches', async (req, res) => {
    try {
        const batches = await Batch.find().populate('students', 'name email');
        res.status(200).json(batches);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Route: Get batch details by ID
router.get('/batch/:batchId', async (req, res) => {
    const { batchId } = req.params; // Get batchId from request parameters

    try {
        // Find the batch by ID and populate students with their name and email
        const batch = await Batch.findById(batchId).populate('students', 'name email');
        if (!batch) {
            return res.status(404).json({ message: 'Batch not found' });
        }

        res.status(200).json(batch); // Return the batch details
    } catch (error) {
        console.error('Error fetching batch details:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});



module.exports = router;
