
import React from 'react';
import { Flame } from 'lucide-react';

interface AuthScreenProps {
  onReady?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onReady }) => {
  React.useEffect(() => {
    onReady?.();
  }, [onReady]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-white p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="w-20 h-20 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-white text-3xl font-bold mb-6 shadow-xl shadow-indigo-200">
          <Flame className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">No sign-in required</h2>
        <p className="text-slate-500 mt-2">
          ChefMate runs fully on-device for now. Add your ingredients and start cooking without creating an account.
        </p>
        <button
          onClick={() => onReady?.()}
          className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 active:scale-95 transition-transform"
        >
          Start cooking
        </button>
      </div>
    </div>
  );
};
