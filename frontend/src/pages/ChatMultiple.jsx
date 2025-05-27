import React, { useContext, useEffect, useState } from 'react'
import Header from '../components/Header'
import { chatMultipleSocket } from '../socket';
import { globalContext } from '../context/GlobalContext';
import { useNavigate } from 'react-router-dom'

const ChatMultiple = () => {

  const { chatMultipleAllRooms,setChatMultipleAllRooms, setChatMultipleUserID, userGuestName } = useContext(globalContext);
  const [roomName, setRoomName] = useState('');
  const navigate = useNavigate();


  useEffect(() => {
    function handleUserIDEvent(data) {
      if (!localStorage.getItem('chatMultipleUserID')) {
        localStorage.setItem('chatMultipleUserID', data.userID);
      }
      const storedUserID = localStorage.getItem('chatMultipleUserID');
      setChatMultipleUserID(storedUserID)


    }

    function handleNewRoomCreatedEvent (data) { 
      setChatMultipleAllRooms(prev => [...prev,  { 
        roomID : data.roomID, 
        roomName : data.roomName,
      }])
    }

    function handleInitialChatRoomDetailsEvent (data) { 

      const allChatRoomsDetails = data.allChatRooms.map((room) => {
        return {roomID : room.roomID, roomName : room.roomName}
      })
      
      setChatMultipleAllRooms([...allChatRoomsDetails ])
      console.log(allChatRoomsDetails)
    }

    chatMultipleSocket.on('chat-multiple-user-id', handleUserIDEvent);
    chatMultipleSocket.on('chat-multiple-create-room-success', handleNewRoomCreatedEvent);
    chatMultipleSocket.on('chat-mulitple-all-chat-rooms', handleInitialChatRoomDetailsEvent);
    
    return () => {
      chatMultipleSocket.off('chat-multiple-user-id', handleUserIDEvent);
      chatMultipleSocket.off('chat-multiple-create-room-success', handleNewRoomCreatedEvent);
    }
  }, [])

  useEffect(() => {

    function connect(chatMultipleSocket) {

      chatMultipleSocket.auth = { userName: userGuestName };

      const storedUserID = localStorage.getItem('chatMultipleUserID');
      if (storedUserID) {
        chatMultipleSocket.auth = { ...chatMultipleSocket.auth, userID: storedUserID }
      }


      chatMultipleSocket.connect();
    }

    function disconnect(chatMultipleSocket) {
      localStorage.removeItem('chatMultipleUserID');
      chatMultipleSocket.disconnect();
    }


    connect(chatMultipleSocket)

    return () => {
      disconnect(chatMultipleSocket)
    }
  }, [])

  function handleNewRoomCreateEvent(event) {
    event.preventDefault();
    if (roomName.length <= 0) {
      alert("Please enter a room name first!!!");
      return;
    }
    if (chatMultipleAllRooms.filter(room => room.roomName === roomName).length > 0) {
      alert("Please Choose a different room name. This one is already taken!!!");
      return;
    }
    

    chatMultipleSocket.emit('chat-multiple-create-room', { 
      roomName : roomName
    })
  }

  function handleJoinRoomEvent(roomID, roomName) { 
    navigate(`/chatmultiple/${roomName}/${roomID}`);

  }
  
  

  return (

    <>
      <Header />
      <div className=' h-fit min-h-[90vh] w-full p-4  '>

        <div className='h-fit min-h-[10vh] w-full border-2 border-black flex flex-col gap-2 p-2 justify-center items-center rounded-sm md:rounded-lg '>
          <input value={roomName} onChange={(e) => { setRoomName(e.target.value) }} className='p-2 border-1 border-black rounded-sm md:rounded-lg' placeholder='room name' type="text" />
          <button onClick={handleNewRoomCreateEvent} className='h-fit w-fit p-2 px-8 text-white bg-black rounded-sm md:rounded-lg hover:text-blue-400 hover:border-2 hover:border-blue-400 cursor-pointer'>Create Your Own Room</button>
        </div>

        <div className='h-fit w-full flex flex-col justify-center items-center p-4'>
          <p>OR</p>
          <p className='font-bold'>Join a room</p>
        </div>

        <div className='h-fit min-h-[60vh] w-full p-2 flex justify-evenly items-start flex-wrap '>

          {
            chatMultipleAllRooms.map((room) => { 
              return <div key={room.roomID} onClick={() => {handleJoinRoomEvent(room.roomID, room.roomName)}} className='h-fit w-fit p-16 bg-blue-400 cursor-pointer rounded-sm md:rounded-lg'> {room.roomName}</div>
            })
          }

        </div>

      </div>
    </>
  )
}

export default ChatMultiple