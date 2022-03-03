import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(() => ({
    groupDetailItemIcon: {
        color: '#8c8c8c',
        transform: 'rotate(180deg)',
    },
    groupDetailCrumb: {
        height: 42,
        color: '#7e7e7e',
        fontSize: 16,
    },
    groupDetailBox: {
        background: '#f2f8f6',
        minHeight: '100%',
    },
    groupDetailTitle: {
        fontSize: 14,
        fontWeight: 600,
    },
    groupDetailTime: {
        fontSize: 12,
        color: '#737578',
    },
    stopBtn: {
        marginRight: 7,
        width: 18,
        height: 18,
    },
    numberCount: {
        color: '#6374c8',
        fontSize: 16,
    }
}));