import { makeStyles } from '@material-ui/core';
import index from 'themes';
export default makeStyles((theme) => ({
    headerMenuRoot: {
        background: "#ffffff",
        width: "100%",
        height: "59px",
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    leftIcon: {
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 15
    },
    menulogo: {
        height: 32,
        width: 28,
        marginLeft: 15
    },
    rams: {
        height: 30,
    },
    menuBtn: {
        minWidth: 59,
        borderRadius: 0,
        border: 'none',
    },
    menuIcon: {fontSize: '32px',color: '#FFFFFF'},
    contentRoot: {
        position: 'relative',
        height: 'calc(100% - 59px)',
        width: '100%',
        fontSize: 14,
        fontWeight: 500,
        color: '#000',
        backgroundColor: '#e1efed',
        flex: 1,
        overflowY: 'auto'
    },
    roomTitle: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 30,
        width: '100%',
        padding: '0px 14px',
        fontSize: 16,
        fontWeight: 500,
        color: '#6374c8',
        backgroundColor: '#cbeae4',
        '& span:last-child': {
            fontWeight: 600,
            color: '#000'
        }
    },
    menuDrawPop: {
        position: 'absolute',
        top: 59,
        width: '100%',
        height: 'calc(100% - 59px)',
        fontSize: 14,
        fontWeight: 500,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    drawPopContent: {
        zIndex: 9,
        backgroundColor: '#e1efed'
    },
    drawMenuContent: {
        display: 'flex',
        padding: '5px 9px 10px 9px',
        flexWrap: 'wrap',
        justifyContent: 'space-between'
    },
    workScanning: {
        display: 'flex',
        width: '100%',
        height: 30,
        lineHeight: '30px',
        padding: '0px 15px',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    scanning: {
        display: "flex",
        alignItems: 'center'
    },
    menuSpan: {
        display: 'block',
        height: 40,
        width: 95,
        lineHeight: '40px',
        textAlign: 'center',
        backgroundColor: '#f2f8f6',
        color: '#000',
        borderRadius: 10,
        marginBottom: 10,
        '&:hover': {
            backgroundColor: '#39ad90',
            color: '#FFFFFF'
        }
    },
    loginOut: {
        height: 38,
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        color: '#39ad90',
        fontSize: 14,
        paddingRight: 9,
        '& span': {
            padding: '0px 8px'
        }
    }
}));