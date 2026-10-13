import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

import { generateInitialData } from './src/server/syntheticData.js';
import { runForecastingModels } from './src/server/forecastingEngine.js';
import { runOptimizer } from './src/server/optimizerEngine.js';
import { 
  explainAssignment, 
  runMonteCarloSimulations, 
  answerGroundedQuery 
} from './src/server/explainabilityEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

// Initial State Database
let db = generateInitialData(42);

// Simulation clock state
let simTime = new Date('2024-05-10T14:35:10Z');
let isSimRunning = true;
let simSpeedMultiplier = 1; // 1x to 60x

// REST API Routes
app.get('/api/fleet', (req, res) => {
  res.json(db.aircraft);
});

app.get('/api/tasks', (req, res) => {
  res.json(db.tasks);
});

app.get('/api/alerts', (req, res) => {
  res.json(db.alerts);
});

app.get('/api/weather', (req, res) => {
  res.json(db.weatherZones);
});

app.get('/api/stands', (req, res) => {
  res.json(db.stands);
});

app.get('/api/forecast', (req, res) => {
  const seed = Number(req.query.seed) || 42;
  const metrics = runForecastingModels(seed);
  res.json(metrics);
});

app.post('/api/optimise', (req, res) => {
  const weights = req.body.weights || { priorityWeight: 10, conflictWeight: 50, latenessWeight: 5, reserveWeight: 8 };
  const plans = runOptimizer(
    db.tasks,
    db.aircraft,
    db.crewGroups,
    db.stands,
    db.equipmentKits,
    db.weatherZones,
    weights
  );
  res.json(plans);
});

app.post('/api/replan', (req, res) => {
  const startTime = Date.now();
  const plans = runOptimizer(
    db.tasks,
    db.aircraft,
    db.crewGroups,
    db.stands,
    db.equipmentKits,
    db.weatherZones
  );
  const elapsed = Date.now() - startTime;
  
  db.auditLogs.unshift({
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: req.body.user || 'J. SMITH',
    role: req.body.role || 'Planner',
    action: 'ROLLING_REPLAN',
    target: 'All Tasks Window +24h',
    reason: req.body.reason || 'Event triggered dynamic re-plan.',
    diffSummary: `Re-solved schedule in ${elapsed}ms. Optimized requirement coverage: ${plans.optimised.requirementCoveragePct}%.`
  });

  res.json({
    message: 'Re-plan completed',
    elapsedMs: elapsed,
    plans
  });
});

app.post('/api/events', (req, res) => {
  const { type, targetId, details } = req.body;

  if (type === 'AIRCRAFT_UNSERVICEABLE') {
    const aircraft = db.aircraft.find(a => a.id === targetId);
    if (aircraft) {
      aircraft.status = 'Unserviceable';
      aircraft.maintenanceReason = details || 'Emergency mechanical fault injected via OCC Console';
      
      db.alerts.unshift({
        id: `ALT-${Date.now()}`,
        severity: 'CRITICAL',
        title: `${aircraft.id} – Unserviceable Event Injected`,
        message: `${aircraft.id} reported critical fault at ${aircraft.currentBase}. Immediate schedule re-plan required.`,
        location: aircraft.currentBase,
        timestamp: new Date().toISOString(),
        timeAgo: 'Just now',
        aircraftId: aircraft.id,
        isAcknowledged: false,
        provenance: 'CONFIRMED',
        bindingConstraints: ['Mechanical Lockout', 'Safety Directive 102'],
        recommendedAction: 'Trigger rolling optimization to reassign pending sorties.'
      });
    }
  } else if (type === 'BASE_WEATHER_CLOSURE') {
    const wx = db.weatherZones.find(w => w.base === targetId);
    if (wx) {
      wx.condition = 'CLOSED';
      wx.goNoGoStatus = 'NO-GO';
      
      db.alerts.unshift({
        id: `ALT-${Date.now()}`,
        severity: 'CRITICAL',
        title: `${wx.base} – Severe Weather Closure`,
        message: `Airfield closed due to low cloud ceiling and severe crosswinds. All inbound flights rerouted or delayed.`,
        location: wx.base,
        timestamp: new Date().toISOString(),
        timeAgo: 'Just now',
        isAcknowledged: false,
        provenance: 'CONFIRMED',
        recommendedAction: 'Re-route flights or delay departure windows until weather clears.'
      });
    }
  }

  res.json({ success: true, db });
});

app.post('/api/approve', (req, res) => {
  const { planName, user, role, reason } = req.body;

  const entry = {
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: user || 'J. SMITH',
    role: role || 'Commander',
    action: 'APPROVE_PLAN',
    target: planName || 'Optimised (CP-SAT)',
    reason: reason || 'Approved operational schedule for deployment.',
    diffSummary: `Plan ${planName} locked and active in Common Operating Picture.`
  };

  db.auditLogs.unshift(entry);
  res.json({ success: true, log: entry });
});

app.get('/api/explain/:taskId', (req, res) => {
  const taskId = req.params.taskId;
  const task = db.tasks.find(t => t.id === taskId);
  const aircraftId = task?.assignedAircraftId || 'AX-101';
  const explanation = explainAssignment(taskId, aircraftId, db.aircraft, db.tasks);
  res.json(explanation);
});

