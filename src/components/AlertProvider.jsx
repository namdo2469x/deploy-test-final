import React, { createContext, useReducer } from "react";

const AlertContext = createContext([{}, () => {}]);
AlertContext.displayName = "AlertContext";

const initialState = {
  alerts: []
};

let reducer = (state, action) => {
  let newAlerts, element;
  switch (action.type) {
    case "ADD_ALERT":
      newAlerts = [...state.alerts, action.payload];
      return { ...state, alerts: newAlerts };
    case "REMOVE_ALERT":
      element = state.alerts.filter((e) => e.id !== action.payload.id);
      return { alerts: element };
    default:
      return state;
  }
};

function AlertContextProvider(props) {
  let [state, dispatch] = useReducer(reducer, initialState);

  const actions = {
    addAlert: (payload) => {
      dispatch({ type: "ADD_ALERT", payload });
    },
    removeAlert: (payload) => {
      dispatch({ type: "REMOVE_ALERT", payload });
    }
  };

  return (
    <AlertContext.Provider value={{ state: state, actions: actions }}>
      {props.children}
    </AlertContext.Provider>
  );
}

export { AlertContext, AlertContextProvider };
