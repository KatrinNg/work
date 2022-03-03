import {makeStyles} from "@material-ui/styles";

export default makeStyles(theme => ({
    containerDiv:{
        height: "100%",
        position: 'relative',
    },
    rightContentTitle:{
        height:30,
        border: 'solid 1px #39ad90',
        borderRadius:2,
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
        fontSize:14,
        color:'#000',
        fontWeight:600,
        backgroundColor:'#d1f2ea',
    },
    roomTitle: {
        fontSize: 12,
        fontWeight: 600,
        width: '100%',
        display: 'flex', alignItems: 'center',
        marginTop: 5,
        color: '#7b0400'
    },
    roomSelectEdit: {
        display:'flex',
        alignItems:'center',
        marginTop: 5,
        justifyContent: 'space-between',
        paddingRight: 16
    },
    tableContent: {
        padding:'0px 30px 10px 30px',
        backgroundColor:'#e0e6f1',
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    rowItem:{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        backgroundColor:'#fff',
        borderRadius: 6,
        marginTop: 5,
        height: 40,
    },
    sortSpan: {
        width: '17%',
        height: '100%',
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingLeft: 24
    },
    sortTreatment: {
        width: '50%',
        height: '100%',
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingLeft: 24,
        '& .MuiFormControl-root': {
            width: '80%',
            backgroundColor: '#f5f5f5',
            height: 30,
            lineHeight: '30px',
            borderRadius: 4,
            '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
            },
            '& .MuiInputBase-input': {
                height: 30,
                borderRadius: 4
            }
        }
    },
    remaining: {
        width: '25%',
        height: '100%',
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    sortDispaly: {
        display: 'flex',
        paddingRight: 40,
        width: '8%',
        justifyContent: 'flex-end',
    },
    select: {
        height: 30,
        backgroundColor: '#f5f5f5',
        borderRadius: 4,
        lineHeight: '30px',
        padding: '0px 0px 0px 10px',
    },
    errorTip: {
        fontSize: 18,
        fontWeight: 500,
        color: 'red',
        padding: '10px 0px 0px 10px'
    }
}));
