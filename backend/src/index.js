import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";

const app = express();
const server = createServer(app);

//setting up socket server

const io = new Server(server, {
  cors: "http://localhost:5173",
});

const allEvents = {
  chatRandomEvents: {},
};

//namespaces

const chatRandom = io.of("/chat-random");
const chatMultiple = io.of("chat-multiple");
const videoChatRandom = io.of("/video-chat-random");

//all variables
let allChatRandomSockets = [];

let allChatMultipleSockets = [];
const allChatMultipleChatRooms = [];

let allVideoChatRandomSockets = [];

//handling chat random namespace

chatRandom.use((socket, next) => {
  const userName = socket.handshake.auth.userName;

  if (!userName) {
    return new Error("Invalid user Name");
  }

  socket.userName = userName;
  next();
});
chatRandom.use((socket, next) => {
  const userID = allChatRandomSockets.filter((s) => {
    return s.userID === socket.handshake.auth.userID;
  });

  if (userID.length > 0) {
    socket.userID = userID[0];
    return next();
  }

  const randomUserID = uuidv4();
  socket.userID = randomUserID;

  //check for partner ID

  if (
    socket.handshake.auth.partnerID &&
    socket.handshake.auth.partnerUserName
  ) {
    socket.partnerID = socket.handshake.auth.partnerID;
    socket.partnerUserName = socket.handshake.auth.partnerUserName;
    allChatRandomSockets.push({
      userID: socket.userID,
      userName: socket.userName,
      connected: true,
      partnerID: socket.partnerID,
    });
  } else {
    allChatRandomSockets.push({
      userID: socket.userID,
      userName: socket.userName,
      connected: false,
      partnerID: "",
    });
  }

  next();
});

chatRandom.on("connection", (socket) => {
  chatRandom.emit("chat-random-total-connection", {
    totalConnectionCount: allChatRandomSockets.filter(
      (s) => s.connected === false
    ).length,
  });

  socket.on("disconnect", () => {
    const index = allChatRandomSockets.findIndex(
      (s) => s.userID === socket.userID
    );
    allChatRandomSockets.splice(index, 1);
    chatRandom.emit("chat-random-total-connection", {
      totalConnectionCount: allChatRandomSockets.filter(
        (s) => s.connected === false
      ).length,
    });
  });

  //does the socket already have a partner

  function connectToAnotherRandomParnter() {
    if (allChatRandomSockets.filter((s) => s.connected === false).length >= 1) {
      const randomPartner = allChatRandomSockets.filter(
        (s) => s.userID !== socket.userID && s.connected === false
      );

      socket.to(randomPartner[0].userID).emit("chat-random-partner-id", {
        partnerID: socket.userID,
        partnerUserName: socket.userName,
      });
      socket.emit("chat-random-partner-id", {
        partnerID: randomPartner[0].userID,
        partnerUserName: randomPartner[0].userName,
      });
      const socketIdx = allChatRandomSockets.findIndex(
        (s) => s.userID === socket.userID
      );
      const randomPartnerIdx = allChatRandomSockets.findIndex(
        (s) => s.userID === randomPartner[0].userID
      );

      allChatRandomSockets[socketIdx].connected = true;
      allChatRandomSockets[randomPartnerIdx].connected = true;
    }
  }
  function connectToRandomParnter() {
    if (allChatRandomSockets.filter((s) => s.connected === false).length >= 2) {
      const randomPartner = allChatRandomSockets.filter(
        (s) => s.userID !== socket.userID && s.connected === false
      );

      socket.to(randomPartner[0].userID).emit("chat-random-partner-id", {
        partnerID: socket.userID,
        partnerUserName: socket.userName,
      });
      socket.emit("chat-random-partner-id", {
        partnerID: randomPartner[0].userID,
        partnerUserName: randomPartner[0].userName,
      });
      const socketIdx = allChatRandomSockets.findIndex(
        (s) => s.userID === socket.userID
      );
      const randomPartnerIdx = allChatRandomSockets.findIndex(
        (s) => s.userID === randomPartner[0].userID
      );

      allChatRandomSockets[socketIdx].connected = true;
      allChatRandomSockets[randomPartnerIdx].connected = true;
    }
  }

  if (socket.partnerID) {
    socket.to(socket.partnerID).emit("chat-random-partner-id", {
      partnerID: socket.userID,
      partnerUserName: socket.userName,
    });
    socket.emit("chat-random-partner-id", {
      partnerID: socket.partnerID,
      partnerUserName: socket.partnerUserName,
    });
    //setting connected to true for both of them and their partnerID
    const socketIdx = allChatRandomSockets.findIndex(
      (s) => s.userID === socket.userID
    );
    const randomPartnerIdx = allChatRandomSockets.findIndex(
      (s) => s.userID === socket.partnerID
    );

    allChatRandomSockets[socketIdx].connected = true;
    allChatRandomSockets[socketIdx].partnerID = socket.partnerID;
    if (randomPartnerIdx > -1) {
      allChatRandomSockets[randomPartnerIdx].connected = true;
      allChatRandomSockets[randomPartnerIdx].partnerID = socket.userID;
    } else {
      connectToRandomParnter();
    }
  } else {
    connectToRandomParnter();
  }

  socket.emit("chat-random-user-id", {
    userID: socket.userID,
  });

  socket.on("chat-random-new-message", ({ partnerID, message }) => {
    socket
      .to(partnerID)
      .emit("chat-random-new-message", { newMessage: message });
  });

  socket.on("chat-random-user-typing", ({ partnerID, userTyping }) => {
    socket.to(partnerID).emit("chat-random-on-user-typing", {
      userTyping: userTyping,
    });
  });

  socket.on("chat-random-connect-to-another", ({ partnerID }) => {
    socket.to(partnerID).emit("chat-random-connect-to-partner-initiated");
    connectToAnotherRandomParnter();
    const partnerIdx = allChatRandomSockets.findIndex(
      (s) => s.userID === partnerID
    );
    console.log(
      "parnterID : ",
      partnerIdx,
      "  -  ",
      partnerID,
      "allsockets : "
    );
    if (partnerIdx >= 0) {
      allChatRandomSockets[partnerIdx].connected = false;
      allChatRandomSockets[partnerIdx].partnerID = "";
    }
  });
  socket.join(socket.userID);

  console.log("length : ", allChatRandomSockets);
});

