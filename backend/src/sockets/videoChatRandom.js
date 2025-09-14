import { v4 as uuidv4 } from "uuid";

export default function registerVideoChatRandomSocket(io) {
  const videoChatRandom = io.of("/video-chat-random");

  let allVideoChatRandomSockets = [];

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
        allVideoChatRandomSockets.filter((s) => s.connected === false).length >=
        1
      ) {
        const randomPartner = allVideoChatRandomSockets.filter(
          (s) => s.userID !== socket.userID && s.connected === false
        );

        socket
          .to(randomPartner[0].userID)
          .emit("video-chat-random-partner-id", {
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
        allVideoChatRandomSockets.filter((s) => s.connected === false).length >=
        2
      ) {
        const randomPartner = allVideoChatRandomSockets.filter(
          (s) => s.userID !== socket.userID && s.connected === false
        );

        socket
          .to(randomPartner[0].userID)
          .emit("video-chat-random-partner-id", {
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
      socket
        .to(partnerID)
        .emit("video-chat-random-connect-to-partner-initiated");
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
}
