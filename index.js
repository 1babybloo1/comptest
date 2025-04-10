// Simple Express server to handle Discord webhook requests
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Your webhook secret (should be kept secure in production)
const WEBHOOK_SECRET = 'https://discord.com/api/webhooks/1359247078802456768/XJYyxEJHHE_J7tSSHAKrta6TqXKcpCUtu4VXWvmrUK3_xVfzrMrMzVCmj-DUCXcLU9h5';

// Use JSON middleware
app.use(bodyParser.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Verify webhook signature (security measure)
function verifySignature(req, res, next) {
  const signature = req.headers['x-discord-signature'];
  
  if (!signature) {
    return res.status(401).json({ error: 'Missing signature' });
  }
  
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const computedSignature = hmac.update(JSON.stringify(req.body)).digest('hex');
  
  if (signature !== computedSignature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  next();
}

// Read and write data functions
function readData() {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'public', 'data.json'), 'utf8');
    return JSON.parse(data);
  } catch (err) {
    // Return default data structure if file doesn't exist
    return {
      matches: [],
      clans: [],
      tournament: {
        rounds: []
      }
    };
  }
}

function writeData(data) {
  fs.writeFileSync(
    path.join(__dirname, 'public', 'data.json'), 
    JSON.stringify(data, null, 2), 
    'utf8'
  );
}

// Webhook endpoint
app.post('/webhook/discord', verifySignature, (req, res) => {
  const { type, action, data } = req.body;
  
  if (!type || !action) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }
  
  const siteData = readData();
  let success = false;
  let message = '';
  
  try {
    switch (type) {
      case 'match':
        if (action === 'add' && data) {
          const newId = siteData.matches.length > 0 
            ? Math.max(...siteData.matches.map(m => m.id)) + 1 
            : 1;
            
          siteData.matches.push({
            id: newId,
            team1: data.team1,
            team2: data.team2,
            details: data.details,
            timestamp: new Date(data.date).getTime(),
            live: false
          });
          
          success = true;
          message = `Match added: ${data.team1} vs ${data.team2}`;
        } else if (action === 'update' && data && data.id) {
          const matchIndex = siteData.matches.findIndex(m => m.id === parseInt(data.id));
          
          if (matchIndex !== -1) {
            siteData.matches[matchIndex] = {
              ...siteData.matches[matchIndex],
              team1: data.team1 || siteData.matches[matchIndex].team1,
              team2: data.team2 || siteData.matches[matchIndex].team2,
              details: data.details || siteData.matches[matchIndex].details,
              timestamp: data.date ? new Date(data.date).getTime() : siteData.matches[matchIndex].timestamp
            };
            
            success = true;
            message = `Match updated: ID ${data.id}`;
          } else {
            message = `Match ID ${data.id} not found`;
          }
        } else if (action === 'remove' && data && data.id) {
          const initialLength = siteData.matches.length;
          siteData.matches = siteData.matches.filter(m => m.id !== parseInt(data.id));
          
          if (siteData.matches.length < initialLength) {
            success = true;
            message = `Match removed: ID ${data.id}`;
          } else {
            message = `Match ID ${data.id} not found`;
          }
        }
        break;
        
      case 'clan':
        if (action === 'add' && data && data.name) {
          siteData.clans.push({
            name: data.name,
            wins: parseInt(data.wins || 0),
            losses: parseInt(data.losses || 0)
          });
          
          success = true;
          message = `Player added: ${data.name}`;
        } else if (action === 'update' && data && data.name) {
          const clanIndex = siteData.clans.findIndex(c => c.name === data.name);
          
          if (clanIndex !== -1) {
            siteData.clans[clanIndex] = {
              name: data.name,
              wins: data.wins !== undefined ? parseInt(data.wins) : siteData.clans[clanIndex].wins,
              losses: data.losses !== undefined ? parseInt(data.losses) : siteData.clans[clanIndex].losses
            };
            
            success = true;
            message = `Player updated: ${data.name}`;
          } else {
            message = `Player ${data.name} not found`;
          }
        } else if (action === 'remove' && data && data.name) {
          const initialLength = siteData.clans.length;
          siteData.clans = siteData.clans.filter(c => c.name !== data.name);
          
          if (siteData.clans.length < initialLength) {
            success = true;
            message = `Player removed: ${data.name}`;
          } else {
            message = `Player ${data.name} not found`;
          }
        }
        break;
        
      case 'tournament':
        if (action === 'advance' && data) {
          const { roundIndex, matchIndex, winningTeam, players } = data;
          
          if (roundIndex >= siteData.tournament.rounds.length - 1) {
            message = "Can't advance from final round";
            break;
          }
          
          const round = siteData.tournament.rounds[parseInt(roundIndex)];
          if (!round || !round.matches[parseInt(matchIndex)]) {
            message = "Invalid round or match index";
            break;
          }
          
          const winningTeamData = round.matches[parseInt(matchIndex)][`team${winningTeam}`];
          const toMatchIndex = Math.floor(parseInt(matchIndex) / 2);
          const toTeamSlot = parseInt(matchIndex) % 2 === 0 ? 'team1' : 'team2';
          
          siteData.tournament.rounds[parseInt(roundIndex) + 1].matches[toMatchIndex][toTeamSlot] = {
            name: winningTeamData.name,
            players: players ? players.split(',') : winningTeamData.players
          };
          
          success = true;
          message = `Advanced ${winningTeamData.name} to the next round`;
        } else if (action === 'addRound' && data && data.name) {
          siteData.tournament.rounds.push({
            name: data.name,
            matches: [{
              team1: {
                name: "TBD",
                players: ["TBD"]
              },
              team2: {
                name: "TBD",
                players: ["TBD"]
              }
            }]
          });
          
          success = true;
          message = `Tournament round added: ${data.name}`;
        } else if (action === 'updateMatch' && data) {
          const { roundIndex, matchIndex, team1Name, team1Players, team2Name, team2Players } = data;
          
          const round = siteData.tournament.rounds[parseInt(roundIndex)];
          if (!round || !round.matches[parseInt(matchIndex)]) {
            message = "Invalid round or match index";
            break;
          }
          
          const match = round.matches[parseInt(matchIndex)];
          
          if (team1Name) match.team1.name = team1Name;
          if (team1Players) match.team1.players = team1Players.split(',');
          if (team2Name) match.team2.name = team2Name;
          if (team2Players) match.team2.players = team2Players.split(',');
          
          success = true;
          message = `Tournament match updated`;
        }
        break;
        
      default:
        message = 'Unknown command type';
    }
    
    if (success) {
      writeData(siteData);
    }
    
    res.json({ success, message });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error processing command',
      error: error.message
    });
  }
});

// Add a data.json endpoint
app.get('/data.json', (req, res) => {
  res.json(readData());
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Create public directory if it doesn't exist
  const publicDir = path.join(__dirname, 'public');
  if (!fs.existsSync(publicDir)){
    fs.mkdirSync(publicDir);
  }
  
  // Create initial data.json if it doesn't exist
  const dataPath = path.join(publicDir, 'data.json');
  if (!fs.existsSync(dataPath)){
    const initialData = {
      matches: [],
      clans: [],
      tournament: {
        rounds: []
      }
    };
    writeData(initialData);
    console.log('Created initial data.json file');
  }
});
