import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { axiosInstance } from "../../lib/axios"
import { Loader } from "lucide-react"
import toast from "react-hot-toast"

const RegisterForm = () => {
  const [userInfo, setUserInfo] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const queryClient = useQueryClient()

  const { mutate: registerMutation, isPending } = useMutation({
    mutationFn: async (userInfo) => {
      const res = await axiosInstance.post('/auth/signup', userInfo)
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
    registerMutation(userInfo)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setUserInfo({ ...userInfo, [name]: value })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 border p-4 rounded-xl">
      <div className="flex flex-col gap-2">
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          name="username"
          id="username"
          value={userInfo.username}
          onChange={handleChange}
          className="border rounded-md px-2 py-1"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="firstname">Firstname:</label>
        <input
          type="text"
          name="firstName"
          id="firstname"
          value={userInfo.firstName}
          onChange={handleChange}
          className="border rounded-md px-2 py-1"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="lastname">Lastname:</label>
        <input
          type="text"
          name="lastName"
          id="lastname"
          value={userInfo.lastName}
          onChange={handleChange}
          className="border rounded-md px-2 py-1"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          name="email"
          id="email"
          value={userInfo.email}
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
          value={userInfo.password}
          onChange={handleChange}
          className="border rounded-md px-2 py-1"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="confirmPassword">Confirm Password:</label>
        <input
          type="password"
          name="confirmPassword"
          id="confirmPassword"
          value={userInfo.confirmPassword}
          onChange={handleChange}
          className="border rounded-md px-2 py-1"
        />
      </div>

      <button
        type="submit"
        className="border rounded-md mt-2 px-2 py-2 cursor-pointer text-white bg-violet-400 hover:bg-violet-600"
        disabled={isPending}
      >
        {isPending ? <Loader className="size-6 animate-spin mx-auto" /> : 'Register'}
      </button>
    </form>
  )
}
export default RegisterForm