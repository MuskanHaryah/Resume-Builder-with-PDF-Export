import { Briefcase, Plus, Trash2, Calendar, List } from 'lucide-react';
import type { Experience } from '../../types/resume';

interface ExperienceFormProps {
  data: Experience[];
  onChange: (data: Experience[]) => void;
}

const ExperienceForm = ({ data, onChange }: ExperienceFormProps) => {
  const addExperience = () => {
    const newExperience: Experience = {
      id: Date.now().toString(),
      company: '',
      title: '',
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

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-luna-500 flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-luna-200" />
          Work Experience
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

                {/* Bullet Points */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <List className="w-4 h-4 text-luna-200" />
                    Responsibilities & Achievements <span className="text-red-500">*</span>
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
                        {exp.bulletPoints.length > 1 && (
                          <button
                            onClick={() => removeBulletPoint(exp.id, bulletIndex)}
                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove bullet point"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
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
          <li>• Keep bullet points concise (1-2 lines each)</li>
        </ul>
      </div>
    </div>
  );
};

export default ExperienceForm;
