import React from 'react';

export function Header({ title, instructor }: { title: string; instructor: { name: string; email: string } }) {
  return (
    <header className="bg-white border-b border-gray-200 p-6 flex items-center justify-between">
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-400" />
        <div className="text-sm text-gray-700">
          <div className="font-semibold">{instructor.name}</div>
          <div className="text-gray-500">{instructor.email}</div>
        </div>
      </div>
    </header>
  );
}

export default Header;