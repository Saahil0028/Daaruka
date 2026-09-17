import { api } from './api';
import { Project, ProjectCreateInput } from '../types/project';

export const projectService = {
  async getProjects(search?: string, category?: string, status?: string): Promise<Project[]> {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (status) params.status = status;

    const res = await api.get<Project[]>('/projects', { params });
    return res.data;
  },

  async getProject(id: string): Promise<Project> {
    const res = await api.get<Project>(`/projects/${id}`);
    return res.data;
  },

  async createProject(input: ProjectCreateInput): Promise<Project> {
    const res = await api.post<Project>('/projects', input);
    return res.data;
  },

  async updateProject(id: string, input: Partial<ProjectCreateInput>): Promise<Project> {
    const res = await api.put<Project>(`/projects/${id}`, input);
    return res.data;
  },

  async deleteProject(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  }
};
