import { User, Mail, Phone, Linkedin, Github } from 'lucide-react';
import { PersonalInfo } from '../../types/resume';

interface PersonalInfoFormProps {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
}

const PersonalInfoForm = ({ data, onChange }: PersonalInfoFormProps) => {
  const handleChange = (field: keyof PersonalInfo, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="card">
      <h3 className="text-xl font-bold text-luna-500 mb-6 flex items-center gap-2">
        <User className="w-6 h-6 text-luna-200" />
        Personal Information
      </h3>

      <div className="space-y-4">
        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="firstName"
            value={data.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className="input-field"
            placeholder="John"
            required
          />
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            value={data.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className="input-field"
            placeholder="Doe"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Mail className="w-4 h-4 text-luna-300" />
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            value={data.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="input-field"
            placeholder="john.doe@example.com"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Phone className="w-4 h-4 text-luna-300" />
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            value={data.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="input-field"
            placeholder="+1 (555) 123-4567"
            required
          />
        </div>

        {/* LinkedIn */}
        <div>
          <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Linkedin className="w-4 h-4 text-luna-300" />
            LinkedIn URL
          </label>
          <input
            type="url"
            id="linkedin"
            value={data.linkedin}
            onChange={(e) => handleChange('linkedin', e.target.value)}
            className="input-field"
            placeholder="https://linkedin.com/in/johndoe"
          />
        </div>

        {/* GitHub */}
        <div>
          <label htmlFor="github" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Github className="w-4 h-4 text-luna-300" />
            GitHub URL
          </label>
          <input
            type="url"
            id="github"
            value={data.github}
            onChange={(e) => handleChange('github', e.target.value)}
            className="input-field"
            placeholder="https://github.com/johndoe"
          />
        </div>
      </div>

      <div className="mt-6 p-4 bg-luna-50 border border-luna-100 rounded-lg">
        <p className="text-sm text-gray-600">
          <span className="font-medium text-luna-500">💡 Tip:</span> Make sure your contact information is accurate. 
          Recruiters will use this to reach you for interviews.
        </p>
      </div>
    </div>
  );
};

export default PersonalInfoForm;
