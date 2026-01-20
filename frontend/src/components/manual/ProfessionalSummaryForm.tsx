import { FileText } from 'lucide-react';

interface ProfessionalSummaryFormProps {
  data: string;
  onChange: (data: string) => void;
}

const ProfessionalSummaryForm = ({ data, onChange }: ProfessionalSummaryFormProps) => {
  const maxLength = 500;
  const remainingChars = maxLength - data.length;

  return (
    <div className="card">
      <h3 className="text-xl font-bold text-luna-500 mb-6 flex items-center gap-2">
        <FileText className="w-6 h-6 text-luna-200" />
        Professional Summary
      </h3>

      <div className="space-y-4">
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
            <li>• Avoid generic phrases like "hard worker" or "team player"</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalSummaryForm;
