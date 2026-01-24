import express from 'express';
import { 
  extractKeywords, 
  generateSummary, 
  generateBulletPoints, 
  suggestSkills,
  generateProjectDescription,
  listAvailableModels
} from '../services/aiService.js';

const router = express.Router();

/**
 * GET /api/ai/models
 * List available AI models (for debugging)
 */
router.get('/models', async (req, res) => {
  try {
    const models = await listAvailableModels();
    res.json({
      success: true,
      data: models
    });
  } catch (error) {
    console.error('List models error:', error);
    res.status(500).json({ 
      error: 'Failed to list models',
      details: error.message 
    });
  }
});

/**
 * POST /api/ai/extract-keywords
 * Extract keywords from job description
 */
router.post('/extract-keywords', async (req, res) => {
  try {
    const { jobDescription } = req.body;
    
    if (!jobDescription || typeof jobDescription !== 'string') {
      return res.status(400).json({ 
        error: 'Job description is required and must be a string' 
      });
    }
    
    if (jobDescription.trim().length < 50) {
      return res.status(400).json({ 
        error: 'Job description is too short. Please provide more details.' 
      });
    }
    
    const keywords = await extractKeywords(jobDescription);
    
    res.json({
      success: true,
      data: keywords
    });
  } catch (error) {
    console.error('Extract keywords error:', error);
    res.status(500).json({ 
      error: 'Failed to extract keywords. Please try again.',
      details: error.message 
    });
  }
});

/**
 * POST /api/ai/generate-summary
 * Generate professional summary suggestions
 */
router.post('/generate-summary', async (req, res) => {
  try {
    const { jobDescription, userExperience, skills } = req.body;
    
    if (!jobDescription) {
      return res.status(400).json({ 
        error: 'Job description is required' 
      });
    }
    
    const summaries = await generateSummary(jobDescription, userExperience, skills);
    
    res.json({
      success: true,
      data: summaries
    });
  } catch (error) {
    console.error('Generate summary error:', error);
    res.status(500).json({ 
      error: 'Failed to generate summary. Please try again.',
      details: error.message 
    });
  }
});

/**
 * POST /api/ai/generate-bullets
 * Generate bullet points for work experience
 */
router.post('/generate-bullets', async (req, res) => {
  try {
    const { jobDescription, jobTitle, company, existingBullets } = req.body;
    
    if (!jobDescription) {
      return res.status(400).json({ 
        error: 'Job description is required' 
      });
    }
    
    if (!jobTitle) {
      return res.status(400).json({ 
        error: 'Job title is required' 
      });
    }
    
    const bullets = await generateBulletPoints(jobDescription, jobTitle, company, existingBullets);
    
    res.json({
      success: true,
      data: bullets
    });
  } catch (error) {
    console.error('Generate bullets error:', error);
    res.status(500).json({ 
      error: 'Failed to generate bullet points. Please try again.',
      details: error.message 
    });
  }
});

/**
 * POST /api/ai/suggest-skills
 * Suggest skills based on job description
 */
router.post('/suggest-skills', async (req, res) => {
  try {
    const { jobDescription, currentSkills } = req.body;
    
    if (!jobDescription) {
      return res.status(400).json({ 
        error: 'Job description is required' 
      });
    }
    
    const skills = await suggestSkills(jobDescription, currentSkills);
    
    res.json({
      success: true,
      data: skills
    });
  } catch (error) {
    console.error('Suggest skills error:', error);
    res.status(500).json({ 
      error: 'Failed to suggest skills. Please try again.',
      details: error.message 
    });
  }
});

/**
 * POST /api/ai/generate-project
 * Generate project description bullets
 */
router.post('/generate-project', async (req, res) => {
  try {
    const { jobDescription, projectName, technologies } = req.body;
    
    if (!jobDescription) {
      return res.status(400).json({ 
        error: 'Job description is required' 
      });
    }
    
    if (!projectName) {
      return res.status(400).json({ 
        error: 'Project name is required' 
      });
    }
    
    const bullets = await generateProjectDescription(jobDescription, projectName, technologies);
    
    res.json({
      success: true,
      data: bullets
    });
  } catch (error) {
    console.error('Generate project error:', error);
    res.status(500).json({ 
      error: 'Failed to generate project description. Please try again.',
      details: error.message 
    });
  }
});

export default router;
