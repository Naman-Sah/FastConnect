const express = require("express");
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// GET all notifications for logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Mark a notification as read
router.put("/:id/read", authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isRead: true },
      { new: true }
    );
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: "Failed to mark as read" });
  }
});

// Delete a notification
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

module.exports = router;
