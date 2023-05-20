/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback, useContext } from "react";
import {
  Box,
  useTheme,
  IconButton,
  InputBase,
  Button,
  TextField,
  Modal,
  Stack,
  Typography,
} from "@mui/material";
import { Grid } from "@material-ui/core";
import { DataGrid } from "@mui/x-data-grid";
import { Search } from "@mui/icons-material";
import Header from "components/Header";
import FlexBetween from "components/FlexBetween";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import { useDispatch } from "react-redux";
import {
  getAllUser,
  getRoleList,
  addRoleUser,
  deleteRoleUser,
  updateUser,
} from "store/userStore";
import Notification from "components/Notification";
import { AlertContext } from "../../components/AlertProvider";
import dayjs from "dayjs";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const Role = () => {
  const theme = useTheme();
  const [searchText, setSearchText] = useState("");
  const { actions } = useContext(AlertContext);

  const [open, setOpen] = useState(false);
  const [open1, setOpen1] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [userList, setUserList] = useState([]);
  const [isloading, setisloading] = useState(false);
  const [roles, setRoles] = useState([]);

  const dispatch = useDispatch();

  const initFetch = useCallback(() => {
    setisloading(true);
    dispatch(getAllUser())
      .then((response) => {
        if (response.payload) {
          const data = response.payload.map((item, index) => {
            return { no: index + 1, ...item };
          });

          setUserList(data);
        }
      })
      .catch((e) => {})
      .finally(() => setisloading(false));
  }, [dispatch]);

  const fetchRoleList = useCallback(async () => {
    const { payload } = await dispatch(getRoleList());
    setRoles(payload);
  }, [dispatch]);

  useEffect(() => {
    initFetch();
    fetchRoleList();
  }, [initFetch]);

  const [user, setUser] = useState({
    username: "",
    roleId: 0,
    jobTitle: "",
  });

  const [roleName, setRoleName] = useState([]);
  const [jobName, setJobName] = useState([]);

  const renderActionsButton = (params) => {
    return (
      <Stack spacing={3} direction="row">
        {params.row.roles.length === 0 ? (
          <Button
            variant="contained"
            color="secondary"
            size="small"
            style={{ marginLeft: 16 }}
            onClick={() => {
              setUser({
                username: params.row.username,
                roleId: roles,
              });
              setOpen(true);
            }}
          >
            ADD ROLE
          </Button>
        ) : (
          <Button
            variant="contained"
            color="secondary"
            size="small"
            style={{ marginLeft: 16 }}
            onClick={() => {
              setOpen1(true);
              setSelectedItem(params.row.username);
              var roles = 0;
              params.row.roles.map((item) => {
                if (item.id === 1) {
                  roles = 1;
                }
                if (item.id === 2) {
                  roles = 2;
                }
                if (item.id === 3) {
                  roles = 3;
                }
                return roles;
              });
              setUser({
                username: params.row.username,
                roleId: roles,
                jobTitle: params.row.jobTitle,
              });
            }}
          >
            DELETE ROLE
          </Button>
        )}
      </Stack>
    );
  };

  const handleEditUser = (event) => {
    event.preventDefault();
    const params = {
      username: user.username,
      roleId: roleName,
      jobTitle: jobName,
    };
    dispatch(addRoleUser(params))
      .then((response) => {
        actions.addAlert({
          text: "Add Role Successfully",
          type: "success",
          id: Date.now(),
        });
      })
      .catch((e) => {
        actions.addAlert({
          text: "Something wrong",
          type: "error",
          id: Date.now(),
        });
      })
      .finally(() => {
        setOpen(false);
        setRoleName([]);
        initFetch();
      });
  };

  const columns = [
    {
      field: "no",
      headerName: "No",
      flex: 0.3,
    },
    {
      field: "fullName",
      headerName: "Full Name",
      flex: 1,
    },
    {
      field: "username",
      headerName: "User Name",
      flex: 0.5,
    },
    {
      field: "roles",
      headerName: "Role",
      flex: 0.5,
      renderCell: (params) => {
        var roles = "";
        params.row.roles.map((item) => {
          if (item.id === 1) {
            roles = "ADMIN";
            return roles;
          }
          if (item.id === 2) {
            roles = "PM";
            return roles;
          }
          if (item.id === 3) {
            roles = "MEMBER";
            return roles;
          }
          return roles;
        });
        return roles;
      },
    },
    {
      field: "jobTitle",
      headerName: "Job Title",
      flex: 0.5,
    },
    {
      field: "0",
      headerName: "Actions",
      flex: 1,
      renderCell: renderActionsButton,
      disableClickEventBubbling: true,
      sortable: false,
    },
  ];

  const filterModel = {
    items: [
      { columnField: "fullName", operatorValue: "contains", value: searchText },
    ],
  };

  return (
    <Box m="1.5rem 2.5rem">
      <Box>
        <FlexBetween>
          <Box>
            <Header title="ROLE" subtitle="Managing role of user" />
            <FlexBetween
              backgroundColor={theme.palette.background.alt}
              borderRadius="9px"
              gap="3rem"
              p="0.1rem 1.5rem"
              sx={{
                mt: "20px",
                width: "319.562px",
              }}
            >
              <InputBase
                placeholder="Search by full name..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <IconButton>
                <Search />
              </IconButton>
            </FlexBetween>
          </Box>
        </FlexBetween>
      </Box>

      {/* ADD ROLE OF USER */}
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setUser({
            username: "",
            roleId: 0,
            jobTitle: 0,
          });
          setRoleName([]);
          setJobName([]);
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 800,
            bgcolor: "white",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
            borderRadius: "10px",
          }}
        >
          <form onSubmit={handleEditUser}>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6}>
                <InputLabel id="userName">User Name</InputLabel>
                <TextField
                  labelid="userName"
                  name="username"
                  disabled
                  value={user.username}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InputLabel id="roleUser">Role</InputLabel>
                <Select
                  labelid="roleUser"
                  value={roleName}
                  name="roles"
                  onChange={(event) => setRoleName(event.target.value)}
                  placeholder="Choose role"
                  fullWidth
                  MenuProps={MenuProps}
                >
                  {roles &&
                    roles.map((item) => (
                      <MenuItem key={item.name} value={item.id}>
                        {item.name}
                      </MenuItem>
                    ))}
                </Select>
              </Grid>
              {roleName === 3 ? (
                <Grid item xs={12} sm={6}>
                  <InputLabel id="jobTitle">Job Title</InputLabel>
                  <Select
                    labelid="jobTitle"
                    value={jobName}
                    name="jobTitle"
                    onChange={(event) => setJobName(event.target.value)}
                    placeholder="Choose role"
                    fullWidth
                    MenuProps={MenuProps}
                  >
                    <MenuItem value={"DEV"}>DEV</MenuItem>
                    <MenuItem value={"TESTER"}>TESTER</MenuItem>
                    <MenuItem value={"BA"}>BA</MenuItem>
                    <MenuItem value={"QC"}>QC</MenuItem>
                    <MenuItem value={"QA"}>QA</MenuItem>
                  </Select>
                </Grid>
              ) : (
                <></>
              )}
            </Grid>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                style={{
                  width: "150px",
                  fontSize: "20px",
                  marginTop: "50px",
                }}
              >
                SAVE
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>

      {/* Delete role modal */}
      <Modal open={open1} onClose={() => setOpen1(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            bgcolor: "white",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
            borderRadius: "10px",
          }}
        >
          <Typography variant="h5" gutterBottom>
            Are you sure you want to delete role of user {selectedItem}?
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={(e) => setOpen1(false)}
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                dispatch(deleteRoleUser(user))
                  .then((response) => {})
                  .catch((e) => {
                    actions.addAlert({
                      text: "Something wrong",
                      type: "error",
                      id: Date.now(),
                    });
                  })
                  .finally(() => {
                    setOpen1(false);
                    initFetch();
                  });
                actions.addAlert({
                  text: "Delete Role Successfully",
                  type: "success",
                  id: Date.now(),
                });
              }}
            >
              DELETE
            </Button>
          </Box>
        </Box>
      </Modal>

      <Notification />
      <Box
        mt="40px"
        height="68vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
            fontSize: "14px",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: theme.palette.background.alt,
            color: theme.palette.secondary[100],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: theme.palette.primary.light,
          },
          "& .MuiDataGrid-footerContainer": {
            backgroundColor: theme.palette.background.alt,
            color: theme.palette.secondary[100],
            borderTop: "none",
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${theme.palette.secondary[200]} !important`,
          },
        }}
      >
        <DataGrid
          loading={isloading}
          getRowId={(rows) => rows.id}
          rows={userList}
          columns={columns}
          filterModel={filterModel}
          pageSize={20}
          rowsPerPageOptions={[20]}
        />
      </Box>
    </Box>
  );
};

export default Role;
