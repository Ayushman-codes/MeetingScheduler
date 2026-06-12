import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import JitsiRoom from '../components/JitsiRoom';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { supabase } from '../supabase/config';
import { generateSummaryFromAudio } from '../services/aiService';

export default function MeetingRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { isRecording, startRecording, stopRecording } = useAudioRecorder();
  const [isUploading, setIsUploading] = useState(false);

  const handleLeaveMeeting = async () => {
    if (isRecording) {
      setIsUploading(true);
      try {
        const audioBlob = await stopRecording();
        
        if (audioBlob) {
          // 1. Get the current logged-in user
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("No user logged in");

          // 2. Upload to Supabase bucket
          const fileName = `meeting-${roomId}-${Date.now()}.webm`;
          await supabase.storage.from('meeting-recordings').upload(fileName, audioBlob);

          // 3. Send audio to Gemini for the summary
          console.log("Analyzing audio with Gemini...");
          const aiSummary = await generateSummaryFromAudio(audioBlob);

          // 4. Save the final summary to your database table
          const { error: dbError } = await supabase
            .from('meetings')
            .insert([
              { 
                user_id: user.id, 
                room_name: roomId, 
                summary: aiSummary 
              }
            ]);

          if (dbError) throw dbError;
          
          alert("Meeting analyzed and saved successfully!");
        }
      } catch (err) {
        console.error("Pipeline failed:", err);
        alert("Something went wrong while processing the meeting.");
      } finally {
        setIsUploading(false);
      }
    }
    navigate('/');
  };

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Room: {roomId}</h1>
        <button 
          onClick={isRecording ? handleLeaveMeeting : startRecording}
          disabled={isUploading}
          className={`px-6 py-2 rounded-lg text-white font-semibold shadow transition-colors ${
            isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
          } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isRecording ? (isUploading ? 'Analyzing AI Summary...' : 'Stop Recording & Leave') : 'Start AI Recording'}
        </button>
      </div>
      
      <JitsiRoom roomName={roomId} onLeave={handleLeaveMeeting} />
    </div>
  );
}