import { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import JobDescriptionInput from '../components/ai/JobDescriptionInput';
import KeywordDisplay from '../components/ai/KeywordDisplay';

// Types for extracted keywords
export interface ExtractedKeywords {
  skills: string[];
  responsibilities: string[];
  qualifications: string[];
  actionVerbs: string[];
  keywords: string[];
}

// Steps for AI Builder flow
type AIBuilderStep = 'input' | 'keywords' | 'builder';

const AIBuilder = () => {
  const navigate = useNavigate();
  
  // Current step in the AI flow
  const [currentStep, setCurrentStep] = useState<AIBuilderStep>('input');
  
  // Job description text
  const [jobDescription, setJobDescription] = useState<string>(() => {
    const saved = localStorage.getItem('ai_jobDescription');
    return saved ? JSON.parse(saved) : '';
  });
  
  // Extracted keywords from JD
  const [extractedKeywords, setExtractedKeywords] = useState<ExtractedKeywords | null>(() => {
    const saved = localStorage.getItem('ai_extractedKeywords');
    return saved ? JSON.parse(saved) : null;
  });
  
  // Loading state for AI extraction
  const [isExtracting, setIsExtracting] = useState(false);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('ai_jobDescription', JSON.stringify(jobDescription));
  }, [jobDescription]);

  useEffect(() => {
    if (extractedKeywords) {
      localStorage.setItem('ai_extractedKeywords', JSON.stringify(extractedKeywords));
    }
  }, [extractedKeywords]);

  // Handle keyword extraction
  const handleExtractKeywords = async () => {
    if (!jobDescription.trim()) return;
    
    setIsExtracting(true);
    try {
      // Call backend API for AI extraction
      const response = await fetch('http://localhost:5000/api/ai/extract-keywords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobDescription }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to extract keywords');
      }
      
      setExtractedKeywords(result.data);
      setCurrentStep('keywords');
    } catch (error) {
      console.error('Failed to extract keywords:', error);
      alert(error instanceof Error ? error.message : 'Failed to extract keywords. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  // Handle continue to builder
  const handleContinueToBuilder = () => {
    setCurrentStep('builder');
  };

  // Handle back button
  const handleBack = () => {
    if (currentStep === 'keywords') {
      setCurrentStep('input');
    } else if (currentStep === 'builder') {
      setCurrentStep('keywords');
    } else {
      navigate('/');
    }
  };

  // Handle re-extract (go back to input)
  const handleReExtract = () => {
    setCurrentStep('input');
  };

  return (
    <div className="min-h-screen bg-luna-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-luna-50 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-luna-200" />
                <h1 className="text-xl font-bold text-luna-500">AI-Assisted Resume Builder</h1>
              </div>
            </div>
            
            {/* Step indicator */}
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentStep === 'input' ? 'bg-luna-200 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                1. Job Description
              </span>
              <span className="text-gray-300">→</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentStep === 'keywords' ? 'bg-luna-200 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                2. Keywords
              </span>
              <span className="text-gray-300">→</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentStep === 'builder' ? 'bg-luna-200 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                3. Build Resume
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-8">
        {/* Step 1: Job Description Input */}
        {currentStep === 'input' && (
          <JobDescriptionInput
            value={jobDescription}
            onChange={setJobDescription}
            onExtract={handleExtractKeywords}
            isLoading={isExtracting}
          />
        )}

        {/* Step 2: Keyword Display */}
        {currentStep === 'keywords' && extractedKeywords && (
          <KeywordDisplay
            keywords={extractedKeywords}
            onContinue={handleContinueToBuilder}
            onReExtract={handleReExtract}
          />
        )}

        {/* Step 3: Builder (will be implemented in later phases) */}
        {currentStep === 'builder' && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <Sparkles className="w-16 h-16 text-luna-200 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-luna-500 mb-2">Resume Builder</h2>
            <p className="text-gray-600 mb-4">
              The AI-powered form builder will be implemented in Phase 3.
            </p>
            <p className="text-sm text-gray-500">
              Keywords extracted: {extractedKeywords?.skills.length || 0} skills, 
              {' '}{extractedKeywords?.actionVerbs.length || 0} action verbs
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AIBuilder;
