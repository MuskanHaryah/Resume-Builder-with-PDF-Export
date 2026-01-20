import { GraduationCap, Plus, Trash2, Calendar, MapPin } from 'lucide-react';
import type { Education } from '../../types/resume';

interface EducationFormProps {
  data: Education[];
  onChange: (data: Education[]) => void;
}

const EducationForm = ({ data, onChange }: EducationFormProps) => {
  const addEducation = () => {
    const newEducation: Education = {
      id: Date.now().toString(),
      university: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      city: '',
    };
    onChange([...data, newEducation]);
  };

  const removeEducation = (id: string) => {
    onChange(data.filter((edu) => edu.id !== id));
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    onChange(
      data.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    );
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-luna-500 flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-luna-200" />
          Education
        </h3>
        <button
          onClick={addEducation}
          className="btn-secondary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Education
        </button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No education added yet</p>
          <button onClick={addEducation} className="btn-primary flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" />
            Add Your First Education
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {data.map((edu, index) => (
            <div
              key={edu.id}
              className="border border-gray-200 rounded-lg p-6 space-y-4 bg-gray-50 hover:shadow-luna transition-shadow"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-luna-500">Education #{index + 1}</h4>
                <button
                  onClick={() => removeEducation(edu.id)}
                  className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove this education"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* University */}
                <div className="md:col-span-2">
                  <label htmlFor={`university-${edu.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                    University/Institution <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`university-${edu.id}`}
                    type="text"
                    value={edu.university}
                    onChange={(e) => updateEducation(edu.id, 'university', e.target.value)}
                    className="input-field"
                    placeholder="e.g., Stanford University"
                  />
                </div>

                {/* Degree */}
                <div>
                  <label htmlFor={`degree-${edu.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                    Degree <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`degree-${edu.id}`}
                    type="text"
                    value={edu.degree}
                    onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                    className="input-field"
                    placeholder="e.g., Bachelor of Science"
                  />
                </div>

                {/* Field of Study */}
                <div>
                  <label htmlFor={`field-${edu.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                    Field of Study <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`field-${edu.id}`}
                    type="text"
                    value={edu.field}
                    onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                    className="input-field"
                    placeholder="e.g., Computer Science"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label htmlFor={`startDate-${edu.id}`} className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-luna-200" />
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`startDate-${edu.id}`}
                    type="month"
                    value={edu.startDate}
                    onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                    className="input-field"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label htmlFor={`endDate-${edu.id}`} className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-luna-200" />
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`endDate-${edu.id}`}
                    type="month"
                    value={edu.endDate}
                    onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                    className="input-field"
                  />
                </div>

                {/* City */}
                <div className="md:col-span-2">
                  <label htmlFor={`city-${edu.id}`} className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-luna-200" />
                    City
                  </label>
                  <input
                    id={`city-${edu.id}`}
                    type="text"
                    value={edu.city}
                    onChange={(e) => updateEducation(edu.id, 'city', e.target.value)}
                    className="input-field"
                    placeholder="e.g., Palo Alto, CA"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-luna-50 border border-luna-100 rounded-lg p-4 mt-6">
        <h4 className="font-semibold text-luna-500 text-sm mb-2">💡 Education Tips:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• List education in reverse chronological order (most recent first)</li>
          <li>• Include GPA if it's 3.5 or higher</li>
          <li>• Add relevant coursework, honors, or achievements</li>
          <li>• Use the official name of your institution</li>
        </ul>
      </div>
    </div>
  );
};

export default EducationForm;
