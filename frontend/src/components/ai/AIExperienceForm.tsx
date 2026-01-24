import React, { useState } from 'react';
import { Briefcase, Plus, Trash2, Calendar, List, MapPin, Sparkles, Loader2 } from 'lucide-react';
import type { Experience } from '../../types/resume';

interface AIExperienceFormProps {
  data: Experience[];
  onChange: (data: Experience[]) => void;
  jobDescription: string;
  aiMode?: boolean;
}

const AIExperienceForm: React.FC<AIExperienceFormProps> = ({ 
  data, 
  onChange, 
  jobDescription,
  aiMode = true 
}) => {
  // State for AI suggestions per experience
  const [loadingBullets, setLoadingBullets] = useState<Record<string, boolean>>({});
  const [suggestedBullets, setSuggestedBullets] = useState<Record<string, string[]>>({});
  const [showSuggestions, setShowSuggestions] = useState<Record<string, boolean>>({});

  const addExperience = () => {
    const newExperience: Experience = {
      id: Date.now().toString(),
      company: '',
      title: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      bulletPoints: [''],
    };
    onChange([...data, newExperience]);
  };

  const removeExperience = (id: string) => {
    onChange(data.filter((exp) => exp.id !== id));
  };

  const updateExperience = (id: string, field: keyof Experience, value: string | boolean) => {
    onChange(
      data.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    );
  };

  const addBulletPoint = (id: string) => {
    onChange(
      data.map((exp) =>
        exp.id === id
          ? { ...exp, bulletPoints: [...exp.bulletPoints, ''] }
          : exp
      )
    );
  };

  const removeBulletPoint = (id: string, index: number) => {
    onChange(
      data.map((exp) =>
        exp.id === id
          ? { ...exp, bulletPoints: exp.bulletPoints.filter((_, i) => i !== index) }
          : exp
      )
    );
  };

  const updateBulletPoint = (id: string, index: number, value: string) => {
    onChange(
      data.map((exp) =>
        exp.id === id
          ? {
              ...exp,
              bulletPoints: exp.bulletPoints.map((bp, i) => (i === index ? value : bp)),
            }
          : exp
      )
    );
  };

  // Generate AI bullet points for an experience
  const generateBullets = async (exp: Experience) => {
    if (!exp.title) {
      alert('Please enter a job title first');
      return;
    }
    
    setLoadingBullets(prev => ({ ...prev, [exp.id]: true }));
    try {
      const response = await fetch('http://localhost:5000/api/ai/generate-bullets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          jobDescription,
          jobTitle: exp.title,
          company: exp.company,
          existingBullets: exp.bulletPoints.filter(b => b.trim())
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate bullets');
      }
      
      setSuggestedBullets(prev => ({ ...prev, [exp.id]: result.data }));
      setShowSuggestions(prev => ({ ...prev, [exp.id]: true }));
    } catch (error) {
      console.error('Failed to generate bullets:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate bullet points');
    } finally {
      setLoadingBullets(prev => ({ ...prev, [exp.id]: false }));
    }
  };

  // Add a suggested bullet point to the experience
  const addSuggestedBullet = (expId: string, bullet: string) => {
    onChange(
      data.map((exp) =>
        exp.id === expId
          ? { ...exp, bulletPoints: [...exp.bulletPoints.filter(b => b.trim()), bullet] }
          : exp
      )
    );
    // Remove used bullet from suggestions
    setSuggestedBullets(prev => ({
      ...prev,
      [expId]: prev[expId]?.filter(b => b !== bullet) || []
    }));
  };

  // Dismiss suggestions for an experience
  const dismissSuggestions = (expId: string) => {
    setShowSuggestions(prev => ({ ...prev, [expId]: false }));
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-luna-500 flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-luna-200" />
          Work Experience
          {aiMode && (
            <span className="ml-2 px-2 py-0.5 bg-luna-100 text-luna-300 text-xs font-medium rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI-Powered
            </span>
          )}
        </h3>
        <button
          onClick={addExperience}
          className="btn-secondary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Experience
        </button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No work experience added yet</p>
          <button onClick={addExperience} className="btn-primary flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" />
            Add Your First Experience
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {data.map((exp, index) => (
            <div
              key={exp.id}
              className="border border-gray-200 rounded-lg p-6 space-y-4 bg-gray-50 hover:shadow-luna transition-shadow"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-luna-500">Experience #{index + 1}</h4>
                <button
                  onClick={() => removeExperience(exp.id)}
                  className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove this experience"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Company */}
                <div className="md:col-span-2">
                  <label htmlFor={`company-${exp.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                    Company <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`company-${exp.id}`}
                    type="text"
                    value={exp.company}
                    onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                    className="input-field"
                    placeholder="e.g., Google Inc."
                  />
                </div>

                {/* Job Title */}
                <div className="md:col-span-2">
                  <label htmlFor={`title-${exp.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`title-${exp.id}`}
                    type="text"
                    value={exp.title}
                    onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                    className="input-field"
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>

                {/* Location */}
                <div className="md:col-span-2">
                  <label htmlFor={`location-${exp.id}`} className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-luna-200" />
                    Location <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <input
                    id={`location-${exp.id}`}
                    type="text"
                    value={exp.location || ''}
                    onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                    className="input-field"
                    placeholder="e.g., Karachi, Pakistan"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label htmlFor={`startDate-${exp.id}`} className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-luna-200" />
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`startDate-${exp.id}`}
                    type="month"
                    value={exp.startDate}
                    onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                    className="input-field"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label htmlFor={`endDate-${exp.id}`} className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-luna-200" />
                    End Date
                  </label>
                  <input
                    id={`endDate-${exp.id}`}
                    type="month"
                    value={exp.endDate}
                    onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                    className="input-field"
                    disabled={exp.current}
                  />
                </div>

                {/* Currently Working Checkbox */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exp.current}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        const updatedExp = {
                          ...exp,
                          current: isChecked,
                          endDate: isChecked ? '' : exp.endDate,
                        };
                        onChange(
                          data.map((item) => (item.id === exp.id ? updatedExp : item))
                        );
                      }}
                      className="w-4 h-4 text-luna-200 border-gray-300 rounded focus:ring-luna-200 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-700">I currently work here</span>
                  </label>
                </div>

                {/* AI Generate Bullets Button */}
                {aiMode && (
                  <div className="md:col-span-2">
                    <button
                      onClick={() => generateBullets(exp)}
                      disabled={loadingBullets[exp.id] || !exp.title}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        loadingBullets[exp.id] || !exp.title
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-luna-200 text-white hover:bg-luna-300 shadow-sm'
                      }`}
                    >
                      {loadingBullets[exp.id] ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate AI Bullets
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* AI Suggested Bullets */}
                {aiMode && showSuggestions[exp.id] && suggestedBullets[exp.id]?.length > 0 && (
                  <div className="md:col-span-2 bg-gradient-to-r from-luna-50 to-white border-2 border-luna-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-luna-400 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        AI Suggested Bullets
                      </span>
                      <button
                        onClick={() => dismissSuggestions(exp.id)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Dismiss
                      </button>
                    </div>
                    <div className="space-y-2">
                      {suggestedBullets[exp.id].map((bullet, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 bg-white rounded-lg border border-luna-100">
                          <p className="flex-1 text-sm text-gray-700">{bullet}</p>
                          <button
                            onClick={() => addSuggestedBullet(exp.id, bullet)}
                            className="px-3 py-1 bg-luna-200 text-white text-xs font-medium rounded-lg hover:bg-luna-300 transition-colors"
                          >
                            Use
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bullet Points */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <List className="w-4 h-4 text-luna-200" />
                    Description <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    {exp.bulletPoints.map((bullet, bulletIndex) => (
                      <div key={bulletIndex} className="flex gap-2">
                        <span className="text-luna-300 mt-3 font-bold">•</span>
                        <input
                          type="text"
                          value={bullet}
                          onChange={(e) => updateBulletPoint(exp.id, bulletIndex, e.target.value)}
                          className="input-field flex-1"
                          placeholder="e.g., Led team of 5 engineers to deliver product 2 weeks ahead of schedule"
                        />
                        <button
                          onClick={() => removeBulletPoint(exp.id, bulletIndex)}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove bullet point"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addBulletPoint(exp.id)}
                      className="text-luna-300 hover:text-luna-500 text-sm font-medium flex items-center gap-1 mt-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Bullet Point
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-luna-50 border border-luna-100 rounded-lg p-4 mt-6">
        <h4 className="font-semibold text-luna-500 text-sm mb-2">💡 Experience Tips:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Use action verbs: Led, Developed, Implemented, Increased</li>
          <li>• Quantify achievements: "Increased sales by 30%"</li>
          <li>• Focus on impact and results, not just duties</li>
          <li>• List experiences in reverse chronological order</li>
          <li>• Use AI suggestions as a starting point, then customize</li>
        </ul>
      </div>
    </div>
  );
};

export default AIExperienceForm;
