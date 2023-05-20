import {
  TextField,
  Button,
  Typography,
  Box,
  useTheme,
  Modal,
  IconButton
} from "@mui/material";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import FlexCenter from "components/FlexCenter";
import { AuthService } from "services/auth";
import { AlertContext } from "../../components/AlertProvider";
import Notification from "../../components/Notification";
import { axiosApi } from "http-common";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import InputAdornment from "@material-ui/core/InputAdornment";


const Login = () => {
  const theme = useTheme();
  const [openModal, setOpenModal] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email1, setEmail1] = useState("");
  const navigate = useNavigate();
  const { actions } = useContext(AlertContext);
  var role = "";

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = () => setShowPassword(!showPassword);

  const handleSubmit = (event) => {
    event.preventDefault();
    AuthService.login(
      username,
      password, 
      (token) => {
        token.data.accountInfo.roles.map((item) => (role = item.name));
        if (role === "ADMIN" || role === "PM") {
          localStorage.setItem("access_token", token.data.jwtToken);
          localStorage.setItem("role", role);
          localStorage.setItem(
            "accountInfo",
            JSON.stringify(token.data.accountInfo)
          );
          navigate("/dashboard");
          actions.addAlert({
            text: "Login Successfully!",
            type: "success",
            id: Date.now(),
          });
        } else {
          actions.addAlert({
            text: "You don't have permission to login web app",
            type: "error",
            id: Date.now(),
          });
        }
      },
      (reason) => {
        actions.addAlert({
          text: "Something wrong. Please try again",
          type: "info",
          id: Date.now(),
        });
      }
    );
  };

  const handleForgetPass = () => {
    let email = { email: email1 };
    axiosApi
      .post("users/sendmailpassword", email)
      .then(() => {
        actions.addAlert({
          text: "Link has been send to your email. Please check your email",
          type: "success",
          id: Date.now(),
        });
      })

      .catch((error) => {
        actions.addAlert({
          text: error.message,
          type: "error",
          id: Date.now(),
        });
      })
      .finally(() => setOpenModal(false));
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box color={theme.palette.secondary.main}>
        <Typography
          variant="h1"
          fontWeight="bold"
          textAlign="center"
          paddingTop="50px"
          fullWidth
        >
          W F M S - Workflow Management System
        </Typography>
      </Box>
      <FlexCenter>
        <Modal open={openModal} onClose={() => setOpenModal(false)}>
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
              Input your email to get reset password link
            </Typography>
            <TextField
              fullWidth
              value={email1}
              onChange={(event) => setEmail1(event.target.value)}
            ></TextField>
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleForgetPass}
              >
                Submit
              </Button>
            </Box>
          </Box>
        </Modal>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            border: "1px solid white",
            marginTop: "150px",
            padding: "40px",
            borderRadius: "10px",
            background: "#d5d5d5",
          }}
        >
          <Typography variant="h2" fontWeight="bold" textAlign="center">
            Login
          </Typography>
          <TextField
            label="User Name"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            margin="normal"
            style={{ marginTop: "30px", width: "300px" }}
            required
          />
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            margin="normal"
            required
            style={{ marginBottom: "20px", width: "300px" }}
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
          />
          <Typography
            sx={{
              textDecoration: "underline",
              "&:hover": {
                cursor: "pointer",
              },
            }}
            textAlign="center"
            onClick={() => {
              setOpenModal(true);
              setEmail1("");
            }}
          >
            Forget Password?
          </Typography>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            style={{ marginTop: "20px", width: "150px", fontSize: "20px" }}
          >
            Login
          </Button>
        </Box>
      </FlexCenter>
      <Notification />
    </form>
  );
};

export default Login;
