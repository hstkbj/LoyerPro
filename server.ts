import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// 1. Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'LoyerPro API Server',
    environment: process.env.NODE_ENV || 'development',
    time: new Date().toISOString(),
  });
});

// 2. FedaPay API proxy - Initialize transaction securely without exposing FEDAPAY_SECRET_KEY
app.post('/api/fedapay/create-transaction', async (req, res) => {
  try {
    const { amount, description, customer, callback_url } = req.body;
    const fedapaySecret = process.env.FEDAPAY_SECRET_KEY;

    if (!amount || !description) {
      return res.status(400).json({ error: 'Montant et description requis' });
    }

    if (!fedapaySecret) {
      // Return sandbox simulated token if secret key is not set in environment yet
      return res.json({
        id: 'fedapay_tx_' + Date.now(),
        status: 'pending',
        amount: Number(amount),
        currency: 'XOF',
        token: 'token_sandbox_' + Math.random().toString(36).substring(2, 10),
        url: callback_url || '#',
        notice: 'Mode simulation FedaPay (Définissez FEDAPAY_SECRET_KEY pour la passerelle live)',
      });
    }

    // Call real FedaPay API
    const response = await fetch('https://api.fedapay.com/v1/transactions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${fedapaySecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description,
        amount: Number(amount),
        currency: { iso: 'XOF' },
        callback_url,
        customer: customer || {
          firstname: 'Client',
          lastname: 'LoyerPro',
          email: 'client@loyerpro.bj',
        },
      }),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error: any) {
    console.error('FedaPay transaction error:', error);
    return res.status(500).json({ error: error.message || 'Erreur serveur FedaPay' });
  }
});

// 3. FedaPay verify transaction securely
app.get('/api/fedapay/verify-transaction/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const fedapaySecret = process.env.FEDAPAY_SECRET_KEY;

    if (!fedapaySecret) {
      // In sandbox/testing mode when no secret key is provided
      return res.json({
        id,
        status: 'approved',
        amount: 15000,
        currency: 'XOF',
        verified: true,
        notice: 'Mode vérification locale de test',
      });
    }

    const response = await fetch(`https://api.fedapay.com/v1/transactions/${id}`, {
      headers: {
        'Authorization': `Bearer ${fedapaySecret}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error: any) {
    console.error('FedaPay verify error:', error);
    return res.status(500).json({ error: error.message || 'Erreur de vérification FedaPay' });
  }
});

// 4. FedaPay webhook listener
app.post('/api/fedapay/webhook', (req, res) => {
  const event = req.body;
  console.log('FedaPay webhook received:', event?.name || 'event', event?.id);
  // Acknowledge webhook
  res.status(200).json({ received: true });
});

// 5. Vite integration & Static serving
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LoyerPro server running on port ${PORT}`);
  });
}

start();
