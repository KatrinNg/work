import React from "react";
import Button from "@material-ui/core/Button";
import useStyle from './styles';
import { ToggleButton } from '@material-ui/lab';
import clsx from 'clsx';
function ColorButton(props) {
  // backgroundColor is white
  const { color, style, className, ...other } = props;
  const classes = useStyle(props);
  return <Button style={style} className={clsx(classes.root, className)} {...other} />;
}

export default ColorButton;