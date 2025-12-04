import { Search, Bell } from 'lucide-react';

interface HeaderProps {
  userName?: string;
}

export default function Header({ userName = 'Tarek Mohamed' }: HeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-gray-900">Welcome Back, {userName}</h1>
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative w-64">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input type="text" placeholder="Search Here" className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          {/* Notification */}
          <button className="relative p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <Bell size={20} className="text-gray-600" />
            <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          {/* Avatar */}
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full cursor-pointer hover:opacity-80 transition-opacity" />
        </div>
      </div>
    </div>
  );
}
