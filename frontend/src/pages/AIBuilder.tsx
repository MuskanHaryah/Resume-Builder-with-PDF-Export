import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ArrowLeft, Sparkles, ArrowRight, ArrowLeftIcon, Check, TrendingUp, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// AI Components
import JobDescriptionInput from '../components/ai/JobDescriptionInput';
import KeywordDisplay from '../components/ai/KeywordDisplay';
import AIProfessionalSummaryForm from '../components/ai/AIProfessionalSummaryForm';
import AIExperienceForm from '../components/ai/AIExperienceForm';
import AISkillsForm from '../components/ai/AISkillsForm';
import AIProjectsForm from '../components/ai/AIProjectsForm';

// Shared Components (same as Manual Builder)
import PersonalInfoForm from '../components/manual/PersonalInfoForm';
import EducationForm from '../components/manual/EducationForm';
import LeadershipForm from '../components/manual/LeadershipForm';
import ResumePreview from '../components/preview/ResumePreview';
import ATSBreakdown from '../components/ATSBreakdown';

import type { PersonalInfo, Education, Experience, Project, Leadership, ResumeData } from '../types/resume';
import { calculateATSScore, getScoreColor } from '../utils/atsCalculator';

// Types for extracted keywords
export interface ExtractedKeywords {
  skills: string[];
  responsibilities: string[];
  qualifications: string[];
  actionVerbs: string[];
  keywords: string[];
}

// Steps for AI Builder flow
type AIBuilderStep = 'input' | 'keywords' | 'builder';

// Form steps (same as Manual Builder)
const FORM_STEPS = [
  { id: 1, title: 'Personal Info', key: 'personal' },
  { id: 2, title: 'Summary', key: 'summary' },
  { id: 3, title: 'Education', key: 'education' },
  { id: 4, title: 'Experience', key: 'experience' },
  { id: 5, title: 'Projects', key: 'projects' },
  { id: 6, title: 'Skills', key: 'skills' },
  { id: 7, title: 'Leadership', key: 'leadership' },
];

