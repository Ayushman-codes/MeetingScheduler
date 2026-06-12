import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Plus, Moon, Sun, LogOut, User } from 'lucide-react';
import MeetingCard from '../components/MeetingCard';
import { supabase } from '../supabase/config'; 

export default function Dashboard() {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // --- NEW: State for your real database meetings ---
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize theme based on localStorage or system preference
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Apply the dark class to the HTML document when the theme changes
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Handle clicking outside the menu to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- NEW: Fetch real meetings from Supabase on load ---
  useEffect(() => {
    const fetchMeetings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('meetings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setMeetings(data);
        } else if (error) {
          console.error("Error fetching meetings:", error.message);
        }
      }
      setIsLoading(false);
    };

    fetchMeetings();
  }, []);

  const handleStartMeeting = (e) => {
    e.preventDefault();
    const finalRoomId = roomName.trim().replace(/\s+/g, '-') || `meet-${Math.random().toString(36).substring(2, 10)}`;
    navigate(`/meeting/${finalRoomId}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 font-sans">
      
      {/* Top Navbar */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-4 flex justify-between items-center transition-colors">
        <div className="flex items-center text-blue-600 dark:text-blue-400 font-bold text-xl">
          <Video className="w-6 h-6 mr-2" />
          MeetFlow AI
        </div>
        
        {/* Profile Area */}
        <div className="flex items-center gap-4 relative" ref={menuRef}>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300 hidden sm:block">
            Welcome, Ayush
          </span>
          
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center font-bold shadow-sm transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            A
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute top-12 right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 sm:hidden">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Ayush</p>
              </div>
              
              <button 
                onClick={() => setIsDark(!isDark)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center transition-colors"
              >
                {isDark ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>
              
              <button 
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center transition-colors"
              >
                <User className="w-4 h-4 mr-2" />
                Profile Settings
              </button>
              
              <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
              
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 flex items-center transition-colors font-medium"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto mt-10 px-6 pb-12">
        
        {/* Create Meeting Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-10 text-center transition-colors">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
            Instant AI-Powered Meetings
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-lg mx-auto">
            Start a secure video conference. When you finish, our AI will automatically generate a summary and extract action items.
          </p>
          
          <form onSubmit={handleStartMeeting} className="flex justify-center max-w-md mx-auto gap-3">
            <input 
              type="text" 
              placeholder="Enter room name (optional)" 
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5 mr-1" />
              Start Meeting
            </button>
          </form>
        </div>

        {/* --- NEW: Dynamic Meeting History Section --- */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">Your Meeting History</h2>
          
          {isLoading ? (
            <p className="text-gray-500 dark:text-gray-400 animate-pulse">Loading your history...</p>
          ) : meetings.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">You haven't had any recorded meetings yet. Start one above!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {meetings.map((meeting) => (
                <MeetingCard 
                  key={meeting.id}
                  title={meeting.room_name}
                  date={new Date(meeting.created_at).toLocaleDateString()}
                  summary={meeting.summary}
                />
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}