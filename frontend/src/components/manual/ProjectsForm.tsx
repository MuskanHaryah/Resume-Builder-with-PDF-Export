import { FolderGit2, Plus, Trash2, Code, List, X } from 'lucide-react';
import { useState } from 'react';
import type { Project } from '../../types/resume';

interface ProjectsFormProps {
  data: Project[];
  onChange: (data: Project[]) => void;
}

const ProjectsForm = ({ data, onChange }: ProjectsFormProps) => {
  const [techInputs, setTechInputs] = useState<{ [key: string]: string }>({});

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

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-luna-500 flex items-center gap-2">
          <FolderGit2 className="w-6 h-6 text-luna-200" />
          Projects
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
          <li>• Use bullet points to describe your contributions and impact</li>
          <li>• Add technologies as individual items for better formatting</li>
          <li>• Focus on measurable achievements and outcomes</li>
        </ul>
      </div>
    </div>
  );
};

export default ProjectsForm;