//handling chat multiple namespace

chatMultiple.use((socket, next) => {
  const storedUserName = socket.handshake.auth.userName;

  if (!storedUserName) {
    return new Error("Invalid User Name");
  }

  socket.userName = storedUserName;
  next();
});
chatMultiple.use((socket, next) => {
  const storedUserID = socket.handshake.auth.userID;

  if (storedUserID) {
    socket.userID = storedUserID;
  } else {
    const randomUserID = uuidv4();
    socket.userID = randomUserID;
  }

  next();
});
chatMultiple.on("connection", (socket) => {
  console.log(allChatMultipleChatRooms);

  socket.emit("chat-multiple-user-id", {
    userID: socket.userID,
  });
  socket.emit("chat-mulitple-all-chat-rooms", {
    allChatRooms: allChatMultipleChatRooms,
  });

  socket.on("chat-multiple-create-room", ({ roomName }) => {
    const randomRoomID = uuidv4();
    console.log(allChatMultipleChatRooms);
    chatMultiple.emit("chat-multiple-create-room-success", {
      roomID: randomRoomID,
      roomName: roomName,
    });
    allChatMultipleChatRooms.push({
      roomID: randomRoomID,
      roomName: roomName,
      messages: [],
      memberNames: [],
    });
  });

  socket.on("chat-multiple-join-room", ({ roomID, userID, userName }) => {
    socket.join(roomID);
    const roomIdx = allChatMultipleChatRooms.findIndex(
      (room) => room.roomID === roomID
    );
    if (roomIdx > -1) {
      allChatMultipleChatRooms[roomIdx].memberNames.push({
        memberID: userID,
        memberName: userName,
      });
      socket.emit("chat-multiple-all-messages", {
        allMessages: allChatMultipleChatRooms[roomIdx].messages,
      });
      chatMultiple.to(roomID).emit("chat-mutiple-all-room-members", {
        allMembers: allChatMultipleChatRooms[roomIdx].memberNames,
      });
    }
  });

  socket.on("chat-mutiple-new-message", ({ roomID, sender, message }) => {
    chatMultiple.to(roomID).emit("chat-mulitple-new-message", {
      sender: sender,
      message: message,
    });
    const roomIdx = allChatMultipleChatRooms.findIndex(
      (room) => room.roomID === roomID
    );
    if (roomIdx >= 0) {
      allChatMultipleChatRooms[roomIdx].messages.push({
        sender: sender,
        message: message,
      });
      console.log(allChatMultipleChatRooms[roomIdx].messages);
    }
  });
});

//handling video chat radnom namespace

videoChatRandom.use((socket, next) => {
  const userName = socket.handshake.auth.userName;

  if (!userName) {
    return new Error("Invalid user Name");
  }

  socket.userName = userName;
  next();
});
videoChatRandom.use((socket, next) => {
  const userID = allVideoChatRandomSockets.filter((s) => {
    return s.userID === socket.handshake.auth.userID;
  });

  if (userID.length > 0) {
    socket.userID = userID[0];
    return next();
  }

  const randomUserID = uuidv4();
  socket.userID = randomUserID;

  //check for partner ID

  if (
    socket.handshake.auth.partnerID &&
    socket.handshake.auth.partnerUserName
  ) {
    socket.partnerID = socket.handshake.auth.partnerID;
    socket.partnerUserName = socket.handshake.auth.partnerUserName;
    allVideoChatRandomSockets.push({
      userID: socket.userID,
      userName: socket.userName,
      connected: true,
      partnerID: socket.partnerID,
    });
  } else {
    allVideoChatRandomSockets.push({
      userID: socket.userID,
      userName: socket.userName,
      connected: false,
      partnerID: "",
    });
  }

  next();
});