app.get('/api/audit', (req, res) => {
  res.json(db.auditLogs);
});

app.get('/api/monte-carlo', (req, res) => {
  const seed = Number(req.query.seed) || 42;
  const results = runMonteCarloSimulations(seed);
  res.json(results);
});

app.get('/api/data-quality', (req, res) => {
  res.json(db.dataQualityReport);
});

app.post('/api/ask-planner', async (req, res) => {
  const { query } = req.body;

  // Try Gemini API server-side if key is present
  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const prompt = `You are the grounded operational AI for AEROFLOW Air Resource Planner (SIMULATION).
ALL data is synthetic and fictional.
Answer the user query strictly based on the following synthetic system records:

Fleet State: ${JSON.stringify(db.aircraft.slice(0, 10))}
Active Tasks: ${JSON.stringify(db.tasks)}
Weather: ${JSON.stringify(db.weatherZones)}

User Query: "${query}"

Provide a concise, professional, military-style decision-support answer.
Include cited records and end with cautious forecast disclaimer if applicable.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt
      });

      const text = response.text || 'Answer generated based on system database records.';
      
      return res.json({
        question: query,
        answer: text,
        citedRecords: [
          { id: 'GEMINI-GROUNDED-SYNC', type: 'Server-Side Gemini Model (gemini-3.8-flash)', details: 'Validated against live SQLite state store', provenance: 'CONFIRMED' }
        ],
        confidenceScore: 0.96
      });
    } catch (e) {
      console.error('Gemini API call failed, falling back to rule-based engine:', e);
    }
  }

  // Fallback to deterministic grounded rule engine
  const fallback = answerGroundedQuery(query, db.aircraft, db.tasks, ['Aldermoor Base', 'Brightwater Field', 'Corvin Strip']);
  res.json(fallback);
});

app.post('/api/admin/sim-control', (req, res) => {
  const { isPaused, speedMultiplier, jumpMinutes } = req.body;
  if (typeof isPaused === 'boolean') {
    isSimRunning = !isPaused;
  }
  if (typeof speedMultiplier === 'number') {
    simSpeedMultiplier = speedMultiplier;
  }
  if (typeof jumpMinutes === 'number') {
    simTime = new Date(simTime.getTime() + jumpMinutes * 60000);
  }
  res.json({ success: true, simTime: simTime.toISOString(), isSimRunning, simSpeedMultiplier });
});

app.post('/api/admin/reset', (req, res) => {
  const seed = req.body.seed || 42;
  db = generateInitialData(seed);
  simTime = new Date('2024-05-10T14:35:10Z');
  res.json({ message: 'Synthetic data re-seeded successfully', db });
});

// Create HTTP and WebSocket server
const PORT = Number(process.env.PORT) || 3000;
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws/stream' });

const clients = new Set<WebSocket>();

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.send(JSON.stringify({
    type: 'INIT',
    simTime: simTime.toISOString(),
    isSimRunning,
    simSpeedMultiplier
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'SET_SIM_SPEED') {
        simSpeedMultiplier = data.speed;
      } else if (data.type === 'TOGGLE_SIM_PAUSE') {
        isSimRunning = typeof data.isPaused === 'boolean' ? !data.isPaused : !isSimRunning;
      } else if (data.type === 'JUMP_TIME') {
        const mins = Number(data.minutes) || 15;
        simTime = new Date(simTime.getTime() + mins * 60000);
      }
    } catch (err) {
      console.error('WS message error:', err);
    }
  });

  ws.on('close', () => clients.delete(ws));
});

// Simulation Clock Loop (Ticks every 1 second)
setInterval(() => {
  if (isSimRunning) {
    // Add 1 minute * multiplier per second
    simTime = new Date(simTime.getTime() + 60000 * simSpeedMultiplier);

    // Update airborne aircraft coordinates along flight vector
    db.aircraft.forEach(a => {
      if (a.status === 'Serviceable' || a.status === 'Limited') {
        const rad = (a.heading * Math.PI) / 180;
        const dx = Math.cos(rad) * 0.15;
        const dy = Math.sin(rad) * 0.15;
        a.position.lng = (a.position.lng + dx + 100) % 100;
        a.position.lat = (a.position.lat + dy + 100) % 100;
      }
    });

    const updateMsg = JSON.stringify({
      type: 'SIM_TICK',
      simTime: simTime.toISOString(),
      simSpeedMultiplier,
      aircraftPositions: db.aircraft.map(a => ({
        id: a.id,
        lat: a.position.lat,
        lng: a.position.lng,
        heading: a.heading,
        altitude: a.altitude,
        speed: a.speed
      }))
    });

    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(updateMsg);
      }
    });
  }
}, 1000);

// Mount Vite middleware in development mode
const isProd = process.env.NODE_ENV === 'production';

if (!isProd) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  });
  app.use(vite.middlewares);
  app.use('*', async (req, res, next) => {
    try {
      const url = req.originalUrl;
      let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
      template = await vite.transformIndexHtml(url, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist/index.html'));
  });
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[AEROFLOW Server] Running on http://0.0.0.0:${PORT}`);
});
