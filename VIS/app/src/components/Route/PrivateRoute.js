import React from "react";
import { Route, Redirect } from "react-router-dom";
//import { getSessionToken } from "../../helpers/storage/session";

export const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={(props) => <Component {...props} />} />

  // <Route
  //   {...rest}
  //   render={props =>
  //     getSessionToken() ? (
  //       <Component {...props} />
  //     ) : (
  //       <Redirect
  //         to={{ pathname: "/login", state: { from: props.location } }}
  //       />
  //     )
  //   }
  // />
);
