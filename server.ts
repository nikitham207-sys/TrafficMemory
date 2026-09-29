import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { HYDERABAD_ZONES, HYDERABAD_HOSPITALS, INITIAL_INCIDENTS, INITIAL_CORRIDORS } from './src/data/seedData.ts';
import { memoryService } from './src/services/memoryService.ts';
import { analyzeTrafficIncident, analyzeEmergencyRoute } from './src/services/agentService.ts';
import { AnalyzeRequest, RecordOutcomeRequest } from './src/types/traffic.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Explicitly serve MapLibre Web Worker to avoid bundling and CORS/CSP module issues
app.get('/maplibre-gl-worker.mjs', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
  res.sendFile(path.resolve('public', 'maplibre-gl-worker.mjs'));
});
app.use(express.static(path.resolve('public')));

// Health Check
app.get('/api/health', async (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'TrafficMemory Intelligence Engine',
    timestamp: new Date().toISOString(),
    hindsightStatus: memoryService.getMode(),
    uptime: process.uptime()
  });
});

// Overall System Statistics
app.get('/api/stats', async (_req: Request, res: Response) => {
  try {
    const stats = await memoryService.getStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch statistics' });
  }
});

// Zones
app.get('/api/zones', (_req: Request, res: Response) => {
  res.json(HYDERABAD_ZONES);
});

// Hospitals
app.get('/api/hospitals', (_req: Request, res: Response) => {
  res.json(HYDERABAD_HOSPITALS);
});

// Incidents
app.get('/api/incidents', (_req: Request, res: Response) => {
  res.json(INITIAL_INCIDENTS);
});

// Corridors
app.get('/api/corridors', (_req: Request, res: Response) => {
  res.json(INITIAL_CORRIDORS);
});

// Memories Explorer & Query
app.get('/api/memories', async (req: Request, res: Response) => {
  try {
    const { zone, location, incident, weather, outcome } = req.query as Record<string, string>;
    const memories = await memoryService.getAllMemories({
      zone,
      location,
      incident,
      weather,
      outcome
    });
    res.json({
      total: memories.length,
      memoryMode: memoryService.getMode(),
      memories
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch memories' });
  }
});

// Analyze Traffic Incident (Memory Recall + AI Reasoning Loop)
app.post('/api/analyze', async (req: Request, res: Response) => {
  try {
    const body: AnalyzeRequest = req.body;
    if (!body.location || !body.incident || !body.day || !body.weather) {
      return res.status(400).json({ error: 'Missing required incident fields (location, incident, day, weather)' });
    }

    const analysisResult = await analyzeTrafficIncident(body);
    res.json(analysisResult);
  } catch (err: any) {
    console.error('Error during traffic analysis:', err);
    res.status(500).json({ error: err.message || 'Internal traffic intelligence analysis failed' });
  }
});

// Emergency Routing
app.post('/api/emergency', async (req: Request, res: Response) => {
  try {
    const { origin, destinationHospitalId, urgency, weather } = req.body;
    if (!origin || !destinationHospitalId) {
      return res.status(400).json({ error: 'Missing origin or destination hospital' });
    }

    const emergencyResult = await analyzeEmergencyRoute({
      origin,
      destinationHospitalId,
      urgency: urgency || 'Critical',
      weather: weather || 'Rain'
    });
    res.json(emergencyResult);
  } catch (err: any) {
    console.error('Error during emergency route analysis:', err);
    res.status(500).json({ error: err.message || 'Failed to analyze emergency route' });
  }
});

// Record Outcome & Retain in Memory
app.post('/api/outcomes', async (req: Request, res: Response) => {
  try {
    const body: RecordOutcomeRequest = req.body;
    if (!body.location || !body.intervention || !body.outcome) {
      return res.status(400).json({ error: 'Missing outcome information' });
    }

    let retainedItem;
    if (body.memoryId) {
      retainedItem = await memoryService.retainOutcome(body.memoryId, body.outcome, body.notes);
    }
    
    if (!retainedItem) {
      // Create fresh new retained memory
      retainedItem = await memoryService.retainEvent({
        location: body.location,
        zone: body.zone || 'Ameerpet',
        coordinates: [78.4482, 17.4375],
        day: body.day || 'Friday',
        time: body.time || '6:30 PM',
        weather: body.weather || 'Rain',
        incident: body.incident || 'Accident',
        severity: body.severity || 'Severe',
        intervention: body.intervention,
        outcome: body.outcome,
        success: body.outcome === 'Successful',
        delayBeforeMin: body.delayBeforeMin || 20,
        delayAfterMin: body.delayAfterMin || (body.outcome === 'Successful' ? 9 : 24),
        context: body.notes 
          ? `Operator field log: ${body.notes}. Action ${body.intervention} resulted in ${body.outcome}.` 
          : `Live operator intervention: ${body.intervention} applied under ${body.weather} conditions. Outcome: ${body.outcome}.`
      });
    }

    const updatedStats = await memoryService.getStats();

    res.json({
      success: true,
      message: 'Outcome persisted and retained in Hindsight memory layer',
      retainedMemory: retainedItem,
      updatedStats
    });
  } catch (err: any) {
    console.error('Error saving outcome:', err);
    res.status(500).json({ error: err.message || 'Failed to record outcome' });
  }
});

// Reset Memories to Seed State
app.post('/api/reset-memories', async (_req: Request, res: Response) => {
  await memoryService.resetToSeed();
  const stats = await memoryService.getStats();
  res.json({ success: true, message: 'Memories reset to initial seed dataset', stats });
});

// Frontend Vite Integration
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TrafficMemory] System operational on port ${PORT}`);
  });
}

startServer();
