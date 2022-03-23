const moment = require("moment");

module.exports = {
  formatMessage(username, text) {
    return {
      username,
      text,
      time: moment().format("h:mm a"),
    };
  },

  formatMessageFromDatabase(message) {
    return {
      user: message.user,
      content: message.content,
      time: moment(message.createdAt).format("h:mm a"),
    };
  },
};
