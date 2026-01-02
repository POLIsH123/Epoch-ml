const express = require('express');
const axios = require('axios');
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
    
    const response = await axios.post(`https://router.huggingface.co/api/models/${modelId}/generate?wait_for_model=true`, {
      inputs: prompt,
      parameters: {
        max_new_tokens: maxTokens || 200,
        return_full_text: false,
      }
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      responseType: 'json'
    });
    
    if (response.status !== 200) {
      return res.status(response.status).json({ error: response.data.error || 'Failed to generate text' });
    }
    
    const data = response.data;
    res.json({
      generated_text: data[0]?.generated_text || 'No response generated',
      model: modelId,
      prompt: prompt
    });
    
  } catch (error) {
    console.error('Error in AI Playground:', error);
    // Handle axios-specific errors
    if (error.response) {
      // Server responded with error status
      res.status(error.response.status).json({ 
        error: error.response.data.error || 'Hugging Face API error',
        details: error.response.data
      });
    } else if (error.request) {
      // Request was made but no response received
      res.status(500).json({ 
        error: 'Network error - unable to reach Hugging Face API',
        details: error.message
      });
    } else {
      // Something else happened
      res.status(500).json({ 
        error: error.message || 'Unknown error occurred',
        details: error.message
      });
    }
  }
});

module.exports = router;