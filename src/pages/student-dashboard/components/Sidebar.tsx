import { ChevronDown, Menu } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ size: number }>;
}

interface SidebarSection {
  title: string;
  items: string[];
}

interface SidebarProps {
  onTabChange?: (tab: string) => void;
  tabs?: Tab[];
  activeTab?: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    title: 'Academic',
    items: [
      'My Class',
      'Class Schedule',
      'Grades & Transcript',
      'Assignments',
      'Academic Calendar',
      'AI Features',
      'Gamification',
      'Chat',
    ],
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

export default function Sidebar({ onTabChange, tabs, activeTab, isOpen, onToggle }: SidebarProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen overflow-hidden">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900">Eduverse</span>
          <button onClick={onToggle} className="p-1 hover:bg-gray-100 rounded transition-colors">
            <Menu size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4">
        {/* Vertical Tabs Section */}
        {tabs && tabs.length > 0 && (
          <div className="mb-6">
            <div className="space-y-2">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange?.(tab.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-purple-100 text-purple-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent size={18} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
            {tabs.length > 0 && <div className="border-b border-gray-200 my-4" />}
          </div>
        )}
      </div>
    </div>
  );
}
