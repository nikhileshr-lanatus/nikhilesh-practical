import { useEffect, useState } from 'react';
import { useAuth } from '../context/authContext';
import SignIn from './SignIn';
import supabase from '../utils/supabase';
import { useProjects, type Package, type Report } from '../context/projectContext';
import { toast } from 'react-toastify';

type Project = {
    project_name: string
    id: number,
    package: Package[] & {
        report: Report[]
    }
}

type PackageInput = {
    name?: string;
    description?: string;
}

type ReportInput = PackageInput

const Project = () => {
    const { user } = useAuth();
    const { projects } = useProjects();


    if (!user?.id) {
        return <SignIn />
    }

    return (
        <div style={{
            height: "max-content",
            border: "2px solid white",
            padding: "20px"
        }}>
            <h3>
                User:  {user?.id ? user.id : ''}
            </h3>

            <CreateProject />

            <div style={{ marginTop: "15px", display: "flex", flexDirection: 'column', gap: "5px" }}>
                {
                    projects.map((project: Project) => {
                        return <div style={{
                            border: "1px solid white",
                            borderRadius: "3px",

                        }}>
                            Project: {
                                project.project_name
                            }
                        </div>
                    })
                }
            </div>

        </div>
    )
}

export default Project

const CreateProject = () => {
    const [projectName, setProjectName] = useState("");
    const [packageValue, setPackage] = useState<PackageInput>()
    const [report, setReport] = useState<ReportInput>()

    const { addAll: addProject } = useProjects();
    const onSubmit = async () => {
        if (projectName.trim().length === 0) {
            toast.error("Please type valid project name");
            return
        }

        await addProject({
            project_name: projectName, packageValue: {
                name: packageValue?.name as string,
                description: packageValue?.description as string
            },
            report: {
                name: report?.name as string,
                description: report?.description as string
            }
        })
        setProjectName('')
    }

    return <div style={{
        display: 'flex',
        justifyContent: "space-between"
    }}>
        <input placeholder='Project Name*' required value={projectName} onChange={e => setProjectName(e.target.value)} />
        <input placeholder='Package Name' value={packageValue?.name} onChange={e => setPackage(prev => ({ ...prev, name: e.target.value }))} />
        <input placeholder='Package Name' value={packageValue?.description} onChange={e => setPackage(prev => ({ ...prev, description: e.target.value }))} />
        <input placeholder='Report Name' value={report?.name} onChange={e => setReport(prev => ({ ...prev, name: e.target.value }))} />
        <input placeholder='Report Name' value={report?.description} onChange={e => setReport(prev => ({ ...prev, description: e.target.value }))} />
        <button onClick={onSubmit}>
            Create Project
        </button>
    </div>
}