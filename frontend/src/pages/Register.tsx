import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Logo } from '../components/ui/Logo';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { User as UserIcon, Mail, Lock, UserPlus } from 'lucide-react';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await register(name, email, password);
      showToast('Account registered successfully!', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070C0A] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md bg-[#0B1410] border border-[#1A2E24] rounded-2xl shadow-2xl p-8 relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Logo size="lg" showTagline />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight pt-2">
            Create Administrator Account
          </h2>
          <p className="text-xs text-slate-400">
            Register to create geospatial projects and draw PostGIS site boundaries.
          </p>
        </div>

        {error && (
          <div className="bg-red-950/80 border border-red-500/50 rounded-xl p-3 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Dr. Elena Vance"
            icon={<UserIcon className="w-4 h-4 text-slate-400" />}
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="elena@conservation.org"
            icon={<Mail className="w-4 h-4 text-slate-400" />}
            required
          />

          <Input
            label="Password (min 6 chars)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4 text-slate-400" />}
            required
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full py-2.5"
            isLoading={isLoading}
            icon={<UserPlus className="w-4 h-4" />}
          >
            Register Administrator Account
          </Button>
        </form>

        <div className="pt-4 border-t border-[#1A2E24] text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-400 font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
