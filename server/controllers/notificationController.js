const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/notifications?recipientRole=control_center&unreadOnly=true
exports.getNotifications = asyncHandler(async (req, res) => {
  const { recipientRole, unreadOnly } = req.query;

  const query = {};
  if (recipientRole) query.recipientRole = { $in: [recipientRole, "all"] };
  if (unreadOnly === "true") query.read = false;

  const notifications = await Notification.find(query)
    .populate("relatedIncident", "incidentId type location severity status")
    .sort({ timestamp: -1 })
    .limit(200);

  res.json(notifications);
});

// PATCH /api/notifications/:id/read
exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
  if (!notification) {
    const err = new Error("Notification not found.");
    err.statusCode = 404;
    throw err;
  }
  res.json(notification);
});

// PATCH /api/notifications/read-all
// Body (optional): { recipientRole }
exports.markAllAsRead = asyncHandler(async (req, res) => {
  const { recipientRole } = req.body || {};
  const query = { read: false };
  if (recipientRole) query.recipientRole = { $in: [recipientRole, "all"] };

  const result = await Notification.updateMany(query, { read: true });
  res.json({ updated: result.modifiedCount });
});
