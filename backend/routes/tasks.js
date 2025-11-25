const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Task = require('../models/Task');

// GET all tasks for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST (Create) a new task
// POST (Create) a new task
router.post('/', auth, async (req, res) => {
  try {
    // Added priority to destructuring
    const { title, description, dueDate, priority } = req.body; 
    
    const newTask = new Task({
      title,
      description,
      dueDate: dueDate || Date.now(),
      priority: priority || 'medium', // Default to medium
      user: req.user.id,
    });
    
    const savedTask = await newTask.save();
    res.json(savedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT (Update) a task
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, status } = req.body;
    let task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ msg: 'Task not found' });
    
    // Make sure user owns the task
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    task = await Task.findByIdAndUpdate(req.params.id, 
      { $set: { title, description, status } }, 
      { new: true });
      
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a task
router.delete('/:id', auth, async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: 'Task not found' });

    // Make sure user owns the task
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Task removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;