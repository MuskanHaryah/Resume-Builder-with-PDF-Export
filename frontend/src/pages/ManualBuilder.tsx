import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, FileText, ArrowRight, ArrowLeftIcon, Check, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import PersonalInfoForm from '../components/manual/PersonalInfoForm';
import ProfessionalSummaryForm from '../components/manual/ProfessionalSummaryForm';
import EducationForm from '../components/manual/EducationForm';
import ExperienceForm from '../components/manual/ExperienceForm';
import ProjectsForm from '../components/manual/ProjectsForm';
import SkillsForm from '../components/manual/SkillsForm';
import LeadershipForm from '../components/manual/LeadershipForm';
import ResumePreview from '../components/preview/ResumePreview';
import ATSBreakdown from '../components/ATSBreakdown';
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
  const resumeRef = useRef<HTMLDivElement>(null);
  
  // State to track if resume exceeds one page
  const [exceedsOnePage, setExceedsOnePage] = useState(false);
  const [pageOverflowPercentage, setPageOverflowPercentage] = useState(0);

  // State to track ATS modal open/close
  const [isATSModalOpen, setIsATSModalOpen] = useState(false);
  
  // State for download modal
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);

  // Load data from localStorage on mount
  const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const [currentStep, setCurrentStep] = useState(() => 
    loadFromLocalStorage('resume_currentStep', 1)
  );
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(() => {
    const saved = loadFromLocalStorage<number[]>('resume_visitedSteps', [1]);
    return new Set(saved);
  });

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(() =>
    loadFromLocalStorage('resume_personalInfo', {
      firstName: '',
      lastName: '',
      address: '',
      email: '',
      phone: '',
      linkedin: '',
      github: '',
    })
  );

  const [summary, setSummary] = useState<string>(() =>
    loadFromLocalStorage('resume_summary', '')
  );
  
  const [education, setEducation] = useState<Education[]>(() =>
    loadFromLocalStorage('resume_education', [])
  );
  
  const [experience, setExperience] = useState<Experience[]>(() =>
    loadFromLocalStorage('resume_experience', [])
  );
  
  const [projects, setProjects] = useState<Project[]>(() => {
    const savedProjects = loadFromLocalStorage<Project[]>('resume_projects', []);
    // Migrate old project format to new format
    return savedProjects.map((proj) => {
      const anyProj = proj as unknown as Record<string, string | string[]>;
      // If project has old structure, convert it
      if (typeof anyProj.technologies === 'string' || 'description' in anyProj || 'link' in anyProj) {
        return {
          id: (anyProj.id as string) || Date.now().toString(),
          name: (anyProj.name as string) || '',
          technologies: typeof anyProj.technologies === 'string' 
            ? (anyProj.technologies as string).split(',').map((t: string) => t.trim()).filter(Boolean)
            : (proj.technologies || []),
          bulletPoints: anyProj.description ? [anyProj.description as string] : (proj.bulletPoints || []),
        };
      }
      // Already in new format
      return proj;
    });
  });
  
  const [skills, setSkills] = useState<string[]>(() =>
    loadFromLocalStorage('resume_skills', [])
  );
  
  const [leadership, setLeadership] = useState<Leadership[]>(() => {
    const savedLeadership = loadFromLocalStorage<Leadership[]>('resume_leadership', []);
    // Migrate old leadership format to new format
    return savedLeadership.map((lead) => {
      const anyLead = lead as unknown as Record<string, string | string[]>;
      // If leadership has old structure with description, convert it
      if ('description' in anyLead && !('bulletPoints' in anyLead)) {
        return {
          id: (anyLead.id as string) || Date.now().toString(),
          title: (anyLead.title as string) || '',
          organization: (anyLead.organization as string) || '',
          startDate: (anyLead.startDate as string) || '',
          endDate: (anyLead.endDate as string) || '',
          bulletPoints: anyLead.description ? [anyLead.description as string] : [''],
        };
      }
      // Already in new format
      return lead;
    });
  });

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Save currentStep to localStorage
  useEffect(() => {
    localStorage.setItem('resume_currentStep', JSON.stringify(currentStep));
  }, [currentStep]);

  // Save visitedSteps to localStorage
  useEffect(() => {
    localStorage.setItem('resume_visitedSteps', JSON.stringify(Array.from(visitedSteps)));
  }, [visitedSteps]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('resume_personalInfo', JSON.stringify(personalInfo));
  }, [personalInfo]);

  useEffect(() => {
    localStorage.setItem('resume_summary', JSON.stringify(summary));
  }, [summary]);

  useEffect(() => {
    localStorage.setItem('resume_education', JSON.stringify(education));
  }, [education]);

  useEffect(() => {
    localStorage.setItem('resume_experience', JSON.stringify(experience));
  }, [experience]);

  useEffect(() => {
    localStorage.setItem('resume_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('resume_skills', JSON.stringify(skills));
  }, [skills]);

  useEffect(() => {
    localStorage.setItem('resume_leadership', JSON.stringify(leadership));
  }, [leadership]);

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

  // Check if resume exceeds one page (A4 ratio: 210mm x 297mm = 1:1.414)
  const checkPageOverflow = useCallback(() => {
    const resumeElement = document.getElementById('resume-content');
    if (!resumeElement) return;

    // A4 aspect ratio is 1:1.414 (width:height)
    // We'll calculate based on a standard A4 at 96 DPI: 794px x 1123px
    const a4HeightAtWidth = resumeElement.offsetWidth * 1.414;
    const contentHeight = resumeElement.scrollHeight;
    
    const exceeds = contentHeight > a4HeightAtWidth;
    const overflowPercent = exceeds ? Math.round(((contentHeight - a4HeightAtWidth) / a4HeightAtWidth) * 100) : 0;
    
    setExceedsOnePage(exceeds);
    setPageOverflowPercentage(overflowPercent);
  }, []);

  // Check page overflow whenever resume data changes
  useEffect(() => {
    // Small delay to allow DOM to update
    const timer = setTimeout(checkPageOverflow, 100);
    return () => clearTimeout(timer);
  }, [resumeData, checkPageOverflow]);

  // Clear localStorage
  const clearResumeData = () => {
    localStorage.removeItem('resume_currentStep');
    localStorage.removeItem('resume_visitedSteps');
    localStorage.removeItem('resume_personalInfo');
    localStorage.removeItem('resume_summary');
    localStorage.removeItem('resume_education');
    localStorage.removeItem('resume_experience');
    localStorage.removeItem('resume_projects');
    localStorage.removeItem('resume_skills');
    localStorage.removeItem('resume_leadership');
  };

  // Handle navigation after download
  const handleGoHome = () => {
    clearResumeData();
    navigate('/');
  };

  const handleMakeAnother = () => {
    clearResumeData();
    setIsDownloadModalOpen(false);
    setDownloadComplete(false);
    // Reset to first step
    window.location.reload();
  };

  // Validate all mandatory sections before download
  const validateAllMandatorySections = (): boolean => {
    // 1. Personal Info - mandatory fields
    if (!personalInfo.firstName.trim()) {
      toast.error('Please fill in your First Name in Personal Info section');
      setCurrentStep(1);
      return false;
    }
    if (!personalInfo.lastName.trim()) {
      toast.error('Please fill in your Last Name in Personal Info section');
      setCurrentStep(1);
      return false;
    }
    if (!personalInfo.email.trim() || !personalInfo.email.includes('@')) {
      toast.error('Please provide a valid Email in Personal Info section');
      setCurrentStep(1);
      return false;
    }

    // 2. Summary - mandatory
    if (!summary.trim()) {
      toast.error('Please add a Professional Summary');
      setCurrentStep(2);
      return false;
    }

    // 3. Education - at least one complete entry
    if (education.length === 0) {
      toast.error('Please add at least one Education entry');
      setCurrentStep(3);
      return false;
    }
    for (const edu of education) {
      if (!edu.university.trim()) {
        toast.error('Please complete all Education fields (University is required)');
        setCurrentStep(3);
        return false;
      }
      if (!edu.degree.trim()) {
        toast.error('Please complete all Education fields (Degree is required)');
        setCurrentStep(3);
        return false;
      }
      if (!edu.field.trim()) {
        toast.error('Please complete all Education fields (Field of Study is required)');
        setCurrentStep(3);
        return false;
      }
    }

    // 4. Skills - at least one skill
    if (skills.length === 0) {
      toast.error('Please add at least one Skill');
      setCurrentStep(6);
      return false;
    }

    return true;
  };

  // Handle PDF Download
  const handleDownloadPDF = async () => {
    // Validate all mandatory sections first
    if (!validateAllMandatorySections()) {
      return;
    }

    const resumeElement = document.getElementById('resume-content');
    if (!resumeElement) {
      console.error('Resume element not found');
      toast.error('Resume preview not found');
      return;
    }

    // Open modal and start downloading
    setIsDownloadModalOpen(true);
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

  // Validate current step before moving to next
  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
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
        // Check if all education entries have required fields filled
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
            // Check if current is false, then endDate is required
            if (!exp.current && !exp.endDate) {
              toast.error('Please select the End Date or check "I currently work here"');
              return false;
            }
            // Check if at least one bullet point has content
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
            if (proj.bulletPoints.length === 0) {
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

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      if (!validateCurrentStep()) {
        return; // Don't proceed if validation fails
      }
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

  // Check if all mandatory sections are complete
  const isMandatorySectionsComplete = useMemo(() => {
    return (
      personalInfo.firstName.trim() !== '' &&
      personalInfo.lastName.trim() !== '' &&
      personalInfo.email.trim() !== '' &&
      personalInfo.email.includes('@') &&
      summary.trim() !== '' &&
      education.length > 0 &&
      education.every(edu => edu.university.trim() && edu.degree.trim() && edu.field.trim()) &&
      skills.length > 0
    );
  }, [personalInfo, summary, education, skills]);

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
              <button onClick={() => setIsATSModalOpen(true)} className="btn-secondary px-4 py-2">
                View Analysis
              </button>
              <button 
                onClick={handleDownloadPDF} 
                disabled={!isMandatorySectionsComplete}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  isMandatorySectionsComplete
                    ? 'btn-primary hover:opacity-90'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                title={!isMandatorySectionsComplete ? 'Please complete all mandatory sections: Personal Info, Summary, Education, and Skills' : 'Download your resume as PDF'}
              >
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

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left: Form Panel */}
          <div className="lg:col-span-5 space-y-6">
            {/* Current Form */}
            {renderCurrentForm()}

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
                {currentStep > 1 && (
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 bg-white border-2 border-luna-300 text-luna-500 font-semibold rounded-lg hover:bg-luna-50 transition-colors flex items-center gap-2"
                  >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Back
                  </button>
                )}
              </div>

              <span className="text-sm text-gray-600">
                Step {currentStep} of {STEPS.length}
              </span>

              <div className="flex-1 flex justify-end">
                {currentStep < STEPS.length && (
                  <button
                    onClick={handleNext}
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
      </main>

      {/* ATS Modal - Outside of main so it doesn't get blurred */}
      <ATSBreakdown 
        atsScore={atsScore} 
        isOpen={isATSModalOpen}
        onClose={() => setIsATSModalOpen(false)}
      />

      {/* Download Modal */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            {isDownloading ? (
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

export default ManualBuilder;
