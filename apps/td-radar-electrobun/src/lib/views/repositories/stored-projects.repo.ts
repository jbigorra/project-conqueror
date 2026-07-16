let storedProjects: string[] = [];

async function addProject(path: string): Promise<void> {
  if (!path) throw new Error("Selected path cannot be empty");

  storedProjects = [...storedProjects, path];
  localStorage.setItem("stored-projects", JSON.stringify(storedProjects));
}

async function getAll(): Promise<string[]> {
  if (storedProjects.length > 0) return storedProjects;

  const stringStoreRepositories =
    localStorage.getItem("stored-projects") ?? "[]";

  storedProjects = JSON.parse(stringStoreRepositories);

  return storedProjects;
}

export interface IStoredProjectsRepository {
  addProject: (path: string) => Promise<void>;
  getAll: () => Promise<string[]>;
}

export const storedProjectsRepository: IStoredProjectsRepository = {
  addProject,
  getAll,
};
