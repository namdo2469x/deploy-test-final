import { configureStore } from '@reduxjs/toolkit'
import globalReducer from "./globalModeStore";
import userReducer from "./userStore"
import projectReducer from "./projectStore"
import fileReducer from "./fileStore"

const reducer = {
  global: globalReducer,
  user: userReducer,
  project: projectReducer,
  file: fileReducer
}

const store = configureStore({
  reducer: reducer,
  devTools: true,
})

export default store;