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

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Preview Header */}
      <div className="bg-gray-100 px-6 py-3 border-b border-gray-300">
        <h2 className="text-lg font-bold text-gray-800">Resume Preview</h2>
        <p className="text-xs text-gray-600">This is how your resume will look in the PDF</p>
      </div>

      {/* Resume Content - A4 Paper Simulation */}
      <div className="p-8 bg-white" style={{ fontFamily: 'Georgia, serif' }}>
        {/* HEADER - Personal Info */}
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-3xl font-bold text-black mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            {personalInfo.firstName || personalInfo.lastName
              ? `${personalInfo.firstName} ${personalInfo.lastName}`.trim()
              : 'Your Name'}
          </h1>
          <div className="text-sm text-black space-y-1" style={{ fontFamily: 'Arial, sans-serif' }}>
            {personalInfo.email && <div>{personalInfo.email}</div>}
            {personalInfo.phone && <div>{personalInfo.phone}</div>}
            {(personalInfo.linkedin || personalInfo.github) && (
              <div className="flex justify-center gap-4 flex-wrap">
                {personalInfo.linkedin && <span>LinkedIn: {personalInfo.linkedin}</span>}
                {personalInfo.github && <span>GitHub: {personalInfo.github}</span>}
              </div>
            )}
          </div>
        </div>

        {/* PROFESSIONAL SUMMARY */}
        {summary && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-black border-b border-black pb-1 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
              PROFESSIONAL SUMMARY
            </h2>
            <p className="text-sm text-black leading-relaxed" style={{ fontFamily: 'Arial, sans-serif' }}>
              {summary}
            </p>
          </div>
        )}

        {/* EDUCATION */}
        {education.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-black border-b border-black pb-1 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
              EDUCATION
            </h2>
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id} style={{ fontFamily: 'Arial, sans-serif' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-black text-sm">{edu.degree} in {edu.field}</div>
                      <div className="text-sm text-black">{edu.university}</div>
                    </div>
                    <div className="text-right text-sm text-black">
                      {edu.city && <div>{edu.city}</div>}
                      {(edu.startDate || edu.endDate) && (
                        <div>
                          {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WORK EXPERIENCE */}
        {experience.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-black border-b border-black pb-1 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
              WORK EXPERIENCE
            </h2>
            <div className="space-y-4">
              {experience.map((exp) => (
                <div key={exp.id} style={{ fontFamily: 'Arial, sans-serif' }}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <div className="font-bold text-black text-sm">{exp.title}</div>
                      <div className="text-sm text-black">{exp.company}</div>
                    </div>
                    <div className="text-sm text-black">
                      {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                    </div>
                  </div>
                  {exp.bulletPoints.length > 0 && exp.bulletPoints[0] && (
                    <ul className="list-none ml-0 mt-2 space-y-1">
                      {exp.bulletPoints.map((bullet, idx) => (
                        bullet && (
                          <li key={idx} className="text-sm text-black flex">
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
          <div className="mb-6">
            <h2 className="text-lg font-bold text-black border-b border-black pb-1 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
              PROJECTS
            </h2>
            <div className="space-y-3">
              {projects.map((project) => (
                <div key={project.id} style={{ fontFamily: 'Arial, sans-serif' }}>
                  <div className="font-bold text-black text-sm flex items-center gap-2">
                    {project.name}
                    {project.link && (
                      <span className="text-xs font-normal">({project.link})</span>
                    )}
                  </div>
                  {project.technologies && (
                    <div className="text-sm text-black italic">
                      Technologies: {project.technologies}
                    </div>
                  )}
                  {project.description && (
                    <div className="text-sm text-black mt-1">
                      {project.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SKILLS */}
        {skills.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-black border-b border-black pb-1 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
              SKILLS
            </h2>
            <div className="text-sm text-black" style={{ fontFamily: 'Arial, sans-serif' }}>
              {skills.join(' • ')}
            </div>
          </div>
        )}

        {/* LEADERSHIP & ACTIVITIES */}
        {leadership.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-black border-b border-black pb-1 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
              LEADERSHIP & ACTIVITIES
            </h2>
            <div className="space-y-3">
              {leadership.map((lead) => (
                <div key={lead.id} style={{ fontFamily: 'Arial, sans-serif' }}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <div className="font-bold text-black text-sm">{lead.title}</div>
                      <div className="text-sm text-black">{lead.organization}</div>
                    </div>
                    {(lead.startDate || lead.endDate) && (
                      <div className="text-sm text-black">
                        {formatDate(lead.startDate)} - {formatDate(lead.endDate)}
                      </div>
                    )}
                  </div>
                  {lead.description && (
                    <div className="text-sm text-black mt-1">
                      {lead.description}
                    </div>
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
