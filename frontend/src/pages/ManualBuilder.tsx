import { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, FileText, ArrowRight, ArrowLeftIcon, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PersonalInfoForm from '../components/manual/PersonalInfoForm';
import ProfessionalSummaryForm from '../components/manual/ProfessionalSummaryForm';
import EducationForm from '../components/manual/EducationForm';
import ExperienceForm from '../components/manual/ExperienceForm';
import ProjectsForm from '../components/manual/ProjectsForm';
import SkillsForm from '../components/manual/SkillsForm';
import LeadershipForm from '../components/manual/LeadershipForm';
import ResumePreview from '../components/preview/ResumePreview';
import type { PersonalInfo, Education, Experience, Project, Leadership, ResumeData } from '../types/resume';
import { calculateATSScore, getScoreColor } from '../utils/atsCalculator';

const STEPS = [
  { id: 1, title: 'Personal Info', key: 'personal' },
  { id: 2, title: 'Summary', key: 'summary' },
  { id: 3, title: 'Education', key: 'education' },
  { id: 4, title: 'Experience', key: 'experience' },
  { id: 5, title: 'Projects', key: 'projects' },
  { id: 6, title: 'Skills', key: 'skills' },
  { id: 7, title: 'Leadership', key: 'leadership' },
];

const ManualBuilder = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([1]));
  
  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
  });

  const [summary, setSummary] = useState<string>('');
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [leadership, setLeadership] = useState<Leadership[]>([]);

  // Combine all data for preview and ATS calculation
  const resumeData: ResumeData = useMemo(() => ({
    personalInfo,
    summary,
    education,
    experience,
    projects,
    skills,
    leadership,
  }), [personalInfo, summary, education, experience, projects, skills, leadership]);

  // Calculate ATS score
  const atsScore = useMemo(() => calculateATSScore(resumeData), [resumeData]);

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setVisitedSteps(prev => new Set([...prev, currentStep + 1]));
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderCurrentForm = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoForm data={personalInfo} onChange={setPersonalInfo} />;
      case 2:
        return <ProfessionalSummaryForm data={summary} onChange={setSummary} />;
      case 3:
        return <EducationForm data={education} onChange={setEducation} />;
      case 4:
        return <ExperienceForm data={experience} onChange={setExperience} />;
      case 5:
        return <ProjectsForm data={projects} onChange={setProjects} />;
      case 6:
        return <SkillsForm data={skills} onChange={setSkills} />;
      case 7:
        return <LeadershipForm data={leadership} onChange={setLeadership} />;
      default:
        return null;
    }
  };

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
              <div className={`px-4 py-2 rounded-lg border ${getScoreColor(atsScore.totalScore) === 'text-green-600' ? 'bg-green-50 border-green-200' : getScoreColor(atsScore.totalScore) === 'text-blue-600' ? 'bg-blue-50 border-blue-200' : getScoreColor(atsScore.totalScore) === 'text-yellow-600' ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
                <span className={`text-sm font-bold ${getScoreColor(atsScore.totalScore)}`}>
                  ATS Score: {atsScore.totalScore}/100
                </span>
              </div>
              <button className="btn-primary">
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-8">
        {/* Progress Stepper */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center gap-2 transition-all ${
                    currentStep === step.id
                      ? 'text-luna-500 font-bold'
                      : visitedSteps.has(step.id)
                      ? 'text-green-600 cursor-pointer hover:text-green-700'
                      : 'text-gray-400 cursor-pointer hover:text-gray-600'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      currentStep === step.id
                        ? 'bg-luna-200 text-white'
                        : visitedSteps.has(step.id)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {visitedSteps.has(step.id) && currentStep !== step.id ? <Check className="w-4 h-4" /> : step.id}
                  </div>
                  <span className="text-sm hidden md:inline">{step.title}</span>
                </button>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded ${
                       visitedSteps.has(step.id + 1) ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Form Panel */}
          <div className="space-y-6">
            {/* Current Form */}
            {renderCurrentForm()}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-4 pt-4">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className={`px-6 py-3 bg-white border-2 border-luna-300 text-luna-500 font-semibold rounded-lg hover:bg-luna-50 transition-colors flex items-center gap-2 ${
                  currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back
              </button>

              <span className="text-sm text-gray-600">
                Step {currentStep} of {STEPS.length}
              </span>

              <button
                onClick={handleNext}
                disabled={currentStep === STEPS.length}
                className={`btn-primary flex items-center gap-2 ${
                  currentStep === STEPS.length ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {currentStep === STEPS.length ? 'Completed' : 'Next'}
                {currentStep < STEPS.length && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Right: Preview Panel */}
          <div className="lg:sticky lg:top-24 h-fit">
            <ResumePreview data={resumeData} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManualBuilder;
