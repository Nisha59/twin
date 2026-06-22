import Image from 'next/image';
import Twin from '@/components/twin';

export default function Home() {
  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      {/* Sidebar — hidden on mobile */}
      <aside className="hidden md:flex flex-col w-64 bg-zinc-900 border-r border-zinc-800 p-6 shrink-0">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/avatar.jpg"
            alt="Nisha Chavan"
            width={80}
            height={80}
            className="w-20 h-20 rounded-full object-cover ring-2 ring-indigo-500 mb-4"
          />
          <h1 className="text-white font-semibold text-base">Nisha Chavan</h1>
          <p className="text-zinc-400 text-sm mt-1">Digital Twin</p>
        </div>

        <div className="mt-8">
          <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2 font-medium">About</p>
          <p className="text-zinc-400 text-sm leading-relaxed">
            A digital version of Nisha, ask me anything about her work, skills, or projects.
          </p>
        </div>

      </aside>

      {/* Chat area */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <Twin />
      </div>
    </div>
  );
}
