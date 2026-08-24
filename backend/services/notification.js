// Dummy notification service
const sendNotification = async (userId, type, message) => {
  // In a real app, integrate Twilio/SendGrid here
  console.log(`[NOTIFICATION] To User ${userId} | Type: ${type} | Message: ${message}`);
};

module.exports = { sendNotification };
