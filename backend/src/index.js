require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { uploadToIPFS, getFromIPFS } = require('./ipfsService');
const { analyzeProposal, generateVisualization } = require('./aiService');
const { findContractor } = require('./contractorService');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post('/api/proposals', async (req, res) => {
  try {
    const { title, description, author, choices } = req.body;
    if (!title || !description) return res.status(400).json({ error: 'Title and description required' });
    const metadata = { title, description, author: author || 'anonymous', timestamp: new Date().toISOString(), choices: choices || ['For', 'Against', 'Abstain'] };
    const cid = await uploadToIPFS(metadata);
    const analysis = await analyzeProposal(title, description);
    res.json({ success: true, ipfsCid: cid, analysis, proposalData: metadata });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/proposals/:cid', async (req, res) => {
  try {
    const data = await getFromIPFS(req.params.cid);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/analyze', async (req, res) => {
  try {
    const { title, description } = req.body;
    const analysis = await analyzeProposal(title, description);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/visualize', async (req, res) => {
  try {
    const { description } = req.body;
    const result = await generateVisualization(description);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/find-contractor', async (req, res) => {
  try {
    const { description, budget } = req.body;
    const contractor = await findContractor(description, budget);
    res.json(contractor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`DigitalAgora backend running on port ${PORT}`));