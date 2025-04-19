import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Users, UserPlus, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { FormGroup } from '../components/ui/FormGroup';
import { useAuth } from '../context/AuthContext';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await loginAdmin(username, password);
      
      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1500);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full min-h-screen bg-gradient-animate bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-950 flex flex-col justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-delay-2" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-delay-4" />
      </div>

      <div className="relative z-10">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
          <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center ring-4 ring-blue-500/30 shadow-lg shadow-blue-500/20 mb-6 animate-float">
            <Shield className="w-12 h-12 text-white animate-glow" />
          </div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 tracking-tight mb-2">
            AestrialHack
          </h1>
          <p className="text-blue-200/90 text-lg">
            Advanced Authentication System
          </p>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-[380px]">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25" />
            <Card className="relative glass-effect">
              <CardHeader>
                <div className="flex items-center space-x-3 px-1">
                  <div className="h-8 w-1 rounded-full bg-gradient-to-b from-blue-500 to-indigo-500" />
                  <h2 className="text-xl font-semibold text-blue-50">Admin Access</h2>
                </div>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert 
                    variant="error" 
                    className="mb-4 bg-red-500/10 border-red-500/20 text-red-200"
                    onDismiss={() => setError('')}
                  >
                    {error}
                  </Alert>
                )}
                
                {success && (
                  <Alert 
                    variant="success" 
                    className="mb-4 bg-green-500/10 border-green-500/20 text-green-200"
                    onDismiss={() => setSuccess('')}
                  >
                    {success}
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <FormGroup>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      label="Username"
                      icon={<User className="h-4 w-4 text-blue-400" />}
                      autoComplete="username"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="input-glow"
                    />

                    <Input
                      id="password"
                      name="password"
                      type="password"
                      label="Password"
                      icon={<Lock className="h-4 w-4 text-blue-400" />}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-glow"
                    />
                  </FormGroup>

                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    isLoading={loading}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-11 button-glow"
                  >
                    {loading ? 'Authenticating...' : 'Sign in'}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center space-x-6 py-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/reseller/login')}
                  icon={<Users className="h-4 w-4" />}
                  className="text-blue-200 hover:text-blue-100 hover:bg-blue-500/10"
                >
                  Reseller Login
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/reseller/register')}
                  icon={<UserPlus className="h-4 w-4" />}
                  className="text-blue-200 hover:text-blue-100 hover:bg-blue-500/10"
                >
                  Register
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        <footer className="mt-8 text-center text-blue-200/60 text-sm">
          © 2025 AestrialHack. Secured by Advanced Authentication.
        </footer>
      </div>
    </div>
  );
};

export default AdminLogin;