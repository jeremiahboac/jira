import { Link, useLocation } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { axiosInstance } from '../../lib/axios'

const Navbar = () => {
  const currentPage = useLocation().pathname
  const queryClient = useQueryClient()

  const { data: authUser } = queryClient.getQueryState(['authUser'])

  const { mutate: logoutMutation } = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post('/auth/logout')
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authUser'] })
    }
  })

  return (
    <nav className="max-w-7xl mx-auto sticky top-0 z-10">
      <div className="border-b-2 border-gray-300 flex justify-between items-center">
        <div className="flex justify-between items-center">
          <img src="/jira.png" alt="jira" className="w-24 h-24" />
          <Link to='/' className='text-2xl text-violet-600 font-bold'>Jira Helpdesk</Link>
        </div>
        {
          authUser ? (
            <div className="flex justify-between items-center gap-6 pr-6">
              <Link to={'/dashboard'} className={currentPage === '/dashboard' ? 'text-violet-600' : ''}>Dashboard</Link>
              <Link>Ticket</Link>
              <button className='cursor-pointer hover:text-violet-600' onClick={logoutMutation}>Logout</button>
            </div>
          ) : (
            <div className='flex justify-between items-center gap-6 pr-6'>
              <Link to={'/register'} className={currentPage === '/register' ? 'text-violet-600' : ''}>Register</Link>
              <Link to={'/login'} className={currentPage === '/login' ? 'text-violet-600' : ''}>Login</Link>
            </div>
          )
        }
      </div>
    </nav>
  )
}
export default Navbar