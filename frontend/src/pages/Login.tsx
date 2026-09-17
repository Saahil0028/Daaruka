import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Logo } from '../components/ui/Logo';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Lock, Mail, Database, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, seedDemo } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
      showToast('Authentication successful!', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedDemoAdmin = async () => {
    setIsSeeding(true);
    setError('');
    try {
      const res = await seedDemo();
      setEmail('admin@darukaa.earth');
      setPassword('Password123!');
      showToast('Demo admin account seeded! Click "Sign In".', 'success');
    } catch (err: any) {
      setError('Failed to seed demo account');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070C0A] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Topographic Accents */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#0B1410] border border-[#1A2E24] rounded-2xl shadow-2xl p-8 relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Logo size="lg" showTagline />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight pt-2">
            Administrator Portal
          </h2>
          <p className="text-xs text-slate-400">
            Environmental intelligence, grounded in geography.
          </p>
        </div>

        {error && (
          <div className="bg-red-950/80 border border-red-500/50 rounded-xl p-3 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@darukaa.earth"
            icon={<Mail className="w-4 h-4 text-slate-400" />}
            required
          />

          <Input
            label="Password"
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
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In to Platform
          </Button>
        </form>

        {/* Demo Account Auto-Fill Action */}
        <div className="pt-4 border-t border-[#1A2E24] text-center space-y-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSeedDemoAdmin}
            isLoading={isSeeding}
            icon={<Database className="w-4 h-4 text-emerald-400" />}
            className="w-full text-xs"
          >
            Seed & Auto-fill Demo Admin Credentials
          </Button>

          <p className="text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-emerald-400 font-semibold hover:underline">
              Register New Admin
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
