import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import ReservaForm from './pages/ReservaForm'
import Reportes from './pages/Reportes'
import AdminLogin from './pages/AdminLogin'
import Admin from './pages/Admin'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ReservaForm />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<PrivateRoute />}>
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
