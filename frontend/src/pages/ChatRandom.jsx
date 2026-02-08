import React, { useState, useRef, useEffect, useContext } from 'react'
import Header from '../components/Header'
import { chatRandomSocket } from '../socket';
import { globalContext } from '../context/GlobalContext';
import cloudBackgroundOne from '../assets/cloudBackgroundOne.svg';
import cloudBackgroundTwo from '../assets/cloudBackgroundTwo.svg';
import messageInputBox from '../assets/messageInputBox.svg';
import button from '../assets/button.svg';
import messageBoxOne from '../assets/messageBox.svg';
import messageBoxTwo from '../assets/messageBoxTwo.svg';
import gsap from 'gsap'
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

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
    const [allMessages, setAllMessages] = useState([])

    const cloudOneRef = useRef(null);
    const cloudTwoRef = useRef(null);


    //cloud animation 
    useGSAP(() => {
        const height = window.innerHeight;
        const speed = 0.7;
        if (!cloudOneRef || !cloudTwoRef || !cloudOneRef.current || !cloudTwoRef.current) {
            return;
        }
        gsap.set(cloudOneRef.current, { y: 0 });
        gsap.set(cloudTwoRef.current, { y: height });

        gsap.ticker.add(() => {
            gsap.set([cloudOneRef.current, cloudTwoRef.current], {
                y: (i, el) => {
                    let y = gsap.getProperty(el, "y") - speed * gsap.ticker.deltaRatio();
                    if (y <= -height) y += height * 2;
                    return y;
                }
            });
        });

        return () => gsap.ticker.removeAll();
    })



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
        <div className='h-full w-full overflow-hidden'>
            {/* Background images */}
            <div className='h-full w-full overflow-hidden absolute z-[-100]'>

                <img ref={cloudOneRef} src={cloudBackgroundOne} className='absolute' alt="cloud background" />
                <img ref={cloudTwoRef} src={cloudBackgroundTwo} className='absolute' alt="cloud background" />

                {/* <img src={cloudOne} alt="cloud image" className='absolute scale-[0.5] border-2 left-[-20rem] z-0'  />
            <img src={cloudTwo} alt="cloud image" className='absolute scale-[0.6] border-2 right-[-10rem] bottom-[-10rem] z-0'  /> */}
            </div>

            {/* Page Content */}

            <div className='h-fit w-full z-10'>

                {
                    (partnerID.length <= 0) ?
                        <div className='z-10 w-full h-fit flex justify-center items-center md:text-xl lg:text-2xl p-12'>{isParnterDisconnected ? `Your partner has left the chat please try connecting to another ` : ` Sorry we can't connect right now, because nobody is online, Refresh after sometime to check again`} </div> :
                        <div className='z-10 w-full h-[100vh]   flex flex-col'>
                            <div className='border-b-4 border-[#784421] w-full h-fit p-4 flex justify-center bg-[#D38D5F] font-pixel items-center text-[1rem] md:text-xl lg:text-2xl '>
                                {isChatConnected ? `Finally! you are connected to ${partnerUserName}. Say Hi!!!` : `Please wait we are connecting you to a random person... `}
                            </div>
                            <div ref={messageContainerRef} className='  relative overflow-y-scroll border-red-600 h-[72vh]'>
                                <ul>

                                    {allMessages.map((msg, idx) => (
                                        <li
                                            key={idx}
                                            className={`min-h-[18vh] w-3/5 relative font-pixel ${msg.recipient=== 'sender' ? 'text-blue-800' : 'text-purple-950'} flex items-start  p-4 md:text-xl lg:text-2xl rounded md:rounded-lg  m-2 `}
                                        >
                                            {msg.recipient === 'sender' ? 
                                            <img src={messageBoxOne} className='h-fit w-4/5 absolute top-0 left-0 z-[-50] '/> : 
                                            <img src={messageBoxTwo} className='h-fit w-4/5 absolute top-0 left-0 z-[-50] '/>}
                                            {msg.message}
                                        </li>
                                    ))}
                                </ul>
                                {istyping && <p className='absolute bottom-1 left-1 text-gray-500'>typing...</p>}
                            </div>


                            <div className='border-blue-600  h-[20vh] flex  w-full'>
                                <div onClick={handleConnectToAnotherEvent} className='relative w-1/5 cursor-pointer flex justify-center p-6  items-center  '>
                                   <p className=' text-amber-900 hover:text-green-900 font-pixel md:text-xl lg:text-2xl'>Connect to another</p>
                                    <img src={button} className='object-cover absolute  w-full z-[-50] '  />
                                </div>

                                <div className='relative  w-full  flex justify-center p-6  items-center '>
                                    <img src={messageInputBox} className='w-full absolute object-cover   z-[-50] ' alt="" />
                                    <input ref={inputBoxRef} onFocus={handleInputFocusOnEvent} onBlur={handleInputFocusOffEvent} type="text" value={message} onChange={handleInputChange} placeholder='Enter the message' className=' font-pixel outline-none focus:outline-none md:text-xl lg:text-2xl h-3/5 px-4 flex-1' />
                                </div>

                                <div className='relative  w-1/5  flex justify-center p-6  items-center '>
                                    <img src={button} className='object-cover absolute  w-full  z-[-50]  ' alt="" />

                                    <button onClick={handleSendMessage} className='w-fit  h-full font-pixel text-amber-900 cursor-pointer px-4 md:text-xl lg:text-2xl hover:text-green-700 '>
                                        send
                                    </button>
                                </div>
                            </div>

                        </div>
                }

            </div>

        </div>
    )
}

export default ChatRandom