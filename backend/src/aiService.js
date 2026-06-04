const axios = require('axios');

async function analyzeProposal(title, description) {
  if (!process.env.OPENAI_API_KEY) {
    return { sentiment: 'neutral', summary: 'AI analysis disabled (no API key)', riskScore: 5 };
  }
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'system', content: 'Analyze governance proposal. Return JSON: { sentiment, summary, riskScore }' }, { role: 'user', content: `Title: ${title}\nDescription: ${description}` }],
      temperature: 0.5
    }, { headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' } });
    return JSON.parse(response.data.choices[0].message.content);
  } catch (error) {
    console.error('AI analysis error:', error);
    return { sentiment: 'unknown', summary: 'Analysis failed', riskScore: null };
  }
}

async function generateVisualization(description) {
  if (!process.env.REPLICATE_API_TOKEN) {
    return { imageUrl: 'https://placehold.co/800x400?text=AI+Visualization+Demo' };
  }
  try {
    const response = await axios.post('https://api.replicate.com/v1/predictions', {
      version: "stability-ai/stable-diffusion",
      input: { prompt: `Architectural visualization, photorealistic, ${description}` }
    }, { headers: { Authorization: `Token ${process.env.REPLICATE_API_TOKEN}` } });
    return { imageUrl: response.data.output };
  } catch (error) {
    console.error('Visualization error:', error);
    return { imageUrl: null, error: error.message };
  }
}

module.exports = { analyzeProposal, generateVisualization };