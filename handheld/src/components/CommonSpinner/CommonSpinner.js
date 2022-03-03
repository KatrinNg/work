import React from 'react';
import spinner from "resource/enterRoom/spinner.svg"

import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
    root: {
        position: "fixed",
        opacity: "0.5",
        background: "#000",
        zIndex: "10000",
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        alignItems: "center", 
        justifyContent: "center"

    }
}))


export default function CommonSpinner(props) {

    const { display } = props

    const classes = useStyles()


    return (
        <>
            <div className={classes.root} style={display ? { display: "flex"} : {display:"none"}} onClick={(e)=> e.stopPropagation()}>
                <img src={spinner} />
            </div>
        </>
    )
}