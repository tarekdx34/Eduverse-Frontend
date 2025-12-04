import { ChevronDown, Menu } from 'lucide-react';

interface SidebarSection {
  title: string;
  items: string[];
}

interface SidebarProps {
  onTabChange?: (tab: string) => void;
}

const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    title: 'Academic',
    items: ['My Class', 'Class Schedule', 'Grades & Transcript', 'Assignments', 'Academic Calendar', 'AI Features', 'Gamification', 'Chat'],
  },
  {
    title: 'Documents',
    items: ['Official Transcript', 'Certificates'],
  },
  {
    title: 'Financial',
    items: ['Tuition & Fees', 'Payment History', 'Financial Aid'],
  },
  {
    title: 'Student Life',
    items: ['Organizations', 'Campus Events', 'Housing & Dormitory'],
  },
];

const handleItemClick = (item: string, callback?: (tab: string) => void) => {
  switch (item) {
    case 'My Class':
      callback?.('myclass');
      break;
    case 'Class Schedule':
      callback?.('schedule');
      break;
    case 'Payment History':
      callback?.('payments');
      break;
    default:
      break;
  }
};

export default function Sidebar({ onTabChange }: SidebarProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900">Eduverse</span>
          <button className="p-1 hover:bg-gray-100 rounded transition-colors">
            <Menu size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4">
        {/* Dashboard Button */}
        <div 
          onClick={() => onTabChange?.('dashboard')}
          className="bg-gray-100 rounded-lg p-3 mb-6 flex items-center gap-3 cursor-pointer hover:bg-gray-200 transition-colors"
        >
          <div className="w-5 h-5 flex-shrink-0 rounded" style={{ backgroundColor: '#4f39f6' }} />
          <span className="text-gray-900 font-medium">Dashboard</span>
        </div>

        {/* Sections */}
        {SIDEBAR_SECTIONS.map((section) => (
          <div key={section.title} className="mb-6">
            <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors">
              <span className="font-semibold text-gray-900 text-sm">{section.title}</span>
              <ChevronDown size={16} className="text-gray-600" />
            </div>
            <div className="space-y-2 ml-2">
              {section.items.map((item) => (
                <button
                  key={item}
                  onClick={() => handleItemClick(item, onTabChange)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors text-sm text-left"
                >
                  <div className="w-4 h-4 flex-shrink-0 rounded" style={{ backgroundColor: '#d1d5db' }} />
                  <span>{item}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
