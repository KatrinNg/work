
import { makeStyles } from "@material-ui/styles";

export default makeStyles((theme) => ({
    font: {
        color: "#737578",
        fontSize: "12px"
    },
    enterBtn: {
        fontSize: "16px",
        fontWeight: "600",
        width: "95px",
        height: "50px",
    },
    leaveBtn: {
        fontSize: "16px",
        fontWeight: "600",
        width: "95px",
        height: "50px",
        marginLeft: "30px",
    },
    btnLogoDiv: {
        display: "flex",
        justifyContent: "space-between",
        width: "100%",
        alignItems: "center"
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
    icon: {
        height: "43px",
        width: "43px",
        marginRight: "12px"
    },
    error: {
        color: "red",
        fontSize: "12px"
    }
}));