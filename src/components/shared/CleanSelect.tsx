import React from 'react';
import { CustomDropdown } from './CustomDropdown';
import { useTheme } from '../../pages/student-dashboard/contexts/ThemeContext';

export interface CleanSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  value?: string | number;
}

export function CleanSelect({ value, onChange, children, className }: CleanSelectProps) {
  const theme = useTheme() as any;
  const isDark = theme?.isDark ?? false;
  const accentColor = theme?.primaryHex ?? '#3b82f6';

  const options = React.Children.toArray(children)
    .map((child: any) => {
      if (child && child.type === 'option') {
        return {
          value:
            child.props.value !== undefined
              ? String(child.props.value)
              : String(child.props.children),
          label: child.props.children,
        };
      }
      return null;
    })
    .filter(Boolean) as { value: string; label: React.ReactNode }[];

  const stringValue = value !== undefined ? String(value) : options[0]?.value || '';

  const handleChange = (val: string) => {
    if (onChange) {
      // Mock the event object for seamless drop-in replacement
      onChange({ target: { value: val } } as React.ChangeEvent<HTMLSelectElement>);
    }
  };

  // Filter out classes meant for native select interiors (padding, borders, etc.)
  // so they don't apply to our wrapper div and cause gaps.
  const layoutClassNames = (className || '')
    .split(' ')
    .filter(
      (c) =>
        !c.startsWith('px-') &&
        !c.startsWith('py-') &&
        !c.startsWith('p-') &&
        !c.startsWith('bg-') &&
        !c.startsWith('border') &&
        !c.startsWith('rounded') &&
        !c.startsWith('text-') &&
        !c.startsWith('focus:') &&
        !c.startsWith('ring-')
    )
    .join(' ');

  return (
    <div className={`min-w-[140px] ${layoutClassNames}`}>
      <CustomDropdown
        value={stringValue}
        onChange={handleChange}
        options={options.map((opt) => ({ ...opt, label: String(opt.label) }))}
        isDark={isDark}
        accentColor={accentColor}
      />
    </div>
  );
}
