/**
 * ATS Calculator - Rule-Based System (NOT AI)
 * Calculates ATS score based on resume completeness and content quality
 * Score: 0-100 points
 */

import type { ResumeData } from '../types/resume';
import { evaluateContentQuality, evaluateMultipleTexts } from './qualityEvaluator';

export interface ATSScore {
  totalScore: number;              // 0-100
  breakdown: {
    contactInfo: number;           // 0-10 points
    summary: number;               // 0-15 points
    experience: number;            // 0-30 points
    education: number;             // 0-15 points
    skills: number;                // 0-10 points
    projects: number;              // 0-10 points
    formatting: number;            // 0-10 points
  };
  feedback: string[];
  grade: string;                   // A+, A, B+, B, C, D, F
}

/**
 * Calculate ATS score for a resume
 */
export const calculateATSScore = (data: ResumeData): ATSScore => {
  const breakdown = {
    contactInfo: 0,
    summary: 0,
    experience: 0,
    education: 0,
    skills: 0,
    projects: 0,
    formatting: 0,
  };
  const feedback: string[] = [];

  // 1. CONTACT INFORMATION (0-10 points)
  const { personalInfo } = data;
  let contactScore = 0;
  
  if (personalInfo.firstName && personalInfo.lastName) contactScore += 3;
  else feedback.push('Add your full name');
  
  if (personalInfo.email && personalInfo.email.includes('@')) contactScore += 3;
  else feedback.push('Add a valid email address');
  
  if (personalInfo.phone) contactScore += 2;
  else feedback.push('Add your phone number');
  
  if (personalInfo.linkedin || personalInfo.github) contactScore += 2;
  else feedback.push('Add LinkedIn or GitHub profile');
  
  breakdown.contactInfo = contactScore;

  // 2. PROFESSIONAL SUMMARY (0-15 points)
  if (data.summary && data.summary.trim().length > 0) {
    const summaryQuality = evaluateContentQuality(data.summary);
    const wordCount = data.summary.split(/\s+/).filter(w => w.length > 0).length;
    
    let summaryScore = 0;
    
    // Base points for having a summary
    summaryScore += 5;
    
    // Quality score (0-8 points based on quality evaluator)
    summaryScore += Math.min(8, summaryQuality.totalScore / 3);
    
    // Length appropriateness (2 points)
    if (wordCount >= 30 && wordCount <= 100) summaryScore += 2;
    else if (wordCount < 30) feedback.push('Summary is too short (aim for 30-100 words)');
    else feedback.push('Summary is too long (aim for 30-100 words)');
    
    breakdown.summary = Math.round(summaryScore);
  } else {
    feedback.push('Add a professional summary');
    breakdown.summary = 0;
  }

  // 3. WORK EXPERIENCE (0-30 points) - Most important section
  if (data.experience && data.experience.length > 0) {
    let experienceScore = 0;
    
    // Base points for having experience entries
    const validExperiences = data.experience.filter(exp => 
      exp.company && exp.title && exp.startDate
    );
    
    if (validExperiences.length >= 2) experienceScore += 10;
    else if (validExperiences.length === 1) experienceScore += 7;
    
    // Evaluate bullet points quality
    const allBulletPoints = data.experience.flatMap(exp => exp.bulletPoints || []);
    const validBullets = allBulletPoints.filter(b => b && b.trim().length > 0);
    
    if (validBullets.length > 0) {
      const bulletQuality = evaluateMultipleTexts(validBullets);
      
      // Quality score (0-15 points based on action verbs, metrics, etc.)
      experienceScore += Math.min(15, (bulletQuality.totalScore / 25) * 15);
      
      // Bonus for sufficient bullet points
      if (validBullets.length >= 5) experienceScore += 5;
      else if (validBullets.length >= 3) experienceScore += 3;
      else feedback.push('Add more bullet points to your experience (aim for 3-5 per role)');
    } else {
      feedback.push('Add bullet points describing your responsibilities and achievements');
    }
    
    breakdown.experience = Math.round(experienceScore);
  } else {
    feedback.push('Add work experience entries');
    breakdown.experience = 0;
  }

  // 4. EDUCATION (0-15 points)
  if (data.education && data.education.length > 0) {
    let educationScore = 0;
    
    const validEducation = data.education.filter(edu =>
      edu.university && edu.degree && edu.field
    );
    
    if (validEducation.length >= 1) {
      educationScore += 10; // Base points
      
      // Bonus for complete information
      const hasCompleteDates = validEducation.some(edu => edu.startDate && edu.endDate);
      if (hasCompleteDates) educationScore += 3;
      
      const hasLocation = validEducation.some(edu => edu.city);
      if (hasLocation) educationScore += 2;
    } else {
      feedback.push('Complete your education information (university, degree, field)');
    }
    
    breakdown.education = educationScore;
  } else {
    feedback.push('Add education information');
    breakdown.education = 0;
  }

  // 5. SKILLS (0-10 points)
  if (data.skills && data.skills.length > 0) {
    let skillsScore = 0;
    
    if (data.skills.length >= 8) skillsScore = 10;
    else if (data.skills.length >= 5) skillsScore = 8;
    else if (data.skills.length >= 3) skillsScore = 6;
    else {
      skillsScore = 3;
      feedback.push('Add more skills (aim for at least 5-8 relevant skills)');
    }
    
    breakdown.skills = skillsScore;
  } else {
    feedback.push('Add your technical and professional skills');
    breakdown.skills = 0;
  }

  // 6. PROJECTS (0-10 points)
  if (data.projects && data.projects.length > 0) {
    let projectsScore = 0;
    
    const validProjects = data.projects.filter(proj =>
      proj.name && proj.technologies && proj.description
    );
    
    if (validProjects.length >= 2) projectsScore = 10;
    else if (validProjects.length === 1) projectsScore = 7;
    
    // Bonus for including links
    const hasLinks = validProjects.some(proj => proj.link && proj.link.length > 0);
    if (hasLinks && projectsScore < 10) projectsScore += 1;
    
    breakdown.projects = Math.min(10, projectsScore);
  } else {
    feedback.push('Consider adding relevant projects');
    breakdown.projects = 0;
  }

  // 7. FORMATTING & STRUCTURE (0-10 points)
  let formattingScore = 10; // Start with perfect, deduct for issues
  
  // Check for overly long text (ATS may truncate)
  if (data.summary && data.summary.length > 600) {
    formattingScore -= 2;
    feedback.push('Summary is too long (may be truncated by ATS)');
  }
  
  // Check for reasonable section balance
  const totalSections = [
    data.summary ? 1 : 0,
    data.experience.length > 0 ? 1 : 0,
    data.education.length > 0 ? 1 : 0,
    data.skills.length > 0 ? 1 : 0,
    data.projects.length > 0 ? 1 : 0,
  ].reduce((a, b) => a + b, 0);
  
  if (totalSections < 3) {
    formattingScore -= 3;
    feedback.push('Add more sections for a complete resume');
  }
  
  breakdown.formatting = formattingScore;

  // CALCULATE TOTAL SCORE
  const totalScore = Math.min(100, 
    breakdown.contactInfo +
    breakdown.summary +
    breakdown.experience +
    breakdown.education +
    breakdown.skills +
    breakdown.projects +
    breakdown.formatting
  );

  // DETERMINE GRADE
  let grade = 'F';
  if (totalScore >= 95) grade = 'A+';
  else if (totalScore >= 90) grade = 'A';
  else if (totalScore >= 85) grade = 'B+';
  else if (totalScore >= 80) grade = 'B';
  else if (totalScore >= 70) grade = 'C';
  else if (totalScore >= 60) grade = 'D';

  // Add positive feedback for good scores
  if (totalScore >= 90) {
    feedback.unshift('Excellent! Your resume is well-optimized for ATS systems.');
  } else if (totalScore >= 75) {
    feedback.unshift('Good resume! Minor improvements will make it even better.');
  } else if (totalScore >= 60) {
    feedback.unshift('Fair resume. Follow the suggestions below to improve.');
  } else {
    feedback.unshift('Your resume needs improvement. Focus on the key areas below.');
  }

  return {
    totalScore: Math.round(totalScore),
    breakdown,
    feedback,
    grade,
  };
};

/**
 * Get color class based on score
 */
export const getScoreColor = (score: number): string => {
  if (score >= 90) return 'text-green-600';
  if (score >= 75) return 'text-blue-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

/**
 * Get background color class based on score
 */
export const getScoreBgColor = (score: number): string => {
  if (score >= 90) return 'bg-green-100';
  if (score >= 75) return 'bg-blue-100';
  if (score >= 60) return 'bg-yellow-100';
  return 'bg-red-100';
};
