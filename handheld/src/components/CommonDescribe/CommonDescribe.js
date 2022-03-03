import React from "react";
import { useStyles } from "./style";
import { Grid } from "@material-ui/core";
import IconInfo from 'resource/detail/icon-info-small.svg';

export default function CommonDescribe(props) {
    // console.log(props);
    const { label, value, children, margin, showInfoIcon = false, onSuffixClick, suffix } = props;
    const customStyle = {margin}
    const classes = useStyles(customStyle);
    return (
        <Grid className={classes.box}>
            <Grid item>
                <Grid item container alignItems="center">
                    <span className={`${classes.label} ${classes.baseFontSize}`}>{label}</span>
                    {showInfoIcon && <img className={classes.infoIcon} src={suffix ? suffix : IconInfo} onClick={(e) => {
                        onSuffixClick && onSuffixClick(e);
                    }}/>}
                </Grid>
            </Grid>
            <Grid item container className={`${classes.baseFontSize} ${value ? classes.valueStyle : ''}`}>
                {value ? value : children}
            </Grid>
        </Grid>
    )
}