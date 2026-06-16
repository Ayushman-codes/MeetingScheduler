import { Calendar, FileText, Copy } from 'lucide-react';

export default function MeetingCard({ title, date, summary }) {

  const handleCopySummary = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      alert("Summary copied to clipboard!");
      // Optional: Add a subtle toast or alert here
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">{title}</h3>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded-full">
          <Calendar className="w-4 h-4 mr-2" />
          {date}
        </div>
      </div>

      <div className="bg-blue-50/50 dark:bg-gray-700/50 rounded-lg p-4 border border-blue-100 dark:border-gray-600">
        {/* Updated flex container to hold the title and the button side-by-side */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-blue-800 dark:text-blue-300 font-semibold text-sm">
            <FileText className="w-4 h-4 mr-2" />
            AI Summary
          </div>

          {/* New Summary Button */}
          <button
            onClick={handleCopySummary}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800"
          >
            <Copy className="w-3 h-3 mr-1.5" />
            Copy Summary
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
          {summary || "No summary available for this meeting."}
        </p>
      </div>
    </div>
  );
}