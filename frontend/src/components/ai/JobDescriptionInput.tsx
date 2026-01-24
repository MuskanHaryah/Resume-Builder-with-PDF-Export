import React from 'react';
import { FileText, Sparkles, Loader2, Lightbulb } from 'lucide-react';

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  onExtract: () => void;
  isLoading: boolean;
}

const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({
  value,
  onChange,
  onExtract,
  isLoading
}) => {
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onChange(text);
    } catch (error) {
      console.error('Failed to read clipboard:', error);
    }
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-luna-100 rounded-xl flex items-center justify-center">
            <FileText className="w-7 h-7 text-luna-300" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-luna-500">Paste Your Job Description</h2>
            <p className="text-gray-600">Our AI will extract key information to tailor your resume</p>
          </div>
        </div>

        {/* Textarea */}
        <div className="relative">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste the job description here... (e.g., from LinkedIn, Indeed, company website)"
            className="w-full h-64 p-4 border-2 border-gray-200 rounded-xl resize-none focus:border-luna-200 focus:ring-2 focus:ring-luna-100 transition-all text-gray-700 placeholder-gray-400"
          />
          
          {/* Character count */}
          <div className="absolute bottom-3 right-3 text-sm text-gray-400">
            {value.length} characters
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePaste}
              className="px-4 py-2 text-sm font-medium text-luna-300 bg-luna-50 rounded-lg hover:bg-luna-100 transition-colors"
            >
              📋 Paste from Clipboard
            </button>
            {value && (
              <button
                onClick={handleClear}
                className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          <button
            onClick={onExtract}
            disabled={!value.trim() || isLoading}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              value.trim() && !isLoading
                ? 'bg-luna-200 text-white hover:bg-luna-300 shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Extracting...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Extract Keywords
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tips Card */}
      <div className="bg-gradient-to-r from-luna-50 to-white rounded-xl border border-luna-100 p-6">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-luna-500 mb-2">Tips for Best Results</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Include the complete job description with requirements and responsibilities</li>
              <li>• Copy directly from the job posting for accuracy</li>
              <li>• Include technical skills, soft skills, and qualifications sections</li>
              <li>• The more details, the better our AI can tailor your resume</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDescriptionInput;
