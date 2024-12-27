import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

const VideoPlayer = ({ url, isRunning, refreshTrigger }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  useEffect(() => {
    console.log('VideoPlayer - Props recibidas:');
    console.log('- URL:', url);
    console.log('- isRunning:', isRunning);
    console.log('- refreshTrigger:', refreshTrigger);

    let hls = hlsRef.current;

    const initPlayer = () => {
      if (isRunning && url && Hls.isSupported()) {
        console.log('Iniciando reproductor HLS con URL:', url);
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
          console.log('Error HLS, reintentando en 5 segundos...');
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
          console.log('Manifest parseado correctamente');
          videoRef.current.play()
            .then(() => {
              console.log('Reproducción iniciada');
              setIsPlaying(true);
              setIsConnecting(false);
            })
            .catch(e => {
              console.error("Error en autoplay:", e);
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
      console.log('Estado running detectado, esperando 5 segundos...');
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