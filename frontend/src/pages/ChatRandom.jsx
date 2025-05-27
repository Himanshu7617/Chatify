import React, { useState, useRef, useEffect, useContext } from 'react'
import Header from '../components/Header'
import { chatRandomSocket } from '../socket';
import { globalContext } from '../context/GlobalContext';

const ChatRandom = () => {

    const { userGuestName, setChatRandomUserID } = useContext(globalContext);


    const [isChatConnected, setIsChatConnected] = useState(false);
    const [isParnterDisconnected, setIsPartnerDisconnected] = useState(false);
    const [istyping, setIsTyping] = useState(false);
    const [totalConnections, setTotalConnections] = useState(-1);
    const [partnerID, setPartnerID] = useState('');
    const [partnerUserName, setPartnerUserName] = useState('');


    const [message, setMessage] = useState('');
    const messageContainerRef = useRef(null);
    const inputBoxRef = useRef(null);

    //=================================================use context here
    const [allMessages, setAllMessages] = useState([])

    useEffect(() => {
       

        function handleUserIDEvent(data) {
            const previousUserID = localStorage.getItem('chatRandomUserID');

            if (previousUserID) {
                setChatRandomUserID(previousUserID);
                return;
            }

            setChatRandomUserID(data.userID);
            localStorage.setItem('chatRandomUserID', data.userID);
        }

        function handleDisconnectEvent() {
            localStorage.removeItem('chatRandomUserID')
            localStorage.removeItem('chatRandomPartnerID');
            localStorage.removeItem('chatRandomPartnerUserName');
        }

        function handleTotalConnectionEvent(data) {
            setTotalConnections(data.totalConnectionCount);
        }

        function handlePartnerIDEvent(data) {
            if (!localStorage.getItem('chatRandomPartnerID')) {
                localStorage.setItem('chatRandomPartnerID', data.partnerID);
            }
            if (!localStorage.getItem('chatRandomPartnerUserName')) {

                localStorage.setItem('chatRandomPartnerUserName', data.partnerUserName);
            }
            const storedPartnerID = localStorage.getItem('chatRandomPartnerID');
            const storedPartnerUserName = localStorage.getItem('chatRandomPartnerUserName');
            setPartnerUserName(storedPartnerUserName);
            setPartnerID(storedPartnerID);
            setIsChatConnected(true)
            setIsPartnerDisconnected(false);
        }

        function handleUserTypingEvent(data) {
            setIsTyping(data.userTyping);
        }

        function handleNewMessageEvent(data) {
            const newMessage = {
                recipient: 'sender',
                message: data.newMessage,
            }
            setAllMessages(prev => [...prev, newMessage]);



        }

        function handleConnectToAnotherInitiationEvent() {
            console.log("getting second evernt ");
            setPartnerID('');
            localStorage.removeItem('chatRandomPartnerID');
            localStorage.removeItem('chatRandomPartnerUserName');
            setIsPartnerDisconnected(true);
            setIsChatConnected(false);

        }
        chatRandomSocket.on('chat-random-user-id', handleUserIDEvent);
        chatRandomSocket.on('chat-random-total-connection', handleTotalConnectionEvent);
        chatRandomSocket.on('chat-random-partner-id', handlePartnerIDEvent);
        chatRandomSocket.on('chat-random-on-user-typing', handleUserTypingEvent);
        chatRandomSocket.on('chat-random-new-message', handleNewMessageEvent);
        chatRandomSocket.on('chat-random-connect-to-partner-initiated', handleConnectToAnotherInitiationEvent)
        chatRandomSocket.on('disconnect', handleDisconnectEvent);


        return () => {
            chatRandomSocket.off('disconnect', handleDisconnectEvent);
            chatRandomSocket.off('chat-random-user-id', handleUserIDEvent);
            chatRandomSocket.off('chat-random-partner-id', handlePartnerIDEvent);
            chatRandomSocket.off('chat-random-on-user-typing', handleUserTypingEvent);
            chatRandomSocket.off('chat-random-total-connection', handleTotalConnectionEvent);
            chatRandomSocket.off('chat-random-new-message', handleNewMessageEvent);
            chatRandomSocket.off('chat-random-connect-to-partner-initiated', handleConnectToAnotherInitiationEvent)


        }


    }, [])



    useEffect(() => {
        console.log("totalConnections ", totalConnections)

    }, [totalConnections])





    //connecting to chatRandomSocket 
    useEffect(() => {
        function connect(chatRandomSocket) {

            const previousUserID = localStorage.getItem('chatRandomUserID');

            chatRandomSocket.auth = previousUserID ? { userID: previousUserID, userName: userGuestName } : { userName: userGuestName };

            const storedPartnerID = localStorage.getItem('chatRandomPartnerID');
            const storedPartnerUserName = localStorage.getItem('chatRandomPartnerUserName');

            if (storedPartnerID && storedPartnerUserName) {
                chatRandomSocket.auth = { ...chatRandomSocket.auth, partnerID: storedPartnerID, partnerUserName: storedPartnerUserName };
            }

            chatRandomSocket.connect();

        }
        function disconnect(chatRandomSocket) {

            localStorage.removeItem('chatRandomUserID')
            localStorage.removeItem('chatRandomPartnerID');
            localStorage.removeItem('chatRandomPartnerUserName');
            chatRandomSocket.disconnect();

        }
        connect(chatRandomSocket)


        return () => {
            disconnect(chatRandomSocket)
        }
    }, []);


    useEffect(() => {

        function handleDeleteIDEvent() {
            localStorage.removeItem('chatRandomUserID')
            localStorage.removeItem('chatRandomPartnerID');
            localStorage.removeItem('chatRandomPartnerUserName');

        }
        window.addEventListener('beforeunload', handleDeleteIDEvent);

        return () => {
            window.removeEventListener('beforeunload', handleDeleteIDEvent);
        };
    }, []);


    function handleInputFocusOnEvent() {
        chatRandomSocket.emit('chat-random-user-typing', { partnerID: partnerID, userTyping: true });
    }
    function handleInputFocusOffEvent() {
        chatRandomSocket.emit('chat-random-user-typing', { partnerID: partnerID, userTyping: false });
    }

    function handleSendMessage() {

        //==============================================use context here
        const newMessage = {
            recipient: 'user',
            message: message
        }
        chatRandomSocket.emit('chat-random-new-message', { partnerID: partnerID, message: message });
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

    function handleConnectToAnotherEvent(event) {
        event.preventDefault();
        chatRandomSocket.emit('chat-random-connect-to-another', {
            partnerID: partnerID
        })
        setPartnerID('');
        localStorage.removeItem('chatRandomPartnerID');
        localStorage.removeItem('chatRandomPartnerUserName');
        setAllMessages([])
        setIsChatConnected(false);

    }
    return (
        <div>
            <Header />
            {
                (partnerID.length <= 0) ?
                    <div className='w-full h-fit flex justify-center items-center md:text-xl lg:text-2xl p-12'>{isParnterDisconnected ? `Your partner has left the chat please try connecting to another ` : ` Sorry we can't connect right now, because nobody is online, Refresh after sometime to check again`} </div> :
                    <div className='w-full h-[90vh]  flex flex-col'>
                        <div className='border-2 w-full h-fit p-4 flex justify-center bg-green-300 items-center text-[1rem] md:text-xl lg:text-2xl '>
                            {isChatConnected ? `Finally! you are connected to ${partnerUserName}. Say Hi!!!` : `Please wait we are connecting you to a random person... `}
                        </div>
                        <div ref={messageContainerRef} className='border-2 relative overflow-y-scroll border-red-600 h-[72vh]'>
                            <ul>

                                {allMessages.map((msg, idx) => (
                                    <li
                                        key={idx}
                                        className={`h-fit w-fit bg-${msg.recipient === 'sender' ? 'blue-300' : 'green-300'} p-4 md:text-xl lg:text-2xl rounded md:rounded-lg  m-2 `}
                                    >
                                        {msg.message}
                                    </li>
                                ))}
                            </ul>
                            {istyping && <p className='absolute bottom-1 left-1 text-gray-500'>typing...</p>}
                        </div>
                        <div className='border-blue-600 border-2 h-[9vh] flex  w-full'>
                            <div onClick={handleConnectToAnotherEvent} className='h-full w-fit text-white px-3 flex justify-center items-center md:text-xl lg:text-2xl hover:text-blue-300 cursor-pointer bg-black '>
                                Connect to another
                            </div>
                            <input ref={inputBoxRef} onFocus={handleInputFocusOnEvent} onBlur={handleInputFocusOffEvent} type="text" value={message} onChange={handleInputChange} placeholder='Enter the message' className='border-pink-500 border-2 md:text-xl lg:text-2xl px-4 flex-1' />
                            <button onClick={handleSendMessage} className='w-fit h-full bg-black cursor-pointer text-white px-4 md:text-xl lg:text-2xl hover:text-blue-300 '>send</button>
                        </div>

                    </div>
            }


        </div>
    )
}

export default ChatRandom