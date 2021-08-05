import React, { useReducer, useEffect, FC } from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import {
  TextField,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Button
} from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: "flex",
      flexWrap: "wrap",
      width: 400,
      margin: `${theme.spacing(0)} auto`,
    },
    cancelBtn: {
      marginTop: theme.spacing(1),
      flexGrow: 1,
      borderRadius: 50,
    },
    saveBtn: {
        marginTop: theme.spacing(1),
        flexGrow: 1,
        borderRadius: 50,
      },
    header: {
      textAlign: "center",
      background: "#212121",
      color: "#fff",
    },
    card: {
      marginTop: theme.spacing(10),
    },
  })
);

type State = {
  userid: string;
  password: string;
  isButtonDisabled: boolean;
  helperText: string;
  isError: boolean;
};

const initialState: State = {
  userid: "",
  password: "",
  isButtonDisabled: true,
  helperText: "",
  isError: false,
};

type Action =
  | { type: "setUserid"; payload: string }
  | { type: "setPassword"; payload: string }
  | { type: "setIsButtonDisabled"; payload: boolean }
  | { type: "saveSuccess"; payload: string }
  | { type: "saveFailed"; payload: string }
  | { type: "setIsError"; payload: boolean };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "setUserid":
      return {
        ...state,
        userid: action.payload,
      };
    case "setPassword":
      return {
        ...state,
        password: action.payload,
      };
    case "setIsButtonDisabled":
      return {
        ...state,
        isButtonDisabled: action.payload,
      };
    case "saveSuccess":
      return {
        ...state,
        helperText: action.payload,
        isError: false,
      };
    case "saveFailed":
      return {
        ...state,
        helperText: action.payload,
        isError: true,
      };
    case "setIsError":
      return {
        ...state,
        isError: action.payload,
      };
  }
};

const Register: FC<{ onRegisterSuccess: () => any }> = (props: {
  onRegisterSuccess: () => any;
}) => {
  const classes = useStyles();
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (state.userid.trim() && state.password.trim()) {
      dispatch({
        type: "setIsButtonDisabled",
        payload: false,
      });
    } else {
      dispatch({
        type: "setIsButtonDisabled",
        payload: true,
      });
    }
  }, [state.userid, state.password]);


  const handleUseridChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    dispatch({
      type: "setUserid",
      payload: event.target.value,
    });
  };

  const handlePasswordChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    dispatch({
      type: "setPassword",
      payload: event.target.value,
    });
  };
  return (
    <form className={classes.container} noValidate autoComplete="off">
      <Card className={classes.card}>
        <CardHeader className={classes.header} title="Register Test" />
        <CardContent>
          <div>
            <TextField
              error={state.isError}
              fullWidth
              id="userid"
              type="email"
              label="UserID"
              placeholder="UserID"
              margin="normal"
              onChange={handleUseridChange}
            />
            <TextField
              error={state.isError}
              fullWidth
              id="password"
              type="password"
              label="Password"
              placeholder="Password"
              margin="normal"
              helperText={state.helperText}
              onChange={handlePasswordChange}
            />
            <TextField
            error={state.isError}
            fullWidth
            id="password"
            type="password"
            label="Confirm Password"
            placeholder="Confirm Password"
            margin="normal"
            helperText={state.helperText}
            onChange={handlePasswordChange}
          />
          </div>
        </CardContent>
        <CardActions className="col">
            <Button
                variant="contained"
                size="large"
                color="secondary"
                className={classes.cancelBtn}
                disabled={state.isButtonDisabled}
            >
                Cancel
            </Button>
            <Button
                variant="contained"
                size="large"
                color="secondary"
                className={classes.saveBtn}
                disabled={state.isButtonDisabled}
            >
                Save
            </Button>
        </CardActions>
      </Card>
    </form>
  );
};

export default Register;