videoChatRandom.on("connection", (socket) => {
  console.log("vidoelength : ", allVideoChatRandomSockets);

  videoChatRandom.emit("video-chat-random-total-connection", {
    totalConnectionCount: allVideoChatRandomSockets.filter(
      (s) => s.connected === false
    ).length,
  });

  socket.on("disconnect", () => {
    const index = allVideoChatRandomSockets.findIndex(
      (s) => s.userID === socket.userID
    );
    //deleting the disconnected socket from list
    allVideoChatRandomSockets.splice(index, 1);

    //new total connections
    chatRandom.emit("video-chat-random-total-connection", {
      totalConnectionCount: allChatRandomSockets.filter(
        (s) => s.connected === false
      ).length,
    });
  });

  //does the socket already have a partner

  function connectToAnotherRandomParnterVideoChat() {
    if (
      allVideoChatRandomSockets.filter((s) => s.connected === false).length >= 1
    ) {
      const randomPartner = allVideoChatRandomSockets.filter(
        (s) => s.userID !== socket.userID && s.connected === false
      );

      socket.to(randomPartner[0].userID).emit("video-chat-random-partner-id", {
        partnerID: socket.userID,
        partnerUserName: socket.userName,
      });
      socket.emit("video-chat-random-partner-id", {
        partnerID: randomPartner[0].userID,
        partnerUserName: randomPartner[0].userName,
      });
      const socketIdx = allVideoChatRandomSockets.findIndex(
        (s) => s.userID === socket.userID
      );
      const randomPartnerIdx = allVideoChatRandomSockets.findIndex(
        (s) => s.userID === randomPartner[0].userID
      );

      allVideoChatRandomSockets[socketIdx].connected = true;
      allVideoChatRandomSockets[randomPartnerIdx].connected = true;
    }
  }
  function connectToRandomParnterVideoChat() {
    if (
      allVideoChatRandomSockets.filter((s) => s.connected === false).length >= 2
    ) {
      const randomPartner = allVideoChatRandomSockets.filter(
        (s) => s.userID !== socket.userID && s.connected === false
      );

      socket.to(randomPartner[0].userID).emit("video-chat-random-partner-id", {
        partnerID: socket.userID,
        partnerUserName: socket.userName,
      });
      socket.emit("video-chat-random-partner-id", {
        partnerID: randomPartner[0].userID,
        partnerUserName: randomPartner[0].userName,
      });
      const socketIdx = allVideoChatRandomSockets.findIndex(
        (s) => s.userID === socket.userID
      );
      const randomPartnerIdx = allVideoChatRandomSockets.findIndex(
        (s) => s.userID === randomPartner[0].userID
      );

      allVideoChatRandomSockets[socketIdx].connected = true;
      allVideoChatRandomSockets[randomPartnerIdx].connected = true;
    }
  }

  if (socket.partnerID) {
    socket.to(socket.partnerID).emit("video-chat-random-partner-id", {
      partnerID: socket.userID,
      partnerUserName: socket.userName,
    });
    socket.emit("video-chat-random-partner-id", {
      partnerID: socket.partnerID,
      partnerUserName: socket.partnerUserName,
    });
    //setting connected to true for both of them and their partnerID
    const socketIdx = allVideoChatRandomSockets.findIndex(
      (s) => s.userID === socket.userID
    );
    const randomPartnerIdx = allVideoChatRandomSockets.findIndex(
      (s) => s.userID === socket.partnerID
    );

    allVideoChatRandomSockets[socketIdx].connected = true;
    allVideoChatRandomSockets[socketIdx].partnerID = socket.partnerID;
    if (randomPartnerIdx > -1) {
      allVideoChatRandomSockets[randomPartnerIdx].connected = true;
      allVideoChatRandomSockets[randomPartnerIdx].partnerID = socket.userID;
    } else {
      connectToRandomParnterVideoChat();
    }
  } else {
    connectToRandomParnterVideoChat();
  }

  socket.emit("video-chat-random-user-id", {
    userID: socket.userID,
  });
  socket.on("video-chat-random-offer", (offer) => {
    socket.broadcast.emit("video-chat-random-offer", offer);
  });

  socket.on("video-chat-random-answer", (answer) => {
    socket.broadcast.emit("video-chat-random-answer", answer);
  });

  socket.on("video-chat-random-ice-candidate", (candidate) => {
    socket.broadcast.emit("video-chat-random-ice-candidate", candidate);
  });

  socket.on("video-chat-random-connect-to-another", ({ partnerID }) => {
    socket.to(partnerID).emit("video-chat-random-connect-to-partner-initiated");
    connectToAnotherRandomParnterVideoChat();
    const partnerIdx = allVideoChatRandomSockets.findIndex(
      (s) => s.userID === partnerID
    );
    console.log(
      "parnterID : ",
      partnerIdx,
      "  -  ",
      partnerID,
      "allsockets : "
    );
    if (partnerIdx >= 0) {
      allVideoChatRandomSockets[partnerIdx].connected = false;
      allVideoChatRandomSockets[partnerIdx].partnerID = "";
    }
  });
  socket.join(socket.userID);
});


server.listen(3000, () => {
  console.log("server is running at http://localhost:3000");
});
