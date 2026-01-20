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
    <div className="min-h-screen bg-gradient-to-br from-luna-50 to-luna-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-100 sticky top-0 z-50">
        <div className="container-custom py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2.5 hover:bg-luna-50 rounded-lg transition-all hover:scale-105"
                title="Back to Home"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-luna-200 to-luna-300 rounded-lg">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-luna-500 to-luna-400 bg-clip-text text-transparent">
                  Manual Resume Builder
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-luna-50 rounded-lg border border-luna-200">
                <span className="text-sm font-semibold text-luna-500">ATS Score: --/100</span>
              </div>
              <button className="btn-primary shadow-lg hover:shadow-xl transition-shadow">
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-8 flex-1">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Form Panel */}
          <div className="space-y-6">
            <PersonalInfoForm 
              data={personalInfo} 
              onChange={setPersonalInfo} 
            />
          </div>

          {/* Right: Preview Panel */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-luna-200 to-luna-300 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Live Preview
                </h3>
              </div>
              <div className="p-8 min-h-[600px]">
                {/* Preview Content */}
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">
                    {personalInfo.firstName || 'Your'} {personalInfo.lastName || 'Name'}
                  </h2>
                  <div className="mt-3 text-sm text-gray-600 space-y-1">
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
                    <p className="text-lg font-medium">Your resume preview will appear here</p>
                    <p className="text-sm mt-2">Start filling the form to see live updates</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="container-custom">
          <div className="text-center text-gray-600">
            <p>© 2026 Resume Builder. Build professional resumes with confidence.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ManualBuilder;
