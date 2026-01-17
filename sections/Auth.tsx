
import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, ArrowRight, Loader } from 'lucide-react';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';

interface AuthProps {
  user: User | null;
  onLogin: (user: User) => void;
  onLogout: () => void;
}

const Auth: React.FC<AuthProps> = ({ user, onLogin, onLogout }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMSG, setErrorMSG] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{title: string, message: string, type: 'success' | 'error'}>({
    title: '',
    message: '',
    type: 'success'
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    message: '', // for other forms if needed, keeping generic
    newsletter: true
  });
  
  // State for editing profile
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    password: ''
  });
  
  // Initialize editData when user is present
  React.useEffect(() => {
    if (user) {
        setEditData({
            name: user.name || '',
            email: user.email || '',
            password: ''
        });
    }
  }, [user]);

  const showModal = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    setModalConfig({ title, message, type });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMSG('');

    try {
      const endpoint = isLogin ? 'http://localhost:5001/api/login' : 'http://localhost:5001/api/register';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Autenticazione fallita');
      }

      // Login riuscito
      if (data.token) {
        localStorage.setItem('token', data.token); // Save token for update requests
        
        onLogin({
          email: data.user.email,
          name: data.user.name
        });
        
        showModal(
            isLogin ? 'Welcome Back!' : 'Welcome Aboard!',
            isLogin ? 'Login successful. Ready to explore?' : 'Registration completed successfully. Welcome to the inner circle.',
            'success'
        );
      }

    } catch (error: any) {
      console.error(error);
      const message = error.message || 'Si è verificato un errore';
      setErrorMSG(message);
      
      showModal('Authentication Failed', message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("No session found");

        const response = await fetch('http://localhost:5001/api/update-profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(editData)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Update failed");

        onLogin({
            name: data.user.name,
            email: data.user.email
        }); // Update global state
        
        setIsEditing(false);
        showModal('Profile Updated', 'Your details have been successfully updated.', 'success');

    } catch (error: any) {
        showModal('Update Failed', error.message, 'error');
    } finally {
        setLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    if (modalConfig.type === 'success' && !user) {
        navigate('/');
    }
    // If user is logged in (profile view), just close modal, don't navigate
  };


  return (
    <div className="pt-32 pb-20 px-4 min-h-[90vh] flex items-center justify-center bg-gradient-to-b from-black to-[#111]">
      <Modal 
        isOpen={modalOpen}
        onClose={handleModalClose}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />
      {user ? (
          <div className="max-w-md w-full glass p-8 md:p-12 shadow-2xl border-gray-800 text-center space-y-8 animate-in fade-in duration-500">
            <div className="mx-auto w-24 h-24 bg-yellow-600/20 rounded-full flex items-center justify-center border-2 border-yellow-600">
                <span className="text-4xl font-serif text-yellow-600">{user.name.charAt(0).toUpperCase()}</span>
            </div>
            
            {!isEditing ? (
                <>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-serif text-white">Welcome, {user.name}</h2>
                        <p className="text-gray-400">{user.email}</p>
                    </div>

                    <div className="pt-8 space-y-4">
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="w-full py-4 border border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white font-bold uppercase tracking-widest text-xs transition-all rounded-sm"
                        >
                            Edit Profile
                        </button>
                        <button 
                            onClick={() => {
                                onLogout();
                                navigate('/');
                            }}
                            className="w-full py-4 bg-gray-900 text-gray-400 hover:bg-red-900/20 hover:text-red-500 font-bold uppercase tracking-widest text-xs transition-all rounded-sm"
                        >
                            Logout
                        </button>
                    </div>
                </>
            ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-6 text-left">
                    <h3 className="text-xl font-serif text-white text-center">Edit Profile</h3>
                    
                    <div className="space-y-2">
                        <label className="text-[10px] tracking-widest uppercase font-bold text-gray-400">Name</label>
                        <input 
                            type="text"
                            value={editData.name}
                            onChange={(e) => setEditData({...editData, name: e.target.value})}
                            className="w-full bg-black/40 border border-gray-800 p-3 text-sm focus:border-yellow-600 outline-none text-white"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-[10px] tracking-widest uppercase font-bold text-gray-400">Email</label>
                        <input 
                            type="email"
                            value={editData.email}
                            onChange={(e) => setEditData({...editData, email: e.target.value})}
                            className="w-full bg-black/40 border border-gray-800 p-3 text-sm focus:border-yellow-600 outline-none text-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] tracking-widest uppercase font-bold text-gray-400">New Password <span className="text-xs normal-case text-gray-600">(optional)</span></label>
                        <input 
                            type="password"
                            value={editData.password}
                            onChange={(e) => setEditData({...editData, password: e.target.value})}
                            className="w-full bg-black/40 border border-gray-800 p-3 text-sm focus:border-yellow-600 outline-none text-white"
                            placeholder="Leave blank to keep current"
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button 
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="flex-1 py-3 bg-gray-800 text-gray-400 hover:bg-gray-700 font-bold uppercase tracking-widest text-xs rounded-sm"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 bg-yellow-600 text-white hover:bg-yellow-700 font-bold uppercase tracking-widest text-xs rounded-sm disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            )}
            
          </div>
      ) : (
      <div className="max-w-md w-full glass p-8 md:p-12 shadow-2xl border-gray-800">

        <header className="text-center mb-10">
          <h2 className="text-4xl font-serif mb-2">{isLogin ? 'Welcome Back' : 'Join the Inner Circle'}</h2>
          <p className="text-gray-500 text-sm">{isLogin ? 'Log in to access your account' : 'Register for early access to tours and news'}</p>
          {errorMSG && <p className="text-red-500 text-xs mt-4 bg-red-500/10 p-2 rounded border border-red-500/20">{errorMSG}</p>}
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
            disabled={loading}
            className="w-full py-4 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center group"
          >
            {loading ? <Loader className="animate-spin mr-2" /> : (isLogin ? 'Log In' : 'Sign Up')}
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
      )}
    </div>
  );
};

export default Auth;
