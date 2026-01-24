import React from 'react';
import { Sparkles, ArrowRight, RefreshCw, Code, Briefcase, GraduationCap, Zap, Tag } from 'lucide-react';
import type { ExtractedKeywords } from '../../pages/AIBuilder';

interface KeywordDisplayProps {
  keywords: ExtractedKeywords;
  onContinue: () => void;
  onReExtract: () => void;
}

const KeywordDisplay: React.FC<KeywordDisplayProps> = ({
  keywords,
  onContinue,
  onReExtract
}) => {
  // Keyword category configuration
  const categories = [
    {
      key: 'skills',
      title: 'Technical Skills',
      icon: Code,
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      chipColor: 'bg-blue-50 text-blue-700 border-blue-200',
      items: keywords.skills
    },
    {
      key: 'responsibilities',
      title: 'Key Responsibilities',
      icon: Briefcase,
      color: 'bg-green-100 text-green-700 border-green-200',
      chipColor: 'bg-green-50 text-green-700 border-green-200',
      items: keywords.responsibilities
    },
    {
      key: 'qualifications',
      title: 'Qualifications',
      icon: GraduationCap,
      color: 'bg-purple-100 text-purple-700 border-purple-200',
      chipColor: 'bg-purple-50 text-purple-700 border-purple-200',
      items: keywords.qualifications
    },
    {
      key: 'actionVerbs',
      title: 'Action Verbs',
      icon: Zap,
      color: 'bg-orange-100 text-orange-700 border-orange-200',
      chipColor: 'bg-orange-50 text-orange-700 border-orange-200',
      items: keywords.actionVerbs
    },
    {
      key: 'keywords',
      title: 'Important Keywords',
      icon: Tag,
      color: 'bg-pink-100 text-pink-700 border-pink-200',
      chipColor: 'bg-pink-50 text-pink-700 border-pink-200',
      items: keywords.keywords
    }
  ];

  // Calculate total keywords
  const totalKeywords = Object.values(keywords).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-luna-200 to-luna-300 rounded-xl shadow-lg p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Keywords Extracted Successfully!</h2>
              <p className="text-white text-opacity-90">
                Found {totalKeywords} relevant keywords to optimize your resume
              </p>
            </div>
          </div>
          <button
            onClick={onReExtract}
            className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Re-extract
          </button>
        </div>
      </div>

      {/* Keywords Grid */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {categories.map((category) => (
          <div
            key={category.key}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${category.color}`}>
                <category.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{category.title}</h3>
                <span className="text-sm text-gray-500">{category.items.length} found</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {category.items.length > 0 ? (
                category.items.map((item, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border ${category.chipColor}`}
                  >
                    {item}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-sm italic">No items found</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* How Keywords Will Be Used */}
      <div className="bg-luna-50 rounded-xl border border-luna-100 p-6 mb-6">
        <h3 className="font-semibold text-luna-500 mb-3">How we'll use these keywords:</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <span className="text-luna-200 font-bold">1.</span>
            <span><strong>Skills</strong> will auto-populate your skills section</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-luna-200 font-bold">2.</span>
            <span><strong>Action verbs</strong> will enhance your experience bullets</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-luna-200 font-bold">3.</span>
            <span><strong>Keywords</strong> will boost your ATS score</span>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="flex justify-center">
        <button
          onClick={onContinue}
          className="flex items-center gap-3 px-8 py-4 bg-luna-200 text-white rounded-xl font-semibold text-lg shadow-lg hover:bg-luna-300 hover:shadow-xl transition-all"
        >
          Continue to Resume Builder
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default KeywordDisplay;
