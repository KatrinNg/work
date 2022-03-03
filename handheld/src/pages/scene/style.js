import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(() => ({
    sceneBox: {
        background: '#f2f8f6',
        minHeight: '100%',
    },
    sceneTitle: {
        height: 30,
        background: '#39ad90',
        color: '#fff',
        fontSize: 14,
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
    formStyle: {
        border: '1px solid #39ad90',
        borderRadius: 4,
        background: '#fff',
        margin: '22px 9px 0 8px',
    },
    formContent: {
        maxHeight: '48vh',
        overflow: 'auto',
    },
    btnBox: {
        // position: 'relative'
        marginTop: 18
    },
    updateBtn: {
        width: '80%', 
        minHeight: 40,
        // position: 'absolute',
        // left: '10%',
        // bottom: '-50px',
    }
}));