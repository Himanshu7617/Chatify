import React, { useRef, useEffect, useState } from 'react'
import Header from '../components/Header'
import { socket } from '../socket';
import { z } from 'zod';

const ChatSpecific = () => {


  const [establishConnection, SetEstablishConnection] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isChatConnected, setIsChatConnected] = useState(false);
  const [getID, setGetID] = useState(false);
  const [allMessages, setAllMessages] = useState([])
  const [istyping, setIsTyping] = useState(false);
  const [message, setMessage] = useState('');


  const [hasPartnerLeft, setHasPartnerLeft] = useState(false);
  const [partnerID, setPartnerID] = useState('');
  const [guestName, setGuestName] = useState('');

  const [partnerGuestName, setPartnerGuestName] = useState('');
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
      guestName: guestName,
      partnerGuestName: partnerGuestName,
      partnerID: partnerID
    }

    const validationResult = formDetails.safeParse(userEnteredFormDetails);
    const formattedErrors = validationResult.error ? validationResult.error.format() : undefined;

    if (formattedErrors) {
      setErrors(formattedErrors);
      SetEstablishConnection(false);
      return;
    } else {
      SetEstablishConnection(true);
      setIsChatConnected(true)

    }





  }


  //setting partnerID and socketID to the localstorage 
  useEffect(() => { 
    let storedPartnerID = localStorage.getItem('partnerID');
    if(!storedPartnerID || storedPartnerID.length <= 0 ){
      localStorage.setItem("partnerID", partnerID);
      storedPartnerID = localStorage.getItem("partnerID")
    }
    if(storedPartnerID) { 
      setPartnerID(partnerID);
    }
    console.log(partnerID)
  },[partnerID])

  //input focusing user event 
   useEffect(()=> {
          
          const inputbox = inputBoxRef.current;
          function handleInputFocusOnEvent () {
              console.log('hi', partnerID)
              socket.emit('chatSpecific-user-typing', {partnerID : partnerID, userTyping : true});
          }
          function handleInputFocusOffEvent () {
              console.log('bye')
              socket.emit('chatSpecific-user-typing', {partnerID : partnerID, userTyping : false});
          }
          if(inputBoxRef && inputBoxRef.current) {
              console.log(inputBoxRef.current)
              inputBoxRef.current.addEventListener('focus', handleInputFocusOnEvent );
              inputBoxRef.current.addEventListener('blur', handleInputFocusOffEvent);
  
          }
  
          return () => {
              if(inputbox) {
                  inputbox.removeEventListener('focus', handleInputFocusOnEvent );
                  inputbox.removeEventListener('blur', handleInputFocusOffEvent);
      
              }
          }
      },[partnerID, inputBoxRef] )

  function handleSendMessage() {


    const newMessage = {
      recipient: 'user',
      message: message
    }
    socket.emit('chatSpecific-new-message', { partnerID: partnerID, message: message });
    setAllMessages(prev => [...prev, newMessage])
    
    
    //scrolling to the bottom of the container on adding another message
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }



  }
  function handleNewMessageInputChange(e) {
    setMessage(e.target.value)

    
  }


  //handling socket event 

  useEffect(() => {

    function handleIsSocketConnectedEvent(c) {
      setIsSocketConnected(c.isSocketConnected);
      // if(partnerID.length<= 0) { 
      //   setPartnerID(c.socketID)
      // }
    }

    

    function handleConnectionAssuranceEvent(c) { 
      setIsChatConnected(c.isChatConnected);
      if(partnerGuestName.length <= 0 ) { 
        setPartnerGuestName(c.partnerGuestName)
      }
      if(!localStorage.getItem("partnerID")) {
        localStorage.setItem("partnerID",c.partnerID);
        setPartnerID(c.partnerID);
      }
    }

    function handleUserTypingEvent (c) {
      console.log('and i am tryingi to change to ', c.userTyping)
      setIsTyping(c.userTyping);
    }
    socket.on('chatSpecific-is-socket-connected', handleIsSocketConnectedEvent);
    socket.on('chatSpecific-connection-assurance', handleConnectionAssuranceEvent);
    socket.on('chatSpecific-user-typing', handleUserTypingEvent);

    return () => {
      socket.off('chatSpecific-is-socket-connected', handleIsSocketConnectedEvent)
      socket.off('chatSpecific-connection-assurance', handleConnectionAssuranceEvent);
      socket.off('chatSpecific-user-typing', handleUserTypingEvent)


    }

  }, [])

  //connecting to socket 
  useEffect(() => {
    function connectByEstablishConnection(socket) {
      socket.connect();
      socket.emit('chatSpecific-connect-to-partner', {
        partnerID: partnerID,
        guestName: guestName,
      })
      setGuestName('');
      setPartnerID('');


    }

    function connectByGetID(socket) {
      socket.connect();
    }
    function disconnect(socket) {
      socket.disconnect();
    }
    if (establishConnection) {
      connectByEstablishConnection(socket);

    }
    if (getID) {
      connectByGetID(socket);
    }


    return () => {
      disconnect(socket)
    }
  }, [establishConnection, getID]);


  function handleGetID(event) {
    event.preventDefault();
    setGetID(true)

  }


  return (
    <div>
      <Header />

      {
        (isSocketConnected === false || isChatConnected === false) ?
          <main className='w-full h-[90vh] flex flex-col gap-4 justify-center items-center'>

            <div className='w-fit h-fit p-4 border-4 rounded md:rounded-sm lg:rounded-lg'>
              {(socket.connected) && <p>{socket.id}</p>}
              <button onClick={handleGetID} className='w-full h-fit bg-black text-white p-2 px-4 rounded md:rounded-sm lg:rounded-lg '>Get ID</button>
            </div>
            <p className='text-center'>OR<br />Fill the details below to chat</p>
            <form onSubmit={handleFormSubmit} className='w-fit h-fit p-4 rounded md:rounded-sm lg:rounded-lg border-4 flex flex-col justify-center gap-2 items-center'>
              <div className=' flex gap-2'>
                <label htmlFor="guestName">Guest Name: </label>
                <input className='px-2' name='guestName' value={guestName} onChange={(e) => { setGuestName(e.target.value) }} type="text" placeholder='Sabrina Carpentar' />
                {errors && (
                  <span className='text-red-600'>{errors.guestName?._errors[0]}</span>
                )}
              </div>
              <div className=' flex gap-2'>
                <label htmlFor="partnerguestName">Partner's <br />Guest Name: </label>
                <input className='px-2' name='partnerguestName' value={partnerGuestName} onChange={(e) => { setPartnerGuestName(e.target.value) }} type="text" placeholder='Tate McRae' />
                {errors && (
                  <span className='text-red-600'>{errors.partnerGuestName?._errors[0]}</span>
                )}
              </div>
              <div className=' flex gap-2'>
                <label htmlFor="partnerId">PartnerID: </label>
                <input className='px-2' name='partnerId' type="text" value={partnerID} onChange={(e) => { setPartnerID(e.target.value) }} placeholder=' tkuKs2BrQKgbOv5oAABN' />
                {(errors) && (
                  <span className='text-red-600'>{errors.partnerID?._errors[0]}</span>
                )}
              </div>
              <button type='submit' className='w-full bg-black rounded md:rounded-sm lg:rounded-lg text-white p-1 hover:text-blue-400 cursor-pointer'> Chat Now</button>
            </form>

          </main> :
          <div className='w-full h-[90vh]  flex flex-col'>
            <div className='border-2 w-full h-fit p-4 flex justify-center bg-green-300 items-center text-[1rem] md:text-xl lg:text-2xl '>
              {isChatConnected ? `Finally! you are connected to ${partnerGuestName}. Say Hi!!!` : `Please wait we are connecting you to ${partnerGuestName}... `}
            </div>
            <div ref={messageContainerRef} className='border-2 relative overflow-y-scroll border-red-600 h-[72vh]'>
              <ul>

                {allMessages.map((msg, idx) => (
                  <li
                    key={idx}
                    className={`h-fit w-fit bg-${msg.recipient === 'partner' ? 'blue-300' : 'green-300'} p-4 md:text-xl lg:text-2xl rounded md:rounded-lg  m-2 `}
                  >
                    {msg.message}
                  </li>
                ))}
              </ul>
              {istyping && <p className='absolute bottom-1 left-1 text-gray-500'>typing...</p>}
            </div>
            <div className='border-blue-600 border-2 h-[9vh] flex  w-full'>
              <div className='h-full w-fit text-white px-3 flex justify-center items-center md:text-xl lg:text-2xl hover:text-blue-300 cursor-pointer bg-black '>
                Connect to another
              </div>
              <input ref={inputBoxRef} type="text" value={message} onChange={handleNewMessageInputChange} placeholder='Enter the message' className='border-pink-500 border-2 md:text-xl lg:text-2xl px-4 flex-1' />
              <button onClick={handleSendMessage} className='w-fit h-full bg-black cursor-pointer text-white px-4 md:text-xl lg:text-2xl hover:text-blue-300 '>send</button>
            </div>

          </div>
      }

    </div>
  )
}

export default ChatSpecific