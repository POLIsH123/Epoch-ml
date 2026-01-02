const express = require('express');
const router = express.Router();

// AI Playground routes
router.get('/', (req, res) => {
  res.json({ message: 'AI Playground API is running' });
});

// Generate text using Hugging Face models
router.post('/generate', async (req, res) => {
  try {
    const { modelId, prompt, maxTokens } = req.body;
    
    // Get API key from environment
    const apiKey = process.env.HUGGING_FACE_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'Hugging Face API key not configured on server' });
    }
    
    if (!modelId || !prompt) {
      return res.status(400).json({ error: 'Model ID and prompt are required' });
    }
    
    const response = await fetch(`https://api-inference.huggingface.co/models/${modelId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: maxTokens || 200,
          return_full_text: false,
        }
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData.error || 'Failed to generate text' });
    }
    
    const data = await response.json();
    res.json({
      generated_text: data[0]?.generated_text || 'No response generated',
      model: modelId,
      prompt: prompt
    });
    
  } catch (error) {
    console.error('Error in AI Playground:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;