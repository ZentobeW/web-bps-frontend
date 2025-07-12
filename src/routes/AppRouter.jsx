// src/routes/AppRouter.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import AddPublication from "../pages/AddPublication"
import Home from "../pages/Home"

const AppRouter = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/tambah" element={<AddPublication />} />
      
    </Routes>
  </Router>
)

export default AppRouter
