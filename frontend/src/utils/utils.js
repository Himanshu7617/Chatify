//  async function startVideoChat() {

//             // step 1 : get rtp capabilities 
//             const rtpCapabilities = await new Promise((resolve) => {
//                 videoChatRandomSocket.emit('video-chat-random-get-rtp-capabilities', resolve);
//             });

//             // step 2 : create transport on server 
//             const transportInfo = await new Promise((resolve) => {
//                 videoChatRandomSocket.emit('video-chat-random-create-transport', resolve);
//             });

//             // step 3 : create a new device 
//             const device = mediaSoupClient.Device();
//             await device.load({ routerRtpCapabilities: rtpCapabilities });

//             // step 4 : create transport client side 
//             const sendTransport = device.createSendTransport(transportInfo);

//             sendTransport.on('connect', ({ dtlsParameters }, callback) => {
//                 videoChatRandomSocket.emit('video-chat-random-connect-transport', { dtlsParameters });
//                 callback();
//             });

//             sendTransport.on("produce", async ({ kind, rtpParameters }, callback) => {
//                 videoChatRandomSocket.emit("video-chat-random-produce", { kind, rtpParameters }, ({ id }) => {
//                     callback({ id });
//                 });
//             }
//             );

//             // step 5 : get webcam 

//             const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//             if (localVideoRef && localVideoRef.current) {
//                 localVideoRef.current.src = localStream;
//                 localVideoRef.current.srcObject = localStream;

//                 localStreamRef.current = localStream;
//                 // step 6 : produce tracks
//                 localStream.getTracks().forEach(track => {
//                     sendTransport.produce({ track });
//                 })  

//             }

           

//         } 