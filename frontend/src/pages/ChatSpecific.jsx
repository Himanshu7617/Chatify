import React, { useRef, useEffect, useState } from 'react'
import Header from '../components/Header'
import { z } from 'zod';
import { chatSpecificSocket } from '../socket';
import BrickBG from '../assets/brickBackground.svg';
import { IoCopyOutline } from "react-icons/io5";


const ChatSpecific = () => {




  const [userId, setUserId] = useState('');
  const [partnerID, setPartnerID] = useState(() => {
    return localStorage.getItem('chatSpecificPartnerID') || '';
  });
  const [partnerGuestName, setPartnerGuestName] = useState(() => {
    return localStorage.getItem('chatSpecificPartnerUserName') || '';
  });



  const [isChatConnected, setIsChatConnected] = useState(() => {
    if (localStorage.getItem('chatSpecificPartnerID')) { return true; } else { return false; }
  });

  const [allMessages, setAllMessages] = useState([])
  const [istyping, setIsTyping] = useState(false);
  const [message, setMessage] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);




  const [errors, setErrors] = useState()

  const messageContainerRef = useRef(null);
  const inputBoxRef = useRef(null);

  //handling zod stuff 

  const formDetails = z.object({
    guestName: z.string().min(2, "should be more than 2 characters"),
    partnerGuestName: z.string().min(2, "should be more than 2 characters"),
    partnerID: z.string().min(2, "should be more than 2 characters"),
  })

  function handleFormSubmit(event) {
    event.preventDefault();

    const userEnteredFormDetails = {
      partnerID: partnerID
    }

    const validationResult = formDetails.safeParse(userEnteredFormDetails);
    const formattedErrors = validationResult.error ? validationResult.error.format() : undefined;

    if (formattedErrors) {
      setErrors(formattedErrors);

    }


    console.log('emitting connect to partner event');

    chatSpecificSocket.emit('chatSpecific-connect-to-partner', { partnerID: partnerID });


  }




  //input focusing user event 
  useEffect(() => {

    const inputbox = inputBoxRef.current;
    function handleInputFocusOnEvent() {
      chatSpecificSocket.emit('chatSpecific-user-typing', { partnerID: partnerID, userTyping: true });
    }
    function handleInputFocusOffEvent() {
      chatSpecificSocket.emit('chatSpecific-user-typing', { partnerID: partnerID, userTyping: false });
    }
    if (inputBoxRef && inputBoxRef.current) {
      console.log(inputBoxRef.current)
      inputBoxRef.current.addEventListener('focus', handleInputFocusOnEvent);
      inputBoxRef.current.addEventListener('blur', handleInputFocusOffEvent);

    }

    return () => {
      if (inputbox) {
        inputbox.removeEventListener('focus', handleInputFocusOnEvent);
        inputbox.removeEventListener('blur', handleInputFocusOffEvent);

      }
    }
  }, [partnerID, inputBoxRef])

  function handleSendMessage() {


    const newMessage = {
      recipient: 'user',
      message: message
    }
    const partnerID = localStorage.getItem('chatSpecificPartnerID');

    chatSpecificSocket.emit('chatSpecific-new-message', { partnerID: partnerID, message: message });
    setAllMessages(prev => [...prev, newMessage])


    setMessage('');

    //scrolling to the bottom of the container on adding another message
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }



  }
  function handleNewMessageInputChange(e) {
    setMessage(e.target.value)


  }


  //handling chatSpecificSocket event 

  useEffect(() => {





    function handleConnectionAssuranceEvent(c) {

      setPartnerGuestName(c.partnerUserName);
      setPartnerID(c.partnerID);
      setIsChatConnected(true);
      localStorage.setItem('chatSpecificPartnerUserName', c.partnerUserName);
      localStorage.setItem('chatSpecificPartnerID', c.partnerID);
    }

    function handleNewMessageEvent(c) {
      console.log('new message received', c.newMessage);
      const newMessage = {
        recipient: 'partner',
        message: c.newMessage
      };
      setAllMessages(prev => [...prev, newMessage]);
    }

    function handleUserTypingEvent(c) {
      console.log('and i am tryingi to change to ', c.userTyping)
      setIsTyping(c.userTyping);
    }

    function handleUserIdInitializationEvent(data) {

      if (!localStorage.getItem('chatSpecificUserID')) {
        localStorage.setItem('chatSpecificUserID', data.userID);
        setUserId(data.userID);
      }
      else {
        setUserId(localStorage.getItem('chatSpecificUserID'));
      }
    }

    function handleChatSpecificErrorEvent(data) {
      console.log(data.message);
      alert(data.message);
    }
    chatSpecificSocket.on('chatSpecific-user-ID', handleUserIdInitializationEvent);
    chatSpecificSocket.on('chatSpecific-connected', handleConnectionAssuranceEvent);
    chatSpecificSocket.on('chatSpecific-user-typing', handleUserTypingEvent);
    chatSpecificSocket.on('chatSpecific-error', handleChatSpecificErrorEvent);
    chatSpecificSocket.on('chatSpecific-new-message', handleNewMessageEvent);

    return () => {
      chatSpecificSocket.off('chatSpecific-user-ID', handleUserIdInitializationEvent);
      chatSpecificSocket.off('chatSpecific-connected', handleConnectionAssuranceEvent);
      chatSpecificSocket.off('chatSpecific-user-typing', handleUserTypingEvent)
      chatSpecificSocket.off('chatSpecific-error', handleChatSpecificErrorEvent);

    }

  }, [])

  //connecting to chatSpecificSocket 
  useEffect(() => {


    function connect(chatSpecificSocket) {
      console.log('connecting ');
      const userGuestName = localStorage.getItem('userGuestName') || 'Guest';
      const previousUserID = localStorage.getItem('chatSpecificUserID');

      chatSpecificSocket.auth = previousUserID ? { userID: previousUserID, userName: userGuestName } : { userName: userGuestName };

      const storedPartnerID = localStorage.getItem('chatSpecificPartnerID');
      const storedPartnerUserName = localStorage.getItem('chatSpecificPartnerUserName');

      if (storedPartnerID && storedPartnerUserName) {
        chatSpecificSocket.auth = { ...chatSpecificSocket.auth, partnerID: storedPartnerID, partnerUserName: storedPartnerUserName };
      }

      chatSpecificSocket.connect();
    }
    function disconnect(chatSpecificSocket) {
      localStorage.removeItem('chatSpecificUserID');
      localStorage.removeItem('chatSpecificPartnerID');
      localStorage.removeItem('chatSpecificPartnerUserName');
      chatSpecificSocket.disconnect();
    }

    connect(chatSpecificSocket);
    return () => {
      disconnect(chatSpecificSocket)
    }
  }, []);


  function copyToClipboardHandler() {
    // const userID = userId;
    navigator.clipboard.writeText(userId);
    setShowTooltip(true);

    setTimeout(() => {
      setShowTooltip(false);
    }, 1500);
  }

  return (
    <div className='h-[100vh] w-[100vw] flex flex-col justify-center items-center overflow-hidden'>
      <img src={BrickBG} className='h-full absolute w-full object-cover z-[-1000]' />


      {
        (!isChatConnected) ?
          <main className='w-fit h-fit p-16 font-pixel border-[#6d350f] bg-[#f1b58d] rounded-2xl  border-8 flex flex-col gap-4 justify-center items-center'>
      <div className='absolute top-0'>

      <Header  />
      </div>

            <div className='w-fit h-fit flex gap-4 items-center p-4 border-8 px-8 font-pixel border-[#6d350f] bg-[#D38D5F] rounded md:rounded-sm lg:rounded-lg'>
              Your ID :{userId}
              {showTooltip && (
                <div className="absoluten right-[-100px] z-[1000] px-3 py-2 text-sm font-medium text-white bg-black rounded shadow">
                  Copied!
                </div>
              )}
              <span className='cursor-pointer ' onClick={copyToClipboardHandler}><IoCopyOutline /></span>
            </div>
            <p className='text-center'>OR<br />Fill the details below to chat</p>
            <form onSubmit={handleFormSubmit} className='w-fit h-fit p-4 rounded md:rounded-sm lg:rounded-lg border-8 border-[#6d350f] bg-[#D38D5F] font-pixel flex flex-col justify-center gap-2 items-center'>


              <div className=' flex gap-2'>
                <label htmlFor="partnerId">PartnerID: </label>
                <input className='px-2 outline-none focus:outline-none focus:border-none border-none' name='partnerId' type="text" value={partnerID} onChange={(e) => { setPartnerID(e.target.value) }} placeholder=' tkuKs2BrQKgbOv5oAABN' />
                {(errors) && (
                  <span className='text-red-600'>{errors.partnerID?._errors[0]}</span>
                )}
              </div>
              <button type='submit' className='w-full hover:bg-[#58331a]  bg-[#fabc92] rounded md:rounded-sm lg:rounded-lg text-[#452810] p-1 hover:text-white cursor-pointer'> Chat Now</button>
            </form>

          </main> :
          <div className='w-full h-[100vh] overflow-hidden flex flex-col'>
            <div className='border-2 w-full h-fit p-4 flex justify-center border-[#6d350f] bg-[#f1b58d]  items-center text-[1rem] md:text-xl lg:text-2xl '>
              {isChatConnected ? `Finally! you are connected to ${partnerGuestName}. Say Hi!!!` : `Please wait we are connecting you to ${partnerGuestName}... `}
            </div>
            <div ref={messageContainerRef} className='border-2 relative overflow-y-scroll h-[90vh]'>
              <ul>

                {allMessages.map((msg, idx) => (
                  <li
                    key={idx}
                    className={`h-fit w-fit bg-${msg.recipient === 'partner' ? ' border-[#1b55b1] text-[#053b92] bg-[#b1bbf2]' : ' border-[#1bb152] bg-[#7df09f] text-[#0c8137]'} border-4 p-4 md:text-xl lg:text-2xl rounded md:rounded-lg  m-2 `}
                  >
                    {msg.message}
                  </li>
                ))}
              </ul>
              {istyping && <p className='absolute bottom-1 left-1 text-gray-500'>typing...</p>}
            </div>
            <div className='border-4 border-[#6d350f] h-[10vh] flex  w-full'>
              <input ref={inputBoxRef} type="text" value={message} onChange={handleNewMessageInputChange} placeholder='Enter the message' className='border-[#6d350f] bg-[#f1b58d]   md:text-xl lg:text-2xl px-4 flex-1' />
              <button onClick={handleSendMessage} className='w-fit h-full hover:bg-[#6d350f] border-[#6d350f] bg-[#f1b58d]  cursor-pointer text-white px-4 md:text-xl lg:text-2xl hover:text-blue-300 '>send</button>
            </div>

          </div>
      }

    </div>
  )
}

export default ChatSpecific