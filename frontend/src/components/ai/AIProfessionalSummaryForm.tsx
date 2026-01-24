import React, { useState } from 'react';
import { FileText, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import AISuggestionBox from '../ai/AISuggestionBox';

interface AIProfessionalSummaryFormProps {
  data: string;
  onChange: (data: string) => void;
  jobDescription: string;
  aiMode?: boolean;
}

const AIProfessionalSummaryForm: React.FC<AIProfessionalSummaryFormProps> = ({ 
  data, 
  onChange, 
  jobDescription,
  aiMode = true
}) => {
  const maxLength = 500;
  const remainingChars = maxLength - data.length;
  
  // AI suggestion states
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Generate AI suggestions
  const generateSuggestions = async () => {
    if (!jobDescription) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/ai/generate-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          jobDescription,
          userExperience: data || '',
          skills: []
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate suggestions');
      }
      
      setSuggestions(result.data);
      setHasGenerated(true);
      setCurrentSuggestionIndex(0);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Failed to generate summary:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle using a suggestion
  const handleUseSuggestion = (text: string) => {
    onChange(text);
    setShowSuggestions(false);
  };

  // Handle discarding suggestion
  const handleDiscardSuggestion = () => {
    setShowSuggestions(false);
  };

  // Cycle through suggestions
  const handleNextSuggestion = () => {
    setCurrentSuggestionIndex((prev) => (prev + 1) % suggestions.length);
  };

  return (
    <div className="card">
      <h3 className="text-xl font-bold text-luna-500 mb-6 flex items-center gap-2">
        <FileText className="w-6 h-6 text-luna-200" />
        Professional Summary
        {aiMode && (
          <span className="ml-2 px-2 py-0.5 bg-luna-100 text-luna-300 text-xs font-medium rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            AI-Powered
          </span>
        )}
      </h3>

      <div className="space-y-4">
        {/* AI Generate Button */}
        {aiMode && (
          <div className="flex items-center gap-3">
            <button
              onClick={generateSuggestions}
              disabled={isLoading || !jobDescription}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isLoading || !jobDescription
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-luna-200 text-white hover:bg-luna-300 shadow-sm hover:shadow'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {hasGenerated ? 'Regenerate Summary' : 'Generate AI Summary'}
                </>
              )}
            </button>
            {hasGenerated && suggestions.length > 1 && showSuggestions && (
              <button
                onClick={handleNextSuggestion}
                className="flex items-center gap-1 text-sm text-luna-300 hover:text-luna-400"
              >
                <RefreshCw className="w-4 h-4" />
                Show Option {currentSuggestionIndex + 1}/{suggestions.length}
              </button>
            )}
          </div>
        )}

        {/* AI Suggestion Box */}
        {aiMode && showSuggestions && suggestions.length > 0 && (
          <AISuggestionBox
            suggestion={suggestions[currentSuggestionIndex]}
            fieldName="Professional Summary"
            onUse={handleUseSuggestion}
            onDiscard={handleDiscardSuggestion}
            isLoading={isLoading}
          />
        )}

        {/* Manual Input */}
        <div>
          <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
            Summary <span className="text-red-500">*</span>
          </label>
          <textarea
            id="summary"
            value={data}
            onChange={(e) => onChange(e.target.value)}
            maxLength={maxLength}
            rows={6}
            className="input-field resize-none"
            placeholder="Write a brief professional summary highlighting your key skills, experience, and career goals..."
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500">
              {remainingChars} characters remaining
            </p>
            <p className="text-xs text-gray-500">
              {data.split(' ').filter(word => word.length > 0).length} words
            </p>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-luna-50 border border-luna-100 rounded-lg p-4 mt-4">
          <h4 className="font-semibold text-luna-500 text-sm mb-2">💡 Tips for a Strong Summary:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Keep it concise: 3-5 sentences is ideal</li>
            <li>• Use action verbs and quantifiable achievements</li>
            <li>• Highlight your unique value proposition</li>
            <li>• Tailor it to your target role or industry</li>
            <li>• Include keywords from the job description</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AIProfessionalSummaryForm;
