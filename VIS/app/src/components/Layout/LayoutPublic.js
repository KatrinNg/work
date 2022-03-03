import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import HeaderPublic from "./HeaderPublic";
import haLogo from "../../assets/img/ha_logo.gif";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex"
  },
  pageContainer: {
    paddingTop: 30,
    display: "flex",
    width: "100%",
    height: "100%",
    [theme.breakpoints.down("sm")]: {
      paddingTop: 10
    },
    [theme.breakpoints.down("md")]: {
      paddingTop: 20
    }
  },
  contentWrapper: {
    flexGrow: 1,
    width: "100%",
    padding: "5px 5px",
    margin: "5px 12px 8px 12px",
    minHeight: "100vh"
  }
}));

const LayoutPublic = ({ children }) => {
  const classes = useStyles();
  return (
    <div id="container" className={classes.root}>
      <HeaderPublic />
      <div id="pageContainer" className={classes.pageContainer}>
        <div id="content" className={classes.contentWrapper}>
          {children}
        </div>
      </div>
    </div>
  );
};

LayoutPublic.propTypes = {
  children: PropTypes.node.isRequired
};

export default LayoutPublic;
