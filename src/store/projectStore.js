import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import projectDataService from "../services/project"

const initialState = [];

export const createProject = createAsyncThunk(
    "project/create-project",
    async (data) => {
        const res = await projectDataService.createProject(data);
        return res.data;
    }
)

export const getAllProject = createAsyncThunk(
    "project/list",
    async (data) => {
        const res = await projectDataService.getAllProject(data);
        return res.data;
    }
)

export const getProjectByLead = createAsyncThunk(
    "project/list-by-lead",
    async (data) => {
        const res = await projectDataService.getProjectByLead(data);
        return res.data;
    }
)

export const updateProject = createAsyncThunk(
    "project/update-project",
    async (data) => {
        const res = await projectDataService.updateProject(data);
        return res;
    }
)

export const addUserToProject = createAsyncThunk(
    "project/add-user-to-project",
    async (data) => {
        const res = await projectDataService.addUserToProject(data);
        return res;
    }
)

export const removeUserInProject = createAsyncThunk(
    "project/remove-user-in-project",
    async (data) => {
        const res = await projectDataService.removeUserInProject(data);
        return res;
    }
)

const projectSlice = createSlice({
    name: "project",
    initialState,
    extraReducers: {
        [createProject.fulfilled]: (state, action) => {
            return action.payload;
        },
        [getAllProject.fulfilled]: (state, action) => {
            return action.payload;
        },
        [getProjectByLead.fulfilled]: (state, action) => {
            return action.payload;
        },
        [updateProject.fulfilled]: (state, action) => {
            return action.payload;
        },
        [addUserToProject.fulfilled]: (state, action) => {
            return action.payload;
        },
        [removeUserInProject.fulfilled]: (state, action) => {
            return action.payload;
        },
    }
})

const { reducer } = projectSlice;
export default reducer;