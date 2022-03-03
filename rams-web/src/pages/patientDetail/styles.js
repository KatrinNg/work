import {
    makeStyles
} from "@material-ui/styles";

export default makeStyles(theme => ({
    layout: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    SContentLayout: {
        flex: 1,
        display: 'flex',
        // padding: '0 24px 0 31px',
        paddingBottom: 0
    },
    SContent: {
        flex: 1,
        display: 'flex',
        height: '100%',
        width: '100%',
        position: 'relative'
    },
    SContentAbsolute: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflowY: 'auto',
    },
    STopNav: {
        height: 65,
        // marginBottom: 10,
        padding: '10px 28px 10px 29px'
    },
    navLeft: {
        width: 837,
        marginRight: 10,
        height: 45,
        borderRadius: 8,
        backgroundColor: '#fff',
        padding: '3px 4px 4px 3px',
        boxShadow: '0 3px 13px 0 rgba(73, 81, 97, 0.2)'
    },
    navSummaryBtn: {
        display: 'flex',
        width: '120px',
        height: 45,
        padding: '5px 7px 6px',
        borderRadius: '10px',
        border: '1px solid #3ab395',
        backgroundColor: '#fff',
        color: '#3ab395',
        fontFamily: 'PingFangTC',
        fontSize: 13,
        fontWeight: 600,
        lineHeight: 1.2,
        textAlign: 'center',
        alignItems: 'center'
    },
    listNav: {
        width: '100%',
        display: 'flex',
        padding: 0,
        alignItems: 'center'
    },
    listNavItem: {
        width: '131px',
        height: '38px',
        // margin: '0 10px 0 0',
        padding: '11px 12px',
        borderRadius: '8px',
        textAlign: 'center',
        color: '#282b2d',
        fontSize: 13,
        fontFamily: 'PingFangTC',
        justifyContent: 'center',
        lineHeight: 1.23,
        alignItems: 'center'
    },
    line: {
        width: 1,
        backgroundColor: '#bcbcbc',
        margin: '0 4px',
        height: 20
    },
    ListRoot: {
        '&.Mui-selected, &.Mui-selected:hover': {
            backgroundColor: '#facb42',
            fontWeight: '600'
        },
        '&:hover': {
            backgroundColor: '#fff',
        }
    },
    footer: {
        width: '100%',
        height: 80,
        backgroundColor: '#e6fcf6'
    },
}));
