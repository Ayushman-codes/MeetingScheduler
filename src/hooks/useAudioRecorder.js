import { useState, useRef } from 'react';

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      // Request microphone access
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Request system audio (user must select "Share system audio" in the browser prompt)
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true, 
        audio: true 
      });

      const audioContext = new AudioContext();
      const destination = audioContext.createMediaStreamDestination();

      const micSource = audioContext.createMediaStreamSource(micStream);
      micSource.connect(destination);

      // Check if the user actually shared system audio
      if (screenStream.getAudioTracks().length > 0) {
        const systemSource = audioContext.createMediaStreamSource(screenStream);
        systemSource.connect(destination);
      }

      const combinedStream = destination.stream;
      const recorder = new MediaRecorder(combinedStream, { mimeType: 'audio/webm' });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Failed to start recording. Please allow microphone and system audio permissions.");
    }
  };

  const stopRecording = () => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) {
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];
        setIsRecording(false);
        resolve(audioBlob);
      };

      mediaRecorderRef.current.stop();
      
      // Stop all tracks to release hardware
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    });
  };

  return { isRecording, startRecording, stopRecording };
}