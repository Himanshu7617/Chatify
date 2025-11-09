// backend/config/mediasoupConfig.js
import { createWorker as createMediasoupWorker } from "mediasoup";

let worker = null;
let router = null;

export async function createWorker() {
  if (worker && router) return;

  worker = await createMediasoupWorker({
    // optional: set specific port range
    rtcMinPort: 10000,
    rtcMaxPort: 10100,
  });

  worker.on("died", () => {
    console.error("mediasoup worker died — exiting process");
    process.exit(1);
  });

  router = await worker.createRouter({
    mediaCodecs: [
      {
        kind: "audio",
        mimeType: "audio/opus",
        clockRate: 48000,
        channels: 2,
      },
      {
        kind: "video",
        mimeType: "video/VP8",
        clockRate: 90000,
      },
    ],
  });

  console.log("mediasoup worker + router created");
}

export function getRouter() {
  if (!router) throw new Error("mediasoup router not initialized — call createWorker() first");
  return router;
}
