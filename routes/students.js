const express = require('express');
const pool = require('../db');
const router = express.Router();

// Create a new student record
router.post('/', async (req, res) => {
    const { first_name, last_name, date_of_birth, email } = req.body;
    try {
        const newStudent = await pool.query(
            'INSERT INTO students (first_name, last_name, date_of_birth, email) VALUES ($1, $2, $3, $4) RETURNING *',
            [first_name, last_name, date_of_birth, email]
        );
        res.json(newStudent.rows[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Retrieve a list of all students with pagination
router.get('/', async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    try {
        const students = await pool.query('SELECT * FROM students LIMIT $1 OFFSET $2', [limit, offset]);
        const total = await pool.query('SELECT COUNT(*) FROM students');
        res.json({
            students: students.rows,
            total: parseInt(total.rows[0].count),
            page: parseInt(page),
            limit: parseInt(limit),
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Retrieve a single student by ID with marks
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const student = await pool.query('SELECT * FROM students WHERE id = $1', [id]);
        const marks = await pool.query('SELECT * FROM marks WHERE student_id = $1', [id]);
        res.json({ student: student.rows[0], marks: marks.rows });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Update a student's information
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, date_of_birth, email } = req.body;
    try {
        await pool.query(
            'UPDATE students SET first_name = $1, last_name = $2, date_of_birth = $3, email = $4 WHERE id = $5',
            [first_name, last_name, date_of_birth, email, id]
        );
        res.json({ message: 'Student updated successfully' });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Delete a student record
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM students WHERE id = $1', [id]);
        res.json({ message: 'Student deleted successfully' });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;
