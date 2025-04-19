import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { readFile, writeFile, access, mkdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import crypto from 'crypto';
import compression from 'compression';
import helmet from 'helmet';
import serveStatic from 'serve-static';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(compression());

// Ensure data directory exists
const dataDir = join(__dirname, 'src', 'data');
await mkdir(dataDir, { recursive: true });

// Configure CORS
app.use(cors({
  origin: isProd ? ['https://aestrialhack.onrender.com'] : ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());

// Set default content type for all responses to application/json
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Serve static files in production
if (isProd) {
  app.use(serveStatic(join(__dirname, 'dist'), {
    index: false,
    maxAge: '1y'
  }));
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'An internal server error occurred'
  });
});

// Helper functions
async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function readJsonFile(filename) {
  try {
    const filePath = join(__dirname, 'src', 'data', filename);
    
    if (!await fileExists(filePath)) {
      const defaultContent = filename.includes('keys.json') ? [] : {};
      await writeJsonFile(filename, defaultContent);
      return defaultContent;
    }
    
    const data = await readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return filename.includes('keys.json') ? [] : {};
  }
}

async function writeJsonFile(filename, data) {
  try {
    const filePath = join(__dirname, 'src', 'data', filename);
    await writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    throw error;
  }
}

// Initialize data files
async function initializeDataFiles() {
  const files = [
    { name: 'resellers.json', default: [] },
    { name: 'tokens.json', default: [] },
    { name: 'api_usage.json', default: [] },
    { name: 'key_verifications.json', default: [] },
    { name: 'admin.json', default: { username: 'admin', password: 'admin123' } }
  ];

  for (const file of files) {
    const filePath = join(dataDir, file.name);
    if (!await fileExists(filePath)) {
      await writeJsonFile(file.name, file.default);
    }
  }
}

await initializeDataFiles();

