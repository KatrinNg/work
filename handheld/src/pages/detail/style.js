import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(() => ({
    font: {
        color: "#737578",
        fontSize: "12px"
    },
    detailBox: {
        background: '#cbeae4',
        minHeight: '100%',
        padding: '10px 9px 0 8px',
    },
    tooltip: {
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        color: '#fff'
    },
    error: {
        color: "red",
        fontSize: "12px"
    },
    textField: {
        minWidth: "210px",
    },
    barcodeIcon: {
        width: "24px",
        height: "24px",
        margin: "10px"
    },
    barcodeDiv: {
        border: "1px #d6d6d6 solid",
        borderRadius: "50%",
        width: "43px",
        height: "43px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: "7px"
    },
    clearBtn: {
        width: "120px",
        height: "40px",
        background: "#e3fdf7",
        border: "1px solid #a8e2d3"
    },
}));