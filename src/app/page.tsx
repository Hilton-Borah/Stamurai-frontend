// src/app/page.tsx
import axios from 'axios';
import Link from 'next/link';
axios.defaults.withCredentials = true;

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4 text-black">Task Management System</h1>
      <div className="space-x-4">
        <Link href="/login" className="text-blue-600 hover:underline">Login</Link>
        <Link href="/register" className="text-blue-600 hover:underline">Register</Link>
      </div>
    </main>
  );
}
