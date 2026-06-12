import { useEffect, useRef, useState } from 'react';

export default function JitsiRoom({ roomName, onLeave }) {
  const containerRef = useRef(null);
  const apiRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Phase 1: Dynamically load the Jitsi script
  useEffect(() => {
    // If it's already attached to window, we are safe to go
    if (window.JitsiMeetExternalAPI) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    
    script.onload = () => {
      setScriptLoaded(true);
    };

    script.onerror = () => {
      setError('Failed to load the Jitsi meeting interface script.');
    };

    document.body.appendChild(script);

    return () => {
      // Clean up the script tag if the component unmounts while loading
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Phase 2: Initialize Jitsi once the script is verified loaded
  useEffect(() => {
    if (!scriptLoaded || !containerRef.current) return;

    const domain = 'meet.jit.si';
    const options = {
      roomName: roomName,
      width: '100%',
      height: 700,
      parentNode: containerRef.current,
      configOverwrite: {
        disableThirdPartyRequests: true,
        analytics: { disabled: true },
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'desktop', 'fullscreen',
          'hangup', 'chat', 'raisehand', 'videoquality', 'tileview'
        ],
      },
    };

    try {
      apiRef.current = new window.JitsiMeetExternalAPI(domain, options);

      apiRef.current.addListener('videoConferenceLeft', () => {
        if (onLeave) onLeave();
      });
    } catch (err) {
      console.error("Failed to initialize Jitsi client:", err);
      setError('Could not initialize the meeting client.');
    }

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
      }
    };
  }, [roomName, onLeave, scriptLoaded]);

  if (error) {
    return (
      <div className="w-full h-[700px] bg-gray-900 rounded-lg flex items-center justify-center text-white">
        <p className="text-red-400 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[700px] bg-gray-900 rounded-lg overflow-hidden shadow-lg">
      {!scriptLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-white bg-gray-900 z-10">
          <p className="animate-pulse">Loading meeting wrapper interface...</p>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}