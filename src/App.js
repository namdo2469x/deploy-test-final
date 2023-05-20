import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { themeSettings } from "theme";
import Layout from "scenes/layout";
import Dashboard from "scenes/dashboard";
import Admin from "scenes/User";
import Project from "scenes/performance";
import Role from "scenes/role/role";
import Login from "./scenes/login";
import File from "scenes/file";
import { AlertContextProvider } from "components/AlertProvider";


function App() {
  const mode = useSelector((state) => state.global.mode);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  return (
    <div className="app">
      <BrowserRouter>
        <AlertContextProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<Layout />}>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/usermanagement" element={<Admin />} />
                <Route path="/projectmanagement" element={<Project />} />
                <Route path="/userrolemanagement" element={<Role />} />
                <Route path="/files&docsmanagement" element={<File />} />
              </Route>
            </Routes>
          </ThemeProvider>
        </AlertContextProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
