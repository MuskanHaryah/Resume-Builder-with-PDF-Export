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
  location: string;
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
  link?: string;
}

export interface ATSScore {
  totalScore: number;
  breakdown: {
    contactInfo: number;
    summary: number;
    experience: number;
    education: number;
    skills: number;
    projects: number;
    formatting: number;
  };
  feedback: string[];
  grade: string;
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
