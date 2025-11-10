const express = require('express');
const Group = require('../models/Group');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();



/* =========================================================
   GET /api/groups - Fetch all groups
========================================================= */
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find()
      .populate('createdBy', 'name')
      .populate('members', 'name');
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch groups', details: err.message });
  }
});

/* =========================================================
   POST /api/groups - Create a new group
========================================================= */
router.post('/', authMiddleware, async (req, res) => {
  const { name, description, category, visibility } = req.body;

  if (!name || !description || !category) {
    return res.status(400).json({ message: 'All required fields must be filled' });
  }

  try {
    const newGroup = new Group({
      name,
      description,
      category,
      visibility,
      createdBy: req.user._id,
      members: [req.user._id],
    });

    const savedGroup = await newGroup.save();
    const populatedGroup = await savedGroup.populate('createdBy', 'name');
    res.status(201).json(populatedGroup);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create group', details: err.message });
  }
});

/* =========================================================
   PUT /api/groups/:id - Edit group (only creator)
========================================================= */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, description, category, visibility } = req.body;
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Only creator can edit
    if (group.createdBy.toString() !== req.user._id) {
      return res.status(403).json({ message: 'You are not allowed to edit this group' });
    }

    // Update fields
    if (name) group.name = name;
    if (description) group.description = description;
    if (category) group.category = category;
    if (visibility) group.visibility = visibility;

    const updatedGroup = await group.save();
    const populated = await updatedGroup.populate('createdBy', 'name');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update group', details: err.message });
  }
});

/* =========================================================
   DELETE /api/groups/:id - Delete group (only creator)
========================================================= */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (group.createdBy.toString() !== req.user._id) {
      return res.status(403).json({ message: 'You are not allowed to delete this group' });
    }

    await group.deleteOne();
    res.json({ message: 'Group deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete group', details: err.message });
  }
});

/* =========================================================
   POST /api/groups/:id/join - Join group
========================================================= */
router.post('/:id/join', authMiddleware, async (req, res) => {
  try {
    
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const userId = req.user._id;
    if (group.members.includes(userId)) {
      return res.status(400).json({ message: 'You are already a member of this group' });
    }

    group.members.push(userId);
    await group.save();

    const populated = await group.populate(['createdBy', 'members']);
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to join group', details: err.message });
  }
});

/* =========================================================
   POST /api/groups/:id/leave - Leave group
========================================================= */
router.post('/:id/leave', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const userId = req.user._id;

    // Creator cannot leave their own group
    if (group.createdBy.toString() === userId.toString()) {
      return res.status(400).json({ message: 'Creator cannot leave their own group' });
    }

    group.members = group.members.filter((m) => m.toString() !== userId.toString());
    await group.save();

    const populated = await group.populate(['createdBy', 'members']);
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to leave group', details: err.message });
  }
});

/* =========================================================
   GET /api/groups/:id - Fetch single group by ID
========================================================= */
router.get('/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('members', 'name');
    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get group', details: err.message });
  }
});

module.exports = router;
