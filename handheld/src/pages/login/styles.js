
import { makeStyles } from "@material-ui/styles";
import bgIcon from '../../resource/login/group-3.png'

export default makeStyles((theme) => ({
    loginTitle: {
        background: "#ffffff",
        width: "100%",
        height: "59px",
        position: "fixed",
        top: 0,
        right: 0,
        left: 0,
        zIndex: 6,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    content: {
        height: '100%',
        width: '100%',
        overflowY: 'auto',
        background:"#f2f8f6",
        alignContent:"flex-start"
    },
    exerciseIcon: {
        width: "148px",
        height: "115px",
        position: "absolute",
        right: "50%",
        left: "50%",
        transform: "Translate(-50%, -50%)",
        bottom: "-65px",
        zIndex: 2
    },
    ramsIcon: {
        width: "225px",
        height: "50px",
        marginTop: "40px"
    },
    logoSession: {
        width: "100%",
        height: "210px",
        background: `-130px -25px  no-repeat url(${bgIcon})`,
        position: "relative",
        marginTop: "45px",
        display: "flex",
        justifyContent: "center"
    },
    inputSession: {
        marginTop: "19px"
    },
    font: {
        fontSize: "12px",
        color: "#737578",
        fontWeight: "normal",
    },
    textField: {
        "& .MuiOutlinedInput-input": {
            paddingTop: "0",
            paddingBottom: "0",
            height: "40px",
            background: "#ffffff",
            borderRadius: "8px",
            fontSize: "12px"
        },
        "& .MuiOutlinedInput-adornedEnd": {
            background: "white"
        },
        "& .MuiOutlinedInput-root": {
            borderRadius: "8px"
        },
        width: "260px",

    },
    inputIcon: {
        height: "13px",
        width: "12px",
        margin: "2px 9px 6px 3px "
    },
    select: {
        fontSize: "12px",
        width: "260px"
    },
    button: {
        background: "#39ad90",
        borderRadius: "10px",
        marginTop: "20px",
        color: "white",
        height: "40px"
    },
    haIcon: {
        width: "114px",
        height: "48px"
    },
    error: {
        color: "red",
        fontSize: "12px"
    },
    visibilityBtn: {
        "&.MuiIconButton-root": {
            padding: 0,
        },
        "&.MuiInputBase-root": {
            background: "transparent"
        }
    },
    ptBtn: {
        width: "125px",
        height: "40px",
    },
    otBtn: {
        width: "125px",
        height: "40px",
        marginLeft: "5px",
    },
}));