import { useEffect } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Projects from "./pages/projects/Projects"
import AddProject from "./pages/projects/AddProject"
import ProjectDetail from "./pages/projects/ProjectDetail"
import Stash from "./pages/stash/Stash"
import YarnDetail from "./pages/stash/YarnDetail"
import AddYarn from "./pages/stash/AddYarn"
import { YarnProvider } from './pages/stash/YarnContext';
import NotFound from "./pages/NotFound"
import axios from "axios"

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
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />

            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="addProject" element={<AddProject />} />

            <Route path="stash" element={<Stash />} />
            <Route path="stash/:id" element={<YarnDetail />} />
            <Route path="addYarn" element={<AddYarn />} />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter >
    </YarnProvider >

  )
}

export default App
