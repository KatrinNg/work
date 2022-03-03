import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(() => ({
    deleteButtonBox: {
        textAlign: 'right'
    },
    activityDeleteButton: {
        color: '#e90000',
    },
    TreatmentActivitiesItem: {
        background: '#fff',
        borderRadius: '10px',
        boxShadow: '3px 5px 10px 4px rgba(0, 0, 0, 0.07)',
        margin: '12px 24px 12px 31px',
        // position:'relative',
    },
    ActivitiesItemTitle: {
        background: '#dcf2ed',
        height: '50px',
        padding: '0 13px 0 22px',
        borderTopLeftRadius: '10px',
        borderTopRightRadius: '10px',
    },
    itemIndex: {
        fontFamily: 'PingFangTC',
        fontSize: '16px',
        fontWeight: '500',
        fontStretch: 'normal',
        fontStyle: 'normal',
        color: '#000',
    },
    TreatmentActivitiesItemContent: {
        padding: '0 28px 0 24px',
        background: '#fff',
        minHeight: '189px',
        // height: '189px',
        overflow: 'hidden',
    },
    ExpandContent: {
        // overflow: 'auto',
        height: '100%',
    },
    ExpandButton: {
        cursor: 'pointer',
        background: '#fff',
        width: '100%',
        height: '40px',
        lineHeight: '40px',
        textAlign: 'center',
        // position: 'absolute',
        // left: '0',
        // bottom: '0',
    },
    gridItemLabel: {
        fontFamily: 'PingFangHK-Semibold',
        fontSize: 14,
        color: '#1b1b1b',
        paddingLeft: 9,
        marginBottom: 6,
        marginTop: 18,
        fontWeight: 600,
        fontStretch: 'normal',
        fontStyle: 'normal',
    },
    textField: {
        paddingTop: 0,
        paddingBottom: 0,
        height: 40,
        
    },
    expandIcon: {
        transition: 'all .2s',
    },
    rotateExpandIcon: {
        transform: 'rotate(180deg)',
    },
    row: {
        // paddingTop: 10,
        // paddingBottom: 10,
    },
    titleBaseFontStyle: {
        fontFamily: 'PingFangTC',
        fontSize: '14px',
        fontWeight: 'normal',
        fontStretch: 'normal',
        fontStyle: 'normal',
        color: '#000',
    },
    secTitle: {
        fontFamily: 'PingFangTC',
        fontSize: '18px',
        fontWeight: 600,
        fontStretch: 'normal',
        fontStyle: 'normal',
        lineHeight: 'normal',
        marginTop: 25,
    },
    switchesBackground: {
        backgroundColor: '#f2f2f2',
        // padding: '0 0 0 20px',
        height: 80,
        padding: '9px 0 10px 33px'
    },
    switchesItemsBox:{
        minWidth: 690,
        marginRight: 16,
        backgroundColor: '#f2f2f2',
        borderRadius: 10,
    },
    switchesBox: {
        margin: '10px 0',
    },
    yellowBorderColor: {
        borderRight: '1px solid #f6dac5',
    },
    documentationItem: {
        borderRadius: 8,
        backgroundColor: '#f7f7f7',
        padding: '10px 13px',
        color: '#999',
        fontSize: '14',
        fontFamily: 'PingFangTC',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        height: 40
    },
    labelName: {
        fontFamily: 'PingFangTC',
        fontSize: 16,
        fontWeight: 'normal',
        fontStretch: 'normal',
        fontStyle: 'normal',
        color: '#1b1b1b',
    },
    checkboxLabel: {
        fontSize: 18,
        fontWeight: 600,
        fontFamily: 'PingFangTC',
        fontStretch: 'normal',
        fontStyle: 'normal',
        color: '#000',
        marginBottom: '-5px'
    },
}));