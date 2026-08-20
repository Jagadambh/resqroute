const Notification = require("../models/Notification");

async function createNotification(io, { recipientRole, recipientId, type, message, relatedIncident }) {
  const notification = await Notification.create({
    recipientRole,
    recipientId,
    type,
    message,
    relatedIncident,
  });

  if (io) {
    io.emit("notification:new", notification);
  }

  return notification;
}

module.exports = { createNotification };
