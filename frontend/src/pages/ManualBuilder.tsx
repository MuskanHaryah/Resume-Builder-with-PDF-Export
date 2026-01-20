import { useState } from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PersonalInfoForm from '../components/manual/PersonalInfoForm';
import type { PersonalInfo } from '../types/resume';

const ManualBuilder = () => {
  const navigate = useNavigate();
  
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
  });

  return (
    <div className="min-h-screen bg-luna-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-luna-50 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-luna-200" />
                <h1 className="text-xl font-bold text-luna-500">Manual Resume Builder</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">ATS Score: --/100</span>
              <button className="btn-primary">
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Form Panel */}
          <div className="space-y-6">
            <PersonalInfoForm 
              data={personalInfo} 
              onChange={setPersonalInfo} 
            />
          </div>

          {/* Right: Preview Panel */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="card">
              <h3 className="text-xl font-bold text-luna-500 mb-4">Live Preview</h3>
              <div className="bg-white border-2 border-gray-200 rounded-lg p-8 min-h-[600px]">
                {/* Preview Content */}
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">
                    {personalInfo.firstName || 'Your'} {personalInfo.lastName || 'Name'}
                  </h2>
                  <div className="mt-2 text-sm text-gray-600 space-y-1">
                    {personalInfo.email && <p>{personalInfo.email}</p>}
                    {personalInfo.phone && <p>{personalInfo.phone}</p>}
                    {personalInfo.linkedin && (
                      <p className="truncate">{personalInfo.linkedin}</p>
                    )}
                    {personalInfo.github && (
                      <p className="truncate">{personalInfo.github}</p>
                    )}
                  </div>
                </div>
                
                {!personalInfo.firstName && !personalInfo.email && (
                  <div className="text-center text-gray-400 mt-20">
                    <p>Your resume preview will appear here</p>
                    <p className="text-sm mt-2">Start filling the form to see live updates</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManualBuilder;
