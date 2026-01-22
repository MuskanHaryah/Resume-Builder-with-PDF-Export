import { Award, Plus, Trash2, Calendar, List } from 'lucide-react';
import type { Leadership } from '../../types/resume';

interface LeadershipFormProps {
  data: Leadership[];
  onChange: (data: Leadership[]) => void;
}

const LeadershipForm = ({ data, onChange }: LeadershipFormProps) => {
  const addLeadership = () => {
    const newLeadership: Leadership = {
      id: Date.now().toString(),
      title: '',
      organization: '',
      startDate: '',
      endDate: '',
      bulletPoints: [''],
    };
    onChange([...data, newLeadership]);
  };

  const removeLeadership = (id: string) => {
    onChange(data.filter((lead) => lead.id !== id));
  };

  const updateLeadership = (id: string, field: keyof Leadership, value: string | string[]) => {
    onChange(
      data.map((lead) =>
        lead.id === id ? { ...lead, [field]: value } : lead
      )
    );
  };

  const addBulletPoint = (id: string) => {
    onChange(
      data.map((lead) =>
        lead.id === id
          ? { ...lead, bulletPoints: [...lead.bulletPoints, ''] }
          : lead
      )
    );
  };

  const removeBulletPoint = (id: string, index: number) => {
    onChange(
      data.map((lead) =>
        lead.id === id
          ? { ...lead, bulletPoints: lead.bulletPoints.filter((_, i) => i !== index) }
          : lead
      )
    );
  };

  const updateBulletPoint = (id: string, index: number, value: string) => {
    onChange(
      data.map((lead) =>
        lead.id === id
          ? {
              ...lead,
              bulletPoints: lead.bulletPoints.map((bp, i) => (i === index ? value : bp)),
            }
          : lead
      )
    );
  };

  return (
    <div className="card">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-luna-500 flex items-center gap-2">
            <Award className="w-6 h-6 text-luna-200" />
            Leadership & Activities
            <span className="text-xs font-normal text-gray-500 ml-2">(Optional)</span>
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Add leadership roles, volunteer work, or extracurricular activities
          </p>
        </div>
        <button
          onClick={addLeadership}
          className="btn-secondary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Entry
        </button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">No leadership activities added</p>
          <p className="text-xs text-gray-400 mb-4">This section is optional but can strengthen your resume</p>
          <button onClick={addLeadership} className="btn-primary flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" />
            Add Leadership Entry
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {data.map((leadership, index) => (
            <div
              key={leadership.id}
              className="border border-gray-200 rounded-lg p-6 space-y-4 bg-gray-50 hover:shadow-luna transition-shadow"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-luna-500">Entry #{index + 1}</h4>
                <button
                  onClick={() => removeLeadership(leadership.id)}
                  className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove this entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title/Role */}
                <div className="md:col-span-2">
                  <label htmlFor={`title-${leadership.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                    Title/Role <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`title-${leadership.id}`}
                    type="text"
                    value={leadership.title}
                    onChange={(e) => updateLeadership(leadership.id, 'title', e.target.value)}
                    className="input-field"
                    placeholder="e.g., President, Volunteer Coordinator, Team Captain"
                  />
                </div>

                {/* Organization */}
                <div className="md:col-span-2">
                  <label htmlFor={`organization-${leadership.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                    Organization <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`organization-${leadership.id}`}
                    type="text"
                    value={leadership.organization}
                    onChange={(e) => updateLeadership(leadership.id, 'organization', e.target.value)}
                    className="input-field"
                    placeholder="e.g., Student Council, Red Cross, University Sports Team"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label htmlFor={`startDate-${leadership.id}`} className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-luna-200" />
                    Start Date
                  </label>
                  <input
                    id={`startDate-${leadership.id}`}
                    type="month"
                    value={leadership.startDate}
                    onChange={(e) => updateLeadership(leadership.id, 'startDate', e.target.value)}
                    className="input-field"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label htmlFor={`endDate-${leadership.id}`} className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-luna-200" />
                    End Date
                  </label>
                  <input
                    id={`endDate-${leadership.id}`}
                    type="month"
                    value={leadership.endDate}
                    onChange={(e) => updateLeadership(leadership.id, 'endDate', e.target.value)}
                    className="input-field"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <List className="w-4 h-4 text-luna-200" />
                    Description
                  </label>
                  <div className="space-y-3">
                    {leadership.bulletPoints.map((bullet, bulletIndex) => (
                      <div key={bulletIndex} className="flex gap-2">
                        <span className="text-luna-300 mt-3 font-bold">•</span>
                        <input
                          type="text"
                          value={bullet}
                          onChange={(e) => updateBulletPoint(leadership.id, bulletIndex, e.target.value)}
                          className="input-field flex-1"
                          placeholder="e.g., Organized events with 500+ participants"
                        />
                        <button
                          onClick={() => removeBulletPoint(leadership.id, bulletIndex)}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove bullet point"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addBulletPoint(leadership.id)}
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
        <h4 className="font-semibold text-luna-500 text-sm mb-2">💡 Leadership Tips:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Include leadership roles, volunteer work, and community involvement</li>
          <li>• Highlight quantifiable impact (e.g., "Led team of 20 members")</li>
          <li>• Demonstrate soft skills like teamwork and communication</li>
          <li>• Keep it relevant to your career goals</li>
        </ul>
      </div>
    </div>
  );
};

export default LeadershipForm;
