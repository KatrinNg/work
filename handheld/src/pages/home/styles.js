
import {
    makeStyles
} from "@material-ui/styles";

export default makeStyles(theme => ({
    //patientSummary
    content: {
        position: 'relative',
        height: '100%',
        width: '100%',
        fontSize: 14,
        fontWeight: 500,
        color: '#000',
        backgroundColor: '#e1efed',
        flex: 1
    },
    menuPanel: {
        display: 'flex',
        height: 240,
        width: '100%',
        flexDirection: 'column',
    },
    workScanning: {
        display: 'flex',
        width: '100%',
        height: 20,
        margin: '11px 0px',
        padding: '0px 15px',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    scanning: {
        display: "flex",
        alignItems: 'center'
    },
    menuContent: {
        display: 'flex',
        paddingLeft: 9,
        flexWrap: 'wrap',
        justifyContent: 'space-between'
    },
    menuFuc: {
        display: 'flex',
        height: 90,
        width: 95,
        flexDirection: "column",
        backgroundColor: '#f2f8f6',
        marginRight: 9,
        marginBottom: 9,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        '& img': {
            height: 34,
            width: 34,
            marginBottom: 12
        }
    },
    roomContent: {
        height: 105,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '10px 14px 15px 14px',
        backgroundColor: '#cbeae4',
    },
    roomTop: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 16,
        marginBottom: 10,
        '& span': {
            '&:first-child': {
                color: '#6374c8',
                fontWeight: 500
            },
            '&:last-child': {
                fontWeight: 600,
                paddingRight: 5
            }
            
        }
    },
    roomBottom: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between'
    },
    exercise: {
        height: 'calc(100% - 404px)',
        width: "100%",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '& img': {
            width: 148,
            height: 115
        }
    }
    
}));
