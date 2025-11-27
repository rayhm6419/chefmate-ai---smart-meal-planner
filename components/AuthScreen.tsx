
import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Chrome, MessageCircle } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: { name: string; email: string; avatar?: string }) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login/register success
    if (email && password) {
        // For demo purposes, use ui-avatars
        onLogin({
            name: name || email.split('@')[0],
            email: email,
            avatar: `https://ui-avatars.com/api/?name=${name || email}&background=4f46e5&color=fff&bold=true`
        });
    }
  };

  const handleSocialLogin = (provider: 'google' | 'wechat') => {
      // Simulate social login success
      const mockUser = provider === 'google' 
        ? { name: 'Google User', email: 'user@gmail.com' } 
        : { name: 'WeChat User', email: 'user@wechat.com' };
      
      onLogin({
          name: mockUser.name,
          email: mockUser.email,
          avatar: `https://ui-avatars.com/api/?name=${mockUser.name}&background=random&bold=true`
      });
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-white p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-white text-3xl font-bold mb-6 shadow-xl shadow-indigo-200">
            CM
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            {isRegistering ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-slate-500 mt-2">
            {isRegistering ? 'Start your smart kitchen journey' : 'Sign in to continue planning'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
             <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Name</label>
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="Your Name"
                />
             </div>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="hello@example.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 active:scale-95 transition-transform flex items-center justify-center gap-2 mt-2"
          >
            {isRegistering ? 'Sign Up' : 'Sign In'} <ArrowRight className="w-5 h-5" />
          </button>
        </form>
        
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-slate-400 font-medium">Or continue with</span></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => handleSocialLogin('google')} className="flex items-center justify-center gap-2 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 active:scale-95 transition-all group">
             <Chrome className="w-5 h-5 text-slate-600 group-hover:text-indigo-600" />
             <span className="font-bold text-slate-700">Google</span>
          </button>
          <button onClick={() => handleSocialLogin('wechat')} className="flex items-center justify-center gap-2 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 active:scale-95 transition-all group">
             <MessageCircle className="w-5 h-5 text-slate-600 group-hover:text-green-600" />
             <span className="font-bold text-slate-700">WeChat</span>
          </button>
        </div>

        <p className="text-center text-slate-500 text-sm font-medium">
          {isRegistering ? 'Already have an account?' : "Don't have an account?"} {' '}
          <button onClick={() => setIsRegistering(!isRegistering)} className="text-indigo-600 font-bold hover:underline">
            {isRegistering ? 'Sign In' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  );
};
