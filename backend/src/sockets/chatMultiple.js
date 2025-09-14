import { v4 as uuidv4 } from "uuid";

export default function registerChatMultipleSocket(io) {
  const chatMultiple = io.of("/chat-multiple");

  const allChatMultipleChatRooms = [];

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
}
