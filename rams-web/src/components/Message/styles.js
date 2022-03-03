import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme) => ({
    boldFont: {
        fontFamily: 'PingFangHK-Semibold'
    },
    messageTitle: {
        padding: '3px 8px'
    },
    messageDetail: {
        wordBreak: 'break-word',
        whiteSpace: 'pre-line',
        fontFamily: 'PingFangTC',
        fontSize: '16px',
        fontWeight: 'normal',
        fontStretch: 'normal',
        fontStyle: 'normal',
        color: '#000',
        textAlign: 'center',
    },
    messageAction: {
        padding: '20px 20px 35px 20px'
    },
    information: {
        backgroundColor: '#53A5CD'
    },
    warning: {
        backgroundColor: '#FD9721'
    },
    error: {
        backgroundColor: '#F5413C'
    },
    success: {
        backgroundColor: '#4FAF54'
    },
    messageBox: {
        width: '406px',
    },
    messageContentBox: {
        minHeight: '208px'
    },
    messageButton: {
        width: '150px',
        height: '40px',
        borderRadius: '10px',
    },
    SErrorLayout: {
        color: 'red',
        marginTop: '10px',
        fontSize: '12px',
        marginLeft: '13px'
    }
}));