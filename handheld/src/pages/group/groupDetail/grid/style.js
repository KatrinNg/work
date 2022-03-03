import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(() => ({
    formStyle: {
        border: '1px solid #39ad90',
        borderRadius: 4,
        background: '#fff',
        margin: '15px 0 0 0',
    },
    formContent: {
        maxHeight: '48vh',
        overflow: 'auto',
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
        overflow: 'hidden',
        wordBreak: 'break-all'
    },
    formItem: {
        color: '#000',
        fontWeight: 600,
    },
    formInnerItemBox: {
        padding: 0,
    },
    formInnerItem: {
        borderRight: '1px solid #39ad90',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    lastItemColumn: {
        borderRight: 'none',
    },
    lastItemRow: {
        borderBottom: 'none',
    },
    deleteBtn: {
        width: 16,
        height: 16,
        backgroundColor: '#fe0000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
    },
    deleteInnerBtn: {
        width: 8,
        height: 2,
        backgroundColor: '#fff',
    },
    baseBox: {
        width: 6,
        height: 6,
        borderRadius: '50%',
        position: 'absolute',
        right: 1,
        top: 2,
    },
    green: {
        background: '#76ee69'
    },
    red: {
        background: '#fe0000'
    },
    asterisk: {
        position: 'absolute',
        left: -5,
        top: -8,
    }
}));