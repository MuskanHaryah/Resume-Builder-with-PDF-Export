export interface PersonalInfo {
  firstName: string;
  lastName: string;
  address: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
}

export interface Education {
  id: string;
  university: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  city: string;
}

export interface Experience {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bulletPoints: string[];
}

export interface Project {
  id: string;
  name: string;
  technologies: string[];
  bulletPoints: string[];
}

export interface Leadership {
  id: string;
  title: string;
  organization: string;
  startDate: string;
  endDate: string;
  bulletPoints: string[];
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: string[];
  leadership: Leadership[];
}
