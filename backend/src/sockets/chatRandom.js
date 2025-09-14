import { v4 as uuidv4 } from "uuid";

export default function registerChatRandomSocket(io) {
  const chatRandom = io.of("/chat-random");
  let allChatRandomSockets = [];

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
      if (
        allChatRandomSockets.filter((s) => s.connected === false).length >= 1
      ) {
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
      if (
        allChatRandomSockets.filter((s) => s.connected === false).length >= 2
      ) {
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
}
