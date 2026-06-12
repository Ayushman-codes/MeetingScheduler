import { Calendar, FileText } from 'lucide-react';

export default function MeetingCard({ title, date, summary }) {
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
        <div className="flex items-center mb-2 text-blue-800 dark:text-blue-300 font-semibold text-sm">
          <FileText className="w-4 h-4 mr-2" />
          AI Summary
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
          {summary || "No summary available for this meeting."}
        </p>
      </div>
    </div>
  );
}