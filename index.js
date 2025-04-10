const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const MATCHES_FILE = path.join(DATA_DIR, 'matches.json');
const CLANS_FILE = path.join(DATA_DIR, 'clans.json');
const TOURNAMENT_FILE = path.join(DATA_DIR, 'tournament.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Error creating data directory:', err);
  }
}

// File operations
async function readDataFile(filePath, defaultValue = []) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // File doesn't exist, create it with default value
      await fs.writeFile(filePath, JSON.stringify(defaultValue), 'utf8');
      return defaultValue;
    }
    console.error(`Error reading file ${filePath}:`, err);
    throw err;
  }
}

async function writeDataFile(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing to file ${filePath}:`, err);
    throw err;
  }
}

// Initialize data files
async function initDataFiles() {
  await ensureDataDir();
  
  // Initialize matches if it doesn't exist
  const defaultMatches = [
    {
      id: 1,
      team1: "player",
      team2: "player",
      details: "Casual - Match Day",
      timestamp: new Date("2025-04-10T20:00:00").getTime(),
      live: false
    }
  ];
  await readDataFile(MATCHES_FILE, defaultMatches);
  
  // Initialize clans if it doesn't exist
  const defaultClans = [
    { name: "PLAYER", wins: 0, losses: 0 },
    { name: "PLAYER", wins: 0, losses: 0 },
    { name: "PLAYER", wins: 0, losses: 0 },
    { name: "PLAYER", wins: 0, losses: 0 },
    { name: "PLAYER", wins: 0, losses: 0 },
    { name: "PLAYER", wins: 0, losses: 0 }
  ];
  await readDataFile(CLANS_FILE, defaultClans);
  
  // Initialize tournament if it doesn't exist
  const defaultTournament = {
    rounds: [
      {
        name: "Qualifying",
        matches: [
          {
            team1: {
              name: "PLACEHOLDERTHIS!",
              players: ["OK BRO"]
            },
            team2: {
              name: "NAME",
              players: ["SOMEONE"]
            }
          },
          {
            team1: {
              name: "NAME",
              players: ["SOMEONE"]
            },
            team2: {
              name: "NAME",
              players: ["SOMEONE"]
            }
          }
        ]
      },
      {
        name: "Quarter Finals",
        matches: [
          {
            team1: {
              name: "PLACEHOLDERTHIS!",
              players: ["OK BRO"]
            },
            team2: {
              name: "NAME",
              players: ["SOMEONE"]
            }
          },
          {
            team1: {
              name: "NAME",
              players: ["SOMEONE"]
            },
            team2: {
              name: "NAME",
              players: ["SOMEONE"]
            }
          }
        ]
      },
      {
        name: "Semi Finals",
        matches: [
          {
            team1: {
              name: "NAME",
              players: ["SOMEONE"]
            },
            team2: {
              name: "NAME",
              players: ["SOMEONE"]
            }
          }
        ]
      },
      {
        name: "Finals",
        matches: [
          {
            team1: {
              name: "NONE",
              players: ["SOMEONE"]
            },
            team2: {
              name: "NONE",
              players: ["SOMEONE"]
            }
          }
        ]
      }
    ]
  };
  await readDataFile(TOURNAMENT_FILE, defaultTournament);
}

// API Security - Simple API Key middleware
const API_KEY = process.env.API_KEY || 'your-secret-api-key';

function apiKeyAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
  }
  
  next();
}

// ===== MATCHES ENDPOINTS =====

// Get all matches
app.get('/api/matches', async (req, res) => {
  try {
    const matches = await readDataFile(MATCHES_FILE);
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get matches' });
  }
});

// Add a new match
app.post('/api/matches', apiKeyAuth, async (req, res) => {
  try {
    const { team1, team2, details, timestamp } = req.body;
    
    if (!team1 || !team2 || !details || !timestamp) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const matches = await readDataFile(MATCHES_FILE);
    const newId = matches.length > 0 ? Math.max(...matches.map(m => m.id)) + 1 : 1;
    
    const newMatch = {
      id: newId,
      team1,
      team2,
      details,
      timestamp,
      live: false
    };
    
    matches.push(newMatch);
    await writeDataFile(MATCHES_FILE, matches);
    
    res.status(201).json(newMatch);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add match' });
  }
});

// Update a match
app.put('/api/matches/:id', apiKeyAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { team1, team2, details, timestamp } = req.body;
    
    const matches = await readDataFile(MATCHES_FILE);
    const matchIndex = matches.findIndex(m => m.id === id);
    
    if (matchIndex === -1) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    matches[matchIndex] = {
      ...matches[matchIndex],
      team1: team1 || matches[matchIndex].team1,
      team2: team2 || matches[matchIndex].team2,
      details: details || matches[matchIndex].details,
      timestamp: timestamp || matches[matchIndex].timestamp
    };
    
    await writeDataFile(MATCHES_FILE, matches);
    
    res.json(matches[matchIndex]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update match' });
  }
});

// Delete a match
app.delete('/api/matches/:id', apiKeyAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const matches = await readDataFile(MATCHES_FILE);
    const updatedMatches = matches.filter(m => m.id !== id);
    
    if (matches.length === updatedMatches.length) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    await writeDataFile(MATCHES_FILE, updatedMatches);
    
    res.json({ message: 'Match deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete match' });
  }
});

// ===== CLANS ENDPOINTS =====

// Get all clans
app.get('/api/clans', async (req, res) => {
  try {
    const clans = await readDataFile(CLANS_FILE);
    res.json(clans);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get clans' });
  }
});

// Add a new clan
app.post('/api/clans', apiKeyAuth, async (req, res) => {
  try {
    const { name, wins = 0, losses = 0 } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const clans = await readDataFile(CLANS_FILE);
    
    if (clans.some(c => c.name === name)) {
      return res.status(400).json({ error: 'Clan with this name already exists' });
    }
    
    const newClan = { name, wins, losses };
    clans.push(newClan);
    
    await writeDataFile(CLANS_FILE, clans);
    
    res.status(201).json(newClan);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add clan' });
  }
});

// Update clan stats
app.put('/api/clans/:name', apiKeyAuth, async (req, res) => {
  try {
    const name = req.params.name;
    const { wins, losses } = req.body;
    
    const clans = await readDataFile(CLANS_FILE);
    const clanIndex = clans.findIndex(c => c.name === name);
    
    if (clanIndex === -1) {
      return res.status(404).json({ error: 'Clan not found' });
    }
    
    clans[clanIndex] = {
      name,
      wins: wins !== undefined ? wins : clans[clanIndex].wins,
      losses: losses !== undefined ? losses : clans[clanIndex].losses
    };
    
    await writeDataFile(CLANS_FILE, clans);
    
    res.json(clans[clanIndex]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update clan' });
  }
});

// Delete a clan
app.delete('/api/clans/:name', apiKeyAuth, async (req, res) => {
  try {
    const name = req.params.name;
    
    const clans = await readDataFile(CLANS_FILE);
    const updatedClans = clans.filter(c => c.name !== name);
    
    if (clans.length === updatedClans.length) {
      return res.status(404).json({ error: 'Clan not found' });
    }
    
    await writeDataFile(CLANS_FILE, updatedClans);
    
    res.json({ message: 'Clan deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete clan' });
  }
});

// ===== TOURNAMENT ENDPOINTS =====

// Get tournament
app.get('/api/tournament', async (req, res) => {
  try {
    const tournament = await readDataFile(TOURNAMENT_FILE);
    res.json(tournament);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get tournament' });
  }
});

// Update entire tournament
app.put('/api/tournament', apiKeyAuth, async (req, res) => {
  try {
    const tournament = req.body;
    
    if (!tournament || !tournament.rounds) {
      return res.status(400).json({ error: 'Invalid tournament data' });
    }
    
    await writeDataFile(TOURNAMENT_FILE, tournament);
    
    res.json(tournament);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update tournament' });
  }
});

// Add a new round to the tournament
app.post('/api/tournament/rounds', apiKeyAuth, async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Missing round name' });
    }
    
    const tournament = await readDataFile(TOURNAMENT_FILE);
    
    const newRound = {
      name,
      matches: [{
        team1: {
          name: "INSERT NAMES",
          players: ["Player 1", "Player 2"]
        },
        team2: {
          name: "INSERT NAMES",
          players: ["Player 1", "Player 2"]
        }
      }]
    };
    
    tournament.rounds.push(newRound);
    await writeDataFile(TOURNAMENT_FILE, tournament);
    
    res.status(201).json(newRound);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add tournament round' });
  }
});

// Advance a team in the tournament
app.post('/api/tournament/advance', apiKeyAuth, async (req, res) => {
  try {
    const { fromRoundIndex, fromMatchIndex, winningTeamNumber, players } = req.body;
    
    if (fromRoundIndex === undefined || fromMatchIndex === undefined || !winningTeamNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const tournament = await readDataFile(TOURNAMENT_FILE);
    
    if (fromRoundIndex >= tournament.rounds.length - 1) {
      return res.status(400).json({ error: 'Cannot advance from final round' });
    }
    
    if (!tournament.rounds[fromRoundIndex] || 
        !tournament.rounds[fromRoundIndex].matches[fromMatchIndex] ||
        !tournament.rounds[fromRoundIndex].matches[fromMatchIndex][`team${winningTeamNumber}`]) {
      return res.status(404).json({ error: 'Match or team not found' });
    }
    
    const winningTeam = tournament.rounds[fromRoundIndex].matches[fromMatchIndex][`team${winningTeamNumber}`];
    const toMatchIndex = Math.floor(fromMatchIndex / 2);
    const toTeamSlot = fromMatchIndex % 2 === 0 ? 'team1' : 'team2';
    
    // Ensure the next round and match exist
    if (!tournament.rounds[fromRoundIndex + 1]) {
      tournament.rounds[fromRoundIndex + 1] = { name: 'Next Round', matches: [] };
    }
    
    if (!tournament.rounds[fromRoundIndex + 1].matches[toMatchIndex]) {
      tournament.rounds[fromRoundIndex + 1].matches[toMatchIndex] = {
        team1: { name: "TBD", players: [] },
        team2: { name: "TBD", players: [] }
      };
    }
    
    // Update the next round with the winning team
    tournament.rounds[fromRoundIndex + 1].matches[toMatchIndex][toTeamSlot] = {
      name: winningTeam.name,
      players: players || winningTeam.players
    };
    
    await writeDataFile(TOURNAMENT_FILE, tournament);
    
    res.json(tournament.rounds[fromRoundIndex + 1].matches[toMatchIndex]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to advance team' });
  }
});

// ===== SYNC ENDPOINT =====

// Sync data to HTML file
app.post('/api/sync', apiKeyAuth, async (req, res) => {
  try {
    const matches = await readDataFile(MATCHES_FILE);
    const clans = await readDataFile(CLANS_FILE);
    const tournament = await readDataFile(TOURNAMENT_FILE);
    
    // Read the HTML file
    const htmlFilePath = path.join(__dirname, 'public', 'index.html');
    let htmlContent = await fs.readFile(htmlFilePath, 'utf8');
    
    // Update JavaScript data in the HTML
    htmlContent = htmlContent.replace(
      /let matches = \[[\s\S]*?\];/,
      `let matches = ${JSON.stringify(matches, null, 4)};`
    );
    
    htmlContent = htmlContent.replace(
      /let clans = \[[\s\S]*?\];/,
      `let clans = ${JSON.stringify(clans, null, 4)};`
    );
    
    htmlContent = htmlContent.replace(
      /let tournament = \{[\s\S]*?\};/,
      `let tournament = ${JSON.stringify(tournament, null, 4)};`
    );
    
    // Write the updated HTML file
    await fs.writeFile(htmlFilePath, htmlContent, 'utf8');
    
    res.json({ message: 'Data synchronized to HTML file successfully' });
  } catch (err) {
    console.error('Error syncing data:', err);
    res.status(500).json({ error: 'Failed to sync data to HTML file' });
  }
});

// ===== SERVER SETUP =====

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
app.listen(port, async () => {
  await initDataFiles();
  console.log(`API server running on port ${port}`);
});
