import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(() => ({
    baseFontStyle: {
        fontStretch: 'normal',
        fontStyle: 'normal',
        fontFamily: 'PingFangTC',
    },
    title: {
        fontSize: 16,
        fontWeight: 600,
        color: '#000',
        marginBottom: 7,
    },
    formLabel: {
        fontSize: 12,
        color: '#737578',
        borderRight: '1px solid #39ad90',
        borderBottom: '1px solid #39ad90',
        padding: '12px 5px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    formItem: {
        color: '#000',
        fontWeight: 600,
    },
    lastItemColumn: {
        borderRight: 'none',
    },
    lastItemRow: {
        borderBottom: 'none',
    },
    formTitle: {
        padding: '3px 5px',
    },
    formStyle: {
        border: '1px solid #39ad90',
        borderRadius: 4,
        width: '100%',
        marginTop: 9,
    },
    formStyleSec: {
        padding: 12,
    },
    textField: {
        marginTop: 9,
    },
    warningText: {
        color: '#ff0000',
        margin: '8px 0 20px 0'
    }
}));