import { Tag, Plus, X } from 'lucide-react';
import { useState } from 'react';

interface SkillsFormProps {
  data: string[];
  onChange: (data: string[]) => void;
}

const SkillsForm = ({ data, onChange }: SkillsFormProps) => {
  const [inputValue, setInputValue] = useState('');

  const addSkill = () => {
    const trimmedSkill = inputValue.trim();
    if (trimmedSkill && !data.includes(trimmedSkill)) {
      onChange([...data, trimmedSkill]);
      setInputValue('');
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

  return (
    <div className="card">
      <h3 className="text-xl font-bold text-luna-500 mb-6 flex items-center gap-2">
        <Tag className="w-6 h-6 text-luna-200" />
        Skills
      </h3>

      <div className="space-y-4">
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
            <p className="text-xs text-gray-400 mt-2">Start typing and press Enter to add skills</p>
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
                  className="badge-primary flex items-center gap-2 group"
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
          <li>• Include both technical and soft skills</li>
          <li>• List programming languages, frameworks, and tools</li>
          <li>• Add certifications or specialized knowledge</li>
          <li>• Be honest - only include skills you can demonstrate</li>
          <li>• Organize by category: Languages, Frameworks, Tools, Soft Skills</li>
        </ul>
      </div>
    </div>
  );
};

export default SkillsForm;
