import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userDataService from "../services/user";

const initialState = [];

export const createUser = createAsyncThunk(
  "users/add",
  async (parmas, { rejectWithValue }) => {
    try {
      const res = await userDataService.create(parmas);
      return res.data;
    } catch (err) {
      if (!err.response) {
        throw err;
      }

      return rejectWithValue(err.response.data);
    }
  }
);

export const getAllUser = createAsyncThunk("users/list", async () => {
  const res = await userDataService.getAll();
  return res.data;
});

export const getRoleList = createAsyncThunk("users/list", async () => {
  const res = await userDataService.getRoleList();
  return res.data;
});

export const updateUser = createAsyncThunk("users/update", async (data) => {
  const res = await userDataService.update(data);
  return res.data;
});

export const getUserByProject = createAsyncThunk(
  "users/getByProject",
  async (data) => {
    const res = await userDataService.getUserByProject(data);
    return res.data;
  }
);

export const changePass = createAsyncThunk(
  "users/change-pass",
  async (data, { rejectWithValue }) => {
    try {
      const res = await userDataService.changePass(data);
      return res.data;
    } catch (err) {
      if (!err.response) {
        throw err;
      }

      return rejectWithValue(err.response.data);
    }
  }
);

export const deactiveUser = createAsyncThunk(
  "users/stop",
  async (data) => {
    const res = await userDataService.deactiveUser(data);
    return res.data;
  }
)

export const activeUser = createAsyncThunk(
  "users/stop",
  async (data) => {
    const res = await userDataService.activeUser(data);
    return res.data;
  }
)

export const addRoleUser = createAsyncThunk(
  "users/role/add",
  async (data) => {
    const res = await userDataService.addRoleUser(data);
    return res.data;
  }
)

export const deleteRoleUser = createAsyncThunk(
  "users/role/delete",
  async (data) => {
    const res = await userDataService.deleteRoleUser(data);
    return res.data;
  }
)

export const getUserNotProject = createAsyncThunk(
  "users/getNotProject",
  async (data) => {
    const res = await userDataService.getUserNotProject(data);
    return res.data;
  }
)

const userSlice = createSlice({
  name: "user",
  initialState,
  extraReducers: {
    [createUser.fulfilled]: (state, action) => {
      return [...action.payload];
    },
    [createUser.rejected]: (state, action) => {
      return action.payload;
    },
    [getAllUser.fulfilled]: (state, action) => {
      return [...action.payload];
    },
    [updateUser.fulfilled]: (state, { payload }) => {
      state[payload.id] = payload;
    },
    [getUserByProject.fulfilled]: (state, action) => {
      return action.payload;
    },
    [getRoleList.fulfilled]: (state, action) => {
      return [...action.payload];
    },
    [changePass.fulfilled]: (state, { payload }) => {
      return payload;
    },
    [changePass.rejected]: (state, action) => {
      return action.payload;
    },
    [deactiveUser.fulfilled]: (state, action) => {
      return action.payload;
    },
    [activeUser.fulfilled]: (state, action) => {
      return action.payload;
    },
    [addRoleUser.fulfilled]: (state, action) => {
      return action.payload;
    },
    [deleteRoleUser.fulfilled]: (state, action) => {
      return action.payload;
    },
    [getUserNotProject.fulfilled]: (state, action) => {
      return action.payload;
    },
  },
});

const { reducer } = userSlice;
export default reducer;
