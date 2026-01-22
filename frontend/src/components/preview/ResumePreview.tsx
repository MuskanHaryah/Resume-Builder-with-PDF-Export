import { forwardRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { ResumeData } from '../../types/resume';

// Inline SVG icons for reliable PDF capture (no external image loading issues)
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
  </svg>
);

const EmailIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

interface ResumePreviewProps {
  data: ResumeData;
  exceedsOnePage?: boolean;
  overflowPercentage?: number;
}

const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(({ data, exceedsOnePage = false, overflowPercentage = 0 }, ref) => {
  const { personalInfo, summary, education, experience, projects, skills, leadership } = data;

  // Format date from YYYY-MM to Month YYYY
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Extract LinkedIn username from URL
  const getLinkedInUsername = (url: string) => {
    if (!url) return '';
    const match = url.match(/linkedin\.com\/in\/([^\/\?]+)/);
    return match ? `linkedin.com/in/${match[1]}` : url;
  };

  // Extract GitHub username from URL
  const getGitHubUsername = (url: string) => {
    if (!url) return '';
    const match = url.match(/github\.com\/([^\/\?]+)/);
    return match ? `github.com/${match[1]}` : url;
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-visible">
      {/* Preview Header */}
      <div className="bg-gray-100 px-6 py-3 border-b border-gray-300 flex justify-between items-start">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Resume Preview</h2>
          <p className="text-xs text-gray-600">This is how your resume will look in the PDF</p>
        </div>
        {/* Page Overflow Warning */}
        {exceedsOnePage && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 text-amber-800 px-3 py-1.5 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <div className="text-xs">
              <span className="font-semibold">Exceeds 1 page</span>
              <span className="text-amber-700 ml-1">({overflowPercentage}% over)</span>
            </div>
          </div>
        )}
      </div>

      {/* Resume Content */}
      <div 
        ref={ref}
        id="resume-content"
        className="p-6 bg-white overflow-visible"
        style={{ fontFamily: 'Times New Roman, Georgia, serif' }}
      >
        {/* HEADER - Name (Italic, Centered) */}
        <div className="text-center mb-1">
          <h1 
            className="text-2xl text-black" 
            style={{ fontFamily: 'Georgia, Times New Roman, serif', fontStyle: 'italic', fontWeight: 'normal' }}
          >
            {personalInfo.firstName || personalInfo.lastName
              ? `${personalInfo.firstName} ${personalInfo.lastName}`.trim()
              : 'Your Name'}
          </h1>
        </div>

        {/* Address Line */}
        {personalInfo.address && (
          <div className="text-center text-xs text-black mb-1" style={{ fontFamily: 'Arial, sans-serif' }}>
            {personalInfo.address}
          </div>
        )}

        {/* Contact Information Row - All in one line with inline SVG icons */}
        <div className="text-center text-xs text-black mb-3" style={{ fontFamily: 'Arial, sans-serif' }}>
          <div className="flex justify-center items-center gap-4 flex-wrap">
            {personalInfo.phone && (
              <span className="flex items-center gap-1">
                <PhoneIcon />
                <span>{personalInfo.phone}</span>
              </span>
            )}
            {personalInfo.email && (
              <span className="flex items-center gap-1">
                <EmailIcon />
                <span>{personalInfo.email}</span>
              </span>
            )}
            {personalInfo.linkedin && (
              <span className="flex items-center gap-1">
                <LinkedInIcon />
                <span>{getLinkedInUsername(personalInfo.linkedin)}</span>
              </span>
            )}
            {personalInfo.github && (
              <span className="flex items-center gap-1">
                <GitHubIcon />
                <span>{getGitHubUsername(personalInfo.github)}</span>
              </span>
            )}
          </div>
        </div>

        {/* EDUCATION - First Section */}
        {education.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-black border-b border-black pb-0.5 mb-2 uppercase tracking-wide">
              Education
            </h2>
            <div className="space-y-2">
              {education.map((edu) => (
                <div key={edu.id} style={{ fontFamily: 'Arial, sans-serif' }} className="text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-black">{edu.university}</div>
                      <div className="text-black italic">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</div>
                    </div>
                    <div className="text-right text-black">
                      {(edu.startDate || edu.endDate) && (
                        <div className="font-bold">{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</div>
                      )}
                      {edu.city && <div>{edu.city}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUMMARY */}
        {summary && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-black border-b border-black pb-0.5 mb-2 uppercase tracking-wide">
              Summary
            </h2>
            <p className="text-xs text-black leading-relaxed" style={{ fontFamily: 'Arial, sans-serif' }}>
              {summary}
            </p>
          </div>
        )}

        {/* EXPERIENCE */}
        {experience.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-black border-b border-black pb-0.5 mb-2 uppercase tracking-wide">
              Experience
            </h2>
            <div className="space-y-3">
              {experience.map((exp) => (
                <div key={exp.id} style={{ fontFamily: 'Arial, sans-serif' }} className="text-xs">
                  <div className="flex justify-between items-start mb-0.5">
                    <div>
                      <span className="font-bold text-black">{exp.company}</span>
                    </div>
                    <div className="text-right text-black">
                      <div className="font-bold">{formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}</div>
                      {exp.location && <div>{exp.location}</div>}
                    </div>
                  </div>
                  <div className="italic text-black mb-1">{exp.title}</div>
                  {exp.bulletPoints.length > 0 && exp.bulletPoints[0] && (
                    <ul className="list-none ml-4 space-y-0.5">
                      {exp.bulletPoints.map((bullet, idx) => (
                        bullet && (
                          <li key={idx} className="text-black flex">
                            <span className="mr-2">•</span>
                            <span className="flex-1">{bullet}</span>
                          </li>
                        )
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROJECTS */}
        {projects.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-black border-b border-black pb-0.5 mb-2 uppercase tracking-wide">
              Projects
            </h2>
            <div className="space-y-2">
              {projects.map((project) => (
                <div key={project.id} style={{ fontFamily: 'Arial, sans-serif' }} className="text-xs">
                  <div className="font-bold text-black">
                    {project.name}
                    {project.technologies.length > 0 && (
                      <span className="font-normal"> | <span className="italic">{project.technologies.join(', ')}</span></span>
                    )}
                  </div>
                  {project.bulletPoints.length > 0 && project.bulletPoints[0] && (
                    <ul className="list-none ml-4 space-y-0.5 mt-1">
                      {project.bulletPoints.map((bullet, idx) => (
                        bullet && (
                          <li key={idx} className="text-black flex">
                            <span className="mr-2">•</span>
                            <span className="flex-1">{bullet}</span>
                          </li>
                        )
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TECHNICAL SKILLS */}
        {skills.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-black border-b border-black pb-0.5 mb-2 uppercase tracking-wide">
              Technical Skills
            </h2>
            <div className="text-xs text-black" style={{ fontFamily: 'Arial, sans-serif' }}>
              <div>
                <span className="font-bold">Skills:</span> {skills.join(', ')}
              </div>
            </div>
          </div>
        )}

        {/* LEADERSHIP & EXTRACURRICULAR */}
        {leadership.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-black border-b border-black pb-0.5 mb-2 uppercase tracking-wide">
              Leadership / Extracurricular
            </h2>
            <div className="space-y-2">
              {leadership.map((lead) => (
                <div key={lead.id} style={{ fontFamily: 'Arial, sans-serif' }} className="text-xs">
                  <div className="flex justify-between items-start mb-0.5">
                    <div>
                      <span className="font-bold text-black">{lead.organization}</span>
                    </div>
                    {(lead.startDate || lead.endDate) && (
                      <div className="text-black font-bold">
                        {formatDate(lead.startDate)} - {formatDate(lead.endDate)}
                      </div>
                    )}
                  </div>
                  <div className="italic text-black">{lead.title}</div>
                  {lead.bulletPoints.length > 0 && lead.bulletPoints[0] && (
                    <ul className="list-none ml-4 mt-0.5 space-y-0.5">
                      {lead.bulletPoints.map((bullet, idx) => (
                        bullet && (
                          <li key={idx} className="text-black flex">
                            <span className="mr-2">•</span>
                            <span className="flex-1">{bullet}</span>
                          </li>
                        )
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!personalInfo.firstName &&
          !personalInfo.lastName &&
          !summary &&
          education.length === 0 &&
          experience.length === 0 &&
          projects.length === 0 &&
          skills.length === 0 &&
          leadership.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg mb-2">Your resume preview will appear here</p>
              <p className="text-sm">Start filling out the form to see your resume take shape</p>
            </div>
          )}
      </div>
    </div>
  );
});

ResumePreview.displayName = 'ResumePreview';

export default ResumePreview;
