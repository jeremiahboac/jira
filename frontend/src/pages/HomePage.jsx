import { useQuery, useQueryClient } from "@tanstack/react-query"
import { axiosInstance } from "../lib/axios"

const HomePage = () => {
  const queryClient = useQueryClient()

  const { data: authUser } = queryClient.getQueryState(['authUser'])

  const { data: projectList, isFetching } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await axiosInstance.get('/project')
      return res.data
    },
    enabled: !!authUser
  })

  const projectStatus = (status) => {
    switch (status) {
      case 'ongoing':
        return 'bg-violet-600'
      case 'cancelled':
        return 'bg-red-400'
      case 'completed':
        return 'bg-green-400'
    }
  }

  if (isFetching) {
    return <h3 className="font-bold text-lg">Loading...</h3>
  }

  return (
    <div>
      {
        projectList && projectList?.data?.projects?.length === 0 ? (
          <h3 className="font-bold text-gray-700 text-lg">No project yet.</h3>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-10">Project List</h1>
            {
              projectList?.data?.projects.map(project => (
                <div key={project._id} className="bg-white shadow-sm rounded-lg px-4 py-3 relative overflow-hidden hover:shadow-lg p-5 cursor-pointer mb-5">
                  <h3 className="font-bold text-gray-700 text-lg">{project.name}</h3>
                  <p className="text-sm leading-6">{project.description}</p>
                  <div className={`absolute bottom-0 right-0 ${projectStatus(project.status)} text-white text-xs px-2 py-1 rounded-tl-md`}>{project.status}</div>
                </div>
              ))
            }
          </>
        )
      }
    </div >
  )
}
export default HomePage