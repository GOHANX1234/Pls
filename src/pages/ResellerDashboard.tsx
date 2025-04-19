import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Key, Copy, Check, Gamepad2, Trash2, Coins } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Input } from '../components/ui/Input';
import { FormGroup } from '../components/ui/FormGroup';
import { useAuth } from '../context/AuthContext';
import { Key as KeyType, Reseller } from '../types';

const GAME_OPTIONS = ['PUBG MOBILE', 'LAST ISLAND OF SURVIVAL', 'STANDOFF2'] as const;
const DEVICE_LIMIT_OPTIONS = [1, 2, 100] as const;

const ResellerDashboard: React.FC = () => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [keys, setKeys] = useState<KeyType[]>([]);
  const [copiedKey, setCopiedKey] = useState('');
  const [resellerData, setResellerData] = useState<Reseller | null>(null);
  
  const [selectedGame, setSelectedGame] = useState<typeof GAME_OPTIONS[number]>(GAME_OPTIONS[0]);
  const [customKey, setCustomKey] = useState('');
  const [deviceLimit, setDeviceLimit] = useState<typeof DEVICE_LIMIT_OPTIONS[number]>(DEVICE_LIMIT_OPTIONS[0]);
  const [expiryDays, setExpiryDays] = useState(1);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!authState.isAuthenticated || authState.userType !== 'reseller') {
      navigate('/reseller/login');
      return;
    }
    fetchData();
  }, [authState, navigate]);

  const fetchData = async () => {
    if (!authState.user?.username) return;
    
    try {
      const [keysResponse, resellersResponse] = await Promise.all([
        fetch(`/api/keys/${authState.user.username}`),
        fetch('/api/resellers')
      ]);

      const keysData = await keysResponse.json();
      const resellersData = await resellersResponse.json();

      if (keysData.success) {
        setKeys(keysData.keys);
      }

      if (resellersData.success) {
        const currentReseller = resellersData.resellers.find(
          (r: Reseller) => r.username === authState.user?.username
        );
        setResellerData(currentReseller || null);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to fetch data');
    }
  };

  const generateKey = async () => {
    if (!authState.user?.username) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/keys/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: authState.user.username,
          gameName: selectedGame,
          customKey,
          deviceLimit,
          expiryDays,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setKeys([...keys, data.key]);
        setShowSuccess(true);
        setCustomKey('');
        setSuccessMessage('Key generated successfully!');
        fetchData();
        
        setTimeout(() => {
          setShowSuccess(false);
          setSuccessMessage('');
        }, 3000);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error generating key:', error);
      setError('Failed to generate key');
    } finally {
      setLoading(false);
    }
  };

  const deleteKey = async (keyId: string) => {
    if (!authState.user?.username) return;
    
    try {
      const response = await fetch(`/api/keys/${authState.user.username}/${keyId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        setKeys(keys.filter(key => key.id !== keyId));
        setSuccessMessage('Key deleted successfully!');
        setShowSuccess(true);
        
        setTimeout(() => {
          setShowSuccess(false);
          setSuccessMessage('');
        }, 3000);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error deleting key:', error);
      setError('Failed to delete key');
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  if (!authState.isAuthenticated || authState.userType !== 'reseller') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-black">
      <header className="bg-purple-900/20 backdrop-blur-sm border-b border-purple-800/30">
        <div className="px-3 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
              AestrialHack
            </h1>
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
          <div className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <Coins className="h-5 w-5 text-yellow-400" />
              <div>
                <p className="text-xs text-purple-300">Available Credits</p>
                <p className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-amber-300 bg-clip-text text-transparent">
                  {resellerData?.credits || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="p-3 space-y-4">
        {error && (
          <Alert 
            variant="error" 
            className="bg-red-900/20 border-red-700 text-red-300"
            onDismiss={() => setError('')}
          >
            {error}
          </Alert>
        )}
        
        {showSuccess && successMessage && (
          <Alert 
            variant="success" 
            className="bg-green-900/20 border-green-700 text-green-300"
            onDismiss={() => {
              setShowSuccess(false);
              setSuccessMessage('');
            }}
          >
            {successMessage}
          </Alert>
        )}

        <Card className="border border-purple-800/30 card-glow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium text-purple-300">Generate Key</h2>
              <Gamepad2 className="h-4 w-4 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); generateKey(); }} className="space-y-3">
              <FormGroup>
                <label className="block text-sm font-medium text-purple-300">
                  Game
                </label>
                <select
                  value={selectedGame}
                  onChange={(e) => setSelectedGame(e.target.value as typeof GAME_OPTIONS[number])}
                  className="w-full px-3 py-2 text-sm rounded-md border bg-purple-900/20 border-purple-700 text-purple-100"
                >
                  {GAME_OPTIONS.map((game) => (
                    <option key={game} value={game}>{game}</option>
                  ))}
                </select>
              </FormGroup>

              <FormGroup>
                <Input
                  label="Custom Key"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  placeholder="Optional custom key"
                  className="bg-purple-900/20 border-purple-700 text-purple-100 text-sm"
                />
              </FormGroup>

              <div className="grid grid-cols-2 gap-3">
                <FormGroup>
                  <label className="block text-sm font-medium text-purple-300">
                    Devices
                  </label>
                  <select
                    value={deviceLimit}
                    onChange={(e) => setDeviceLimit(Number(e.target.value) as typeof DEVICE_LIMIT_OPTIONS[number])}
                    className="w-full px-3 py-2 text-sm rounded-md border bg-purple-900/20 border-purple-700 text-purple-100"
                  >
                    {DEVICE_LIMIT_OPTIONS.map((limit) => (
                      <option key={limit} value={limit}>{limit}</option>
                    ))}
                  </select>
                </FormGroup>

                <FormGroup>
                  <Input
                    type="number"
                    label="Days"
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(Math.max(1, parseInt(e.target.value)))}
                    min="1"
                    className="bg-purple-900/20 border-purple-700 text-purple-100 text-sm"
                  />
                </FormGroup>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="sm"
                isLoading={loading}
                disabled={!resellerData?.credits || resellerData.credits <= 0}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                {resellerData?.credits && resellerData.credits > 0 
                  ? 'Generate Key' 
                  : 'No Credits'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border border-purple-800/30 card-glow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium text-purple-300">Your Keys</h2>
              <Key className="h-4 w-4 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {keys.length > 0 ? (
                <div className="space-y-2">
                  {keys.map((key) => (
                    <div 
                      key={key.id}
                      className="p-3 rounded bg-purple-900/20 border border-purple-800/30 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-purple-300 font-medium">{key.gameName}</span>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-purple-400 hover:text-purple-300 p-1"
                            onClick={() => copyKey(key.keyValue)}
                          >
                            {copiedKey === key.keyValue ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 p-1"
                            onClick={() => deleteKey(key.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <code className="block font-mono text-xs text-purple-300 break-all">
                        {key.keyValue}
                      </code>
                      <div className="flex items-center justify-between text-xs text-purple-400">
                        <span>{key.deviceLimit} Device{key.deviceLimit > 1 ? 's' : ''}</span>
                        <span>{key.expiryDays} Days</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-purple-400">No keys generated yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ResellerDashboard;