import { makeStyles } from '@material-ui/styles';

export default makeStyles((theme) => ({
    containerDiv: {
        width: '100%',
        height: '100%',
        position: 'relative',
        fontSize: 14,
        color: '#000',
        fontWeight: 'normal',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
    },
    headerDiv: {
        background: '#ecf0f7',
        display: 'flex',
        width: '100%',
        flexDirection: 'column',
    },
    title: {
        background: '#d1f2ea',
        margin: '10px 9px 19px 11px',
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        border: 'solid 1px #39ad90',
        backgroundColor: '#d1f2ea',
    },
    rightContentTitle: {
        fontWeight: 600,
        height: 30,
        border: 'solid 1px #39ad90',
        borderRadius: 2,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#d1f2ea',
    },
    select: {
        width: 58,
        height: 30,
        border: 4,
        backgroundColor: '#f5f5f5',
        marginRight: 9,
    },
    roomNo: {
        marginTop: 9,
        marginLeft: 48,
        color: '#7b0400',
        marginBottom: 13,
        fontWeight: 600,
    },
    content: {
        width: '100%',
        position: 'relative',
        flex: 1,
    },
    contentAbsolute: {
        // marginLeft
        overflowY: 'auto',
        position: 'absolute',
        top: 35,
        left: 32,
        right: 29,
        bottom: 140,
    },
    pagination: {
        width: '100%',
        height: 94,
        paddingLeft: '32px',
        paddingRight: '26px',
        paddingTop: 25,
        bottom: 0,
    },
    switch: {
        '& .MuiSwitch-track': {
            height: '130%',
            background: '#bdbdbd',
            borderRadius: '10px',
        },
        '& .MuiSwitch-thumb': {
            marginTop: '2px',
        },
        '& .MuiSwitch-colorSecondary.Mui-checked': {
            color: '#ffffff',
        },
        '& .MuiSwitch-colorSecondary.Mui-checked + .MuiSwitch-track ': {
            background: '#39b194',
        },
        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
            opacity: 1,
        },
    },
    buttonDiv: {
        display: 'flex',
        justifyContent: 'flex-end',
        width: '100%',
        paddingBottom: '20px',
        marginTop: '20px',
    },
    listItem: {
        background: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        borderRadius: '6px',
        height: '40px',
        marginBottom: '5px',
        alignItems: 'center',
        '&:hover': {
            cursor: 'pointer',
        },
    },
    detailTitle: {
        color: '#7b0400',
        fontSize: '14px',
        fontWeight: 600,
    },
    detailGridItem: {
        marginLeft: '16px',
    },
    searchBox: {
        padding: '10px 50px 0px 40px',
    },
    contentDetail: {
        paddingLeft: '32px',
        paddingRight: '29px',
        width: '100%',
        position: 'relative',
        height: '100%',
        flex: 1,
        marginTop: '15px',
    },
    contentDetailAbsolute: {
        // marginLeft
        overflowY: 'auto',
        position: 'absolute',
        top: 35,
        left: 32,
        right: 29,
        bottom: 0,
    },
    listItemInactive: {
        background: '#d8d8d8',
        cursor: 'pointer',
    },
}));
