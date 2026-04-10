import React, { useState } from 'react';
import BaseModal from './BaseModal';
import { Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useCitizen } from '../../context/CitizenContext';
import { getUserByEmail } from '../../services/api';

const LoginModal = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { setCitizen } = useCitizen();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError('');

    try {
      const user = await getUserByEmail(email);
      if (user) {
        setCitizen(user);
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.message || 'User not found. Please sign up first.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Welcome Back" 
      subtitle="Login to continue your journey"
      size="sm"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 py-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-indian-navy/70 ml-1">Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indian-saffron transition-colors" />
            <input 
              type="email" 
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-black/5 focus:border-indian-saffron outline-none transition-all text-indian-navy placeholder:text-slate-400 font-medium"
            />
          </div>
          <p className="text-xs text-slate-400 ml-1">We'll find your account using your email</p>
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-indian-navy text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-indian-navy/20 active:scale-[0.98] transition-all group disabled:opacity-70"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Logging in...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>
    </BaseModal>
  );
};

export default LoginModal;

