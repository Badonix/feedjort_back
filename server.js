const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const app = express();
const cors = require("cors");
const server = http.createServer(app);
const { v4 } = require("uuid");
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
let users = [];
app.use(cors());
io.on("connection", (socket) => {
  socket.on("click", (data) => {
    let isUser;
    const id = data.id;
    const calorie = data.calorie;
    const nickname = data.nickname;
    users.forEach((el) => {
      if (el.id == id) {
        isUser = true;
      } else {
        isUser = false;
      }
    });
    if (!isUser) {
      users = [...users, { nickname, id, calories: 0 }];
    }

    users = users.map((el) => {
      if (el.id == id) {
        el.calories += calorie;
        return el;
      } else {
        return el;
      }
    });
  });

  socket.on("get_calories", (data) => {
    const { id } = data;
    const user = users.find((el) => el.id == id);
    socket.emit("calories", {
      calories: user?.calories || 0,
    });
  });

  socket.on("register", (data) => {
    const id = v4();
    socket.emit("get_id", {
      id,
    });
    users = [...users, { nickname: data.nickname, id, calories: 0 }];
  });
});

app.get("/leaderboard", (req, res) => {
  let filteredUsers = users.filter((user) => user.nickname);
  const sortedLeaderboard = filteredUsers
    .sort((a, b) => b.calories - a.calories)
    .slice(0, 50);

  res.json(sortedLeaderboard);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
