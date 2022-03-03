import {makeStyles} from "@material-ui/styles";

export default makeStyles(theme => ({
    container:{
        height: "100%",
        width: "100%",
        position:'relative',
    },
    header:{
        padding:'10px 11px',
        backgroundColor:"#ecf0f7",
    },
    title:{
        height:30,
        width:'100%',
        borderRadius: 2,
        border: 'solid 1px #39ad90',
        backgroundColor: '#d1f2ea',
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
    },
    headerContent:{
        display:'flex',
        justifyContent:'space-between',
        alignItems:'center',
        marginTop:14,
        padding:'0 6px'
    },
    entries:{
        display:'flex',
        alignItems:'center',
    },
    switch: {
        "& .MuiSwitch-track": {
            height: "130%",
            background: "#bdbdbd",
            borderRadius: "10px",

        },
        "& .MuiSwitch-thumb": {
            marginTop: "2px"
        },
        "& .MuiSwitch-colorSecondary.Mui-checked": {
            color: "#ffffff"
        },
        "& .MuiSwitch-colorSecondary.Mui-checked + .MuiSwitch-track ": {
            background: "#39b194"
        }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
            opacity: 1
        }
    },
    searchIcon: {
        "& g": {
            stroke: "green",
            fill: "green"
        }

    },
    searchInput: {
        "& .MuiFormControl-root": {
            height: "100%",
            borderColor: "transparent"
        },
        "& .MuiInputBase-root": {
            height: "100%",
        },
        "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "transparent"
        }
    },
    content: {
        paddingLeft: "32px",
        paddingRight: "29px",
        width: "100%",
        position: "relative",
        height: "73%",
    },
    contentAbsolute: {
        overflowY: "auto",
        position: 'absolute',
        top: 35,
        left: 32,
        right: 29,
        bottom: 0,
    },
    pagination: {
        padding:'0 32px',
        width:'100%',
        height: "94px",
        position:'absolute',
        bottom:0,
    },
    buttonDiv: {
        position:'absolute',
        bottom:52,
        right:32
    },
    
}));
