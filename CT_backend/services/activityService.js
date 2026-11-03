const Activity = require('../models/Activity');
const Notification = require('../models/Notification');

const recordActivity = async (businessId, payload) => {
  const { businessId: _ignored, ...rest } = payload;
  await Activity.create({
    ...rest,
    businessId,
    timestamp: new Date(),
  });
};

const actorFrom = (user) =>
  user
    ? {
        id: String(user._id),
        name: user.name,
        role: user.roleLabel || user.role,
        avatar: user.avatar,
      }
    : undefined;

const notify = async (businessId, payload) => {
  const { businessId: _ignored, ...rest } = payload;
  await Notification.create({ ...rest, businessId });
};

module.exports = { recordActivity, actorFrom, notify };
