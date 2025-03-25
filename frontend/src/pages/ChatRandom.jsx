import React, { useState, useRef, useEffect, use } from 'react'
import Header from '../components/Header'
import { socket } from '../socket';

const ChatRandom = () => {
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const [isChatConnected, setIsChatConnected] = useState(false);
    const [istyping, setIsTyping] = useState(false);
    const [totalConnections, setTotalConnections] = useState(0);
    const [partnerID, setPartnerID] = useState(undefined);

    const [message, setMessage] = useState('');
    const messageContainerRef = useRef(null);
    const inputBoxRef = useRef(null);

    //=================================================use context here
    const [allMessages, setAllMessages] = useState([])

    useEffect(() => {
        function handleTotalConnectionsEvent(c) {
    
                setTotalConnections(c)
            
        }
        
        function handlePartnerIDEvent(c) { 
            setPartnerID(c.value);
            setTotalConnections(2);
            setIsChatConnected(true);
        }

        function handleNewMessageEvent(c) { 
            const newMessage = {
                recipient : 'partner', 
                message : c,
            }
            setAllMessages(prev => [...prev, newMessage]);
        }

        function handleUserTypingEvent(c) { 
            setIsTyping(c.userTyping)
        }

        socket.on('partnerID', handlePartnerIDEvent);
        socket.on('totalConnections', handleTotalConnectionsEvent );
        socket.on('newMessage', handleNewMessageEvent);
        socket.on('userTyping', handleUserTypingEvent);
       return () => {
        socket.off('totalConnections', handleTotalConnectionsEvent);
        socket.off('partnerID', handlePartnerIDEvent );
        socket.off('newMessage', handleNewMessageEvent);
        socket.off('userTyping', handleUserTypingEvent);
       }


    },[])

  

    useEffect(() => {
       console.log("partner ID  : " , partnerID, "and socket id : " ,socket.id, " totalconnections" , totalConnections) 
       
    }, [partnerID, totalConnections]) 

    useEffect(()=> {
        const inputbox = inputBoxRef.current;
        function handleInputFocusOnEvent () {
            socket.emit('userTyping', {partnerID : partnerID, userTyping : true});
        }
        function handleInputFocusOffEvent () {
            socket.emit('userTyping', {partnerID : partnerID, userTyping : false});
        }
        if(inputBoxRef && inputBoxRef.current) {
            
            inputBoxRef.current.addEventListener('focus', handleInputFocusOnEvent );
            inputBoxRef.current.addEventListener('blur', handleInputFocusOffEvent);

        }

        return () => {
            if(inputbox) {
                inputbox.removeEventListener('focus', handleInputFocusOnEvent );
                inputbox.removeEventListener('blur', handleInputFocusOffEvent);
    
            }
        }
    } )

    //connecting to socket 
    useEffect(() => {
        function connect(socket) {
            socket.connect();
            setIsSocketConnected(true);
        }
        function disconnect(socket) {

            partnerID && socket.emit('disconnecting',{ partnerID : partnerID});
            socket.disconnect();

            setIsSocketConnected(false);
        }
        connect(socket)


        return () => {
            disconnect(socket)
        }
    },[]); 

    

    function handleSendMessage() {

        //==============================================use context here
        const newMessage = {
            recipient: 'user',
            message: message
        }
        socket.emit('newMessage',{ partnerID : partnerID , message : message});
        setAllMessages(prev => [...prev, newMessage])



        setMessage('');

        //scrolling to the bottom of the container on adding another message
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }



    }

    function handleInputChange(event) {
        setMessage(event.target.value);

    
    }
    return (
        <div>
            <Header />
            {
                totalConnections < 2  && (partnerID !== undefined || 'undefined')?
                <div className='w-full h-fit flex justify-center items-center md:text-xl lg:text-2xl p-12'> Sorry we can't connect right now, because nobody is online, Refresh after sometime to check again </div> : 
                <div className='w-full h-[90vh]  flex flex-col'>
                <div className='border-2 w-full h-fit p-4 flex justify-center bg-green-300 items-center text-[1rem] md:text-xl lg:text-2xl '>
                    {isChatConnected ? `Finally! you are connected. Say Hi!!!` : `Please wait we are connecting you to a random person... `}
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
                    <input ref={inputBoxRef} type="text" value={message} onChange={handleInputChange} placeholder='Enter the message' className='border-pink-500 border-2 md:text-xl lg:text-2xl px-4 flex-1' />
                    <button onClick={handleSendMessage} className='w-fit h-full bg-black cursor-pointer text-white px-4 md:text-xl lg:text-2xl hover:text-blue-300 '>send</button>
                </div>

            </div>
            }
            

        </div>
    )
}

export default ChatRandom