import {
    makeStyles
} from "@material-ui/styles"

export default makeStyles(theme => ({
    DashboardPanel: {
        height: '100%',
        width: '100%',
        fontFamily: 'PingFangTC',
        fontStretch: 'normal',
        fontStyle: 'normal',
        fontWeight: 'normal',
        lineHeight: 'normal',
        letterSpacing: 'normal',
        backgroundColor: '#fafafa',
    },
    listPanel: {
        height: 'calc(100% - 160px)',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
    },
    BoardRow: {
        width: 'calc(100% - 30px)',
        height: 60,
        margin: '5px 15px',
        padding: '7px 15px',
        display: 'flex',
        fontSize: 30,
        fontWeight: 600,
        borderRadius: 6,
        border: 'solid 1px #858585',
    },
    itemName: {
        width: '24%',
        height: 46,
        lineHeight: '46px',
        '& span': {
            padding: '0px 7px'
        }
    },
    itemWardBead: {
        width: '15%',
        height: 46,
        display: 'flex',
        alignItems: 'center',
        fontSize: 22,
    },
    wardIconImg: {
        height: 22,
        width: 26,
        marginRight: 5
    },
    rowImg: {
        height: 44,
        width: 44,
        border: 'solid 1px #979797',
        borderRadius: 23,
        backgroundColor: '#fff',
        marginLeft: 7,
    },
    itemTreatment: {
        width: '45%',
        height: 46,
        lineHeight: '46px'
    },
    itemO2Plus: {
        width: '12%',
        height: 46,
        lineHeight: '46px'
    },
    itemRemainTime: {
        width: '7%',
        paddingRight: 15,
        height: 46,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end'
    },
    page: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        height: 45,
        fontSize: 26,
        fontWeight: 600,
        marginRight: 15,
        paddingTop: 5,
        '& span': {
            height: 40,
            width: 237,
            backgroundColor: '#e1e1e1',
            textAlign: 'center',
            lineHeight: '40px',
            borderRadius: 30,
        }
    },
    buttomPanel: {
        height: 108,
        marginTop: 7,
        width: '100%',
        backgroundColor: '#fff',
        display: 'flex',
    },
    leftTable: {
        width: 'calc(100% - 345px)',
        height: 'calc(100% - 1px)',
        display: 'flex',
        
    },
    tableColumn: {
        width: '10%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        fontSize: 30,
        '& span': {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50%',
            border: 'solid 1px #979797',
            '&:first-child': {
                fontSize: 18,
                backgroundColor: '#ffed44',
                fontWeight: 600,
                textAlign: 'center',
                lineHeight: 1
            }
        }
    },
    overSizeTextStyle: {
        '& span': {
            '&:first-child': {
                fontSize: 15,
            }
        }
    },
    rightContent: {
        width: 343,
        height: '100%',
        display: 'flex',
        backgroundColor: '#5a5959',
        border: 'solid 1px #979797',
        color: '#fff'
    },
    roomTime: {
        display: 'flex',
        flexDirection: 'column',
        width: 172,
        height: '100%'
    },
    topRoom: {
        height: '50%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff',
        color: '#000',
        fontSize: 14,
        padding: '4px 8px',
        '& span': {
            '&:last-child':{
                height: 30,
                lineHeight: '30px',
                fontSize: 22,
                fontWeight: 600
            }
        }
    },
    buttomTime: {
        height: '50%',
        display: 'flex',
        flexDirection: 'column',
        fontSize: 14,
        padding: '4px 8px',
        '& span': {
            '&:last-child':{
                height: 30,
                lineHeight: '30px',
                fontSize: 22,
                fontWeight: 600
            }
        }
    },
    iconLoginout: {
        height: '100%',
        width: 171,
        display: 'flex',
        flexDirection: 'column',
        padding: '8px 15px',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
        fontWeight: 600,
        '& img': {
            height: 65,
            width: 137,
            backgroundColor: '#fff',
            borderRadius: 8,
            padding: 5
        }
    }
}))
