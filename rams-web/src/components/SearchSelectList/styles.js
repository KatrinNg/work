import {
    makeStyles
} from '@material-ui/core/styles';

export const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%'
    },
    popper: (props) => ({
        minWidth: props.width,
        padding: '12px 13px',
        borderRadius: 10,
        boxShadow: '0 2px 4px 5px rgba(30, 30, 30, 0.06)',
        backgroundColor: '#fff'
    }),
    paper: {
        boxShadow: 'none',
        margin: 0,
        color: '#586069',
        fontSize: 13,
    },
    textField: {
        width: '100%',
        padding: '10px 10px 10px 17px',
        borderRadius: 8,
        fontSize: 14,
        fontFamily: 'PingFangTC',
        boxSizing: 'border-box',
        height: 40,
        color: '#000'
    },
    option: {
        width: '100%',
        minHeight: '34px',
        alignItems: 'flex-start',
        borderBottom: '1px solid #dfdfdf',
        '&[aria-selected="true"]': {
            // backgroundColor: 'transparent',
        },
        '&[data-focus="true"]': {
            // backgroundColor: theme.palette.action.hover,
        },
    },
    popperDisablePortal: {
        position: 'relative',
        minWidth: '100%'
    },
    inputSearch: {
        width: '100%',
        height: 40,
        padding: '10px 19px 9px 7px',
        borderRadius: '8px',
        backgroundColor: '#f6f6f6'
    },
    inputBase: {
        padding: 0,
        width: '100%',
        display: 'flex',
        flex: 1
    },
    listItem: {
        fontSize: 14,
        fontFamily: 'PingFangTC',
        color: '#000',
    },
    triangleDown: {
        width: 0,
        height: 0,
        borderLeft: '6px solid transparent',
        borderRight: '5px solid transparent',
        borderTop: '10px solid #797979',
    },
    notchedOutline: {
        borderRadius: 8,
        borderColor: '#bbb'
    }
}));