import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext'
import { StashProvider } from "./contexts/StashContext";
import { ProjectsProvider } from "./contexts/ProjectsContext";
import Layout from "./components/Layout";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const Projects = lazy(() => import("./pages/projects/Projects"));
const AddProject = lazy(() => import("./pages/projects/AddProject"));
const EditProject = lazy(() => import("./pages/projects/EditProject"));
const ProjectDetail = lazy(() => import("./pages/projects/ProjectDetail"));
const Stash = lazy(() => import("./pages/stash/Stash"));
const YarnDetail = lazy(() => import("./pages/stash/YarnDetail"));
const AddYarn = lazy(() => import("./pages/stash/AddYarn"));
const EditYarn = lazy(() => import("./pages/stash/EditYarn"));
const NotFound = lazy(() => import("./pages/NotFound"));

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StashProvider>
          <ProjectsProvider>
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />

                  <Route path="projects" element={<Projects />} />
                  <Route path="projects/:projectId" element={<ProjectDetail />} />
                  <Route path="addProject" element={<AddProject />} />
                  <Route path="editProject/:projectId" element={<EditProject />} />

                  <Route path="stash" element={<Stash />} />
                  <Route path="stash/:yarnId" element={<YarnDetail />} />
                  <Route path="addYarn" element={<AddYarn />} />
                  <Route path="editYarn/:yarnId" element={<EditYarn />} />

                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Suspense>
          </ProjectsProvider>
        </StashProvider>
      </AuthProvider>
    </BrowserRouter>

  );
}

export default App
