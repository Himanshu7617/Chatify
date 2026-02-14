import { useState, useRef, useContext, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Header from '../components/Header';
import { GiHamburgerMenu } from "react-icons/gi";
import { ImCross } from "react-icons/im";
import { chatMultipleSocket } from '../socket';
import { globalContext } from '../context/GlobalContext';
import BrickBG from '../assets/brickBackground.svg';


const ChatRoom = () => {

  const { roomName, roomID } = useParams();
  const {userGuestName, setChatMultipleUserID, chatMultipleUserID} = useContext(globalContext);
  const [message, setMessage] = useState('');
  const [allMessages, setAllMessages] = useState([]);
  const [navActive, setNavActive] = useState(false);
  const [allMembers, setAllMemebers] = useState([]);


  const messageContainerRef = useRef(null);
  const inputBoxRef = useRef(null);


 useEffect(() => {
    function handleUserIDEvent(data) {
      if (!localStorage.getItem('chatMultipleUserID')) {
        localStorage.setItem('chatMultipleUserID', data.userID);
      }
      const storedUserID = localStorage.getItem('chatMultipleUserID');
      setChatMultipleUserID(storedUserID)
    }

    function handleNewMessageEvent(data) { 

      const newMessage = { 
        sender : data.sender, 
        message : data.message,
      }

      setAllMessages(prev => [...prev, newMessage]);
    }

    function handleAllMessagesInitializationEvent(data) { 
      setAllMessages(data.allMessages);
    }

    function handleNewMemberJoinEvent(data){ 
      setAllMemebers(data.allMembers);
    }
    chatMultipleSocket.on('chat-multiple-user-id', handleUserIDEvent);
    chatMultipleSocket.on('chat-multiple-all-messages', handleAllMessagesInitializationEvent);
    chatMultipleSocket.on('chat-mulitple-new-message', handleNewMessageEvent);
    chatMultipleSocket.on('chat-mutiple-all-room-members', handleNewMemberJoinEvent);
    return () => {
      chatMultipleSocket.off('chat-multiple-user-id', handleUserIDEvent);
      chatMultipleSocket.off('chat-multiple-all-messages', handleAllMessagesInitializationEvent);
      chatMultipleSocket.off('chat-mulitple-new-message', handleNewMessageEvent);
    }
  }, [])

  useEffect(() => {

    function connect(chatMultipleSocket) {

      chatMultipleSocket.auth = { userName: userGuestName, userID : roomID };

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

  useEffect(() => {
    chatMultipleSocket.emit('chat-multiple-join-room', {
      roomID : roomID,
      userID : chatMultipleUserID,
      userName: userGuestName,
    });
  },[]);


  function handleInputChange(event) {
    setMessage(event.target.value)
  }

  function handleSendMessage(event) {
    event.preventDefault();


    const newMessage = { 
      roomID : roomID,
      message : message, 
      sender : userGuestName, 
      
    }

    chatMultipleSocket.emit('chat-mutiple-new-message',newMessage);
    setMessage('');

  }

  return (
    <div className='h-screen w-full font-pixel overflow-hidden flex flex-col'>
    <img src={BrickBG} className='h-full fixed  w-full object-cover z-[-1000]' />
      
     
      <div className='h-[100vh] w-full z-[100] relative flex'>
       


        <div className='h-full overflow-auto  lg:block border-[#6d350f]  bg-[#D38D5F]  border-8 w-1/5'>
          <p className='h-fit w-full bg-[#D38D5F] p-4 mb-2'>Members: </p>
          <ol type='1' className='h-fit  px-6 list-decimal w-full '>
            {allMembers.map((member) => (
              <li key={member.memberID} className='text-xl z-40 m-2'>{member.memberName}</li>
            ))}
          </ol>

        </div>
        <div className='h-full w-full lg:w-4/5'>

          <div ref={messageContainerRef} className=' relative overflow-y-scroll h-[90vh]'>
            <div className='h-fit w-full border-[#6d350f]  bg-[#D38D5F]  border-8 p-4 flex justify-center items-center'>Room Name : {roomName}</div>
            <ul>

              {allMessages.map((msg, idx) => (
                <li
                  key={idx}
                  className={`h-fit w-fit md:text-xl text-[#1b55b1] lg:text-2xl rounded md:rounded-lg  m-2 `}
                >
                  <fieldset className='border-4 border-[#1b55b1] bg-[#b1bbf2]  rounded-sm md:rounded-lg p-4'> 
                  <legend>{msg.sender}</legend>
                  {msg.message}
                  </fieldset>

                </li>
              ))}
            </ul>
          </div>
          <div className=' h-[10vh] flex  w-full'>

            <input ref={inputBoxRef} type="text" value={message} onChange={handleInputChange} placeholder='Enter the message' className='outline-none border-[#6d350f]  bg-[#D38D5F] border-8  md:text-xl lg:text-2xl px-4 flex-1' />
            <button onClick={handleSendMessage} className='w-fit h-full   bg-[#D38D5F] border-[#6d350f]   border-8 cursor-pointer text-[#6d350f] hover:bg-[#6d350f] px-4 md:text-xl lg:text-2xl hover:text-white'>send</button>
          </div>


        </div>
      </div>
    </div>
  )
}

export default ChatRoom