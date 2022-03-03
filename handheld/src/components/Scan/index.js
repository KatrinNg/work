import React, { useState } from "react";
import { useStyles } from './style';
import ScanBox from './scanBox'
import { useSelector } from 'react-redux'

export default function(props) {
    const classes = useStyles();
    const { 
        getScanResult,
    } = props;

    const { g_showScan } = useSelector(
        (state) => {
            const { showScan } = state.room
            return {
                g_showScan: showScan,
            }
        }
    );

    return (
        <div className={classes.mainBox}>
            { g_showScan && <ScanBox getScanResult={getScanResult}/> }
      </div>
  );
}
