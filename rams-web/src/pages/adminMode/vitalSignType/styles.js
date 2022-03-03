import {makeStyles} from "@material-ui/styles";

export default makeStyles(theme => ({
    container:{
        width:'100%',
        height:'100%',
        fontFamily: 'PingFangTC',
        fontSize: 14,
        fontWeight: 'normal',
        fontStretch: 'normal',
        fontStyle: 'normal',
        lineHeight: 'normal',
        letterSpacing: 'normal',
        color: '#000',
        position:'relative',
    },
    header:{
        padding:'10px 11px',
        backgroundColor:'#ecf0f7',
    },
    headerTitle:{
        height:30,
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
        borderRadius:2,
        border:'1px solid #39ad90',
        backgroundColor:'#d1f2ea',
    },
    headerContent:{
        display:'flex',
        justifyContent:'space-between',
        alignItems:'center',
        marginTop:12,
        padding:'0 16px 0 6px'
    },
    select:{
        width:58,
        height:30,
        border:4,
        backgroundColor:'#f5f5f5',
        marginLeft:5,
        marginRight:9,
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
    content:{
        width: "100%",
        position: "relative",
        height: "73%",
        flex: 1
    },
    contentAbsolute:{
        // marginLeft
        overflowY: "auto",
        position: 'absolute',
        top: 35,
        left: 32,
        right: 29,
        bottom: 0,
    },
    pagination: {
        width: "100%",
        paddingLeft: "32px",
        paddingRight: "26px",
        paddingTop: "25px",
        height: "94px",
        position:'absolute',
        bottom:0,
    },
}));
