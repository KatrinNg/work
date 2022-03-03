import { makeStyles } from '@material-ui/styles';

export default makeStyles((theme) => ({
    containerDiv: {
        background: '#e0e6f1',
        minHeight: '100%',
        display: 'flex',
        width: '100%',
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
    content: {
        paddingLeft: '32px',
        paddingRight: '29px',
        width: '100%',
        position: 'relative',
        height: '100%',
        flex: 1,
        marginTop: '15px',
    },
    contentAbsolute: {
        overflowY: 'auto',
        position: 'absolute',
        top: 35,
        left: 32,
        right: 29,
        bottom: 0,
    },
    pagination: {
        marginBottom: '0px',
        width: '100%',
        paddingLeft: '32px',
        paddingRight: '26px',
        paddingTop: '25px',
        height: '94px',
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
    listItemInactive: {
        background: '#d8d8d8',
        cursor: 'pointer',
    },
}));
