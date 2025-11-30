import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, label, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-sm font-medium text-[#121712] mb-2">{label}</label>}
        <input
          ref={ref}
          className={`w-full h-[56px] rounded-[12px] px-4 font-["Lexend","Noto_Sans_Arabic",sans-serif] bg-[#f0f5f2] text-[#121712] placeholder:text-[#638766] focus:outline-none focus:ring-2 focus:ring-[#1adb2e] ${
            error ? 'ring-2 ring-red-500' : ''
          } ${className}`}
          {...props}
        />
        {error && <p className="text-red-500 text-[12px] mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';



