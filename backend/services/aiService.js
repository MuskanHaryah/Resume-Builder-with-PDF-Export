import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Extract keywords from job description
 * @param {string} jobDescription - The job description text
 * @returns {Promise<Object>} - Extracted keywords in categories
 */
export const extractKeywords = async (jobDescription) => {
  const prompt = `Analyze the following job description and extract key information. 
Return ONLY a valid JSON object with no additional text, no markdown, no code blocks.

Categories to extract:
1. skills: Technical and soft skills mentioned (array of strings)
2. responsibilities: Key job responsibilities (array of strings, max 5 items)
3. qualifications: Required/preferred qualifications (array of strings, max 5 items)
4. actionVerbs: Strong action verbs used in the job description (array of strings, max 8 items)
5. keywords: Important industry keywords and buzzwords (array of strings, max 6 items)

Job Description:
"""
${jobDescription}
"""

Return JSON format exactly like this:
{"skills":["skill1","skill2"],"responsibilities":["resp1","resp2"],"qualifications":["qual1","qual2"],"actionVerbs":["verb1","verb2"],"keywords":["kw1","kw2"]}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up the response - remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const parsed = JSON.parse(text);
    
    // Ensure all arrays exist
    return {
      skills: parsed.skills || [],
      responsibilities: parsed.responsibilities || [],
      qualifications: parsed.qualifications || [],
      actionVerbs: parsed.actionVerbs || [],
      keywords: parsed.keywords || []
    };
  } catch (error) {
    console.error('Error extracting keywords:', error);
    throw new Error('Failed to extract keywords from job description');
  }
};

/**
 * Generate professional summary based on job description and user experience
 * @param {string} jobDescription - The job description text
 * @param {string} userExperience - User's experience summary (optional)
 * @param {Array} skills - User's skills (optional)
 * @returns {Promise<Array<string>>} - Array of summary suggestions
 */
export const generateSummary = async (jobDescription, userExperience = '', skills = []) => {
  const prompt = `Generate 3 professional resume summary options for a candidate applying to the following job.
Each summary should be 2-3 sentences, professional, and tailored to the job requirements.
Include relevant keywords from the job description.
${userExperience ? `The candidate has experience in: ${userExperience}` : ''}
${skills.length > 0 ? `The candidate's skills include: ${skills.join(', ')}` : ''}

Job Description:
"""
${jobDescription}
"""

Return ONLY a valid JSON array with 3 summary strings, no additional text:
["summary1", "summary2", "summary3"]`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up the response
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const summaries = JSON.parse(text);
    return Array.isArray(summaries) ? summaries : [summaries];
  } catch (error) {
    console.error('Error generating summary:', error);
    throw new Error('Failed to generate summary suggestions');
  }
};

/**
 * Generate bullet points for work experience
 * @param {string} jobDescription - The job description text
 * @param {string} jobTitle - User's job title
 * @param {string} company - Company name
 * @param {Array} existingBullets - Existing bullet points (optional)
 * @returns {Promise<Array<string>>} - Array of bullet point suggestions
 */
export const generateBulletPoints = async (jobDescription, jobTitle, company = '', existingBullets = []) => {
  const prompt = `Generate 5 strong resume bullet points for a ${jobTitle}${company ? ` at ${company}` : ''}.
Each bullet should:
- Start with a strong action verb
- Include quantifiable achievements when possible
- Be relevant to the target job description
- Be 1-2 lines maximum
${existingBullets.length > 0 ? `Avoid duplicating these existing bullets: ${existingBullets.join('; ')}` : ''}

Target Job Description:
"""
${jobDescription}
"""

Return ONLY a valid JSON array with 5 bullet point strings, no additional text:
["bullet1", "bullet2", "bullet3", "bullet4", "bullet5"]`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up the response
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const bullets = JSON.parse(text);
    return Array.isArray(bullets) ? bullets : [bullets];
  } catch (error) {
    console.error('Error generating bullet points:', error);
    throw new Error('Failed to generate bullet point suggestions');
  }
};

/**
 * Suggest skills based on job description
 * @param {string} jobDescription - The job description text
 * @param {Array} currentSkills - User's current skills
 * @returns {Promise<Array<Object>>} - Array of skill suggestions with match percentage
 */
export const suggestSkills = async (jobDescription, currentSkills = []) => {
  const prompt = `Analyze the job description and suggest the most relevant skills.
For each skill, provide a match percentage (how important it is for this job, 60-100%).
${currentSkills.length > 0 ? `The candidate already has these skills: ${currentSkills.join(', ')}. Suggest additional skills they might want to add.` : 'Suggest the top 10 most important skills for this role.'}

Job Description:
"""
${jobDescription}
"""

Return ONLY a valid JSON array of objects with skill and matchPercentage:
[{"skill":"React","matchPercentage":95},{"skill":"Node.js","matchPercentage":85}]`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up the response
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const skills = JSON.parse(text);
    return Array.isArray(skills) ? skills : [];
  } catch (error) {
    console.error('Error suggesting skills:', error);
    throw new Error('Failed to suggest skills');
  }
};

/**
 * Generate project description based on project name and technologies
 * @param {string} jobDescription - The job description text
 * @param {string} projectName - Name of the project
 * @param {Array} technologies - Technologies used
 * @returns {Promise<Array<string>>} - Array of bullet point suggestions for project
 */
export const generateProjectDescription = async (jobDescription, projectName, technologies = []) => {
  const prompt = `Generate 4 strong bullet points describing a project called "${projectName}"${technologies.length > 0 ? ` that uses ${technologies.join(', ')}` : ''}.
Each bullet should:
- Describe a specific feature or achievement
- Use action verbs
- Be relevant to the target job
- Show technical depth and impact

Target Job Description:
"""
${jobDescription}
"""

Return ONLY a valid JSON array with 4 bullet point strings:
["bullet1", "bullet2", "bullet3", "bullet4"]`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up the response
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const bullets = JSON.parse(text);
    return Array.isArray(bullets) ? bullets : [bullets];
  } catch (error) {
    console.error('Error generating project description:', error);
    throw new Error('Failed to generate project description');
  }
};

export default {
  extractKeywords,
  generateSummary,
  generateBulletPoints,
  suggestSkills,
  generateProjectDescription
};
