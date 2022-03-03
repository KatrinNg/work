import { Grid } from "@material-ui/core";
import React from "react";
import { useStyles } from "./styles";

export default function CommonItem(props) {
    const classes = useStyles();
    const { 
        label, 
        labelWidth, 
        labelStyle = {},
        margin = '0 0 10px 0', 
        children } = props;
    // console.log(props);
    const itemStyle = {
        margin
    }
    labelStyle.width = labelStyle.width ? labelStyle.width : labelWidth;
   
    return (
        <Grid container alignItems="center" style={itemStyle}>
            <Grid className={classes.label} style={labelStyle}>{label}</Grid>
            {children}
        </Grid>
    )
}