import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(() => ({
    title:{
        height: 35,
        padding: '8px 9px 7px 11px',
        backgroundColor: '#c8e9e0',
        width: '100%',
        fontFamily: 'PingFangTC',
        fontSize: 14,
        fontWeight: 600,
        fontStretch: 'normal',
        fontStyle: 'normal',
        color: '#000',
    },
    typeColor: {
        width: 20,
        height: 20,
        marginRight: 8,
        borderRadius: 3,
        display: 'inline-block',
    },
    editIcon:{
        cursor: 'pointer',
        width: 18,
        height: 18,
    },
    baseBox: {
        background: '#fff',
        padding: '6px 0 0 0',
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflowY: 'auto',
    },
    readOnlyItem: {
        height: 35,
        lineHeight: '35px'
    },
    label: {
        fontFamily: 'PingFangTC',
        fontSize: 14,
        fontWeight: 600,
        fontStretch: 'normal',
        fontStyle: 'normal',
        color: '#000',
    }
}));