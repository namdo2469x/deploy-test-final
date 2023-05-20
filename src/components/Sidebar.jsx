/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRightOutlined,
  HomeOutlined,
} from "@mui/icons-material";
import ArticleIcon from "@mui/icons-material/Article";
import PermIdentityOutlinedIcon from "@mui/icons-material/PermIdentityOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import FolderIcon from "@mui/icons-material/Folder";
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FlexBetween from "./FlexBetween";

var navItems = [];

const Sidebar = ({
  drawerWidth,
  isSidebarOpen,
  setIsSidebarOpen,
  isNonMobile,
}) => {
  const { pathname } = useLocation();
  const [active, setActive] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();
  const role = localStorage.getItem("role");

  useEffect(() => {
    setActive(pathname.substring(1));
    if (role === "ADMIN") {
      navItems = [
        {
          text: "Dashboard",
          icon: <HomeOutlined />,
        },
        {
          text: "User Management",
          icon: <PermIdentityOutlinedIcon />,
        },
        {
          text: "Project Management",
          icon: <ArticleIcon />,
        },
        {
          text: "User Role Management",
          icon: <BadgeOutlinedIcon />,
        },
        // {
        //   text: "Workflow Management",
        //   icon: <AccountTreeIcon />,
        // },
        // {
        //   text: "Files & Docs Management",
        //   icon: <FolderIcon />,
        // },
      ];
    } else {
      navItems = [
        {
          text: "Dashboard",
          icon: <HomeOutlined />,
        },
        {
          text: "Project Management",
          icon: <ArticleIcon />,
        },
        // {
        //   text: "Workflow Management",
        //   icon: <AccountTreeIcon />,
        // },
        // {
        //   text: "Files & Docs Management",
        //   icon: <FolderIcon />,
        // },
      ];
    }
  }, [pathname]);

  return (
    <Box component="nav">
      {isSidebarOpen && (
        <Drawer
          open={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          variant="persistent"
          anchor="left"
          sx={{
            width: drawerWidth,
            "& .MuiDrawer-paper": {
              color: theme.palette.secondary[200],
              backgroundColor: theme.palette.background.alt,
              boxSixing: "border-box",
              borderWidth: isNonMobile ? 0 : "2px",
              width: drawerWidth,
            },
          }}
        >
          <Box width="100%">
            <Box m="2rem 2rem 2rem 2rem">
              {!isNonMobile && (
                <FlexBetween color={theme.palette.secondary.main}>
                  <Box
                    display="flex"
                    justifySelf="center"
                    alignItems="center"
                    gap="0.5rem"
                  >
                    <Typography variant="h4" fontWeight="bold">
                      W F M S
                    </Typography>
                  </Box>

                  <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    <ChevronLeft />
                  </IconButton>
                </FlexBetween>
              )}
              {isNonMobile && (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  gap="0.5rem"
                  color={theme.palette.secondary.main}
                >
                  <Typography variant="h4" fontWeight="bold">
                    W F M S
                  </Typography>
                </Box>
              )}
            </Box>
            <List>
              {navItems.map(({ text, icon }) => {
                if (!icon) {
                  return (
                    <Typography key={text} sx={{ m: "2.25rem 0 1rem 3rem" }}>
                      {text}
                    </Typography>
                  );
                }
                const lcText = text.replace(/\s+/g, "").toLowerCase();

                return (
                  <ListItem key={text} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        navigate(`/${lcText}`);
                        setActive(lcText);
                      }}
                      sx={{
                        backgroundColor:
                          active === lcText
                            ? theme.palette.secondary[300]
                            : "transparent",
                        color:
                          active === lcText
                            ? theme.palette.primary[600]
                            : theme.palette.secondary[100],
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          ml: "2rem",
                          color:
                            active === lcText
                              ? theme.palette.primary[600]
                              : theme.palette.secondary[200],
                        }}
                      >
                        {icon}
                      </ListItemIcon>
                      <ListItemText primary={text} />
                      {active === lcText && (
                        <ChevronRightOutlined sx={{ ml: "auto" }} />
                      )}
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        </Drawer>
      )}
    </Box>
  );
};

export default Sidebar;
