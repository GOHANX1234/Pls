import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, UserPlus } from 'lucide-react';

const LoginSelector: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full min-h-screen bg-gradient-animate bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-delay-2" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-delay-4" />
      </div>
      
      <div className="relative w-full max-w-md">
        <div className="text-center mb-12">
          <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center ring-4 ring-blue-500/30 shadow-lg shadow-blue-500/20 mb-6 animate-float">
            <Shield className="w-12 h-12 text-white animate-glow" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 tracking-tight mb-2">
            AestrialHack
          </h1>
          <p className="text-blue-200/90 text-lg">
            Advanced Authentication System
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              title: 'Admin Access',
              icon: <Shield className="w-6 h-6" />,
              description: 'System administration and oversight',
              path: '/admin/login',
              gradient: 'from-blue-600 to-indigo-600'
            },
            {
              title: 'Reseller Portal',
              icon: <Users className="w-6 h-6" />,
              description: 'Manage your reseller account',
              path: '/reseller/login',
              gradient: 'from-blue-600 to-indigo-600'
            },
            {
              title: 'Register',
              icon: <UserPlus className="w-6 h-6" />,
              description: 'Join our reseller network',
              path: '/reseller/register',
              gradient: 'from-blue-600 to-indigo-600'
            }
          ].map((option, index) => (
            <div
              key={index}
              className="relative group cursor-pointer"
              onClick={() => navigate(option.path)}
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
              <div className="relative glass-effect rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${option.gradient} text-white`}>
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-blue-100">
                      {option.title}
                    </h2>
                    <p className="text-sm text-blue-300/80">
                      {option.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <footer className="mt-16 text-center text-blue-200/60 text-sm">
          © 2025 AestrialHack. Secured by Advanced Authentication.
        </footer>
      </div>
    </div>
  );
};

export default LoginSelector;