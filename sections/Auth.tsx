
import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    newsletter: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate auth
    onLogin({
      email: formData.email,
      name: formData.name || formData.email.split('@')[0]
    });
    alert(`Successfully ${isLogin ? 'logged in' : 'registered'}! Check your email for confirmation.`);
  };

  return (
    <div className="pt-32 pb-20 px-4 min-h-[90vh] flex items-center justify-center bg-gradient-to-b from-black to-[#111]">
      <div className="max-w-md w-full glass p-8 md:p-12 shadow-2xl border-gray-800">
        <header className="text-center mb-10">
          <h2 className="text-4xl font-serif mb-2">{isLogin ? 'Welcome Back' : 'Join the Inner Circle'}</h2>
          <p className="text-gray-500 text-sm">{isLogin ? 'Log in to access your account' : 'Register for early access to tours and news'}</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-[10px] tracking-widest uppercase font-bold text-gray-400 flex items-center">
                <UserIcon size={12} className="mr-2" /> Full Name
              </label>
              <input 
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-black/40 border border-gray-800 p-4 text-sm focus:border-yellow-600 outline-none transition-all placeholder:text-gray-700"
                placeholder="John Doe"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] tracking-widest uppercase font-bold text-gray-400 flex items-center">
              <Mail size={12} className="mr-2" /> Email Address
            </label>
            <input 
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-black/40 border border-gray-800 p-4 text-sm focus:border-yellow-600 outline-none transition-all placeholder:text-gray-700"
              placeholder="name@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] tracking-widest uppercase font-bold text-gray-400 flex items-center">
              <Lock size={12} className="mr-2" /> Password
            </label>
            <input 
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full bg-black/40 border border-gray-800 p-4 text-sm focus:border-yellow-600 outline-none transition-all placeholder:text-gray-700"
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={formData.newsletter}
                onChange={(e) => setFormData({...formData, newsletter: e.target.checked})}
                className="form-checkbox bg-transparent border-gray-800 text-yellow-600 rounded-sm"
              />
              <span className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors">
                Receive newsletter for tour dates and new releases
              </span>
            </label>
          )}

          <button 
            type="submit"
            className="w-full py-4 bg-yellow-600 hover:bg-yellow-700 text-white font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center group"
          >
            {isLogin ? 'Log In' : 'Sign Up'}
            <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <footer className="mt-8 text-center pt-8 border-t border-gray-900">
          <p className="text-xs text-gray-500">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-yellow-600 font-bold hover:underline"
            >
              {isLogin ? 'Sign up now' : 'Log in here'}
            </button>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Auth;
