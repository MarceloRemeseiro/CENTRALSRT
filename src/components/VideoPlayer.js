import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

const VideoPlayer = ({ url, isRunning, refreshTrigger }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  useEffect(() => {
 

    let hls = hlsRef.current;

    const initPlayer = () => {
      if (isRunning && url && Hls.isSupported()) {
        setIsPlaying(false);
        setIsConnecting(true);
        
        if (hls) {
          hls.destroy();
        }

        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          setIsPlaying(false);
          setIsConnecting(true);
          if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
          }
          retryTimeoutRef.current = setTimeout(initPlayer, 8000);
        });

        hls.loadSource(url);
        hls.attachMedia(videoRef.current);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoRef.current.play()
            .then(() => {
              setIsPlaying(true);
              setIsConnecting(false);
            })
            .catch(e => {
              setIsPlaying(false);
              setIsConnecting(false);
            });
        });

        hlsRef.current = hls;
      } else {
        setIsPlaying(false);
        setIsConnecting(false);
      }
    };

    if (isRunning) {
      setIsConnecting(true);
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      retryTimeoutRef.current = setTimeout(initPlayer, 5000);
    } else {
      setIsPlaying(false);
      setIsConnecting(false);
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      setIsPlaying(false);
      setIsConnecting(false);
    };
  }, [url, isRunning, refreshTrigger]);

  return (
    <div className="video-container relative" style={{ aspectRatio: '16 / 9', backgroundColor: '#000000' }}>
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        controls
        playsInline
        muted
        style={{ display: isPlaying ? 'block' : 'none' }}
      />
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="text-center">
            {isConnecting ? (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <p className="text-lg">Conectando...</p>
              </div>
            ) : (
              <p className="text-lg">NO HAY VIDEO DISPONIBLE</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;