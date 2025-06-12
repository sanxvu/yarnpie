import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import NotFound from "./pages/NotFound";

const Projects = lazy(() => import("./pages/projects/Projects"));
const AddProject = lazy(() => import("./pages/projects/AddProject"));
const EditProject = lazy(() => import("./pages/projects/EditProject"));
const ProjectDetail = lazy(() => import("./pages/projects/ProjectDetail"));

const Stash = lazy(() => import("./pages/stash/Stash"));
const YarnDetail = lazy(() => import("./pages/stash/YarnDetail"));
const AddYarn = lazy(() => import("./pages/stash/AddYarn"));
const EditYarn = lazy(() => import("./pages/stash/EditYarn"));

import { ProjectsProvider } from "./contexts/ProjectsContext";
import { StashProvider } from "./contexts/StashContext";

// Protected Route component
function ProtectedRoute({ children }) {
  const { userLoggedIn } = useAuth();
  
  if (!userLoggedIn) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            {/* Projects routes with Suspense and context */}
            <Route
              path="projects"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<></>}>
                    <ProjectsProvider>
                      <Projects />
                    </ProjectsProvider>
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="projects/:projectId"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<></>}>
                    <ProjectsProvider>
                      <ProjectDetail />
                    </ProjectsProvider>
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="addProject"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<></>}>
                    <StashProvider>
                      <ProjectsProvider>
                        <AddProject />
                      </ProjectsProvider>
                    </StashProvider>
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="editProject/:projectId"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<></>}>
                    <StashProvider>
                      <ProjectsProvider>
                        <EditProject />
                      </ProjectsProvider>
                    </StashProvider>
                  </Suspense>
                </ProtectedRoute>
              }
            />

            {/* Stash routes with Suspense and context */}
            <Route
              path="stash"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<></>}>
                    <StashProvider>
                      <Stash />
                    </StashProvider>
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="stash/:yarnId"
              element={
                <Suspense fallback={<></>}>
                  <StashProvider>
                    <ProjectsProvider>
                      <YarnDetail />
                    </ProjectsProvider>
                  </StashProvider>
                </Suspense>
              }
            />
            <Route
              path="addYarn"
              element={
                <Suspense fallback={<></>}>
                  <StashProvider>
                    <AddYarn />
                  </StashProvider>
                </Suspense>
              }
            />
            <Route
              path="editYarn/:yarnId"
              element={
                <Suspense fallback={<></>}>
                  <StashProvider>
                    <EditYarn />
                  </StashProvider>
                </Suspense>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
