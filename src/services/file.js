import axios from "../http-common"

const getListFile = (data) => {
    return axios.post("/document/get-list-document-in-project", data)
}

const removeFile = (id) => {
    return axios.post("/document/delete-document?documentId=" + id)
}

const getListDoc = (data) => {
    return axios.post("/note/get-list-note", data);
}

const createDoc = (data) => {
    return axios.post("/note/create", data);
}

const updateDoc = (data) =>{
    return axios.put("/note/update",data);
}

const fileService = {
    getListFile,
    removeFile,
    getListDoc,
    createDoc,
    updateDoc
}
export default fileService;