import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(() => ({
    inprogressBox: {
        borderRadius: 10,
        border: 'solid 1px #39ad90',
        backgroundColor: '#fff',
        padding: '20px 16px 20px 13px',
        marginBottom: 8,
    },
    inprogressTips: {
        fontSize: 14,
        color: '#39ad90',
        fontWeight: 500,
    },
    inprogressTreatment: {
        fontSize: 16,
        fontWeight: 600,
        color: '#000',
    },
    stopBtn: {
        marginRight: 7,
        width: 18,
        height: 18,
    }
}));