import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import fileService from "services/file";

const initialState = [];

export const getListFile = createAsyncThunk(
    "document/getAllFile",
    async (data) => {
        const res = await fileService.getListFile(data);
        return res.data;
    }
)

export const removeFile = createAsyncThunk(
    "document/removeFile",
    async (data) => {
        const res = await fileService.removeFile(data);
        return res.data;
    }
)

export const getListDoc = createAsyncThunk(
    "document/getListDoc",
    async (data) => {
        const res = await fileService.getListDoc(data);
        return res.data;
    }
)

export const createDoc = createAsyncThunk(
    "document/createDoc",
    async (data) => {
        const res = await fileService.createDoc(data);
        return res.data;
    }
)

export const updateDoc = createAsyncThunk(
    "document/getListDoc",
    async (data) => {
        const res = await fileService.updateDoc(data);
        return res.data;
    }
)

const fileSlice = createSlice({
    name: "project",
    initialState,
    extraReducers: {
        [getListFile.fulfilled]: (state, action) => {
            return action.payload;
        },
        [removeFile.fulfilled]: (state, action) => {
            return action.payload;
        },
        [getListDoc.fulfilled]: (state, action) => {
            return action.payload;
        },
        [createDoc.fulfilled]: (state, action) => {
            return action.payload;
        },
        [updateDoc.fulfilled]: (state, action) => {
            return action.payload;
        },
    }
})

const { reducer } = fileSlice;
export default reducer;