const AIBuilder = () => {
  const navigate = useNavigate();
  const resumeRef = useRef<HTMLDivElement>(null);
  
  // Current step in the AI flow
  const [currentStep, setCurrentStep] = useState<AIBuilderStep>('input');
  
  // Job description text
  const [jobDescription, setJobDescription] = useState<string>(() => {
    const saved = localStorage.getItem('ai_jobDescription');
    return saved ? JSON.parse(saved) : '';
  });
  
  // Extracted keywords from JD
  const [extractedKeywords, setExtractedKeywords] = useState<ExtractedKeywords | null>(() => {
    const saved = localStorage.getItem('ai_extractedKeywords');
    return saved ? JSON.parse(saved) : null;
  });
  
  // Loading state for AI extraction
  const [isExtracting, setIsExtracting] = useState(false);
  
  // Resume form state
  const [formStep, setFormStep] = useState(() => {
    const saved = localStorage.getItem('ai_formStep');
    return saved ? JSON.parse(saved) : 1;
  });
  
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('ai_visitedSteps');
    return saved ? new Set(JSON.parse(saved)) : new Set([1]);
  });
  
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(() => {
    const saved = localStorage.getItem('ai_personalInfo');
    return saved ? JSON.parse(saved) : {
      firstName: '',
      lastName: '',
      address: '',
      email: '',
      phone: '',
      linkedin: '',
      github: '',
    };
  });
  
  const [summary, setSummary] = useState<string>(() => {
    const saved = localStorage.getItem('ai_summary');
    return saved ? JSON.parse(saved) : '';
  });
  
  const [education, setEducation] = useState<Education[]>(() => {
    const saved = localStorage.getItem('ai_education');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [experience, setExperience] = useState<Experience[]>(() => {
    const saved = localStorage.getItem('ai_experience');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('ai_projects');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [skills, setSkills] = useState<string[]>(() => {
    const saved = localStorage.getItem('ai_skills');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [leadership, setLeadership] = useState<Leadership[]>(() => {
    const saved = localStorage.getItem('ai_leadership');
    return saved ? JSON.parse(saved) : [];
  });
  
  // UI state
  const [exceedsOnePage, setExceedsOnePage] = useState(false);
  const [pageOverflowPercentage, setPageOverflowPercentage] = useState(0);
  const [isATSModalOpen, setIsATSModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('ai_jobDescription', JSON.stringify(jobDescription));
  }, [jobDescription]);

  useEffect(() => {
    if (extractedKeywords) {
      localStorage.setItem('ai_extractedKeywords', JSON.stringify(extractedKeywords));
    }
  }, [extractedKeywords]);
  
  useEffect(() => {
    localStorage.setItem('ai_formStep', JSON.stringify(formStep));
  }, [formStep]);
  
  useEffect(() => {
    localStorage.setItem('ai_visitedSteps', JSON.stringify([...visitedSteps]));
  }, [visitedSteps]);
  
  useEffect(() => {
    localStorage.setItem('ai_personalInfo', JSON.stringify(personalInfo));
  }, [personalInfo]);
  
  useEffect(() => {
    localStorage.setItem('ai_summary', JSON.stringify(summary));
  }, [summary]);
  
  useEffect(() => {
    localStorage.setItem('ai_education', JSON.stringify(education));
  }, [education]);
  
  useEffect(() => {
    localStorage.setItem('ai_experience', JSON.stringify(experience));
  }, [experience]);
  
  useEffect(() => {
    localStorage.setItem('ai_projects', JSON.stringify(projects));
  }, [projects]);
  
  useEffect(() => {
    localStorage.setItem('ai_skills', JSON.stringify(skills));
  }, [skills]);
  
  useEffect(() => {
    localStorage.setItem('ai_leadership', JSON.stringify(leadership));
  }, [leadership]);

  // Resume data for preview
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
  const scoreColor = getScoreColor(atsScore.score);

  // Handle keyword extraction
  const handleExtractKeywords = async () => {
    if (!jobDescription.trim()) return;
    
    setIsExtracting(true);
    try {
      const response = await fetch('http://localhost:5000/api/ai/extract-keywords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobDescription }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to extract keywords');
      }
      
      setExtractedKeywords(result.data);
      setCurrentStep('keywords');
    } catch (error) {
      console.error('Failed to extract keywords:', error);
      alert(error instanceof Error ? error.message : 'Failed to extract keywords. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  // Handle continue to builder
  const handleContinueToBuilder = () => {
    setCurrentStep('builder');
  };

  // Handle back button
  const handleBack = () => {
    if (currentStep === 'keywords') {
      setCurrentStep('input');
    } else if (currentStep === 'builder') {
      setCurrentStep('keywords');
    } else {
      navigate('/');
    }
  };

  // Handle re-extract (go back to input)
  const handleReExtract = () => {
    setCurrentStep('input');
  };

  // Form navigation
  const goToNextStep = () => {
    if (formStep < FORM_STEPS.length) {
      const nextStep = formStep + 1;
      setFormStep(nextStep);
      setVisitedSteps(prev => new Set([...prev, nextStep]));
    }
  };

  const goToPrevStep = () => {
    if (formStep > 1) {
      setFormStep(formStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (visitedSteps.has(step) || step === formStep + 1) {
      setFormStep(step);
      setVisitedSteps(prev => new Set([...prev, step]));
    }
  };

  // Check page overflow
  const checkPageOverflow = useCallback(() => {
    if (resumeRef.current) {
      const element = resumeRef.current;
      const letterHeightPx = 11 * 96; // 11 inches in pixels at 96 DPI
      const actualHeight = element.scrollHeight;
      const exceeds = actualHeight > letterHeightPx;
      setExceedsOnePage(exceeds);
      if (exceeds) {
        const overflow = ((actualHeight - letterHeightPx) / letterHeightPx) * 100;
        setPageOverflowPercentage(Math.min(overflow, 100));
      } else {
        setPageOverflowPercentage(0);
      }
    }
  }, []);

  useEffect(() => {
    checkPageOverflow();
    const timer = setTimeout(checkPageOverflow, 100);
    return () => clearTimeout(timer);
  }, [resumeData, checkPageOverflow]);

  // PDF Download
  const handleDownloadPDF = async () => {
    if (!resumeRef.current) return;

    setIsDownloading(true);
    setDownloadComplete(false);
    
    try {
      const element = resumeRef.current;
      const letterWidthPx = 8.5 * 96;
      const letterHeightPx = 11 * 96;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: letterWidthPx,
        windowWidth: letterWidthPx,
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'letter',
      });

      const imgWidth = 8.5;
      const imgHeight = (canvas.height / canvas.width) * imgWidth;
      const pageHeight = 11;
      let heightLeft = imgHeight;
      let position = 0;
      let page = 1;

      const imgData = canvas.toDataURL('image/png');

      while (heightLeft > 0) {
        if (page > 1) {
          pdf.addPage();
        }
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        position -= pageHeight;
        page++;
      }

      const fileName = personalInfo.firstName && personalInfo.lastName
        ? `${personalInfo.firstName}_${personalInfo.lastName}_Resume.pdf`
        : 'resume.pdf';

      pdf.save(fileName);
      setDownloadComplete(true);
      toast.success('Resume downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Render form based on step
  const renderForm = () => {
    switch (formStep) {
      case 1:
        return <PersonalInfoForm data={personalInfo} onChange={setPersonalInfo} />;
      case 2:
        return (
          <AIProfessionalSummaryForm
            data={summary}
            onChange={setSummary}
            jobDescription={jobDescription}
            personalInfo={personalInfo}
          />
        );
      case 3:
        return <EducationForm data={education} onChange={setEducation} />;
      case 4:
        return (
          <AIExperienceForm
            data={experience}
            onChange={setExperience}
            jobDescription={jobDescription}
          />
        );
      case 5:
        return (
          <AIProjectsForm
            data={projects}
            onChange={setProjects}
            jobDescription={jobDescription}
          />
        );
      case 6:
        return (
          <AISkillsForm
            data={skills}
            onChange={setSkills}
            jobDescription={jobDescription}
            extractedKeywords={extractedKeywords || undefined}
          />
        );
      case 7:
        return <LeadershipForm data={leadership} onChange={setLeadership} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-luna-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-luna-50 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-luna-200" />
                <h1 className="text-xl font-bold text-luna-500">AI-Assisted Resume Builder</h1>
              </div>
            </div>
            
            {/* Step indicator */}
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentStep === 'input' ? 'bg-luna-200 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                1. Job Description
              </span>
              <span className="text-gray-300">→</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentStep === 'keywords' ? 'bg-luna-200 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                2. Keywords
              </span>
              <span className="text-gray-300">→</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentStep === 'builder' ? 'bg-luna-200 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                3. Build Resume
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-8">
        {/* Step 1: Job Description Input */}
        {currentStep === 'input' && (
          <JobDescriptionInput
            value={jobDescription}
            onChange={setJobDescription}
            onExtract={handleExtractKeywords}
            isLoading={isExtracting}
          />
        )}

        {/* Step 2: Keyword Display */}
        {currentStep === 'keywords' && extractedKeywords && (
          <KeywordDisplay
            keywords={extractedKeywords}
            onContinue={handleContinueToBuilder}
            onReExtract={handleReExtract}
          />
        )}

        {/* Step 3: Builder */}
        {currentStep === 'builder' && (
          <div className="flex gap-8">
            {/* Left Side - Form */}
            <div className="w-1/2 space-y-6">
              {/* Form Step Navigation */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between gap-2 overflow-x-auto">
                  {FORM_STEPS.map((step, index) => (
                    <button
                      key={step.id}
                      onClick={() => goToStep(step.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                        formStep === step.id
                          ? 'bg-luna-200 text-white'
                          : visitedSteps.has(step.id)
                          ? 'bg-luna-50 text-luna-400 hover:bg-luna-100'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                      disabled={!visitedSteps.has(step.id) && step.id !== formStep + 1}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        formStep === step.id
                          ? 'bg-white/20'
                          : visitedSteps.has(step.id)
                          ? 'bg-luna-200 text-white'
                          : 'bg-gray-200'
                      }`}>
                        {visitedSteps.has(step.id) && formStep !== step.id ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          step.id
                        )}
                      </span>
                      {step.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Form */}
              {renderForm()}

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={goToPrevStep}
                  disabled={formStep === 1}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    formStep === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Previous
                </button>

                {formStep < FORM_STEPS.length ? (
                  <button
                    onClick={goToNextStep}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium bg-luna-200 text-white hover:bg-luna-300 transition-colors"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsDownloadModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Download PDF
                  </button>
                )}
              </div>
            </div>

            {/* Right Side - Preview */}
            <div className="w-1/2 space-y-4">
              {/* ATS Score */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${scoreColor}`}>
                      {atsScore.score}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700">ATS Score</p>
                      <p className="text-sm text-gray-500">Resume optimization</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsATSModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-luna-50 text-luna-400 rounded-lg hover:bg-luna-100 transition-colors"
                  >
                    <TrendingUp className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </div>

              {/* Page Overflow Warning */}
              {exceedsOnePage && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-amber-700 text-sm font-medium">
                    ⚠️ Resume exceeds one page by {pageOverflowPercentage.toFixed(0)}%
                  </p>
                  <p className="text-amber-600 text-xs mt-1">
                    Consider removing or condensing some content
                  </p>
                </div>
              )}

              {/* Preview */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gray-100 p-2 border-b flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Preview</span>
                  <span className="text-xs text-gray-500">Live update</span>
                </div>
                <div className="p-4 bg-gray-200 max-h-[calc(100vh-300px)] overflow-y-auto">
                  <div className="transform scale-[0.6] origin-top">
                    <ResumePreview ref={resumeRef} data={resumeData} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ATS Modal */}
      {isATSModalOpen && (
        <ATSBreakdown
          score={atsScore}
          onClose={() => setIsATSModalOpen(false)}
        />
      )}

      {/* Download Modal */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-luna-500 mb-4">Download Resume</h3>
            <p className="text-gray-600 mb-6">
              Your AI-optimized resume is ready for download as a PDF.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setIsDownloadModalOpen(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDownloadPDF();
                  setIsDownloadModalOpen(false);
                }}
                disabled={isDownloading}
                className="flex-1 px-4 py-3 bg-luna-200 text-white rounded-lg font-medium hover:bg-luna-300 transition-colors disabled:opacity-50"
              >
                {isDownloading ? 'Generating...' : 'Download PDF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIBuilder;
