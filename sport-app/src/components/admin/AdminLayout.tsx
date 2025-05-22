"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // To style active tab
import React from 'react'; // Ensure React is imported for React.ReactNode

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const navItems = [
    { href: '/admin', label: 'Compliance Overview' },
    { href: '/admin/rosters', label: 'Sport Rosters' },
    // { href: '/admin/settings', label: 'Settings' }, // Example for future
  ];

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      <header className="mb-8 py-4 bg-white shadow-lg rounded-lg">
        <h1 className="text-4xl font-bold text-center text-blue-700">Admin Portal</h1>
      </header>
      <nav className="mb-8">
        <ul className="flex border-b-2 border-gray-300">
          {navItems.map(item => (
            <li key={item.href} className="-mb-px mr-2 last:mr-0">
              <Link href={item.href} legacyBehavior={false}>
                <a className={`inline-block py-3 px-5 transition-colors duration-150 ease-in-out
                  ${pathname === item.href 
                    ? 'border-b-4 border-blue-600 text-blue-700 font-semibold bg-blue-50 rounded-t-md' 
                    : 'text-gray-600 hover:text-blue-700 hover:border-blue-400 hover:border-b-4 border-b-4 border-transparent font-medium'}`}
                >
                  {item.label}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <main className="bg-white p-6 rounded-lg shadow-md">
        {children}
      </main>
    </div>
  );
}
