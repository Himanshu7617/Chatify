import { useState, useRef, useEffect, useContext } from 'react'
import Header from '../components/Header'
import { videoChatRandomSocket } from '../socket';
import { globalContext } from '../context/GlobalContext';

const VideoChatRandom = () => {

    const { userGuestName, setVideoChatRandomUserID } = useContext(globalContext);


    const [isChatConnected, setIsChatConnected] = useState(false);
    const [isParnterDisconnected, setIsPartnerDisconnected] = useState(false);
    const [totalConnections, setTotalConnections] = useState(-1);
    const [partnerID, setPartnerID] = useState('');
    const [partnerUserName, setPartnerUserName] = useState('');

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const localStreamRef = useRef(null);//but where the fuck is it being used here
    const peerRef = useRef(null);




    useEffect(() => {
        async function startVideoCall() { 
            //get webcam 
            const localStream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
            if(localVideoRef && localVideoRef.current) { 
                localVideoRef.current.src = localStream;
                localVideoRef.current.srcObject = localStream;

                localStreamRef.current = localStream;
            }

            //create peer connection 
            const peer = new RTCPeerConnection({ 
                iceServers : [{urls : 'stun:stun.l.google.com:19302'}],
            });
            peerRef.current = peer;

            //add local tracks
            localStream.getTracks().forEach(track => {
                peer.addTrack(track, localStream);
            })

            
            //when gathering ice candidates 
            peer.onicecandidate = ({candidate}) => { 
                if(candidate) {
                    videoChatRandomSocket.emit('video-chat-random-ice-candidate', candidate)
                }
            }

            //when receiving track from remote
            peer.ontrack = (event) => { 
                console.log(event.streams);
                remoteVideoRef.current.srcObject = event.streams[0];
                remoteVideoRef.current.src = event.streams[0];
            }
            //listen for incoming offer 
            videoChatRandomSocket.on('video-chat-random-offer', async (offer) => { 
                await peer.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await peer.createAnswer();
                await peer.setLocalDescription(answer);
                videoChatRandomSocket.emit('video-chat-random-answer', answer);
            });

            //listen for answer to our offer
            videoChatRandomSocket.on('video-chat-random-answer', async(answer) => { 
                await peer.setRemoteDescription(new RTCSessionDescription(answer));
            });

            //listen for ICE candidates from other peer
            videoChatRandomSocket.on('video-chat-random-ice-candidate', async (candidate) => { 
                try { 
                    await peer.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (err) {
                    console.error("Failed to add ICE candidate", err);
                }
            });


            

            //create and send offer (start the call)
            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);
            videoChatRandomSocket.emit('video-chat-random-offer', offer);
        }


        function handleUserIDEvent(data) {
            const previousUserID = localStorage.getItem('videoChatRandomUserID');

            if (previousUserID) {
                setVideoChatRandomUserID(previousUserID);
                return;
            }

            setVideoChatRandomUserID(data.userID);
            localStorage.setItem('videoChatRandomUserID', data.userID);
        }

        function handleDisconnectEvent() {
            localStorage.removeItem('videoChatRandomUserID')
            localStorage.removeItem('videoChatRandomPartnerID');
            localStorage.removeItem('videoChatRandomPartnerUserName');
        }

        function handleTotalConnectionEvent(data) {
            setTotalConnections(data.totalConnectionCount);
        }

        function handlePartnerIDEvent(data) {
            if (!localStorage.getItem('videoChatRandomPartnerID')) {
                localStorage.setItem('videoChatRandomPartnerID', data.partnerID);
            }
            if (!localStorage.getItem('videoChatRandomPartnerUserName')) {

                localStorage.setItem('videoChatRandomPartnerUserName', data.partnerUserName);
            }
            const storedPartnerID = localStorage.getItem('videoChatRandomPartnerID');
            const storedPartnerUserName = localStorage.getItem('videoChatRandomPartnerUserName');
            setPartnerUserName(storedPartnerUserName);
            setPartnerID(storedPartnerID);
            setIsChatConnected(true)
            setIsPartnerDisconnected(false);
        }



        function handleConnectToAnotherInitiationEvent() {
            console.log("getting second evernt ");
            setPartnerID('');
            localStorage.removeItem('videoChatRandomPartnerID');
            localStorage.removeItem('videoChatRandomPartnerUserName');
            setIsPartnerDisconnected(true);
            setIsChatConnected(false);

        }
        videoChatRandomSocket.on('video-chat-random-user-id', handleUserIDEvent);
        videoChatRandomSocket.on('video-chat-random-total-connection', handleTotalConnectionEvent);
        videoChatRandomSocket.on('video-chat-random-partner-id', handlePartnerIDEvent);
        videoChatRandomSocket.on('video-chat-random-connect-to-partner-initiated', handleConnectToAnotherInitiationEvent)
        videoChatRandomSocket.on('disconnect', handleDisconnectEvent);

        if(partnerID && partnerUserName) { 
            startVideoCall();
        }
        return () => {
            videoChatRandomSocket.off('disconnect', handleDisconnectEvent);
            videoChatRandomSocket.off('video-chat-random-user-id', handleUserIDEvent);
            videoChatRandomSocket.off('video-chat-random-partner-id', handlePartnerIDEvent);
            videoChatRandomSocket.off('video-chat-random-total-connection', handleTotalConnectionEvent);
            videoChatRandomSocket.off('video-chat-random-connect-to-partner-initiated', handleConnectToAnotherInitiationEvent)


        }


    }, [partnerID, partnerUserName])



    useEffect(() => {
        console.log("totalConnections ", totalConnections)

    }, [totalConnections])





    //connecting to videoChatRandomSocket 
    useEffect(() => {
        function connect(videoChatRandomSocket) {

            const previousUserID = localStorage.getItem('videoChatRandomUserID');

            videoChatRandomSocket.auth = previousUserID ? { userID: previousUserID, userName: userGuestName } : { userName: userGuestName };

            const storedPartnerID = localStorage.getItem('videoChatRandomPartnerID');
            const storedPartnerUserName = localStorage.getItem('videoChatRandomPartnerUserName');

            if (storedPartnerID && storedPartnerUserName) {
                videoChatRandomSocket.auth = { ...videoChatRandomSocket.auth, partnerID: storedPartnerID, partnerUserName: storedPartnerUserName };
            }

            videoChatRandomSocket.connect();

        }
        function disconnect(videoChatRandomSocket) {

            localStorage.removeItem('videoChatRandomUserID')
            localStorage.removeItem('videoChatRandomPartnerID');
            localStorage.removeItem('videoChatRandomPartnerUserName');
            videoChatRandomSocket.disconnect();

        }
        connect(videoChatRandomSocket)


        return () => {
            disconnect(videoChatRandomSocket)
        }
    }, []);


    useEffect(() => {

        function handleDeleteIDEvent() {
            localStorage.removeItem('videoChatRandomUserID')
            localStorage.removeItem('videoChatRandomPartnerID');
            localStorage.removeItem('videoChatRandomPartnerUserName');

        }
        window.addEventListener('beforeunload', handleDeleteIDEvent);

        return () => {
            window.removeEventListener('beforeunload', handleDeleteIDEvent);
        };
    }, []);





    function handleConnectToAnotherEvent(event) {
        event.preventDefault();
        videoChatRandomSocket.emit('video-chat-random-connect-to-another', {
            partnerID: partnerID
        })
        setPartnerID('');
        localStorage.removeItem('videoChatRandomPartnerID');
        localStorage.removeItem('videoChatRandomPartnerUserName');
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
                        <div className='flex gap-12 p-4'>
                            <div>
                                <h2>Local Video</h2>
                                <video ref={localVideoRef} autoPlay muted playsInline style={{ width: '300px' }} />
                            </div>
                            <div>
                                <h2>Remote Video</h2>
                                <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '300px' }} />
                            </div>
                        </div>
                        <button onClick={handleConnectToAnotherEvent}> connect to another</button>

                    </div>
            }


        </div>
    )
}

export default VideoChatRandom