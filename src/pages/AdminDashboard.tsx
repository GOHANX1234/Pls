import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, Key, RefreshCw, Copy, Check, CreditCard, Plus, Trash2, Shield, Menu, X, Code, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { Reseller, ApiUsage } from '../types';

const AdminDashboard: React.FC = () => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedToken, setGeneratedToken] = useState('');
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [tokens, setTokens] = useState<string[]>([]);
  const [copiedToken, setCopiedToken] = useState('');
  const [error, setError] = useState('');
  const [selectedReseller, setSelectedReseller] = useState<string>('');
  const [creditsToAdd, setCreditsToAdd] = useState<number>(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [apiUsage, setApiUsage] = useState<ApiUsage[]>([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);

  useEffect(() => {
    if (!authState.isAuthenticated || authState.userType !== 'admin') {
      navigate('/admin/login');
      return;
    }
    fetchData();
  }, [authState, navigate]);

  const fetchData = async () => {
    try {
      const [resellersRes, tokensRes, statsRes] = await Promise.all([
        fetch('/api/resellers'),
        fetch('/api/tokens'),
        fetch('/api/stats')
      ]);

      if (!resellersRes.ok || !tokensRes.ok || !statsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [resellersData, tokensData, statsData] = await Promise.all([
        resellersRes.json(),
        tokensRes.json(),
        statsRes.json()
      ]);

      if (resellersData.success) {
        setResellers(resellersData.resellers);
      }

      if (tokensData.success) {
        setTokens(tokensData.tokens);
      }

      if (statsData.success) {
        setApiUsage(statsData.usage);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data');
    }
  };

  const generateToken = async () => {
    try {
      const response = await fetch('/api/tokens/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate token: ${errorText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setGeneratedToken(data.token);
        setTokens([...tokens, data.token]);
        setShowSuccess(true);
        setError('');
        
        setTimeout(() => {
          setShowSuccess(false);
          setGeneratedToken('');
        }, 30000);
      } else {
        throw new Error(data.message || 'Failed to generate token');
      }
    } catch (error) {
      console.error('Error generating token:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate token');
      setShowSuccess(false);
    }
  };

  const deleteReseller = async (username: string) => {
    try {
      const response = await fetch(`/api/resellers/${username}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete reseller');
      }

      const data = await response.json();
      
      if (data.success) {
        setResellers(resellers.filter(r => r.username !== username));
        setSuccessMessage('Reseller deleted successfully');
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setSuccessMessage('');
        }, 3000);
      } else {
        throw new Error(data.message || 'Failed to delete reseller');
      }
    } catch (error) {
      console.error('Error deleting reseller:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete reseller');
    }
  };

  const addCredits = async () => {
    if (!selectedReseller || creditsToAdd <= 0) {
      setError('Please select a reseller and enter valid credits');
      return;
    }

    try {
      const response = await fetch('/api/resellers/credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: selectedReseller,
          credits: creditsToAdd,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add credits');
      }

      const data = await response.json();
      
      if (data.success) {
        setResellers(data.resellers);
        setSelectedReseller('');
        setCreditsToAdd(0);
        setShowSuccess(true);
        setSuccessMessage('Credits added successfully');
        setTimeout(() => {
          setShowSuccess(false);
          setSuccessMessage('');
        }, 3000);
      } else {
        throw new Error(data.message || 'Failed to add credits');
      }
    } catch (error) {
      console.error('Error adding credits:', error);
      setError(error instanceof Error ? error.message : 'Failed to add credits');
    }
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(''), 2000);
  };

  const ApiDocs = () => {
    const endpoints = [
      {
        name: 'PUBG MOBILE',
        get: '/api/verify/pubg/:key',
        post: '/api/verify/pubg',
        description: 'Verify PUBG MOBILE keys'
      },
      {
        name: 'LAST ISLAND OF SURVIVAL',
        get: '/api/verify/lastisland/:key',
        post: '/api/verify/lastisland',
        description: 'Verify LAST ISLAND OF SURVIVAL keys'
      },
      {
        name: 'STANDOFF2',
        get: '/api/verify/standoff2/:key',
        post: '/api/verify/standoff2',
        description: 'Verify STANDOFF2 keys'
      }
    ];

    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 overflow-y-auto">
        <div className="min-h-screen p-4">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-purple-100">API Documentation</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(false)}
                className="text-purple-300 hover:text-purple-200"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-6">
              {endpoints.map((endpoint) => (
                <Card key={endpoint.name} className="border border-purple-800/30 bg-black/40">
                  <CardHeader>
                    <h3 className="text-lg font-medium text-purple-300">{endpoint.name}</h3>
                    <p className="text-sm text-purple-400">{endpoint.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-purple-300 mb-2">GET Request</h4>
                      <div className="bg-purple-900/20 p-3 rounded-md">
                        <code className="text-xs text-purple-200">
                          GET {endpoint.get}
                        </code>
                      </div>
                      <div className="mt-2 text-sm text-purple-400">
                        Response:
                        <pre className="mt-1 bg-purple-900/20 p-2 rounded text-xs overflow-x-auto">
{`{
  "success": boolean,
  "verification": {
    "id": "string",
    "keyId": "string",
    "gameName": "string",
    "deviceIp": "string",
    "verifiedAt": "string",
    "expiresAt": "string"
  }
}`}
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-purple-300 mb-2">POST Request</h4>
                      <div className="bg-purple-900/20 p-3 rounded-md">
                        <code className="text-xs text-purple-200">
                          POST {endpoint.post}
                        </code>
                      </div>
                      <div className="mt-2 text-sm text-purple-400">
                        Request Body:
                        <pre className="mt-1 bg-purple-900/20 p-2 rounded text-xs overflow-x-auto">
{`{
  "key": "string"
}`}
                        </pre>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-purple-300 mb-2">Usage Example (cURL)</h4>
                      <pre className="bg-purple-900/20 p-3 rounded-md text-xs overflow-x-auto text-purple-200">
{`# GET Request
curl "${window.location.origin}${endpoint.get.replace(':key', 'YOUR_KEY')}"

# POST Request
curl -X POST "${window.location.origin}${endpoint.post}" \\
  -H "Content-Type: application/json" \\
  -d '{"key": "YOUR_KEY"}'`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="border border-purple-800/30 bg-black/40">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-purple-400" />
                    <h3 className="text-lg font-medium text-purple-300">API Usage Stats</h3>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {apiUsage.slice(-5).map((usage) => (
                      <div 
                        key={usage.id}
                        className="flex items-center justify-between p-3 rounded bg-purple-900/20 border border-purple-800/30"
                      >
                        <div>
                          <p className="text-sm text-purple-200">{usage.endpoint}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-purple-400">{usage.method}</span>
                            <span className="text-purple-700">•</span>
                            <span className="text-xs text-purple-400">{new Date(usage.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs ${usage.success ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
                          {usage.success ? 'Success' : 'Failed'}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!authState.isAuthenticated || authState.userType !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900 via-black to-black">
      <header className="bg-black/40 backdrop-blur-sm border-b border-purple-800/30">
        <div className="px-3 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-purple-400" />
              <div>
                <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                  AestrialHack
                </h1>
                <p className="text-xs text-purple-400">Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(true)}
                className="text-purple-300 hover:text-purple-200"
              >
                <Code className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<LogOut className="h-4 w-4" />}
                onClick={logout}
                className="border-purple-700 text-purple-300 hover:bg-purple-800/20"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="p-3 space-y-4">
        {error && (
          <Alert 
            variant="error" 
            className="bg-red-500/10 border-red-500/20 text-red-200"
            onDismiss={() => setError('')}
          >
            {error}
          </Alert>
        )}
        
        {showSuccess && (
          <Alert 
            variant="success" 
            className="bg-green-500/10 border-green-500/20 text-green-200"
            onDismiss={() => {
              setShowSuccess(false);
              setSuccessMessage('');
            }}
          >
            <div className="flex flex-col">
              {generatedToken && (
                <>
                  <p>Token generated successfully!</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <code className="font-mono text-xs break-all bg-green-900/20 p-2 rounded flex-1">
                      {generatedToken}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-green-700 text-green-300 hover:bg-green-800/20"
                      onClick={() => copyToken(generatedToken)}
                    >
                      {copiedToken === generatedToken ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="mt-2 text-xs">This token will be visible for 30 seconds</p>
                </>
              )}
              {!generatedToken && successMessage && <p>{successMessage}</p>}
            </div>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border border-purple-800/30 bg-black/40">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-purple-400" />
                  <h2 className="text-base font-medium text-purple-300">Resellers</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-100">{resellers.length}</p>
                    <p className="text-xs text-purple-400">Total Registered</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="space-y-2">
                  <select
                    value={selectedReseller}
                    onChange={(e) => setSelectedReseller(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-md border bg-purple-900/20 border-purple-700 text-purple-100"
                  >
                    <option value="">Select Reseller</option>
                    {resellers.map((reseller) => (
                      <option key={reseller.id} value={reseller.username}>
                        {reseller.username} (Credits: {reseller.credits || 0})
                      </option>
                    ))}
                  </select>
                  
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      value={creditsToAdd}
                      onChange={(e) => setCreditsToAdd(Math.max(0, parseInt(e.target.value) || 0))}
                      min="0"
                      placeholder="Credits"
                      className="bg-purple-900/20 border-purple-700 text-purple-100 text-sm"
                    />
                    <Button
                      onClick={addCredits}
                      size="sm"
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                      icon={<Plus className="h-4 w-4" />}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-purple-800/30 bg-black/40">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Key className="h-4 w-4 text-purple-400" />
                  <h2 className="text-base font-medium text-purple-300">Active Tokens</h2>
                </div>
                <Button
                  onClick={generateToken}
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  icon={<RefreshCw className="h-4 w-4" />}
                >
                  Generate
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tokens.length > 0 ? (
                  tokens.map((token, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-2 rounded bg-purple-900/20 border border-purple-800/30"
                    >
                      <code className="font-mono text-xs text-purple-300 break-all">
                        {token}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-purple-400 hover:text-purple-300 p-1"
                        onClick={() => copyToken(token)}
                      >
                        {copiedToken === token ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-purple-400">No active tokens</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border border-purple-800/30 bg-black/40">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-purple-400" />
              <h2 className="text-base font-medium text-purple-300">Recent Activity</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {resellers.length > 0 ? (
                resellers.map((reseller) => (
                  <div 
                    key={reseller.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-purple-900/20 border border-purple-800/30"
                  >
                    <div>
                      <p className="text-sm font-medium text-purple-100">{reseller.username}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-xs text-purple-400">
                          Credits: {reseller.credits || 0}
                        </p>
                        <span className="text-purple-700">•</span>
                        <p className="text-xs text-purple-400">
                          {new Date(reseller.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 p-1"
                      onClick={() => deleteReseller(reseller.username)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-purple-400">No resellers found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {isMenuOpen && <ApiDocs />}
    </div>
  );
};

export default AdminDashboard;