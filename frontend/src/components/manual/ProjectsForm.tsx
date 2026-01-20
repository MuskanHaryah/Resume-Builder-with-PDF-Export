import { FolderGit2, Plus, Trash2, Link as LinkIcon, Code } from 'lucide-react';
import type { Project } from '../../types/resume';

interface ProjectsFormProps {
  data: Project[];
  onChange: (data: Project[]) => void;
}

const ProjectsForm = ({ data, onChange }: ProjectsFormProps) => {
  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: '',
      technologies: '',
      description: '',
      link: '',
    };
    onChange([...data, newProject]);
  };

  const removeProject = (id: string) => {
    onChange(data.filter((proj) => proj.id !== id));
  };

  const updateProject = (id: string, field: keyof Project, value: string) => {
    onChange(
      data.map((proj) =>
        proj.id === id ? { ...proj, [field]: value } : proj
      )
    );
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
                  <input
                    id={`technologies-${project.id}`}
                    type="text"
                    value={project.technologies}
                    onChange={(e) => updateProject(project.id, 'technologies', e.target.value)}
                    className="input-field"
                    placeholder="e.g., React, Node.js, MongoDB, Tailwind CSS"
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor={`description-${project.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id={`description-${project.id}`}
                    value={project.description}
                    onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                    rows={3}
                    className="input-field resize-none"
                    placeholder="Brief description of the project, your role, and key achievements..."
                  />
                </div>

                {/* Link */}
                <div>
                  <label htmlFor={`link-${project.id}`} className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <LinkIcon className="w-4 h-4 text-luna-200" />
                    Project Link (GitHub/Demo)
                  </label>
                  <input
                    id={`link-${project.id}`}
                    type="url"
                    value={project.link}
                    onChange={(e) => updateProject(project.id, 'link', e.target.value)}
                    className="input-field"
                    placeholder="https://github.com/username/project"
                  />
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
          <li>• Focus on impact and technical complexity</li>
          <li>• Always include a link to GitHub or live demo if available</li>
          <li>• Mention specific technologies and tools used</li>
        </ul>
      </div>
    </div>
  );
};

export default ProjectsForm;
