/* eslint-disable no-useless-escape */
import React, { useState, useContext, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Menu as MenuIcon, ArrowDropDownOutlined } from "@mui/icons-material";
import FlexBetween from "components/FlexBetween";
import { useDispatch } from "react-redux";
import { Drawer } from "@material-ui/core";
import {
  AppBar,
  Button,
  Box,
  Typography,
  IconButton,
  Toolbar,
  Menu,
  MenuItem,
  useTheme,
  TextField,
  Modal,
  Grid,
  InputLabel,
  Select,
} from "@mui/material";
import { getRoleList, updateUser } from "store/userStore";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import InputAdornment from "@material-ui/core/InputAdornment";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { removeAccessToken } from "http-common";
import FlexCenter from "./FlexCenter";
import { changePass } from "store/userStore";
import { AlertContext } from "./AlertProvider";
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

const Navbar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const isOpen = Boolean(anchorEl);
  const [roles, setRoles] = useState([]);
  const [errors, setErrors] = React.useState({
    newPass: false,
    reNewPass: false,
  });
  const { actions } = useContext(AlertContext);

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = () => setShowPassword(!showPassword);

  const dispatch = useDispatch();

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const [profile, setProfile] = useState({});

  const fetchRoleList = useCallback(async () => {
    const { payload } = await dispatch(getRoleList());
    setRoles(payload);
  }, [dispatch]);

  useEffect(() => {
    fetchRoleList();
    setProfile(JSON.parse(localStorage.getItem("accountInfo")));
  }, []);

  const [value, setValue] = useState(dayjs(profile.birthDay));

  const handleProfile = () => {
    setAnchorEl(null);
    setOpen(true);
    setUser({
      fullName: profile.fullName,
      emailAddress: profile.emailAddress,
      username: profile.username,
      password: profile.password,
      jobTitle: profile.jobTitle,
      phone: profile.phone,
      gender: profile.gender,
      address: profile.address,
      birthDay: dayjs(profile.birthDay),
      roles: profile.roles?.map((item) => item.id).toString(),
      status: profile.status,
    });
    setValue(dayjs(profile.birthDay));
  };

  const [user, setUser] = useState({
    fullName: "",
    emailAddress: "",
    username: "",
    password: "",
    jobTitle: "",
    phone: "",
    gender: "",
    address: "",
    birthDay: "",
    roles: [],
    status: 1,
  });

  const [password, setPassword] = React.useState({
    newPass: "",
    oldPass: "",
    reNewPass: "",
  });

  const handleInputChangePass = (event) => {
    const { name, value } = event.target;
    setPassword({
      ...password,
      [name]: event.target.value,
    });

    if (value.length < 8) {
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
  const [errorss, setErrorss] = useState({
    phone: false,
    emailAddress: false,
    fullName: false,
  });
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const nameRegex = /^[a-zA-Z]{2,}(?: [a-zA-Z]+){0,2}$/;

    setUser({
      ...user,
      [name]: event.target.value,
    });

    if (
      (name === "phone" && (value.length < 10 || !value.startsWith("0"))) ||
      (name === "emailAddress" && !value.match(emailRegex)) ||
      (name === "fullName" && !value.match(nameRegex))
    ) {
      setErrorss({
        ...errorss,
        [name]: true,
      });
    } else {
      setErrorss({
        ...errorss,
        [name]: false,
      });
    }
  };

  const handleChangePassword = () => {
    setOpenChangePassword(true);
    setAnchorEl(null);
  };

  const handleChangePass = (event) => {
    event.preventDefault();
    const infoPass = {
      ...password,
      username: profile.username,
    };
    dispatch(changePass(infoPass)).then((res) => {
      if (res.error?.message) {
        actions.addAlert({
          text: res.payload,
          type: "error",
          id: Date.now(),
        });
        return;
      } else {
        handleLogout();
        actions.addAlert({
          text: "Change password success. Please re-login your account",
          type: "success",
          id: Date.now(),
        });
      }
    });
  };

  const handleLogout = () => {
    removeAccessToken();
    navigate("/login");
    localStorage.clear();
  };

  const [errorr, setErrorr] = useState("");
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

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = {
      id: profile.id,
      ...user,
      roles: profile.roles?.map((item) => ({ id: item.id })),
      birthDay: dayjs(value).add(1, "day").format("YYYY-MM-DD"),
    };

    dispatch(updateUser(data))
      .then((response) => {
        if (response.payload) {
          actions.addAlert({
            text: "Update Profile Successfully. Please re-login to apply change",
            type: "success",
            id: Date.now(),
          });
        }
      })
      .catch((e) => {
        actions.addAlert({
          text: "Update Profile Failed. Please try again later",
          type: "error",
          id: Date.now(),
        });
      })
      .finally(() => {
        setOpen(false);
        handleLogout();
      });
  };

  return (
    <Box>
      <Drawer
        variant="temporary"
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
      >
        <Box
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
                    required
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
                  <TextField
                    label="Job Title"
                    name="jobTitle"
                    value={user.jobTitle}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InputLabel>Date of Birth</InputLabel>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      className={
                        errorr ? "date-picker-error fullwidth" : "fullwidth"
                      }
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
                    disabled
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
                    marginRight:"10px"
                  }}
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
          </form>
        </Box>
      </Drawer>

      {/* Change password modal */}
      <Modal
        open={openChangePassword}
        onClose={() => setOpenChangePassword(false)}
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
          <form onSubmit={handleChangePass}>
            <FlexCenter>
              <Grid container spacing={4}>
                <Grid item xs={8} sm={12}>
                  <TextField
                    label="Old Password"
                    name="oldPass"
                    type="password"
                    value={password.oldPass}
                    onChange={handleInputChangePass}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={8} sm={12}>
                  <TextField
                    label="New Password"
                    type={showPassword ? "text" : "password"}
                    name="newPass"
                    value={password.newPass}
                    error={errors.newPass} // Set error prop based on validation result
                    helperText={
                      errors.newPass && "Minimum length is 8 characters"
                    }
                    onChange={handleInputChangePass}
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                          >
                            {showPassword ? (
                              <VisibilityIcon />
                            ) : (
                              <VisibilityOffIcon />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={8} sm={12}>
                  <TextField
                    label="Re-enter New Password"
                    name="reNewPass"
                    type={showPassword ? "text" : "password"}
                    required
                    error={errors.reNewPass} // Set error prop based on validation result
                    helperText={
                      errors.reNewPass && "Minimum length is 8 characters"
                    }
                    inputProps={{ minLength: 8 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                          >
                            {showPassword ? (
                              <VisibilityIcon />
                            ) : (
                              <VisibilityOffIcon />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    value={password.reNewPass}
                    onChange={handleInputChangePass}
                    fullWidth
                    autoComplete="false"
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: "50px" }}>
                <Button
                  variant="contained"
                  color="secondary"
                  type="submit"
                  style={{
                    width: "100px",
                    fontSize: "16px",
                    marginRight: "10px",
                  }}
                >
                  SAVE
                </Button>
                <Button
                  onClick={(e) => setOpenChangePassword(false)}
                  variant="contained"
                  color="primary"
                  style={{
                    width: "100px",
                    fontSize: "16px",
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </FlexCenter>
          </form>
        </Box>
      </Modal>

      <AppBar
        sx={{
          position: "static",
          background: "none",
          boxShadow: "none",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* LEFT SIDE */}
          <FlexBetween>
            <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <MenuIcon />
            </IconButton>
          </FlexBetween>

          {/* RIGHT SIDE */}
          <FlexBetween gap="1.5rem">
            <FlexBetween>
              <Button
                onClick={handleClick}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  textTransform: "none",
                  gap: "1rem",
                }}
              >
                <Typography color={theme.palette.secondary[300]} variant="h5">
                  Hello, {profile.username}. Have a nice day!!
                </Typography>
                <ArrowDropDownOutlined
                  sx={{ color: theme.palette.secondary[300], fontSize: "25px" }}
                />
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={isOpen}
                onClose={handleClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
              >
                <MenuItem onClick={handleProfile}>Profile</MenuItem>
                <MenuItem onClick={handleChangePassword}>
                  Change Password
                </MenuItem>
                <MenuItem onClick={handleLogout}>Log Out</MenuItem>
              </Menu>
            </FlexBetween>
          </FlexBetween>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Navbar;
