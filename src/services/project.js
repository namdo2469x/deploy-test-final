import axios from "../http-common"

const createProject = (data) => {
    return axios.post("/project/create-project", data)
}

const getAllProject = (data) => {
    return axios.post("/project/list",data)
}

const getProjectByLead = (data) => {
    return axios.post("/project/list-by-lead",data)
}

const updateProject = (data) => {
    return axios.put("/project/update-project",data)
}

const addUserToProject = (data) => {
    return axios.post("/project/add-user-to-project",data)
}

const removeUserInProject = (data) => {
    return axios.post("/project/remove-user-in-project",data)
}

const getStatisticTask = (id) => {
    return axios.get("/task/get-task-in-chart-in-project?projectId="+id)
}

const getTaskByProjectId = (id) => {
    return axios.get("/task/get-task-by-project?projectId="+id)
}

const projectService = {
    getAllProject,
    createProject,
    getProjectByLead,
    updateProject,
    addUserToProject,
    removeUserInProject,
    getStatisticTask,
    getTaskByProjectId
}
export default projectService;