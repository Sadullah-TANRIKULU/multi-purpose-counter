import express from 'express';
import postgres from 'postgres';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

import dotenv from 'dotenv';
dotenv.config();

const port = process.env.PORT || 3009;

// Connect to Postgres using Postgres.js
const sql = postgres(process.env.DATABASE_URL, {
  ssl: { rejectUnauthorized: false }
});

// Serve static files from current folder (for dev)
app.use(express.static('.'));

// Explicit routes for HTML pages
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: '.' });
});

app.get('/admin', (req, res) => {
  res.sendFile('admin.html', { root: '.' });
});

// API endpoint to get total count
app.get('/api/total', async (req, res) => {
  try {
    const result = await sql`SELECT totalcount FROM dhikrtotal LIMIT 1`;
    console.log('from db:  ',result);
    
    // Ensure total is a number, not a string
    const total = (result.length > 0) ? Number(result[0].totalcount) : 0;
    res.json({ total });
  } catch (error) {
    console.error('Error fetching total:', error);
    res.status(500).json({ error: 'Failed to fetch total' });
  }
});

// API endpoint to increment total count
app.post('/api/increment', async (req, res) => {
  try {
    // First, ensure a row exists (INSERT if table is empty)
    await sql`
      INSERT INTO dhikrtotal (id, totalcount) 
      VALUES (1, 0) 
      ON CONFLICT (id) DO NOTHING
    `;
    
    // Now increment
    await sql`UPDATE dhikrtotal SET totalcount = totalcount + 1 WHERE id = 1`;
    const result = await sql`SELECT totalcount FROM dhikrtotal WHERE id = 1`;
    console.log('Updated count:', result);
    
    const total = (result.length > 0) ? Number(result[0].totalcount) : 0;
    res.json({ total });
  } catch (error) {
    console.error('Error updating dhikrtotal:', error);
    res.status(500).json({ error: 'Failed to update dhikrtotal' });
  }
});

// API endpoint to get current dhikr text
app.get('/api/dhikr', async (req, res) => {
  try {
    const result = await sql`SELECT dhikrtext FROM dhikrtotal WHERE id = 1`;
    const dhikrText = (result.length > 0 && result[0].dhikrtext) 
      ? result[0].dhikrtext 
      : 'لا اله الا الله محمد رسول الله';
    res.json({ dhikr: dhikrText });
  } catch (error) {
    console.error('Error fetching dhikr:', error);
    res.status(500).json({ error: 'Failed to fetch dhikr' });
  }
});

// API endpoint to update dhikr text (admin only)
app.post('/api/dhikr', async (req, res) => {
  const { password, dhikrText, resetCount } = req.body;
  
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  if (!dhikrText || typeof dhikrText !== 'string') {
    return res.status(400).json({ error: 'Invalid dhikr text' });
  }
  
  try {
    // Update dhikr text
    await sql`
      INSERT INTO dhikrtotal (id, totalcount, dhikrtext) 
      VALUES (1, 0, ${dhikrText})
      ON CONFLICT (id) DO UPDATE SET dhikrtext = ${dhikrText}
    `;
    
    // If resetCount is true, also reset totalcount to 0
    if (resetCount) {
      await sql`UPDATE dhikrtotal SET totalcount = 0 WHERE id = 1`;
      console.log('Dhikr text updated and counter reset to 0');
    } else {
      console.log('Dhikr text updated to:', dhikrText);
    }
    
    res.json({ message: 'Dhikr text updated successfully', dhikr: dhikrText });
  } catch (error) {
    console.error('Error updating dhikr:', error);
    res.status(500).json({ error: 'Failed to update dhikr' });
  }
});

// Catch-all for 404s - serve index.html (but admin should have explicit route above)
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
