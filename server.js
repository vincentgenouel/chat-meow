require("dotenv").config();
const path = require("path");
const http = require("http");
const express = require("express");
const {
  formatMessage,
  formatMessageFromDatabase,
} = require("./utils/messages");
const { Server } = require("socket.io");
const { db_connect } = require("./utils/databaseConnection");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");
const Message = require("./model/Message");

db_connect()
  .then(() => {
    const User = require("./model/User");

    // Set static folder
    app.use(express.static(path.join(__dirname, "public")));

    const botName = "MeowCord Bot";

    function verifyUserDatabase(newUser) {
      return User.findOne({ ...newUser });
    }

    function handleError(err) {
      console.error(err);
    }

    // Run when client connects
    io.on("connection", async (socket) => {
      const u = {
        username: socket.handshake.auth.username,
        password: socket.handshake.auth.password,
      };

      let newUser = await verifyUserDatabase(u);
      if (!newUser) {
        newUser = new User(u);
        newUser.save(function (err) {
          console.log("là");
          if (err) {
            return handleError(err);
          }
        });
      }

      socket.on("joinRoom", async ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        //find messages
        // function loadingMessagesBy() {
        //   return Message.find({ room });
        // }
        // let lastMessages = [];
        let lastMessages = await Message.find({ room });
        console.log("last message : ", lastMessages);
        console.log("room : ", room);
        lastMessages.map((m) => {
          io.emit("lastMessage", formatMessageFromDatabase(m));
        });

        // Welcome current user
        socket.emit("message", formatMessage(botName, "Bienvenue sur Meow!"));

        // Broadcast when a user connects
        socket.broadcast
          .to(user.room)
          .emit(
            "message",
            formatMessage(botName, `${user.username} a rejoint le chat`)
          );

        // Send users and room info
        io.to(user.room).emit("roomUsers", {
          room: user.room,
          users: getRoomUsers(user.room),
        });
      });

      // Receive message for backup
      socket.on("saveMessage", ({ username, room, msg }) => {
        console.log("Dans le server : ", msg);
        const Message = require("./model/Message");
        let newMessage = new Message({
          content: msg,
          createdAt: new Date(),
          user: username,
          room: room,
        });
        console.log(newMessage);
        newMessage.save(function (err) {
          if (err) {
            return handleError(err);
          }
        });
      });

      // Listen and receive for chatMessage + send username and msg
      socket.on("chatMessage", (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit("message", formatMessage(user.username, msg));
      });

      // Runs when client disconnects
      socket.on("disconnect", () => {
        const user = userLeave(socket.id);

        if (user) {
          io.to(user.room).emit(
            "message",
            formatMessage(botName, `${user.username} a quitté le chat`)
          );

          // Send users and room info
          io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: getRoomUsers(user.room),
          });
        }
      });
    });

    server.listen(8080, () => {
      console.log("Listening on *:8080");
    });
  })
  .catch((err) => {
    console.log("Failed to connect to MongoDB");
    console.error(err);
  });
