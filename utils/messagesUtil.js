const Messages = [];

function getCurrentMessage(room) {
  return Messages.filter((message) => message.room === room);
}

module.exports = { getCurrentMessage };
