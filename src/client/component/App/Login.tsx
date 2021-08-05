import React, { useReducer, useEffect, FC } from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import {
  TextField,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Button,
  ListItem
} from "@material-ui/core";
import SortedPage from "../App/Register";
import { Link, useLocation, Route } from "react-router-dom";
import Register from "../App/Register";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: "flex",
      flexWrap: "wrap",
      width: 400,
      margin: `${theme.spacing(0)} auto`,
    },
    loginBtn: {
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
  | { type: "loginSuccess"; payload: string }
  | { type: "loginFailed"; payload: string }
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
    case "loginSuccess":
      return {
        ...state,
        helperText: action.payload,
        isError: false,
      };
    case "loginFailed":
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

const Login: FC<{ onLoginSuccess: () => any }> = (props: {
  onLoginSuccess: () => any;
}) => {
  const classes = useStyles();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { pathname } = useLocation();

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

  const handleLogin = () => {
    if (state.userid === "user" && state.password === "123") {
      dispatch({
        type: "loginSuccess",
        payload: "Login Successfully",
      });
      props.onLoginSuccess();
    } else {
      dispatch({
        type: "loginFailed",
        payload: "Incorrect username or password",
      });
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.keyCode === 13 || event.which === 13) {
      state.isButtonDisabled || handleLogin();
    }
  };

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
        <CardHeader className={classes.header} title="Login Test" />
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
              onKeyPress={handleKeyPress}
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
              onKeyPress={handleKeyPress}
            />
          </div>
          <div className="float-right">
              <ListItem
                component={Link}
                to="/register"
                selected={pathname == "/register"}
                button
              ><u>Register</u>
              </ListItem>
          </div>
        </CardContent>
        <CardActions className="col">
          <Button
            variant="contained"
            size="large"
            color="secondary"
            className={classes.loginBtn}
            onClick={handleLogin}
            disabled={state.isButtonDisabled}
          >
            Login
          </Button>
        </CardActions>
      </Card>

      <Route path="/register" component={Register} />
    </form>
  );
};

export default Login;
