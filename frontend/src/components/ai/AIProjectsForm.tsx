import React, { useState } from 'react';
import { FolderGit2, Plus, Trash2, Code, List, X, Sparkles, Loader2 } from 'lucide-react';
import type { Project } from '../../types/resume';

interface AIProjectsFormProps {
  data: Project[];
  onChange: (data: Project[]) => void;
  jobDescription: string;
  aiMode?: boolean;
}

const AIProjectsForm: React.FC<AIProjectsFormProps> = ({ 
  data, 
  onChange, 
  jobDescription,
  aiMode = true 
}) => {
  const [techInputs, setTechInputs] = useState<{ [key: string]: string }>({});
  const [loadingDescription, setLoadingDescription] = useState<Record<string, boolean>>({});
  const [suggestedBullets, setSuggestedBullets] = useState<Record<string, string[]>>({});
  const [showSuggestions, setShowSuggestions] = useState<Record<string, boolean>>({});

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: '',
      technologies: [],
      bulletPoints: [''],
    };
    onChange([...data, newProject]);
  };

  const removeProject = (id: string) => {
    onChange(data.filter((proj) => proj.id !== id));
    // Clean up state
    setSuggestedBullets(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
    setShowSuggestions(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  };

  const updateProject = (id: string, field: keyof Project, value: string | string[]) => {
    onChange(
      data.map((proj) =>
        proj.id === id ? { ...proj, [field]: value } : proj
      )
    );
  };

  const addTechnology = (projectId: string) => {
    const trimmedTech = (techInputs[projectId] || '').trim();
    const project = data.find((p) => p.id === projectId);
    if (trimmedTech && project && !project.technologies.includes(trimmedTech)) {
      updateProject(projectId, 'technologies', [...project.technologies, trimmedTech]);
      setTechInputs({ ...techInputs, [projectId]: '' });
    }
  };

  const removeTechnology = (projectId: string, techToRemove: string) => {
    const project = data.find((p) => p.id === projectId);
    if (project) {
      updateProject(
        projectId,
        'technologies',
        project.technologies.filter((tech) => tech !== techToRemove)
      );
    }
  };

  const addBulletPoint = (projectId: string) => {
    const project = data.find((p) => p.id === projectId);
    if (project) {
      updateProject(projectId, 'bulletPoints', [...project.bulletPoints, '']);
    }
  };

  const removeBulletPoint = (projectId: string, index: number) => {
    const project = data.find((p) => p.id === projectId);
    if (project) {
      const newBullets = project.bulletPoints.filter((_, i) => i !== index);
      updateProject(projectId, 'bulletPoints', newBullets);
    }
  };

  const updateBulletPoint = (projectId: string, index: number, value: string) => {
    const project = data.find((p) => p.id === projectId);
    if (project) {
      const newBullets = [...project.bulletPoints];
      newBullets[index] = value;
      updateProject(projectId, 'bulletPoints', newBullets);
    }
  };

  // Generate AI description for a project
  const generateDescription = async (project: Project) => {
    if (!project.name) {
      alert('Please enter a project name first');
      return;
    }
    
    setLoadingDescription(prev => ({ ...prev, [project.id]: true }));
    try {
      const response = await fetch('http://localhost:5000/api/ai/generate-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          jobDescription,
          projectName: project.name,
          technologies: project.technologies,
          existingDescription: project.bulletPoints.filter(b => b.trim()).join(' ')
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate description');
      }
      
      setSuggestedBullets(prev => ({ ...prev, [project.id]: result.data }));
      setShowSuggestions(prev => ({ ...prev, [project.id]: true }));
    } catch (error) {
      console.error('Failed to generate description:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate project description');
    } finally {
      setLoadingDescription(prev => ({ ...prev, [project.id]: false }));
    }
  };

  // Add a suggested bullet point to the project
  const addSuggestedBullet = (projectId: string, bullet: string) => {
    const project = data.find((p) => p.id === projectId);
    if (project) {
      const newBullets = [...project.bulletPoints.filter(b => b.trim()), bullet];
      updateProject(projectId, 'bulletPoints', newBullets);
      // Remove used bullet from suggestions
      setSuggestedBullets(prev => ({
        ...prev,
        [projectId]: prev[projectId]?.filter(b => b !== bullet) || []
      }));
    }
  };

  // Dismiss suggestions for a project
  const dismissSuggestions = (projectId: string) => {
    setShowSuggestions(prev => ({ ...prev, [projectId]: false }));
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-luna-500 flex items-center gap-2">
          <FolderGit2 className="w-6 h-6 text-luna-200" />
          Projects
          {aiMode && (
            <span className="ml-2 px-2 py-0.5 bg-luna-100 text-luna-300 text-xs font-medium rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI-Powered
            </span>
          )}
        </h3>
        <button
          onClick={addProject}
          className="btn-secondary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Project
        </button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FolderGit2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No projects added yet</p>
          <button onClick={addProject} className="btn-primary flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" />
            Add Your First Project
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {data.map((project, index) => (
            <div
              key={project.id}
              className="border border-gray-200 rounded-lg p-6 space-y-4 bg-gray-50 hover:shadow-luna transition-shadow"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-luna-500">Project #{index + 1}</h4>
                <button
                  onClick={() => removeProject(project.id)}
                  className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove this project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Project Name */}
                <div>
                  <label htmlFor={`name-${project.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`name-${project.id}`}
                    type="text"
                    value={project.name}
                    onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                    className="input-field"
                    placeholder="e.g., E-commerce Platform"
                  />
                </div>

                {/* Technologies */}
                <div>
                  <label htmlFor={`technologies-${project.id}`} className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Code className="w-4 h-4 text-luna-200" />
                    Technologies Used <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      id={`technologies-${project.id}`}
                      type="text"
                      value={techInputs[project.id] || ''}
                      onChange={(e) => setTechInputs({ ...techInputs, [project.id]: e.target.value })}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTechnology(project.id);
                        }
                      }}
                      className="input-field flex-1"
                      placeholder="e.g., React, Node.js, MongoDB"
                    />
                    <button
                      type="button"
                      onClick={() => addTechnology(project.id)}
                      className="btn-primary flex items-center gap-2"
                      disabled={!techInputs[project.id]?.trim()}
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Press Enter or click Add to add a technology
                  </p>
                  
                  {/* Technologies Display */}
                  {project.technologies.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Technologies ({project.technologies.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, idx) => (
                          <div
                            key={idx}
                            className="badge-primary"
                          >
                            <span>{tech}</span>
                            <button
                              type="button"
                              onClick={() => removeTechnology(project.id, tech)}
                              className="hover:bg-luna-300 rounded-full p-0.5 transition-colors"
                              title={`Remove ${tech}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Generate Description Button */}
                {aiMode && (
                  <div>
                    <button
                      onClick={() => generateDescription(project)}
                      disabled={loadingDescription[project.id] || !project.name}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        loadingDescription[project.id] || !project.name
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-luna-200 text-white hover:bg-luna-300 shadow-sm'
                      }`}
                    >
                      {loadingDescription[project.id] ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate AI Description
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* AI Suggested Bullets */}
                {aiMode && showSuggestions[project.id] && suggestedBullets[project.id]?.length > 0 && (
                  <div className="bg-gradient-to-r from-luna-50 to-white border-2 border-luna-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-luna-400 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        AI Suggested Description
                      </span>
                      <button
                        onClick={() => dismissSuggestions(project.id)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Dismiss
                      </button>
                    </div>
                    <div className="space-y-2">
                      {suggestedBullets[project.id].map((bullet, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 bg-white rounded-lg border border-luna-100">
                          <p className="flex-1 text-sm text-gray-700">{bullet}</p>
                          <button
                            onClick={() => addSuggestedBullet(project.id, bullet)}
                            className="px-3 py-1 bg-luna-200 text-white text-xs font-medium rounded-lg hover:bg-luna-300 transition-colors"
                          >
                            Use
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description as Bullet Points */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <List className="w-4 h-4 text-luna-200" />
                    Description <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    {project.bulletPoints.map((bullet, bulletIndex) => (
                      <div key={bulletIndex} className="flex gap-2">
                        <span className="text-luna-300 mt-3 font-bold">•</span>
                        <input
                          type="text"
                          value={bullet}
                          onChange={(e) => updateBulletPoint(project.id, bulletIndex, e.target.value)}
                          className="input-field flex-1"
                          placeholder="e.g., Developed responsive UI with React and TypeScript"
                        />
                        <button
                          type="button"
                          onClick={() => removeBulletPoint(project.id, bulletIndex)}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove bullet point"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addBulletPoint(project.id)}
                      className="text-luna-300 hover:text-luna-500 text-sm font-medium flex items-center gap-1 mt-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Bullet Point
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-luna-50 border border-luna-100 rounded-lg p-4 mt-6">
        <h4 className="font-semibold text-luna-500 text-sm mb-2">💡 Project Tips:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Highlight projects relevant to your target role</li>
          <li>• Include personal, academic, and professional projects</li>
          <li>• Use AI to generate descriptions, then customize them</li>
          <li>• Add technologies as individual items for better formatting</li>
          <li>• Focus on measurable achievements and outcomes</li>
        </ul>
      </div>
    </div>
  );
};

export default AIProjectsForm;
