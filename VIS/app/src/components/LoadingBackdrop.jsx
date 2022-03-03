import React from "react";
import PropTypes from "prop-types";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles((theme) => ({
	backdrop: {
		zIndex: theme.zIndex.drawer + 1,
		color: '#fff',
	},
}));

const LoadingBackdrop = ({isShown})=>{
	const classes = useStyles();
	return (<Backdrop open={isShown} className={classes.backdrop}>
		<CircularProgress color="inherit" />
	</Backdrop>)
}

LoadingBackdrop.propTypes = {
	isShown: PropTypes.bool
};

export default LoadingBackdrop;

