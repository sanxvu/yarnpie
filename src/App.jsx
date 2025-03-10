import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import { YarnProvider } from "./pages/stash/YarnContext";
import axios from "axios";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
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
  const fetchAPI = async () => {
    const response = await axios.get("http://localhost:8080/api")
    console.log(response.data.fruits)
  }

  useEffect(() => {
    fetchAPI()
  }, [])
  return (
    <YarnProvider>
      <BrowserRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />

              <Route path="projects" element={<Projects />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route path="addProject" element={<AddProject />} />
              <Route path="editProject" element={<EditProject />} />

              <Route path="stash" element={<Stash />} />
              <Route path="stash/:id" element={<YarnDetail />} />
              <Route path="addYarn" element={<AddYarn />} />
              <Route path="editYarn" element={<EditYarn />} />

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </YarnProvider>
  );
}

export default App
