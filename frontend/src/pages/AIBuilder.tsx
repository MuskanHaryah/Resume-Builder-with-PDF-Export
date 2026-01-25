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

  // Validate current step before moving to next
  const validateCurrentStep = (): boolean => {
    switch (formStep) {
      case 1: // Personal Info - only firstName and email are mandatory
        if (!personalInfo.firstName.trim()) {
          toast.error('Please fill in your first name');
          return false;
        }
        if (!personalInfo.email.trim()) {
          toast.error('Please fill in your email address');
          return false;
        }
        return true;
      case 2: // Professional Summary - mandatory
        if (!summary.trim()) {
          toast.error('Please write a professional summary');
          return false;
        }
        return true;
      case 3: // Education - mandatory (at least one entry with all required fields)
        if (education.length === 0) {
          toast.error('Please add at least one education entry');
          return false;
        }
        for (let i = 0; i < education.length; i++) {
          const edu = education[i];
          if (!edu.university.trim()) {
            toast.error('Please fill in the University/Institution field');
            return false;
          }
          if (!edu.degree.trim()) {
            toast.error('Please fill in the Degree field');
            return false;
          }
          if (!edu.field.trim()) {
            toast.error('Please fill in the Field of Study');
            return false;
          }
          if (!edu.startDate) {
            toast.error('Please select the Start Date');
            return false;
          }
          if (!edu.endDate) {
            toast.error('Please select the End Date');
            return false;
          }
        }
        return true;
      case 4: // Experience - optional but if added, must be complete
        if (experience.length > 0) {
          for (let i = 0; i < experience.length; i++) {
            const exp = experience[i];
            if (!exp.company.trim()) {
              toast.error('Please fill in the Company field');
              return false;
            }
            if (!exp.title.trim()) {
              toast.error('Please fill in the Job Title field');
              return false;
            }
            if (!exp.startDate) {
              toast.error('Please select the Start Date');
              return false;
            }
            if (!exp.current && !exp.endDate) {
              toast.error('Please select the End Date or check "I currently work here"');
              return false;
            }
            const hasValidBullet = exp.bulletPoints.some(bp => bp.trim().length > 0);
            if (!hasValidBullet) {
              toast.error('Please add at least one responsibility');
              return false;
            }
          }
        }
        return true;
      case 5: // Projects - optional but if added, must be complete
        if (projects.length > 0) {
          for (let i = 0; i < projects.length; i++) {
            const proj = projects[i];
            if (!proj.name.trim()) {
              toast.error('Please fill in the Project Name');
              return false;
            }
            if (proj.technologies.length === 0) {
              toast.error('Please add at least one technology for the project');
              return false;
            }
            if (proj.bulletPoints.length === 0 || !proj.bulletPoints.some(bp => bp.trim())) {
              toast.error('Please add at least one bullet point describing the project');
              return false;
            }
          }
        }
        return true;
      case 6: // Skills - mandatory (at least one skill)
        if (skills.length === 0) {
          toast.error('Please add at least one skill');
          return false;
        }
        return true;
      case 7: // Leadership - optional but if added, must be complete
        if (leadership.length > 0) {
          for (let i = 0; i < leadership.length; i++) {
            const lead = leadership[i];
            if (!lead.title.trim()) {
              toast.error('Please fill in the Title/Role field');
              return false;
            }
            if (!lead.organization.trim()) {
              toast.error('Please fill in the Organization field');
              return false;
            }
            if (lead.bulletPoints.length === 0 || !lead.bulletPoints.some(bp => bp.trim())) {
              toast.error('Please add at least one bullet point describing your leadership role');
              return false;
            }
          }
        }
        return true;
      default:
        return true;
    }
  };

  // Validate all mandatory sections before download
  const validateAllMandatorySections = (): boolean => {
    // 1. Personal Info - mandatory fields
    if (!personalInfo.firstName.trim()) {
      toast.error('Please fill in your First Name in Personal Info section');
      setFormStep(1);
      return false;
    }
    if (!personalInfo.email.trim() || !personalInfo.email.includes('@')) {
      toast.error('Please provide a valid Email in Personal Info section');
      setFormStep(1);
      return false;
    }

    // 2. Summary - mandatory
    if (!summary.trim()) {
      toast.error('Please add a Professional Summary');
      setFormStep(2);
      return false;
    }

    // 3. Education - at least one complete entry
    if (education.length === 0) {
      toast.error('Please add at least one Education entry');
      setFormStep(3);
      return false;
    }
    for (const edu of education) {
      if (!edu.university.trim()) {
        toast.error('Please complete all Education fields (University is required)');
        setFormStep(3);
        return false;
      }
      if (!edu.degree.trim()) {
        toast.error('Please complete all Education fields (Degree is required)');
        setFormStep(3);
        return false;
      }
      if (!edu.field.trim()) {
        toast.error('Please complete all Education fields (Field of Study is required)');
        setFormStep(3);
        return false;
      }
    }

    // 4. Skills - at least one skill
    if (skills.length === 0) {
      toast.error('Please add at least one Skill');
      setFormStep(6);
      return false;
    }

    return true;
  };

  // Clear all resume data from localStorage
  const clearResumeData = () => {
    localStorage.removeItem('ai_jobDescription');
    localStorage.removeItem('ai_extractedKeywords');
    localStorage.removeItem('ai_formStep');
    localStorage.removeItem('ai_visitedSteps');
    localStorage.removeItem('ai_personalInfo');
    localStorage.removeItem('ai_summary');
    localStorage.removeItem('ai_education');
    localStorage.removeItem('ai_experience');
    localStorage.removeItem('ai_projects');
    localStorage.removeItem('ai_skills');
    localStorage.removeItem('ai_leadership');
  };

  // Handle navigation after download
  const handleGoHome = () => {
    navigate('/');
  };

  const handleMakeAnother = () => {
    setIsDownloadModalOpen(false);
    setDownloadComplete(false);
    // Reset to first step without clearing data
    setCurrentStep('input');
    setFormStep(1);
  };

  // Form navigation
  const goToNextStep = () => {
    if (formStep < FORM_STEPS.length) {
      if (!validateCurrentStep()) {
        return; // Don't proceed if validation fails
      }
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

  // Handle PDF Download (same as Manual Builder)
  const handleDownloadPDF = async () => {
    const resumeElement = document.getElementById('resume-content');
    if (!resumeElement) {
      console.error('Resume element not found');
      toast.error('Resume preview not found');
      return;
    }

    // Start downloading
    setIsDownloading(true);
    setDownloadComplete(false);

    console.log('Starting PDF generation...');
    console.log('Resume element:', resumeElement);
    console.log('Resume element dimensions:', {
      width: resumeElement.offsetWidth,
      height: resumeElement.offsetHeight,
      scrollHeight: resumeElement.scrollHeight
    });

    try {

      // Wait a bit for any pending renders
      await new Promise(resolve => setTimeout(resolve, 300));

      console.log('Starting html2canvas...');
      
      // Capture the resume content as canvas - simplified approach
      const canvas = await html2canvas(resumeElement, {
        scale: 2,
        useCORS: false,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        foreignObjectRendering: false,
        onclone: (clonedDoc) => {
          // Only remove oklch colors, don't mess with anything else
          const styleTags = clonedDoc.querySelectorAll('style');
          styleTags.forEach((style) => {
            if (style.textContent && style.textContent.includes('oklch')) {
              style.textContent = style.textContent.replace(/oklch\([^)]+\)/g, '#ffffff');
            }
          });
        }
      });

      console.log('Canvas created:', {
        width: canvas.width,
        height: canvas.height
      });

      // A4 dimensions in mm
      const pageWidth = 210;
      const pageHeight = 297;
      const bottomMargin = 15; // Leave 15mm space at the bottom of each page
      const usablePageHeight = pageHeight - bottomMargin;
      
      // Calculate image dimensions to fit A4 width
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      console.log('PDF dimensions:', {
        imgWidth,
        imgHeight,
        pageHeight,
        usablePageHeight,
        pages: Math.ceil(imgHeight / usablePageHeight)
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      console.log('Converting canvas to image...');
      const imgData = canvas.toDataURL('image/png');
      console.log('Image data length:', imgData.length);

      // Check if content fits on one page (with bottom margin)
      // Add 5% tolerance to prevent creating a second page for minor overflows
      const toleranceThreshold = usablePageHeight * 1.05;
      
      if (imgHeight <= toleranceThreshold) {
        console.log('Adding single page...');
        // If slightly over, scale down to fit perfectly
        const finalHeight = Math.min(imgHeight, usablePageHeight);
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, finalHeight);
      } else {
        console.log('Adding multiple pages with proper slicing...');
        
        // Calculate pixels per mm for precise slicing
        const pxPerMm = canvas.width / imgWidth;
        const usablePageHeightPx = usablePageHeight * pxPerMm;
        const topMarginPx = 15 * pxPerMm; // 15mm top margin for page 2 onwards
        
        // First page
        const page1Canvas = document.createElement('canvas');
        page1Canvas.width = canvas.width;
        page1Canvas.height = Math.min(usablePageHeightPx, canvas.height);
        const ctx1 = page1Canvas.getContext('2d');
        
        if (ctx1) {
          ctx1.fillStyle = '#ffffff';
          ctx1.fillRect(0, 0, page1Canvas.width, page1Canvas.height);
          ctx1.drawImage(canvas, 0, 0);
          
          const page1Data = page1Canvas.toDataURL('image/png');
          pdf.addImage(page1Data, 'PNG', 0, 0, imgWidth, usablePageHeight);
        }
        
        // Additional pages
        let currentY = usablePageHeightPx;
        
        while (currentY < canvas.height) {
          pdf.addPage();
          
          const remainingHeight = canvas.height - currentY;
          const sliceHeight = Math.min(usablePageHeightPx, remainingHeight);
          
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = sliceHeight + topMarginPx;
          const ctx = pageCanvas.getContext('2d');
          
          if (ctx) {
            // White background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
            
            // Draw the slice with top margin
            ctx.drawImage(
              canvas,
              0, currentY,
              canvas.width, sliceHeight,
              0, topMarginPx,
              canvas.width, sliceHeight
            );
            
            const pageData = pageCanvas.toDataURL('image/png');
            const pageImgHeight = ((sliceHeight + topMarginPx) / canvas.width) * imgWidth;
            pdf.addImage(pageData, 'PNG', 0, 0, imgWidth, pageImgHeight);
          }
          
          currentY += usablePageHeightPx;
        }
      }

      // Download PDF
      const fileName = `resume_${personalInfo.firstName || 'my'}_${personalInfo.lastName || 'resume'}.pdf`;
      console.log('Saving PDF as:', fileName);
      pdf.save(fileName);
      
      // Mark download as complete
      setIsDownloading(false);
      setDownloadComplete(true);
      console.log('PDF download complete!');
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('PDF download error:', errorMsg);
      setIsDownloading(false);
      setIsDownloadModalOpen(false);
      toast.error(`Failed to download PDF: ${errorMsg}`);
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
      <header className="bg-white shadow-sm border-b border-gray-200">
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
            
            {/* Header Right Side - Changes based on step */}
            {currentStep === 'builder' ? (
              <div className="flex items-center gap-4">
                <div className={`px-4 py-2 rounded-lg border ${
                  atsScore.totalScore >= 80 ? 'bg-green-50 border-green-200' : 
                  atsScore.totalScore >= 60 ? 'bg-blue-50 border-blue-200' : 
                  atsScore.totalScore >= 40 ? 'bg-yellow-50 border-yellow-200' : 
                  'bg-red-50 border-red-200'
                }`}>
                  <span className={`text-sm font-bold ${
                    atsScore.totalScore >= 80 ? 'text-green-600' : 
                    atsScore.totalScore >= 60 ? 'text-blue-600' : 
                    atsScore.totalScore >= 40 ? 'text-yellow-600' : 
                    'text-red-600'
                  }`}>
                    ATS Score: {atsScore.totalScore}/100
                  </span>
                </div>
                <button onClick={() => setIsATSModalOpen(true)} className="btn-secondary px-4 py-2">
                  View Analysis
                </button>
                <button 
                  onClick={() => {
                    if (!validateAllMandatorySections()) {
                      return;
                    }
                    setIsDownloadModalOpen(true);
                  }}
                  className="btn-primary px-6 py-2"
                >
                  Download PDF
                </button>
              </div>
            ) : (
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
            )}
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
          <>
            {/* Progress Stepper - same as Manual Builder */}
            <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                {FORM_STEPS.map((step, index) => (
                  <div key={step.id} className="flex items-center flex-1">
                    <button
                      onClick={() => setFormStep(step.id)}
                      className={`flex items-center gap-2 transition-all ${
                        formStep === step.id
                          ? 'text-luna-500 font-bold'
                          : visitedSteps.has(step.id)
                          ? 'text-green-600 cursor-pointer hover:text-green-700'
                          : 'text-gray-400 cursor-pointer hover:text-gray-600'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                          formStep === step.id
                            ? 'bg-luna-200 text-white'
                            : visitedSteps.has(step.id)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {visitedSteps.has(step.id) && formStep !== step.id ? <Check className="w-4 h-4" /> : step.id}
                      </div>
                      <span className="text-sm hidden md:inline">{step.title}</span>
                    </button>
                    {index < FORM_STEPS.length - 1 && (
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

            <div className="grid lg:grid-cols-12 gap-6">
              {/* Left: Form Panel */}
              <div className="lg:col-span-5 space-y-6">
                {/* Current Form */}
                {renderForm()}

                {/* ATS Score Button */}
                <button
                  onClick={() => setIsATSModalOpen(true)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <TrendingUp className="w-5 h-5" />
                  View ATS Analysis
                </button>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between gap-4 pt-4">
                  <div className="flex-1">
                    {formStep > 1 && (
                      <button
                        onClick={goToPrevStep}
                        className="px-6 py-3 bg-white border-2 border-luna-300 text-luna-500 font-semibold rounded-lg hover:bg-luna-50 transition-colors flex items-center gap-2"
                      >
                        <ArrowLeftIcon className="w-4 h-4" />
                        Back
                      </button>
                    )}
                  </div>

                  <span className="text-sm text-gray-600">
                    Step {formStep} of {FORM_STEPS.length}
                  </span>

                  <div className="flex-1 flex justify-end">
                    {formStep < FORM_STEPS.length && (
                      <button
                        onClick={goToNextStep}
                        className="btn-primary flex items-center gap-2"
                      >
                        Next
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Preview Panel */}
              <div className="lg:col-span-7 sticky top-6 h-fit">
                <ResumePreview 
                  ref={resumeRef} 
                  data={resumeData}
                  exceedsOnePage={exceedsOnePage}
                  overflowPercentage={pageOverflowPercentage}
                />
              </div>
            </div>
          </>
        )}
      </main>

      {/* ATS Modal */}
      <ATSBreakdown
        atsScore={atsScore}
        isOpen={isATSModalOpen}
        onClose={() => setIsATSModalOpen(false)}
      />

      {/* Download Modal */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            {!isDownloading && !downloadComplete ? (
              // Confirmation state
              <div>
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
                    onClick={handleDownloadPDF}
                    className="flex-1 px-4 py-3 bg-luna-300 text-white rounded-lg font-medium hover:bg-luna-400 transition-colors"
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            ) : isDownloading ? (
              <div className="text-center">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Generating PDF...</h3>
                <p className="text-gray-600">Please wait while we prepare your resume</p>
              </div>
            ) : downloadComplete ? (
              <div className="text-center">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">PDF Downloaded Successfully!</h3>
                <p className="text-gray-600 mb-8">What would you like to do next?</p>
                
                <div className="space-y-3">
                  <button
                    onClick={handleGoHome}
                    className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Go to Home Page
                  </button>
                  
                  <button
                    onClick={handleMakeAnother}
                    className="w-full px-6 py-3 bg-white border-2 border-indigo-500 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                  >
                    <FileText className="w-5 h-5" />
                    Make Another Resume
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIBuilder;
