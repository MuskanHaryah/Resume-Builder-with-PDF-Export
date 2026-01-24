import React, { useState, useEffect } from 'react';
import { Tag, Plus, X, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';

interface AISkillsFormProps {
  data: string[];
  onChange: (data: string[]) => void;
  jobDescription: string;
  extractedKeywords?: {
    skills: string[];
    keywords: string[];
  };
  aiMode?: boolean;
}

interface SuggestedSkill {
  skill: string;
  match: 'high' | 'medium' | 'low';
  fromJD: boolean;
}

const AISkillsForm: React.FC<AISkillsFormProps> = ({ 
  data, 
  onChange, 
  jobDescription,
  extractedKeywords,
  aiMode = true 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestedSkills, setSuggestedSkills] = useState<SuggestedSkill[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Auto-populate suggestions from extracted keywords when available
  useEffect(() => {
    if (extractedKeywords && aiMode) {
      const jdSkills: SuggestedSkill[] = [
        ...extractedKeywords.skills.map(skill => ({
          skill,
          match: 'high' as const,
          fromJD: true
        })),
        ...extractedKeywords.keywords
          .filter(kw => !extractedKeywords.skills.includes(kw))
          .slice(0, 10)
          .map(kw => ({
            skill: kw,
            match: 'medium' as const,
            fromJD: true
          }))
      ];
      // Filter out already added skills
      const filtered = jdSkills.filter(s => !data.includes(s.skill));
      if (filtered.length > 0) {
        setSuggestedSkills(filtered);
        setShowSuggestions(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extractedKeywords, aiMode]);

  const addSkill = () => {
    const trimmedSkill = inputValue.trim();
    if (trimmedSkill && !data.includes(trimmedSkill)) {
      onChange([...data, trimmedSkill]);
      setInputValue('');
      // Remove from suggestions if present
      setSuggestedSkills(prev => prev.filter(s => s.skill.toLowerCase() !== trimmedSkill.toLowerCase()));
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onChange(data.filter((skill) => skill !== skillToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  // Generate AI skill suggestions
  const generateSkillSuggestions = async () => {
    if (!jobDescription) {
      alert('Please paste a job description first');
      return;
    }
    
    setLoadingSuggestions(true);
    try {
      const response = await fetch('http://localhost:5000/api/ai/suggest-skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          jobDescription,
          existingSkills: data
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to suggest skills');
      }
      
      // Map API response to our format
      const suggestions: SuggestedSkill[] = result.data.map((skill: string) => ({
        skill,
        match: extractedKeywords?.skills.includes(skill) ? 'high' : 'medium',
        fromJD: false
      }));
      
      // Filter out already added skills
      const filtered = suggestions.filter(s => !data.includes(s.skill));
      setSuggestedSkills(filtered);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Failed to suggest skills:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate skill suggestions');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Add a suggested skill
  const addSuggestedSkill = (skill: string) => {
    if (!data.includes(skill)) {
      onChange([...data, skill]);
      setSuggestedSkills(prev => prev.filter(s => s.skill !== skill));
    }
  };

  // Add all suggested skills
  const addAllSuggested = () => {
    const newSkills = suggestedSkills.map(s => s.skill).filter(s => !data.includes(s));
    onChange([...data, ...newSkills]);
    setSuggestedSkills([]);
    setShowSuggestions(false);
  };

  // Get match color
  const getMatchColor = (match: 'high' | 'medium' | 'low') => {
    switch (match) {
      case 'high':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-luna-500 flex items-center gap-2">
          <Tag className="w-6 h-6 text-luna-200" />
          Skills
          {aiMode && (
            <span className="ml-2 px-2 py-0.5 bg-luna-100 text-luna-300 text-xs font-medium rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI-Powered
            </span>
          )}
        </h3>
        {aiMode && (
          <button
            onClick={generateSkillSuggestions}
            disabled={loadingSuggestions}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              loadingSuggestions
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-luna-200 text-white hover:bg-luna-300 shadow-sm'
            }`}
          >
            {loadingSuggestions ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Get AI Suggestions
              </>
            )}
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* AI Suggested Skills from JD */}
        {aiMode && showSuggestions && suggestedSkills.length > 0 && (
          <div className="bg-gradient-to-r from-luna-50 to-white border-2 border-luna-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-luna-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Suggested Skills from Job Description
              </span>
              <div className="flex gap-2">
                <button
                  onClick={addAllSuggested}
                  className="px-3 py-1 bg-luna-200 text-white text-xs font-medium rounded-lg hover:bg-luna-300 transition-colors flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Add All
                </button>
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Dismiss
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedSkills.map((item, i) => (
                <button
                  key={i}
                  onClick={() => addSuggestedSkill(item.skill)}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all hover:scale-105 flex items-center gap-1 ${getMatchColor(item.match)}`}
                >
                  <Plus className="w-3 h-3" />
                  {item.skill}
                  {item.match === 'high' && (
                    <span className="ml-1 text-xs opacity-75">★</span>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                High match
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                Medium match
              </span>
            </p>
          </div>
        )}

        {/* Input Field */}
        <div>
          <label htmlFor="skill-input" className="block text-sm font-medium text-gray-700 mb-2">
            Add Skills <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              id="skill-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="input-field flex-1"
              placeholder="e.g., JavaScript, Python, React..."
            />
            <button
              onClick={addSkill}
              className="btn-primary flex items-center gap-2"
              disabled={!inputValue.trim()}
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Press Enter or click Add to add a skill
          </p>
        </div>

        {/* Skills Display */}
        {data.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Tag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No skills added yet</p>
            <p className="text-xs text-gray-400 mt-2">
              {aiMode ? 'Use AI suggestions or type to add skills' : 'Start typing and press Enter to add skills'}
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">
              Your Skills ({data.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {data.map((skill, index) => (
                <div
                  key={index}
                  className="badge-primary"
                >
                  <span>{skill}</span>
                  <button
                    onClick={() => removeSkill(skill)}
                    className="hover:bg-luna-300 rounded-full p-0.5 transition-colors"
                    title={`Remove ${skill}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="bg-luna-50 border border-luna-100 rounded-lg p-4 mt-6">
        <h4 className="font-semibold text-luna-500 text-sm mb-2">💡 Skills Tips:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Include skills mentioned in the job description (marked with ★)</li>
          <li>• Add both technical and soft skills</li>
          <li>• List programming languages, frameworks, and tools</li>
          <li>• Add certifications or specialized knowledge</li>
          <li>• Be honest - only include skills you can demonstrate</li>
        </ul>
      </div>
    </div>
  );
};

export default AISkillsForm;
