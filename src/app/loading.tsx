export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center animate-pulse">
          <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
            <rect x="2" y="2" width="6" height="14" rx="1" fill="white" opacity="0.9" />
            <rect x="10" y="2" width="6" height="14" rx="1" fill="white" opacity="0.5" />
          </svg>
        </div>
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" />
        </div>
      </div>
    </div>
  );
}
