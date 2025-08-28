import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type Project from "../components/Project";
import { getAll, pushApiCall } from "../utils/idb";
import supabase from "../utils/supabase";

export type AddProject = {
    project_name: string;
    packageValue?: {
        name: string;
        description: string;
    }
    report?: {
        name: string;
        description: string;
    }
}

export type Package = {
    id: number;
    name: string;
    description: string;
    project_id: number;
}

export type Report = Omit<Package, 'project_id'> & {
    package_id: number
}


export type ProjectContextType = {
    projects: Project[],
    packages: Package[],
    reports: Report[],
    addAll: (data: AddProject) => void
    fetchPorjects: () => void
};

const ProjectContext = createContext<ProjectContextType>({
    projects: [],
    packages: [],
    reports: [],
    addAll: () => { },
    fetchPorjects: () => { }
});



export const ProjectProvider = ({ children }: { children: ReactNode }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [packages, setPackages] = useState<Package[]>([]);
    const [reports, setReports] = useState<Report[]>([]);

    const [online, setOnline] = useState(true)


    useEffect(() => {
        if (online) {
            getAll()
        }

    }, [online])

    const fetchPorjects = async () => {
        const { data } = await supabase
            .from("project")
            .select(`
          *,
    package (
      id,
      name,
      description,
      report (
        id,
        name,
        description
      )
    )
        `);
        const { data: packageRes } = await supabase.from("package").select("*")
        const { data: repoartRes } = await supabase.from("report").select("*")

        setProjects(data as Project[])
        setPackages(packageRes as Package[])
        setReports(repoartRes as Report[])
    }

    const addPackage = async (data: AddProject['packageValue'], project_id: number) => {
        if (online) {
            const packageData = await supabase.from("package").insert({
                ...data,
                project_id
            }).select()

            return packageData.data as Package[]
        } else {
            const project_id = new Date().getTime();

            await pushApiCall({
                type: "Package",
                data: {
                    ...data,
                }
            })

            return [{
                id: project_id,
                ...data
            }] as Package[]
        }
    }

    const addReport = async (data: AddProject['packageValue'], package_id: number) => {
        if (online) {
            const repoartData = await supabase.from("report").insert({
                ...data,
                package_id
            }).select()

            return repoartData.data as Report[]
        } else {
            const project_id = new Date().getTime();

            await pushApiCall({
                type: "Report",
                data: {
                    ...data,
                }
            })

            return [{
                id: project_id,
                ...data
            }] as Report[]
        }
    }


    const addProject = async (project_name: string) => {
        if (online) {
            const project = await supabase.from("project").insert({
                project_name: project_name,
            }).select()

            return project.data as Project[]
        } else {
            const project_id = new Date().getTime();

            await pushApiCall({
                type: "Project",
                data: {
                    project_name
                }
            })

            return [{
                id: project_id,
                project_name
            }] as Project[]
        }
    }

    const addAll = async ({
        project_name,
        packageValue,
        report
    }: AddProject) => {

        const project = await addProject(project_name)
        let packageData: Package[] = [];

        if (project.length && packageValue?.name && packageValue?.description) {
            packageData = await addPackage(packageValue, project[0].id)
        }

        let reportData: Report[] = [];
        if (packageData.length && report?.name && report?.description) {
            reportData = await addReport(report, packageData[0].id)
        }

        if (!!project) {
            setProjects(pre => [...pre, ...project])
        }
        return project
    }

    useEffect(() => {
        fetchPorjects()
    }, [])

    return <ProjectContext.Provider value={{ projects, packages, reports, fetchPorjects, addAll }}>
        {online}
        <button onClick={() => { setOnline(!online) }}>
            {online ? 'Go Offline' : "Go Online"}
        </button>
        {children}
    </ProjectContext.Provider>
}

export const useProjects = () => {
    const projects = useContext(ProjectContext)
    return projects
}