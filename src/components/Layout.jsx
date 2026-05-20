import { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-dark-950">
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setSidebarOpen(false)}
      />
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-dark-800 bg-dark-950/80 px-4 py-3 backdrop-blur-xl lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-dark-300 hover:bg-dark-800 hover:text-dark-100 transition-colors lg:hidden"
          >
            <Menu size={20} />
          </button>
          <div className="text-xs text-dark-400">
            {new Date().toLocaleDateString('es-MX', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-dark-400">Local</span>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
