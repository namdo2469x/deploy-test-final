import axios from "../http-common";

const create = (data) => {
  return axios.post("/users", data);
};

const getAll = () => {
  return axios.get("/users/list");
};

const update = (data) => {
  return axios.put("/users", data);
};

const getUserByProject = (data) => {
  return axios.post("/users/searchWithPaging", data);
};
const getRoleList = () => {
  return axios.get("/users/role/list");
};

const changePass = (data) => {
  return axios.put("/users/changepass", data);
};

const deactiveUser = (data) => {
  return axios.put("/users/blockusers", data)
}

const activeUser = (data) => {
  return axios.put("/users/openUsers", data)
}

const addRoleUser = (data) => {
  return axios.post("/users/role/addtoUsers", data)
}

const deleteRoleUser = (data) => {
  return axios.delete("/users/role/deleteroleUsers", data)
}

const getUserNotProject = (data) => {
  return axios.post("/users/getMemberNotInProject", data)
}

const userService = {
  getAll,
  create,
  update,
  changePass,
  getUserByProject,
  getRoleList,
  deactiveUser,
  activeUser,
  addRoleUser,
  deleteRoleUser,
  getUserNotProject
};
export default userService;
