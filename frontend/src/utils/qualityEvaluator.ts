/**
 * Keyword Quality Evaluator
 * Rule-based system to evaluate resume content quality
 * Scores based on: Action Verbs, Metrics, Technical Depth, Professional Tone
 */

// Strong action verbs that demonstrate impact
const ACTION_VERBS = [
  // Leadership & Management
  'led', 'managed', 'directed', 'coordinated', 'supervised', 'mentored', 'coached', 'guided',
  'oversaw', 'facilitated', 'orchestrated', 'spearheaded', 'championed',
  
  // Achievement & Results
  'achieved', 'accomplished', 'delivered', 'exceeded', 'surpassed', 'attained', 'completed',
  'won', 'earned', 'secured', 'obtained',
  
  // Improvement & Optimization
  'improved', 'enhanced', 'optimized', 'streamlined', 'increased', 'boosted', 'maximized',
  'reduced', 'decreased', 'minimized', 'eliminated', 'resolved', 'refined',
  
  // Creation & Development
  'developed', 'created', 'designed', 'built', 'engineered', 'established', 'implemented',
  'launched', 'initiated', 'introduced', 'founded', 'formulated', 'constructed', 'architected',
  
  // Analysis & Strategy
  'analyzed', 'evaluated', 'assessed', 'investigated', 'researched', 'identified', 'diagnosed',
  'strategized', 'planned', 'forecasted', 'projected',
  
  // Collaboration & Communication
  'collaborated', 'partnered', 'presented', 'communicated', 'negotiated', 'liaised',
  'interfaced', 'consulted', 'advised',
  
  // Technical & Execution
  'automated', 'integrated', 'deployed', 'migrated', 'configured', 'programmed', 'coded',
  'debugged', 'tested', 'validated', 'documented', 'executed', 'performed'
];

// Patterns that indicate metrics/quantifiable achievements
const METRIC_PATTERNS = [
  /\d+%/g,                    // Percentages: 25%, 100%
  /\d+x/gi,                   // Multipliers: 2x, 10x
  /\$\d+/g,                   // Money: $100, $1M
  /\d+\+/g,                   // Plus: 50+, 100+
  /\d+\s*(million|thousand|billion|k|m|b)/gi, // Large numbers
  /\d+\s*(users|customers|clients|people|employees|members)/gi,
  /\d+\s*(hours|days|weeks|months|years)/gi,
  /\d+\s*(projects|tasks|features|bugs|issues)/gi,
];

// Technical terms that indicate depth (language-agnostic)
const TECHNICAL_INDICATORS = [
  // Architectures & Patterns
  'architecture', 'microservices', 'api', 'rest', 'graphql', 'websocket',
  'mvc', 'mvvm', 'design pattern', 'solid', 'scalable', 'distributed',
  
  // Development Practices
  'ci/cd', 'devops', 'agile', 'scrum', 'git', 'testing', 'unit test',
  'integration test', 'deployment', 'docker', 'kubernetes', 'cloud',
  
  // Performance & Quality
  'optimization', 'performance', 'security', 'authentication', 'authorization',
  'encryption', 'caching', 'database', 'query', 'algorithm', 'data structure',
  
  // Common frameworks/tools (broad categories)
  'framework', 'library', 'sdk', 'platform', 'system', 'infrastructure',
  'pipeline', 'workflow', 'automation', 'monitoring', 'logging'
];

export interface QualityScore {
  actionVerbsScore: number;      // 0-8 points
  metricsScore: number;          // 0-8 points
  technicalDepthScore: number;   // 0-6 points
  professionalToneScore: number; // 0-3 points
  totalScore: number;            // 0-25 points
  details: {
    actionVerbsFound: number;
    metricsFound: number;
    technicalTermsFound: number;
    hasGenericPhrases: boolean;
  };
}

/**
 * Evaluates text content for quality indicators
 */
export const evaluateContentQuality = (text: string): QualityScore => {
  if (!text || text.trim().length === 0) {
    return {
      actionVerbsScore: 0,
      metricsScore: 0,
      technicalDepthScore: 0,
      professionalToneScore: 0,
      totalScore: 0,
      details: {
        actionVerbsFound: 0,
        metricsFound: 0,
        technicalTermsFound: 0,
        hasGenericPhrases: false,
      },
    };
  }

  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);

  // 1. ACTION VERBS SCORE (0-8 points)
  const actionVerbsFound = ACTION_VERBS.filter(verb => 
    words.includes(verb) || words.includes(verb + 'ed') || words.includes(verb + 'ing')
  ).length;
  
  let actionVerbsScore = 0;
  if (actionVerbsFound >= 5) actionVerbsScore = 8;
  else if (actionVerbsFound >= 3) actionVerbsScore = 6;
  else if (actionVerbsFound >= 2) actionVerbsScore = 4;
  else if (actionVerbsFound >= 1) actionVerbsScore = 2;

  // 2. METRICS SCORE (0-8 points)
  let metricsFound = 0;
  METRIC_PATTERNS.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) metricsFound += matches.length;
  });

  let metricsScore = 0;
  if (metricsFound >= 5) metricsScore = 8;
  else if (metricsFound >= 3) metricsScore = 6;
  else if (metricsFound >= 2) metricsScore = 4;
  else if (metricsFound >= 1) metricsScore = 2;

  // 3. TECHNICAL DEPTH SCORE (0-6 points)
  const technicalTermsFound = TECHNICAL_INDICATORS.filter(term => 
    lowerText.includes(term)
  ).length;

  let technicalDepthScore = 0;
  if (technicalTermsFound >= 5) technicalDepthScore = 6;
  else if (technicalTermsFound >= 3) technicalDepthScore = 4;
  else if (technicalTermsFound >= 1) technicalDepthScore = 2;

  // 4. PROFESSIONAL TONE SCORE (0-3 points)
  // Deduct points for generic/weak phrases
  const genericPhrases = [
    'hard worker', 'team player', 'fast learner', 'detail oriented',
    'self-motivated', 'responsible for', 'assisted with', 'helped with'
  ];
  
  const hasGenericPhrases = genericPhrases.some(phrase => lowerText.includes(phrase));
  const professionalToneScore = hasGenericPhrases ? 0 : 3;

  // TOTAL SCORE
  const totalScore = actionVerbsScore + metricsScore + technicalDepthScore + professionalToneScore;

  return {
    actionVerbsScore,
    metricsScore,
    technicalDepthScore,
    professionalToneScore,
    totalScore,
    details: {
      actionVerbsFound,
      metricsFound,
      technicalTermsFound,
      hasGenericPhrases,
    },
  };
};

/**
 * Evaluates multiple text sections (e.g., all experience bullet points)
 */
export const evaluateMultipleTexts = (texts: string[]): QualityScore => {
  const combinedText = texts.filter(t => t && t.trim()).join(' ');
  return evaluateContentQuality(combinedText);
};

/**
 * Get feedback message based on score
 */
export const getQualityFeedback = (score: number): string => {
  if (score >= 20) return 'Excellent! Strong action verbs and quantifiable achievements.';
  if (score >= 15) return 'Good! Consider adding more metrics and specific achievements.';
  if (score >= 10) return 'Fair. Add more action verbs and quantify your impact.';
  if (score >= 5) return 'Needs improvement. Focus on action verbs and measurable results.';
  return 'Weak content. Use strong action verbs and include specific metrics.';
};
