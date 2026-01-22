import type { ResumeData } from '../../types/resume';

interface ResumePreviewProps {
  data: ResumeData;
}

const ResumePreview = ({ data }: ResumePreviewProps) => {
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
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Preview Header */}
      <div className="bg-gray-100 px-6 py-3 border-b border-gray-300">
        <h2 className="text-lg font-bold text-gray-800">Resume Preview</h2>
        <p className="text-xs text-gray-600">This is how your resume will look in the PDF</p>
      </div>

      {/* Resume Content - A4 Paper Simulation */}
      <div className="p-6 bg-white min-h-[600px]" style={{ fontFamily: 'Times New Roman, Georgia, serif' }}>
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

        {/* Contact Information Row - All in one line with icons */}
        <div className="text-center text-xs text-black mb-3" style={{ fontFamily: 'Arial, sans-serif' }}>
          <div className="flex justify-center items-center gap-3 flex-wrap">
            {personalInfo.phone && (
              <span className="flex items-center gap-1">
                <span style={{ fontSize: '10px' }}>📞</span>
                <span>{personalInfo.phone}</span>
              </span>
            )}
            {personalInfo.email && (
              <span className="flex items-center gap-1">
                <span style={{ fontSize: '10px' }}>✉️</span>
                <span>{personalInfo.email}</span>
              </span>
            )}
            {personalInfo.linkedin && (
              <span className="flex items-center gap-1">
                <span style={{ fontSize: '10px' }}>🔗</span>
                <span>{getLinkedInUsername(personalInfo.linkedin)}</span>
              </span>
            )}
            {personalInfo.github && (
              <span className="flex items-center gap-1">
                <span style={{ fontSize: '10px' }}>🐙</span>
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
                        <div>{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</div>
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
                    <div className="text-black">
                      {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                    </div>
                  </div>
                  <div className="italic text-black mb-1">{exp.title}</div>
                  {exp.bulletPoints.length > 0 && exp.bulletPoints[0] && (
                    <ul className="list-none ml-0 space-y-0.5">
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
                    <ul className="list-none ml-0 space-y-0.5 mt-1">
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
                      <div className="text-black">
                        {formatDate(lead.startDate)} - {formatDate(lead.endDate)}
                      </div>
                    )}
                  </div>
                  <div className="italic text-black">{lead.title}</div>
                  {lead.bulletPoints.length > 0 && lead.bulletPoints[0] && (
                    <ul className="list-none ml-0 mt-0.5 space-y-0.5">
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
};

export default ResumePreview;
