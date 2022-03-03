import {
    makeStyles
} from "@material-ui/styles";

export default makeStyles(theme => ({
    scheduleGroupTitle: {
        color: '#000',
        width: '100%',
        fontSize: 14,
        fontFamily: 'PingFangTC',
        fontWeight: 600,
        fontStretch: 'normal',
        fontStyle: 'normal',
        letterSpacing: 'normal',
        padding: '7px 16px',
        height: 35,
        backgroundColor: '#c8e9e0',
    },
    footer: {
        height: 80,
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        backgroundColor: '#e6fcf6'
    },
    noScheduleList: {
        paddingTop: 57,
        fontSize: 12,
        fontFamily: 'PingFangTC',
        fontStretch: 'normal',
        fontStyle: 'normal',
        letterSpacing: 'normal',
        color: '#999'
    },
    addIconInList: {
        width: 19,
        height: 19,
        marginRight: 9,
        cursor: 'pointer',
        marginTop: '-2px'
    },
    SContent: {
        flex: 1,
        display: 'flex',
        width: '100%',
        position: 'relative'
    },
    SContentAbsolute: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflowY: 'auto',
        paddingLeft: 10,
        paddingRight: 10,
    },
    itemPaper: {
        width: '100%',
        marginTop: 10,
        borderRadius: '15px',
        padding: '16px 17px',
        boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.15)',
        backgroundColor:'#fff'
    },
    itemLeft: {
        width: 30,
    },
    rectangle: {
        display: 'block',
        width: 20,
        height: 20,
        borderRadius: 3,
        backgroundColor: '#4f5369'
    },
    itemContent: {
        flex: 1,
        fontFamily: 'PingFangTC-Regular',
        fontSize: 14,
        color: '#000',
        fontStretch: 'normal',
        fontStyle: 'normal',
        letterSpacing: 'normal',
        overflow: 'hidden'
    },
    itemTitle: {
        fontFamily: 'PingFangTC',
        fontWeight: 600,
        fontSize: 16,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis'
    },
    itemCategory: {
        color: '#7f7f7f',
        lineHeight: 1.79,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis'
    },
    itemDate: {
        lineHeight: 1.79,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis'
    },
    itemTime: {
        lineHeight: 1.79,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis'
    },
    itemRight: {
        width: 70,
        fontSize: 16,
        fontFamily: 'PingFangTC',
        fontWeight: 600
    },
    roomIcon: {
        width: 20,
        marginTop: '-2px',
        marginRight: 7
    },
    patientIcon: {
        width: 20,
        marginTop: '-2px',
        marginRight: 7
    },
    popup: {
        width: 500,
        padding: '18px 0'
    },
    popupTitle: {
        display: 'flex',
        alignItems: 'center',
        height: 35,
        width: '100%',
        paddingLeft: 16,
        paddingRight: 16
    },
    popupTitleLeft: {
        // paddingLeft: 10,
    },
    popupTitleContent: {
        flex: 1,
        paddingLeft: 10,
        fontFamily: 'PingFangTC',
        fontWeight: 600,
        fontSize: 18,
        color: '#000',
        lineHeight: '35px'
    },
    popupTitleRight: {
        fontSize: 16,
        fontWeight: 600,
        color: '#000',
        display: 'flex',
        alignItems: 'center',
        '& span': {
            // width: 50,
            paddingLeft: 10,
            display: 'flex',
        }
    },
    navBox: {
        padding: '10px 10px'
    },
    listNav: {
        width: '100%',
        height: 40,
        display: 'flex',
        padding: 0,
        alignItems: 'center',
        border: '1px solid #ebebeb',
        backgroundColor: '#f9f9f9',
        borderRadius: 8
    },
    listNavItem: {
        width: '100%',
        flex: 1,
        height: '34px',
        // margin: '0 10px 0 0',
        padding: '11px 12px',
        borderRadius: '8px',
        textAlign: 'center',
        color: '#282b2d',
        fontSize: 12,
        fontFamily: 'PingFangTC',
        justifyContent: 'center',
        lineHeight: 1.23,
        alignItems: 'center',
        // border: '1px solid '
        
    },
    ListRoot: {
        '&.Mui-selected, &.Mui-selected:hover': {
            backgroundColor: '#fff',
            boxShadow: '0 1px 4px 0 rgba(0, 0, 0, 0.15)'
        },
        
    },
    selectedMain: {
        position: 'relative',
        padding: '0 10px 40px'
    },
    selectedBox: (e) => {
        const { selectedBoxMargin } = e;
        return {
            margin: 0,
            backgroundColor: '#fff7e1',
            borderRadius: 10,
            fontSize: 14,
            fontFamily: 'PingFangTC',
            color: "#000",
            overflow: 'hidden',
            
        }
    },
    selectedBoxTitle: {
        height: 45,
        backgroundColor: '#f1f1f1',
        paddingLeft: 24,
        lineHeight: '45px'
    },
    selectedBoxName: {
        width: '50%',
        paddingRight: 10,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis'
    },
    selectedBoxCase: {
        width: '50%',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis'
    },
    selectedBoxContent: {
        height: 205,
        position: 'relative',
    },
    overflowBox: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflowY: 'auto',
        
    },
    selectedBoxRow: {
        // height: 35,
        lineHeight: '1.5',
        fontSize: '14px',
        fontFamily: 'PingFangTC-Regular',
        color: '#000',
        width: '100%',
        position: 'relative',
        padding: '5px 16px',
    },
    spanReq: {
        position: 'absolute',
        top: 6,
        left: 0,
        paddingLeft: 5
    },
    selectedBoxRemark: {
        color: '#858585',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis'
    },
    selectedBoxContentDate: {
        width: '110px'
    },
    selectedBoxContentInfo: {
        paddingLeft: 15,
        flex: 1,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis'
    },
    selectedBoxFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        color: '#000',
        fontSize: 12,
        fontFamily: 'PingFangTC',
        lineHeight: '40px',
        paddingRight: 13
    },
    popupInfoBox: {
        padding: '0 24px 14px',
        fontSize: 14,
        fontFamily: 'PingFangTC',
        color: '#000',
        lineHeight: '35px'
    },
    popupInfoLabel: {
        width: 100,
        fontWeight: 600
    },
    popupInfoValue: {
        flex: 1,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis'
    },
    popupFooter: {
        paddingRight: 19
    },
    noSelected: {
        width: '100%',
        fontSize: 14,
        color: '#999',
        fontFamily: 'PingFangTC',
        marginTop: 25,
        textAlign: 'center'
    },
    addIconButton: {
        position: 'absolute',
        left: -52,
        top: -5,
    },
    addIcon: {
        cursor: 'pointer',
        borderRadius: 5,
        background: '#49bc96',
        padding: 8
    },
    remark: {
        wordBreak: 'break-all'
    }
}));
