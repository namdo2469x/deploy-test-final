/* eslint-disable no-useless-escape */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  Box,
  useTheme,
  IconButton,
  InputBase,
  Button,
  TextField,
  Typography,
  Modal,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import { Drawer, Grid } from "@material-ui/core";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DataGrid, GridOverlay } from "@mui/x-data-grid";
import { Search } from "@mui/icons-material";
import Header from "components/Header";
import FlexBetween from "components/FlexBetween";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DownloadIcon from "@mui/icons-material/Download";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FlexCenter from "components/FlexCenter";
import { useDispatch } from "react-redux";
import {
  getAllUser,
  createUser,
  getRoleList,
  updateUser,
  activeUser,
  deactiveUser,
} from "store/userStore";
import saveAs from "file-saver";
import moment from "moment";
import dayjs from "dayjs";
import axios from "axios";
import Notification from "components/Notification";
import { AlertContext } from "../../components/AlertProvider";
import { axiosApi } from "http-common";

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

const Admin = () => {
  const theme = useTheme();
  const [searchText, setSearchText] = useState("");
  const { actions } = useContext(AlertContext);

  const [modalDownload, setModalDownload] = useState(false);
  const [open, setOpen] = useState(false);
  const [openDeleteModal, setDeleteModal] = useState(false);
  const [open1, setOpen1] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [status, setStatus] = useState();
  const [userList, setUserList] = useState([]);
  const [isloading, setisloading] = useState(false);
  const [isloading1, setisloading1] = useState(false);
  const [roles, setRoles] = useState([]);
  const [errors, setErrors] = useState({
    phone: false,
    emailAddress: false,
    fullName: false,
    username: false,
  });
  const [errorr, setErrorr] = useState("");
  const dispatch = useDispatch();

  // Read Excel
  const [data1, setData1] = useState([]);
  const [dataModal, setDataModal] = useState(false);
  const [openView, setOpenView] = useState(false);

  const handleUploadFile = (event) => {
    setisloading1(true);
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "Content-Type": "form-data",
      },
    };
    axios
      .post(
        "http://103.176.110.28:8080/profile/validate-template-create-user-file",
        formData,
        config
      )
      .then((response) => {
        if (response.data) {
          const dataWithIds = response.data.listUserValidate.map(
            (item, index) => ({
              ...item,
              id: index + 1,
            })
          );
          setData1(dataWithIds);
          actions.addAlert({
            text: "Upload successfully",
            type: "success",
            id: Date.now(),
          });
          setDataModal(true);
        }
      })
      .catch((error) => {
        actions.addAlert({
          text: "Upload fail. Please select appropriate file",
          type: "error",
          id: Date.now(),
        });
      })
      .finally(() => {
        setisloading1(false);
      });

    event.target.value = "";
  };
  //

  const initFetch = useCallback(async () => {
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
  }, [initFetch, status]);

  const [user, setUser] = useState({
    fullName: "",
    emailAddress: "",
    username: "",
    password: "",
    jobTitle: "",
    phone: "",
    gender: 0,
    address: "",
    birthDay: "",
    roles: [],
    status: 1,
  });

  const [value, setValue] = useState(dayjs(user.birthDay));
  const handleDateChange = (date) => {
    setValue(dayjs(date));
    setErrorr("");
    if (date) {
      const currentDate = dayjs();
      if (currentDate.diff(date, "y") < 18) {
        setErrorr("Please enter valid date of birth (age > 18)");
      }
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const nameRegex = /^[a-zA-Z]{2,}(?: [a-zA-Z]+){0,2}$/;
    const username = /^[a-zA-Z0-9]{8,10}$/;
    setUser({
      ...user,
      [name]: event.target.value,
    });

    if (
      (name === "phone" && (value.length < 10 || !value.startsWith("0"))) ||
      (name === "emailAddress" && !value.match(emailRegex)) ||
      (name === "fullName" && !value.match(nameRegex)) ||
      (name === "username" && !value.match(username))
    ) {
      setErrors({
        ...errors,
        [name]: true,
      });
    } else {
      setErrors({
        ...errors,
        [name]: false,
      });
    }
  };

  const handleSubmit = (event, action, data = {}) => {
    event.preventDefault();
    data = {
      ...user,
      birthDay: dayjs(value).add(1,"day")
    };
    if (!selectedItem) handleAddUser(data);
    else handleEditUser(data, action);
  };

  const handleAddUser = (data) => {
    data = {
      ...data,
      password: "123@123a",
      status: 1,
    };

    // .then(() => {
    dispatch(createUser(data))
      .then((res) => {
        if (!!res?.error?.message) {
          actions.addAlert({
            text: res.payload.error || res.payload,
            type: "error",
            id: Date.now(),
          });
          return;
        }
        actions.addAlert({
          text: "Add User Successfully",
          type: "success",
          id: Date.now(),
        });
        setOpen1(false);
      })
      .finally(() => {
        initFetch();
      });
  };

  const hanldeAddMultipleUser = () => {
    data1.forEach((item) => {
      if (item.messageValidate === "") {
        const data = {
          fullName: item.fullName,
          emailAddress: item.emailAddress,
          username: item.username,
          password: "123@123a",
          phone: item.phone,
          gender: getGender(item.gender.toLowerCase()),
          address: item.address,
          birthDay: dayjs(item.birthDay),
          roles: getIdRole(item.role.toLowerCase()),
          jobTitle: item.jobTitle,
          status: 1,
        };
        dispatch(createUser(data)).then((res) => {
          if (res.error.message) {
            actions.addAlert({
              text: res.payload.error || res.payload,
              type: "error",
              id: Date.now(),
            });
            return;
          }
          actions.addAlert({
            text: `Add User ${item.username} Successfully`,
            type: "success",
            id: Date.now(),
          });
          setDataModal(false);
        });
      } else {
        actions.addAlert({
          text: `User ${item.username} not validated`,
          type: "error",
          id: Date.now(),
        });
      }
    });
  };

  const getIdRole = (data) => {
    if (data === "admin") {
      return 1;
    }
    if (data === "pm") {
      return 2;
    }
    if (data === "member") {
      return 3;
    }
  };

  const getGender = (data) => {
    if (data === "male") {
      return 1;
    }
    if (data === "female") {
      return 0;
    }
  };

  const getNameRole = (ids) => {
    if (!openView) return;
    const getName = roles
      .filter((role) => ids.includes(role.id))
      .map((item) => item.name);
    return getName.toString();
  };

  const downloadFile = async () => {
    const token = localStorage.getItem("access_token");
    const config = {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "blob",
    };
    axios
      .get(
        "http://103.176.110.28:8080/profile/download-template-create-user",
        config
      )
      .then((response) => {
        const filename = "template-create-user.xlsx";
        saveAs(response.data, filename);
      })
      .catch((error) => {})
      .finally(() => setModalDownload(false));
  };

  const renderAction = (params) => {
    return (
      <>
        <strong>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            style={{ marginLeft: 16 }}
            onClick={() => {
              setSelectedItem(params.row.id);
              setValue(dayjs(params.row.birthDay));
              setUser({
                fullName: params.row.fullName,
                emailAddress: params.row.emailAddress,
                username: params.row.username,
                jobTitle: params.row.jobTitle,
                password: params.row.password,
                phone: params.row.phone,
                gender: params.row.gender,
                address: params.row.address,
                roles: params.row.roles.map((item) => item.id),
                status: params.row.status,
              });
              setOpenView(true);
            }}
          >
            VIEW DETAIL USER
          </Button>
        </strong>
        <strong>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            style={{ marginLeft: 16 }}
            onClick={() => {
              setSelectedItem(params.row.id);
              setValue(dayjs(params.row.birthDay));
              setUser({
                fullName: params.row.fullName,
                emailAddress: params.row.emailAddress,
                username: params.row.username,
                password: params.row.password,
                jobTitle: params.row.jobTitle,
                phone: params.row.phone,
                gender: params.row.gender,
                address: params.row.address,
                roles: params.row.roles.map((item) => item.id),
                status: params.row.status,
              });
              setOpen(true);
            }}
          >
            EDIT
          </Button>
        </strong>
        <strong>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            style={{ marginLeft: 16 }}
            onClick={() => {
              setDeleteModal(true);
              setSelectedItem(params.row.id);
              setStatus(params.row.status);
            }}
          >
            {params.row.status === 1 ? "Deactive User" : "Active User"}
          </Button>
        </strong>
      </>
    );
  };

  const handleStatusUser = async () => {
    const userId = [selectedItem];
    if (status === 1) {
      dispatch(deactiveUser(userId))
        .then((response) => {
          if (response.payload) {
            actions.addAlert({
              text: "Deactive User Successfully",
              type: "success",
              id: Date.now(),
            });
          }
        })
        .catch((e) => {
          actions.addAlert({
            text: "Something wrong. Please try again later",
            type: "error",
            id: Date.now(),
          });
        })
        .finally(() => {
          setDeleteModal(false);
          setStatus(0);
        });
    } else {
      dispatch(activeUser(userId))
        .then((response) => {
          if (response.payload) {
            actions.addAlert({
              text: "Active User Successfully",
              type: "success",
              id: Date.now(),
            });
          }
        })
        .catch((e) => {
          actions.addAlert({
            text: "Something wrong. Please try again later",
            type: "error",
            id: Date.now(),
          });
        })
        .finally(() => {
          setDeleteModal(false);
          setStatus(1);
        });
    }
  };

  const handleEditUser = async (data, action) => {
    data = {
      id: selectedItem,
      ...data,
      roles: data.roles.map((item) => ({ id: item })),
    };

    dispatch(updateUser(data))
      .then((response) => {
        if (response.payload) {
          actions.addAlert({
            text:
              action === "delete"
                ? "Delete User Successfully"
                : "Edit User Successfully",
            type: "success",
            id: Date.now(),
          });
          if (action === "delete") setDeleteModal(false);
          else setOpen(false);
        }
      })
      .catch((e) => {
        actions.addAlert({
          text: "Something wrong. Please try again later",
          type: "error",
          id: Date.now(),
        });
      })
      .finally(() => {
        initFetch();
      });
  };

  const cleanForm = () => {
    setValue(dayjs(""));
    setUser({
      fullName: "",
      emailAddress: "",
      username: "",
      password: "",
      phone: "",
      gender: 0,
      address: "",
      birthDay: "",
      roles: [],
      status: 1,
    });
  };

  const columnAddUser = [
    {
      field: "id",
      headerName: "ID",
      flex: 0.2,
    },
    {
      field: "fullName",
      headerName: "Full Name",
      flex: 0.5,
    },
    {
      field: "username",
      headerName: "User Name",
      flex: 0.5,
    },
    {
      field: "emailAddress",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "phone",
      headerName: "Phone Number",
      flex: 0.5,
    },
    {
      field: "address",
      headerName: "Address",
      flex: 0.5,
    },
    {
      field: "gender",
      headerName: "Gender",
      flex: 0.5,
      renderCell: (params) => {
        if (params.row.gender === 0) {
          return "Male";
        } else if (params.row.gender === 1) {
          return "Female";
        }
      },
    },
    {
      field: "birthDay",
      headerName: "BirthDay",
      flex: 0.5,
    },
    {
      field: "jobTitle",
      headerName: "Job Title",
      flex: 0.5,
    },
    {
      field: "role",
      headerName: "Role",
      flex: 0.5,
    },
    {
      field: "messageValidate",
      headerName: "Message Validate",
      flex: 1,
    },
  ];

  const columns = [
    {
      field: "no",
      headerName: "No",
      flex: 0.1,
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
      field: "birthDay",
      headerName: "BirthDay",
      flex: 0.5,
      renderCell: (params) => {
        return moment(params.row.birthDay).format("MM/DD/YYYY");
      },
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.4,
      renderCell: (params) => {
        if (params.row.status === 0) {
          return "Deactive";
        } else {
          return "Active";
        }
      },
    },
    {
      field: "0",
      headerName: "Action",
      flex: 1.4,
      renderCell: renderAction,
      disableClickEventBubbling: true,
      sortable: false,
    },
  ];

  const filterModel = {
    items: [
      { columnField: "fullName", operatorValue: "contains", value: searchText },
    ],
  };

  const CustomLoadingOverlay = () => {
    return (
      <GridOverlay>
        <CircularProgress color="secondary" />
      </GridOverlay>
    );
  };

  return (
    <Box m="1.5rem 2.5rem">
      <Box>
        <FlexBetween>
          <Box>
            <Header title="USERS" subtitle="Managing user of company" />
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
          <Modal open={openView} onClose={() => setOpenView(false)}>
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
                fontSize: "15px",
                "& .MuiFormLabel-root": {
                  fontSize: "15px",
                  color: "#7c7c7c",
                },
              }}
            >
              <FlexCenter>
                <Grid container spacing={4}>
                  <Grid item xs={8} sm={6}>
                    <InputLabel>Full Name</InputLabel>
                    <span>{user.fullName}</span>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InputLabel>Email Address</InputLabel>
                    <span>{user.emailAddress}</span>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InputLabel>Username</InputLabel>
                    <span>{user.username}</span>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InputLabel>Phone</InputLabel>
                    <span>{user.phone}</span>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InputLabel>Address</InputLabel>
                    <span>{user.address}</span>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InputLabel>Job Title</InputLabel>
                    <span>{user.jobTitle}</span>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InputLabel id="roleUser">Role</InputLabel>
                    <span>{getNameRole(user.roles)}</span>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InputLabel>Date of Birth</InputLabel>
                    <span>{value.format("DD/MM/YYYY")}</span>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InputLabel id="genderUser">Gender</InputLabel>
                    <span>{user.gender === 1 ? "Male" : "Female"}</span>
                  </Grid>
                </Grid>
                <Box>
                  <Button
                    variant="contained"
                    color="secondary"
                    style={{
                      width: "140px",
                      fontSize: "15px",
                      marginTop: "50px",
                    }}
                    onClick={() => setOpenView(false)}
                  >
                    CLOSE
                  </Button>
                </Box>
              </FlexCenter>
            </Box>
          </Modal>

          <Modal open={open} onClose={() => setOpen(false)}>
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
              <FlexCenter>
                <Grid container spacing={4}>
                  <Grid item xs={8} sm={6}>
                    <TextField
                      label="Full Name"
                      name="fullName"
                      value={user.fullName}
                      onChange={handleInputChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Email Address"
                      name="emailAddress"
                      value={user.emailAddress}
                      onChange={handleInputChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Username"
                      name="username"
                      value={user.username}
                      onChange={handleInputChange}
                      fullWidth
                      autoComplete="false"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Password"
                      name="password"
                      value={user.password}
                      onChange={handleInputChange}
                      type="password"
                      fullWidth
                      autoComplete="false"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Phone"
                      name="phone"
                      type="number"
                      inputProps={{
                        minLength: 10, // Set minimum length to 10
                        pattern: "0.*", // Set pattern to start with "0"
                      }}
                      value={user.phone}
                      onChange={handleInputChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Address"
                      name="address"
                      value={user.address}
                      onChange={handleInputChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Date of birth"
                        className="fullwidth"
                        value={value}
                        onChange={(newValue) => setValue(newValue)}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Job Title"
                      name="jobTitle"
                      value={user.jobTitle}
                      disabled={true}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InputLabel id="roleUser">Role</InputLabel>
                    <Select
                      labelId="roleUser"
                      value={user.roles}
                      name="roles"
                      onChange={handleInputChange}
                      placeholder="Choose role"
                      fullWidth
                      multiple
                      MenuProps={MenuProps}
                      disabled={true}
                    >
                      {roles &&
                        roles.map((item) => (
                          <MenuItem key={item.name} value={item.id}>
                            {item.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <InputLabel id="genderUser">Gender</InputLabel>
                    <Select
                      labelId="genderUser"
                      value={user.gender}
                      name="gender"
                      onChange={handleInputChange}
                      placeholder="Choose gender"
                      fullWidth
                    >
                      <MenuItem value={1}>Male</MenuItem>
                      <MenuItem value={0}>Female</MenuItem>
                    </Select>
                  </Grid>
                </Grid>
                <Box>
                  <Button
                    type="submit"
                    variant="contained"
                    color="secondary"
                    style={{
                      width: "140px",
                      fontSize: "15px",
                      marginTop: "50px",
                      marginRight: "10px",
                    }}
                    onClick={handleSubmit}
                  >
                    SAVE
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    style={{
                      width: "140px",
                      fontSize: "15px",
                      marginTop: "50px",
                    }}
                    onClick={() => setOpen(false)}
                  >
                    CANCEL
                  </Button>
                </Box>
              </FlexCenter>
            </Box>
          </Modal>

          <Modal open={openDeleteModal} onClose={() => setDeleteModal(false)}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 400,
                bgcolor: "white",
                border: "2px solid #000",
                boxShadow: 24,
                p: 4,
                borderRadius: "10px",
              }}
            >
              <Typography variant="h5" gutterBottom>
                Are you sure you want to {status === 1 ? "deactive" : "active"}{" "}
                this user?
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={(e) => setDeleteModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  style={{
                    marginLeft: "10px",
                  }}
                  onClick={handleStatusUser}
                >
                  {status === 1 ? "Deactive" : "Active"}
                </Button>
              </Box>
            </Box>
          </Modal>

          {/* Modal download file */}
          <Modal
            open={modalDownload}
            onClose={() => {
              setModalDownload(false);
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 400,
                bgcolor: "white",
                border: "2px solid #000",
                boxShadow: 24,
                p: 4,
                borderRadius: "10px",
              }}
            >
              <Typography variant="h5" gutterBottom>
                Are you sure you want to download template excel file?
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setModalDownload(false)}
                  sx={{ mr: 1 }}
                >
                  No
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => {
                    downloadFile();
                  }}
                >
                  Yes
                </Button>
              </Box>
            </Box>
          </Modal>

          {/* Drawer add user */}
          <Box>
            <Drawer
              variant="temporary"
              anchor="right"
              open={open1}
              onClose={() => setOpen1(false)}
            >
              <Box
                autoComplete="off"
                sx={{
                  height: "100vh",
                  width: "600px",
                  backgroundColor: "white",
                  padding: "30px 10px",
                  overflow: "hidden",
                  fontSize: "14px",
                  color: "black",
                }}
              >
                <form onSubmit={handleSubmit}>
                  <FlexCenter>
                    <Grid container spacing={4}>
                      <Grid item xs={8} sm={6}>
                        <TextField
                          label="Full Name"
                          name="fullName"
                          value={user.fullName}
                          required
                          error={errors.fullName} // Set error prop based on validation result
                          helperText={
                            errors.fullName && "Please enter a valid full name"
                          }
                          onChange={handleInputChange}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          type="email"
                          label="Email Address"
                          name="emailAddress"
                          required
                          error={errors.emailAddress} // Set error prop based on validation result
                          helperText={
                            errors.emailAddress &&
                            "Please enter a valid email address"
                          }
                          value={user.emailAddress}
                          onChange={handleInputChange}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Username"
                          name="username"
                          inputProps={{
                            minLength: 8, // Set minimum length to 10
                          }}
                          required
                          error={errors.username} // Set error prop based on validation result
                          helperText={
                            errors.username &&
                            "Length between 8 to 10 characters and no special character"
                          }
                          value={user.username}
                          onChange={handleInputChange}
                          fullWidth
                          autoComplete="off"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Phone"
                          name="phone"
                          type="number"
                          inputProps={{
                            minLength: 10, // Set minimum length to 10
                            pattern: "0.*", // Set pattern to start with "0"
                          }}
                          required
                          error={errors.phone} // Set error prop based on validation result
                          helperText={
                            errors.phone &&
                            "Minimum length is 10 numbers and start with 0"
                          }
                          value={user.phone}
                          onChange={handleInputChange}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Address"
                          name="address"
                          value={user.address}
                          onChange={handleInputChange}
                          fullWidth
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            className={
                              errorr
                                ? "date-picker-error fullwidth"
                                : "fullwidth"
                            }
                            label="Select date of birth"
                            value={value}
                            onChange={handleDateChange}
                            disableFuture
                            slotProps={{
                              textField: {
                                helperText: errorr,
                                required: true,
                              },
                            }}
                          >
                            <TextField />
                          </DatePicker>
                        </LocalizationProvider>
                      </Grid>

                      <Grid item xs={12} sm={6} disabled>
                        <InputLabel id="roleUser">Role</InputLabel>
                        <Select
                          labelId="roleUser"
                          value={user.roles}
                          name="roles"
                          required
                          onChange={handleInputChange}
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

                      <Grid item xs={12} sm={6}>
                        <InputLabel id="genderUser">Gender</InputLabel>
                        <Select
                          labelId="genderUser"
                          value={user.gender}
                          name="gender"
                          onChange={handleInputChange}
                          placeholder="Choose gender"
                          fullWidth
                        >
                          <MenuItem value={1}>Male</MenuItem>
                          <MenuItem value={0}>Female</MenuItem>
                        </Select>
                      </Grid>
                      {user.roles === 3 && (
                        <Grid item xs={12} sm={6}>
                          <InputLabel>Job Title</InputLabel>
                          <Select
                            labelId="jobTitle"
                            value={user.jobTitle}
                            name="jobTitle"
                            onChange={handleInputChange}
                            placeholder="Choose Job Title"
                            fullWidth
                          >
                            <MenuItem value="TESTER">TESTER</MenuItem>
                            <MenuItem value="DEV">DEV</MenuItem>
                            <MenuItem value="BA">BA</MenuItem>
                            <MenuItem value="QC">QC</MenuItem>
                            <MenuItem value="QA">QA</MenuItem>
                          </Select>
                        </Grid>
                      )}
                    </Grid>
                    <Box>
                      <Button
                        type="submit"
                        variant="contained"
                        color="secondary"
                        style={{
                          width: "140px",
                          fontSize: "15px",
                          marginTop: "50px",
                          marginRight: "10px",
                        }}
                      >
                        Add User
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        style={{
                          width: "140px",
                          fontSize: "15px",
                          marginTop: "50px",
                        }}
                        onClick={() => setOpen1(false)}
                      >
                        CANCEL
                      </Button>
                    </Box>
                  </FlexCenter>
                </form>
              </Box>
            </Drawer>
          </Box>

          <Box>
            <Button
              variant="contained"
              color="secondary"
              sx={{
                fontSize: "14px",
                fontWeight: "bold",
                padding: "10px 20px",
                m: "5px",
              }}
              onClick={() => {
                cleanForm();
                setOpen1(true);
                setSelectedItem(null);
              }}
            >
              <AddCircleOutlineIcon sx={{ mr: "10px" }} />
              Add New User
            </Button>
            <Box>
              <input
                accept=".xlsx, .xls"
                style={{ display: "none" }}
                id="raised-button-file"
                type="file"
                onChange={handleUploadFile}
              />
              <label htmlFor="raised-button-file">
                <Button
                  variant="contained"
                  color="secondary"
                  sx={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    padding: "10px 20px",
                    m: "5px",
                  }}
                  component="span"
                >
                  <FileUploadIcon sx={{ mr: "10px" }} />
                  Import User by Excel
                </Button>
              </label>
            </Box>
            <Button
              variant="contained"
              color="secondary"
              sx={{
                fontSize: "14px",
                fontWeight: "bold",
                padding: "10px 20px",
                m: "5px",
              }}
              onClick={() => setModalDownload(true)}
            >
              <DownloadIcon sx={{ mr: "10px" }} />
              Download Template Excel
            </Button>
          </Box>
        </FlexBetween>
      </Box>
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
        <Modal open={dataModal} onClose={() => setDataModal(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 1500,
              height: 600,
              bgcolor: "white",
              border: "2px solid #000",
              boxShadow: 24,
              p: 4,
              borderRadius: "10px",
            }}
          >
            <Box sx={{ height: 500 }}>
              <DataGrid rows={data1} columns={columnAddUser} />
            </Box>
            <Box sx={{ mt: "10px" }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                style={{
                  width: "200px",
                  fontSize: "15px",
                  marginRight: "10px",
                }}
                onClick={hanldeAddMultipleUser}
              >
                ADD USER
              </Button>
              <Button
                variant="contained"
                color="primary"
                style={{
                  width: "150px",
                  fontSize: "15px",
                }}
                onClick={() => {
                  setDataModal(false);
                  setData1([]);
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Modal>
        <DataGrid
          loading={isloading}
          getRowId={(rows) => rows.id}
          rows={userList}
          columns={columns}
          filterModel={filterModel}
          pageSize={20}
          rowsPerPageOptions={[20]}
          loadingOverlay={<CustomLoadingOverlay />}
        />
      </Box>
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
        open={isloading1}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
};

export default Admin;
