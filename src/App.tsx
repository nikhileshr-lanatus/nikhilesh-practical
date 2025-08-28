import { ToastContainer } from 'react-toastify'
import './App.css'
import Project from './components/Project'
import { AuthProvider } from './context/authContext'
import { ProjectProvider } from './context/projectContext'

function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <Project />
        <ToastContainer />
      </ProjectProvider>
    </AuthProvider>
  )
}

export default App
