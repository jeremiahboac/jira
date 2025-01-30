import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { axiosInstance } from "../../lib/axios"
import { Loader } from 'lucide-react'
import toast from "react-hot-toast"

const LoginForm = () => {
  const [loginInfo, setLoginInfo] = useState({
    email: '',
    password: ''
  })

  const queryClient = useQueryClient()

  const { mutate: loginMutation, isLoading } = useMutation({
    mutationFn: async (loginInfo) => {
      const res = await axiosInstance.post('/auth/login', loginInfo)
      return res.data
    },
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: ['authUser'] })
      toast.success(message, { position: 'bottom-right', duration: 2000 })
    },
    onError: ({ response: { data: { message } } }) => {
      toast.error(message, { position: 'bottom-right', duration: 2000 })
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    loginMutation(loginInfo)
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    setLoginInfo({ ...loginInfo, [name]: value })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 border p-4 rounded-xl">
      <div className="flex flex-col gap-2">
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          name="email"
          id="email"
          value={loginInfo.email}
          onChange={handleChange}
          className="border rounded-md px-2 py-1"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          name="password"
          id="password"
          value={loginInfo.password}
          onChange={handleChange}
          className="border rounded-md px-2 py-1"
        />
      </div>

      <button
        type="submit"
        className="border rounded-md mt-2 px-2 py-2 cursor-pointer text-white bg-violet-400 hover:bg-violet-600"
        disabled={isLoading}
      >
        {isLoading ? <Loader className="size-6 animate-spin mx-auto" /> : 'Login'}
      </button>
    </form>
  )
}
export default LoginForm