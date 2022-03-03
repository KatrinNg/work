import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(() => ({
    abstractBox: {
        marginBottom: 8,
    },
    patientAvatar: {
        width: 45,
        height: 45,
        borderRadius: '50%',
        // background: '#cbeae4',
        // padding: '9px 9px 8px',
        marginRight: 14
    },
    status: {
        width: 92,
        height: 28,
        borderRadius: 14,
        background: '#aae8ab',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 500,
        fontSize: 12,
        color: '#000'
    },
    baseFontSize: {
        fontFamily: 'PingFangTC',
        fontStretch: 'normal',
        fontStyle: 'normal',
        lineHeight: 'normal',
        fontWeight: 'normal',
    },
    imageBox: {
        marginTop: 19
    },
    actionsImage: {
        width: 41,
        height: 41,
        marginRight: 15,
    },
    dialogLabelBox: {
        height: 36,
        background: '#e6e6e6',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 27px 0 19px',
        fontSize: 12,
    },
    dialogItemBox: {
        height: 55,
        background: '#fff',
        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
        marginBottom: 5,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 18px 0 19px',
        fontSize: 12,
        color: '#000'
    },
    iconImage: {
        width: 41,
        height: 41,
    },
    paper: {
        margin: '30px 0 0 0',
        width: 'calc(100vw - 17px)',
        maxWidth: 500,
    },
    paperScrollPaper: {
        maxHeight: 'calc(100% - 30px)',
        background: '#f8f8f8',
    },
    customPreventiveMeasureTitle: {
        position: 'relative',
        textAlign: 'center',
        marginBottom: 19,
    },
    title: {
        fontSize: 18,
        fontWeight: 600,
        fontStretch: 'normal',
        fontStyle: 'normal',
        lineHeight: 'normal',
        letterSpacing: 'normal',
        color: '#39ad90',
    },
    closeBtn: {
        position: 'absolute',
        right: -8,
        top: '50%',
        transform: 'translate(0, -50%)',
    },
    MuiDialogContentRoot: {
        padding: '16px 9px 5px 8px'
    },
    MuiDialogTitleRoot: {
        padding: '8px 9px 8px 8px',
    }
}));