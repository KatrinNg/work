import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(() => ({
    treatmentBox: {
        padding: 8,
    },
    treatmentValue: {
        padding: '8px 137px 7px 13px',
        borderRadius: 4,
        backgroundColor: '#f2f2f2',
        marginBottom: 10,
    },
    treatmentIcon: {
        marginRight: 3,
    },
    treatmentLabel: {
        fontSize: 20,
        fontWeight: 600,
        color: '#39ad90',
    },
    treatmentMargin: {
        marginRight: 45
    },
    treatmentItem: {
        padding: '13px 168px 16px 13px',
        borderRadius: 4,
        border: 'solid 1px #39ad90',
        marginBottom: 9,
    },
    treatmentRecordItem: {
        padding: '0 9px 0 10px',
        borderRadius: 4,
        border: 'solid 1px #39ad90',
        backgroundColor: '#f1fefa',
        width: '100%',
        height: 30,
        marginBottom: 5,
        fontSize: 12,
        color: '#979797',
        position: 'relative',
        paddingRight: 30
    },
    treatmentEditIcon: {
        position: 'absolute',
        right: 0,
        top: 0,
        transform: 'translate(0,-3px)',
    },
    stopBtn: {
        marginRight: 7,
        width: 18,
        height: 18
    },
    startBtn: {
        marginRight: 7,
        width: 11,
        height: 13
    },
    numberStyle: {
        width: 25,
        height: 25,
        backgroundColor: '#ffe0c8',
        color: '#eb5e00',
        display: 'inline-flex',
        borderRadius: '50%',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 7,
    },
    remark: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        wordBreak: 'break-all',
        whiteSpace: 'nowrap',
        maxWidth: '100%',
        minWidth: '50%'
    }
}));