// API Routes
app.get('/api/resellers', async (req, res) => {
  try {
    const resellers = await readJsonFile('resellers.json');
    res.json({ success: true, resellers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch resellers' });
  }
});

app.get('/api/tokens', async (req, res) => {
  try {
    const tokens = await readJsonFile('tokens.json');
    res.json({ success: true, tokens });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch tokens' });
  }
});

app.post('/api/tokens/generate', async (req, res) => {
  try {
    const tokens = await readJsonFile('tokens.json');
    const newToken = crypto.randomBytes(16).toString('hex');
    tokens.push(newToken);
    await writeJsonFile('tokens.json', tokens);
    res.json({ success: true, token: newToken });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate token' });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { newReseller, referralToken } = req.body;
    const tokens = await readJsonFile('tokens.json');
    
    if (!tokens.includes(referralToken)) {
      return res.status(400).json({ success: false, message: 'Invalid referral token' });
    }
    
    const resellers = await readJsonFile('resellers.json');
    
    if (resellers.some(r => r.username === newReseller.username)) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }
    
    resellers.push({ ...newReseller, credits: 20 });
    await writeJsonFile('resellers.json', resellers);
    
    // Remove used token
    const updatedTokens = tokens.filter(t => t !== referralToken);
    await writeJsonFile('tokens.json', updatedTokens);
    
    res.json({ success: true, message: 'Registration successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

app.delete('/api/resellers/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const resellers = await readJsonFile('resellers.json');
    const updatedResellers = resellers.filter(r => r.username !== username);
    await writeJsonFile('resellers.json', updatedResellers);
    res.json({ success: true, message: 'Reseller deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete reseller' });
  }
});

app.post('/api/resellers/credits', async (req, res) => {
  try {
    const { username, credits } = req.body;
    const resellers = await readJsonFile('resellers.json');
    const updatedResellers = resellers.map(r => {
      if (r.username === username) {
        return { ...r, credits: (r.credits || 0) + credits };
      }
      return r;
    });
    await writeJsonFile('resellers.json', updatedResellers);
    res.json({ success: true, resellers: updatedResellers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add credits' });
  }
});

app.get('/api/keys/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const keys = await readJsonFile(`${username}_keys.json`);
    res.json({ success: true, keys });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch keys' });
  }
});

app.post('/api/keys/generate', async (req, res) => {
  try {
    const { username, gameName, customKey, deviceLimit, expiryDays } = req.body;
    
    const resellers = await readJsonFile('resellers.json');
    const reseller = resellers.find(r => r.username === username);
    
    if (!reseller || !reseller.credits || reseller.credits <= 0) {
      return res.status(400).json({ success: false, message: 'Insufficient credits' });
    }
    
    const keys = await readJsonFile(`${username}_keys.json`);
    const newKey = {
      id: crypto.randomUUID(),
      gameName,
      keyValue: customKey || crypto.randomBytes(8).toString('hex'),
      deviceLimit,
      expiryDays,
      createdAt: new Date().toISOString(),
      createdBy: username
    };
    
    keys.push(newKey);
    await writeJsonFile(`${username}_keys.json`, keys);
    
    const updatedResellers = resellers.map(r => {
      if (r.username === username) {
        return { ...r, credits: r.credits - 1 };
      }
      return r;
    });
    await writeJsonFile('resellers.json', updatedResellers);
    
    res.json({ success: true, key: newKey });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate key' });
  }
});

app.delete('/api/keys/:username/:keyId', async (req, res) => {
  try {
    const { username, keyId } = req.params;
    const keys = await readJsonFile(`${username}_keys.json`);
    const updatedKeys = keys.filter(k => k.id !== keyId);
    await writeJsonFile(`${username}_keys.json`, updatedKeys);
    res.json({ success: true, message: 'Key deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete key' });
  }
});

// API usage logging
async function logApiUsage(endpoint, method, ip, success) {
  try {
    const usage = await readJsonFile('api_usage.json') || [];
    usage.push({
      id: crypto.randomUUID(),
      endpoint,
      method,
      timestamp: new Date().toISOString(),
      ip,
      success
    });
    await writeJsonFile('api_usage.json', usage);
  } catch (error) {
    console.error('Error logging API usage:', error);
  }
}

app.get('/api/stats', async (req, res) => {
  try {
    const usage = await readJsonFile('api_usage.json') || [];
    res.json({ success: true, usage });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch API stats' });
  }
});

// Game verification endpoints
async function verifyKey(keyValue, gameName, ip) {
  try {
    const verifications = await readJsonFile('key_verifications.json') || [];
    const resellers = await readJsonFile('resellers.json');
    const allKeys = await Promise.all(
      resellers.map(async (reseller) => {
        const keys = await readJsonFile(`${reseller.username}_keys.json`);
        return keys;
      })
    );
    
    const key = allKeys.flat().find(k => k.keyValue === keyValue && k.gameName === gameName);
    
    if (!key) {
      return { success: false, message: 'Invalid key' };
    }

    const keyVerifications = verifications.filter(v => v.keyId === key.id);
    const now = new Date();
    const expiryDate = new Date(key.createdAt);
    expiryDate.setDate(expiryDate.getDate() + key.expiryDays);

    if (now > expiryDate) {
      return { success: false, message: 'Key expired' };
    }

    if (keyVerifications.length >= key.deviceLimit) {
      const hasVerificationForIp = keyVerifications.some(v => v.deviceIp === ip);
      if (!hasVerificationForIp && key.deviceLimit === 1) {
        return { success: false, message: 'Key already in use' };
      }
    }

    const verification = {
      id: crypto.randomUUID(),
      keyId: key.id,
      gameName,
      deviceIp: ip,
      verifiedAt: now.toISOString(),
      expiresAt: expiryDate.toISOString()
    };

    verifications.push(verification);
    await writeJsonFile('key_verifications.json', verifications);

    return { success: true, verification };
  } catch (error) {
    console.error('Key verification error:', error);
    return { success: false, message: 'Verification failed' };
  }
}

// Game verification routes
app.post('/api/verify/pubg', async (req, res) => {
  const { key } = req.body;
  const ip = req.ip || req.connection.remoteAddress;
  const result = await verifyKey(key, 'PUBG MOBILE', ip);
  await logApiUsage('/api/verify/pubg', 'POST', ip, result.success);
  res.json(result);
});

app.get('/api/verify/pubg/:key', async (req, res) => {
  const { key } = req.params;
  const ip = req.ip || req.connection.remoteAddress;
  const result = await verifyKey(key, 'PUBG MOBILE', ip);
  await logApiUsage('/api/verify/pubg', 'GET', ip, result.success);
  res.json(result);
});

app.post('/api/verify/lastisland', async (req, res) => {
  const { key } = req.body;
  const ip = req.ip || req.connection.remoteAddress;
  const result = await verifyKey(key, 'LAST ISLAND OF SURVIVAL', ip);
  await logApiUsage('/api/verify/lastisland', 'POST', ip, result.success);
  res.json(result);
});

app.get('/api/verify/lastisland/:key', async (req, res) => {
  const { key } = req.params;
  const ip = req.ip || req.connection.remoteAddress;
  const result = await verifyKey(key, 'LAST ISLAND OF SURVIVAL', ip);
  await logApiUsage('/api/verify/lastisland', 'GET', ip, result.success);
  res.json(result);
});

app.post('/api/verify/standoff2', async (req, res) => {
  const { key } = req.body;
  const ip = req.ip || req.connection.remoteAddress;
  const result = await verifyKey(key, 'STANDOFF2', ip);
  await logApiUsage('/api/verify/standoff2', 'POST', ip, result.success);
  res.json(result);
});

app.get('/api/verify/standoff2/:key', async (req, res) => {
  const { key } = req.params;
  const ip = req.ip || req.connection.remoteAddress;
  const result = await verifyKey(key, 'STANDOFF2', ip);
  await logApiUsage('/api/verify/standoff2', 'GET', ip, result.success);
  res.json(result);
});

// Serve index.html for all other routes in production
if (isProd) {
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});