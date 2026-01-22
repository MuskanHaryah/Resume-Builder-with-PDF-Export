import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, FileText, ArrowRight, ArrowLeftIcon, Check } from 'lucide-react';
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

  // Handle PDF Download
  const handleDownloadPDF = async () => {
    const resumeElement = document.getElementById('resume-content');
    if (!resumeElement) {
      console.error('Resume element not found');
      toast.error('Resume preview not found');
      return;
    }

    console.log('Starting PDF generation...');
    console.log('Resume element:', resumeElement);
    console.log('Resume element dimensions:', {
      width: resumeElement.offsetWidth,
      height: resumeElement.offsetHeight,
      scrollHeight: resumeElement.scrollHeight
    });

    try {
      toast.loading('Generating PDF...', { id: 'pdf-loading' });

      // Wait a bit for any pending renders
      await new Promise(resolve => setTimeout(resolve, 300));

      console.log('Starting html2canvas...');
      
      // Capture the resume content as canvas
      const canvas = await html2canvas(resumeElement, {
        scale: 2,
        useCORS: false,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        foreignObjectRendering: false,
        onclone: (clonedDoc) => {
          // Remove all oklch colors from the cloned document
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el: any) => {
            const computedStyle = window.getComputedStyle(el);
            
            // Check each style property and replace oklch with hex fallback
            for (let i = 0; i < computedStyle.length; i++) {
              const prop = computedStyle[i];
              const value = computedStyle.getPropertyValue(prop);
              
              if (value && value.includes('oklch')) {
                // Replace oklch with transparent or white
                if (prop.includes('color') || prop.includes('background')) {
                  el.style.setProperty(prop, 'transparent', 'important');
                }
              }
            }
          });
          
          // Also strip all style tags that might contain oklch
          const styleTags = clonedDoc.querySelectorAll('style');
          styleTags.forEach((style) => {
            if (style.textContent && style.textContent.includes('oklch')) {
              style.textContent = style.textContent.replace(/oklch\([^)]+\)/g, 'transparent');
            }
          });
          
          // Fix icon alignment in PDF only
          const svgIcons = clonedDoc.querySelectorAll('svg');
          svgIcons.forEach((svg: any) => {
            svg.style.position = 'relative';
            svg.style.top = '3px';
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
      
      // Calculate image dimensions to fit A4 width
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      console.log('PDF dimensions:', {
        imgWidth,
        imgHeight,
        pageHeight,
        pages: Math.ceil(imgHeight / pageHeight)
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

      // Check if content fits on one page
      if (imgHeight <= pageHeight) {
        console.log('Adding single page...');
        // Single page - fits perfectly
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      } else {
        console.log('Adding multiple pages...');
        // Multi-page: split content across pages
        let heightLeft = imgHeight;
        let position = 0;
        let pageNum = 0;

        while (heightLeft > 0) {
          if (pageNum > 0) {
            pdf.addPage();
          }
          
          console.log(`Adding page ${pageNum + 1}, position: ${position}`);
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          
          heightLeft -= pageHeight;
          position -= pageHeight;
          pageNum++;
        }
      }

      // Download PDF
      const fileName = `resume_${personalInfo.firstName || 'my'}_${personalInfo.lastName || 'resume'}.pdf`;
      console.log('Saving PDF as:', fileName);
      pdf.save(fileName);
      
      toast.dismiss('pdf-loading');
      toast.success('PDF downloaded successfully!');
      console.log('PDF download complete!');
    } catch (error: any) {
      console.error('PDF download error - Full details:', error);
      console.error('Error name:', error?.name);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      toast.dismiss('pdf-loading');
      toast.error(`Failed to download PDF: ${error?.message || 'Unknown error'}`);
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
              <button onClick={handleDownloadPDF} className="btn-primary">
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
    </div>
  );
};

export default ManualBuilder;
