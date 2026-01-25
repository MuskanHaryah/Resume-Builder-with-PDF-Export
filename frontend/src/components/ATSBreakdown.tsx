import React, { useEffect } from 'react';
import type { ATSScore } from '../types/resume';
import { CheckCircle2, AlertCircle, TrendingUp, X } from 'lucide-react';

interface ATSBreakdownProps {
  atsScore: ATSScore;
  isOpen: boolean;
  onClose: () => void;
}

const ATSBreakdown: React.FC<ATSBreakdownProps> = ({ atsScore, isOpen, onClose }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const { totalScore, breakdown, feedback, grade } = atsScore;

  // Determine overall color based on score
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-50 border-green-200';
    if (score >= 75) return 'bg-blue-50 border-blue-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getBarColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const sections = [
    { name: 'Contact Info', score: breakdown.contactInfo, max: 10 },
    { name: 'Summary', score: breakdown.summary, max: 15 },
    { name: 'Experience', score: breakdown.experience, max: 30 },
    { name: 'Education', score: breakdown.education, max: 15 },
    { name: 'Skills', score: breakdown.skills, max: 10 },
    { name: 'Projects', score: breakdown.projects, max: 10 },
    { name: 'Formatting', score: breakdown.formatting, max: 10 },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto">
        {/* Header with close button */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900">ATS Score Analysis</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
      {/* Overall Score */}
      <div className={`rounded-lg p-6 border-2 ${getScoreBgColor(totalScore)}`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">ATS Optimization Score</h3>
          <span className={`text-3xl font-bold ${getScoreColor(totalScore)}`}>
            {totalScore}/100
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Grade: <span className="font-semibold">{grade}</span></span>
          <div className="flex items-center gap-2">
            {totalScore >= 75 ? (
              <CheckCircle2 className={`w-5 h-5 ${getScoreColor(totalScore)}`} />
            ) : (
              <AlertCircle className={`w-5 h-5 ${getScoreColor(totalScore)}`} />
            )}
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Score Breakdown
        </h4>
        <div className="space-y-3">
          {sections.map((section) => (
            <div key={section.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{section.name}</span>
                <span className="text-sm font-semibold text-gray-900">
                  {section.score}/{section.max}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getBarColor(section.score, section.max)}`}
                  style={{ width: `${(section.score / section.max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback & Suggestions */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-3">
          {totalScore >= 90 ? '✨ Excellent!' : totalScore >= 75 ? '💡 Suggestions' : '🎯 Improvements Needed'}
        </h4>
        <div className="space-y-2">
          {feedback.map((item: string, index: number) => (
            <div
              key={index}
              className={`flex items-start gap-2 p-3 rounded-lg ${
                index === 0 && totalScore >= 75 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              {index === 0 && totalScore >= 75 ? (
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              )}
              <p className="text-sm text-gray-700">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tips for reaching 90+ */}
      {totalScore < 90 && totalScore > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-indigo-900 mb-2">
            🎯 How to reach 90-100 (Grade A):
          </h4>
          <ul className="text-sm text-indigo-800 space-y-1 list-disc list-inside">
            {breakdown.contactInfo < 10 && (
              <li>Complete all contact information (name, email, phone, LinkedIn, GitHub)</li>
            )}
            {breakdown.summary < 13 && (
              <li>Write a strong professional summary (30-100 words with action verbs and metrics)</li>
            )}
            {breakdown.experience < 25 && (
              <li>Add 2+ work experiences with 3-5 bullet points each, including metrics and achievements</li>
            )}
            {breakdown.education < 13 && (
              <li>Include complete education details (university, degree, field, dates, location)</li>
            )}
            {breakdown.skills < 8 && (
              <li>List at least 8 relevant technical and professional skills</li>
            )}
            {breakdown.projects < 8 && (
              <li>Add 2+ projects with descriptions, technologies, and links</li>
            )}
            {breakdown.formatting < 8 && (
              <li>Complete all major sections (summary, experience, education, skills, projects)</li>
            )}
          </ul>
        </div>
      )}

      {/* Tips for perfecting a high score (90+) */}
      {totalScore >= 90 && totalScore < 100 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-indigo-900 mb-2">
            🎯 How to reach 100 (Perfect Score):
          </h4>
          <ul className="text-sm text-indigo-800 space-y-1 list-disc list-inside">
            {breakdown.contactInfo < 10 && (
              <li>Complete all contact information (name, email, phone, LinkedIn, GitHub)</li>
            )}
            {breakdown.summary < 15 && (
              <li>Enhance your professional summary with stronger action verbs and quantifiable metrics</li>
            )}
            {breakdown.experience < 30 && (
              <li>Add more detailed achievements with measurable results to your work experience</li>
            )}
            {breakdown.education < 15 && (
              <li>Add complete education details including dates and location</li>
            )}
            {breakdown.skills < 10 && (
              <li>List at least 8 relevant technical and professional skills</li>
            )}
            {breakdown.projects < 10 && (
              <li>Add more projects with detailed descriptions, technologies, and live/GitHub links</li>
            )}
            {breakdown.formatting < 10 && (
              <li>Ensure all sections are complete with well-formatted content</li>
            )}
          </ul>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default ATSBreakdown;
