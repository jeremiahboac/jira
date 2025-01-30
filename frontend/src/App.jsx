import { Routes, Route, Navigate } from 'react-router-dom'
import { axiosInstance } from './lib/axios'
import { useQuery } from '@tanstack/react-query'
import Layout from "./components/layout/Layout"
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import toast, { Toaster } from 'react-hot-toast'
import RegisterPage from './pages/auth/RegisterPage'

const App = () => {
  const { data: authUser, isFetching } = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get('/auth/me')
        return res.data
      } catch (error) {
        if (error.response.status === 401) return null
        toast.error("Something went wrong.", { position: "bottom-right", duration: 2000 })
      }
    }
  })

  if (isFetching) return null

  return <Layout>
    <Routes>
      <Route path='/dashboard' element={authUser ? <HomePage /> : <Navigate to='/login' />} />
      <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to='/dashboard' />} />
      <Route path='/register' element={!authUser ? <RegisterPage /> : <Navigate to='/dashboard' />} />
    </Routes>
    <Toaster />
  </Layout>
}
export default App