export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const express = require('express');
const cors = require('cors');

let app = null;
let dbInitialized = false;

async function initializeApp() {
  if (app) return app;
  
  const { initDB } = require('../../../../../backend/src/db');
  const authRoutes = require('../../../../../backend/src/routes/auth');
  const productRoutes = require('../../../../../backend/src/routes/products');
  const orderRoutes = require('../../../../../backend/src/routes/orders');
  const categoryRoutes = require('../../../../../backend/src/routes/categories');
  const bundleRoutes = require('../../../../../backend/src/routes/bundles');

  app = express();

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use('/api/admin', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/bundles', bundleRoutes);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  if (!dbInitialized) {
    await initDB();
    dbInitialized = true;
  }

  return app;
}

async function handler(request) {
  try {
    const app = await initializeApp();

    return new Promise(async (resolve) => {
      const url = new URL(request.url);
      const body = request.method !== 'GET' && request.method !== 'DELETE' 
        ? await request.json().catch(() => null) 
        : null;

      const mockReq = {
        method: request.method,
        url: url.pathname + url.search,
        headers: Object.fromEntries(request.headers),
        body
      };

      const mockRes = {
        statusCode: 200,
        headers: {},
        setHeader: function(key, value) { this.headers[key] = value; },
        json: function(data) {
          resolve(Response.json(data, { status: this.statusCode, headers: this.headers }));
        },
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        send: function(data) {
          resolve(new Response(data, { status: this.statusCode, headers: this.headers }));
        }
      };

      app(mockReq, mockRes);
    });
  } catch (error) {
    console.error('API Error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request) {
  return handler(request);
}

export async function POST(request) {
  return handler(request);
}

export async function PUT(request) {
  return handler(request);
}

export async function DELETE(request) {
  return handler(request);
}
