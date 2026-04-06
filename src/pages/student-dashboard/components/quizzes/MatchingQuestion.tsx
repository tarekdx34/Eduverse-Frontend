import React, { useState, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

// Types
interface MatchingPair {
  left: string;
  right: string;
}

interface MatchingQuestionProps {
  leftItems: string[];
  rightItems: string[];
  selectedPairs: MatchingPair[];
  onPairChange: (pairs: MatchingPair[]) => void;
  disabled?: boolean;
}

// Pair colors
const PAIR_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
];

export const MatchingQuestion: React.FC<MatchingQuestionProps> = ({
  leftItems,
  rightItems,
  selectedPairs,
  onPairChange,
  disabled = false,
}) => {
  const { isDark } = useTheme();
  const { isRTL } = useLanguage();
  const [activeLeftItem, setActiveLeftItem] = useState<string | null>(null);

  // Create maps for quick lookup
  const pairedMap = useMemo(() => {
    const map = new Map<string, { side: 'left' | 'right'; partner: string; pairIndex: number }>();
    selectedPairs.forEach((pair, index) => {
      map.set(pair.left, { side: 'left', partner: pair.right, pairIndex: index });
      map.set(pair.right, { side: 'right', partner: pair.left, pairIndex: index });
    });
    return map;
  }, [selectedPairs]);

  // Handle left item click
  const handleLeftItemClick = (item: string) => {
    if (disabled) return;

    // If this item is already paired, remove the pair
    const existingPair = selectedPairs.find((p) => p.left === item);
    if (existingPair) {
      onPairChange(selectedPairs.filter((p) => p.left !== item));
      setActiveLeftItem(null);
      return;
    }

    // If this item was active, deselect it
    if (activeLeftItem === item) {
      setActiveLeftItem(null);
      return;
    }

    // Activate this item
    setActiveLeftItem(item);
  };

  // Handle right item click
  const handleRightItemClick = (item: string) => {
    if (disabled) return;

    // If no left item is selected, check if this right item is already paired and remove it
    if (!activeLeftItem) {
      const existingPair = selectedPairs.find((p) => p.right === item);
      if (existingPair) {
        onPairChange(selectedPairs.filter((p) => p.right !== item));
      }
      return;
    }

    // If right item is already paired, remove that pair first
    const existingRightPair = selectedPairs.find((p) => p.right === item);
    let updatedPairs = selectedPairs;
    if (existingRightPair) {
      updatedPairs = selectedPairs.filter((p) => p.right !== item);
    }

    // If left item is already paired with something else, remove that pair
    const existingLeftPair = selectedPairs.find((p) => p.left === activeLeftItem);
    if (existingLeftPair) {
      updatedPairs = updatedPairs.filter((p) => p.left !== activeLeftItem);
    }

    // Check if they're already paired together
    if (existingLeftPair?.right === item) {
      // Remove the pair
      onPairChange(updatedPairs.filter((p) => !(p.left === activeLeftItem && p.right === item)));
    } else {
      // Add the new pair
      onPairChange([...updatedPairs, { left: activeLeftItem, right: item }]);
    }

    setActiveLeftItem(null);
  };

  // Get pair color
  const getPairColor = (item: string): string | null => {
    const pairing = pairedMap.get(item);
    if (!pairing) return null;
    return PAIR_COLORS[pairing.pairIndex % PAIR_COLORS.length];
  };

  // Get pair index
  const getPairIndex = (item: string): number | null => {
    const pairing = pairedMap.get(item);
    if (!pairing) return null;
    return pairing.pairIndex + 1;
  };

  // Check if item is in active/selected state
  const isLeftItemActive = (item: string): boolean => activeLeftItem === item;
  const isLeftItemPaired = (item: string): boolean => selectedPairs.some((p) => p.left === item);
  const isRightItemPaired = (item: string): boolean => selectedPairs.some((p) => p.right === item);

  // Theme colors
  const bgColor = isDark ? 'bg-slate-900' : 'bg-white';
  const borderColor = isDark ? 'border-slate-700' : 'border-slate-200';
  const textColor = isDark ? 'text-slate-100' : 'text-slate-900';
  const hoverBg = isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50';
  const activeBg = 'bg-opacity-10';
  const accentColor = '#3B82F6';

  return (
    <div
      className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} gap-8 p-6 rounded-xl border-2 ${borderColor} ${bgColor}`}
    >
      {/* Left Column - Items to Match */}
      <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
        <div className="space-y-3">
          {leftItems.map((item) => {
            const pairColor = getPairColor(item);
            const pairIndex = getPairIndex(item);
            const isActive = isLeftItemActive(item);
            const isPaired = isLeftItemPaired(item);

            return (
              <button
                key={item}
                onClick={() => handleLeftItemClick(item)}
                disabled={disabled}
                className={`
                  w-full p-3 rounded-xl border-2 transition-all duration-200
                  flex items-center justify-between gap-2
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  ${
                    isActive
                      ? `border-${accentColor} bg-[${accentColor}]${activeBg}`
                      : pairColor
                        ? `border-[${pairColor}] bg-[${pairColor}]${activeBg}`
                        : `border-slate-300 ${hoverBg} ${borderColor}`
                  }
                  ${textColor}
                  ${
                    !disabled
                      ? `hover:border-opacity-100 hover:shadow-md`
                      : ''
                  }
                `}
                style={{
                  borderColor: pairColor || (isActive ? accentColor : undefined),
                  backgroundColor: pairColor
                    ? `${pairColor}${activeBg}`
                    : isActive
                      ? `${accentColor}${activeBg}`
                      : undefined,
                }}
              >
                <span className="font-medium">{item}</span>
                {isPaired && pairIndex && (
                  <span
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold"
                    style={{ backgroundColor: pairColor || accentColor }}
                  >
                    {pairIndex}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column - Options */}
      <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
        <div className="space-y-3">
          {rightItems.map((item) => {
            const pairColor = getPairColor(item);
            const pairIndex = getPairIndex(item);
            const isPaired = isRightItemPaired(item);

            return (
              <button
                key={item}
                onClick={() => handleRightItemClick(item)}
                disabled={disabled}
                className={`
                  w-full p-3 rounded-xl border-2 transition-all duration-200
                  flex items-center justify-between gap-2
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  ${
                    pairColor
                      ? `border-[${pairColor}] bg-[${pairColor}]${activeBg}`
                      : `border-slate-300 ${hoverBg} ${borderColor}`
                  }
                  ${textColor}
                  ${
                    !disabled
                      ? `hover:border-opacity-100 hover:shadow-md`
                      : ''
                  }
                `}
                style={{
                  borderColor: pairColor || undefined,
                  backgroundColor: pairColor ? `${pairColor}${activeBg}` : undefined,
                }}
              >
                <span className="font-medium">{item}</span>
                {isPaired && pairIndex && (
                  <span
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold"
                    style={{ backgroundColor: pairColor || accentColor }}
                  >
                    {pairIndex}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MatchingQuestion;
