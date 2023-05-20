import { AlertContext } from "./AlertProvider";
import { AlertTitle, Alert as MuiAlert } from "@material-ui/lab";
import { makeStyles } from "@material-ui/core";
import React, { useContext, useEffect } from "react";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "fixed",
    right: theme.spacing(3),
    top: theme.spacing(4),
    zIndex: 2000
  },
  alert: {
    marginTop: theme.spacing(2)
  }
}));

export default function Notification(props) {
  const classes = useStyles();
  const { state, actions } = useContext(AlertContext);
  const handleClose = (alert) => {
    actions.removeAlert(alert);
  };
  return (
    <div className={classes.root}>
      {state?.alerts.length > 0 &&
        state.alerts.map((alert, index) => (
          <SnackbarProvider
            key={alert.id + index}
            alert={alert}
            actions={actions}
            handleClose={handleClose}
            {...props}
          />
        ))}
    </div>
  );
}

function SnackbarProvider({ duration = 3000, alert, handleClose }) {
  const classes = useStyles();
  useEffect(() => {
    const timer = setTimeout(() => handleClose(alert), duration);
    return () => {
      clearTimeout(timer);
    };
  }, [alert, duration, handleClose]);

  return (
    <MuiAlert
      className={classes.alert}
      onClose={() => handleClose(alert)}
      id={alert.id}
      elevation={6}
      variant="filled"
      severity={alert.type}
    >
      <AlertTitle>{alert.title}</AlertTitle>
      {alert.text}
    </MuiAlert>
  );
}
