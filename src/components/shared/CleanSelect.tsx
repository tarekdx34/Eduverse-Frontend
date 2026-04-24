import React, { useContext } from 'react';
import { CustomDropdown } from './CustomDropdown';
import StudentThemeContext from '../../pages/student-dashboard/contexts/ThemeContext';
import InstructorThemeContext from '../../pages/instructor-dashboard/contexts/ThemeContext';
import TaThemeContext from '../../pages/ta-dashboard/contexts/ThemeContext';
import AdminThemeContext from '../../pages/admin-dashboard/contexts/ThemeContext';
import ItAdminThemeContext from '../../pages/it-admin-dashboard/contexts/ThemeContext';
import GlobalThemeContext from '../../context/ThemeContext';

export interface CleanSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  value?: string | number;
}

export function CleanSelect({ value, onChange, children, className }: CleanSelectProps) {
  const studentTheme = useContext(StudentThemeContext) as any;
  const instructorTheme = useContext(InstructorThemeContext) as any;
  const taTheme = useContext(TaThemeContext) as any;
  const adminTheme = useContext(AdminThemeContext) as any;
  const itAdminTheme = useContext(ItAdminThemeContext) as any;
  const globalTheme = useContext(GlobalThemeContext) as any;

  // Find the first theme that is actually provided (not undefined and has properties)
  const theme = [
    studentTheme,
    instructorTheme,
    taTheme,
    adminTheme,
    itAdminTheme,
    globalTheme
  ].find(t => t && (t.theme !== undefined || t.isDark !== undefined)) || {};

  const isDark = theme?.isDark ?? (theme?.theme === 'dark') ?? false;
  const accentColor = theme?.primaryHex ?? theme?.primaryColor ?? '#3b82f6';

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
