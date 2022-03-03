import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(() => ({
    groupBox: {
        padding: '10px 9px 0 8px',
        background: '#f2f8f6',
        minHeight: '100%',
    },
    noDataText: {
        fontSize: 12,
        color: '#737578',
        marginTop: 26
    },
    noDataBox: {
        height: '60vh',
    },
    groupItem: {
        boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.1)',
        height: 80,
        width: '100%',
        padding: '10px 16px 9px 23px',
        marginBottom: 10,
        borderRadius: 10,
        background: '#fff',
        position: 'relative',
    },
    groupItemMask: {
        width: '100%',
        height: '100%',
        left: 0,
        top: 0,
        position: 'absolute',
        background: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 10,
    },
    groupItemIcon: {
    },
    groupItemIndex: {
        fontSize: 12,
        color: '#737578'
    },
    groupNumberIcon: {
        width: 10,
        height: 10,
        marginRight: 5,
        marginLeft: 28,
    },
    secTitle: {
        fontSize: 14,
        fontWeight: 500,
    },
    groupTitle: {
        fontSize: 14,
        fontWeight: 600,
        display: '-webkit-box',
        '-webkit-box-orient': 'vertical',
        '-webkit-line-clamp': 2,
        overflow: 'hidden',
    }
}));