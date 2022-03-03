import { makeStyles } from '@material-ui/core/styles';
import { Translate } from '@material-ui/icons';

export const useStyles = makeStyles(() => ({
    mainBox: {
        position: 'relative',
        zIndex: 100
    },
    closeBtn: {
        color: '#fff',
        position: 'fixed',
        right: '5%',
        top: 55,
        zIndex: 10,
        width: 16,
        height: 16,
    },
    scanTips: {
        fontSize: 16,
        fontWeight: 600,
        color: '#fff',
        position: 'fixed',
        left: '50%',
        top: 100,
        zIndex: 10,
        transform: 'translate(-50%, 0)'
    },
    scanBorder: {
        position: 'fixed',
        left: '50%',
        top: '50%',
        zIndex: 10,
        transform: 'translate(-50%, -60%)'
    },
    centreLine: {
        position: 'fixed',
        left: 0,
        top: '48%',
        zIndex: 10,
        width: '100vw',
        height: 2,
        background: '#ff0000',
    },
    video: {
        position: 'fixed',
        top: '50%',
        left: '50%',
        minWidth: '100%',
        minHeight: '100%',
        objectFit: 'fill',
        transform: 'translate(-50%, -50%)',
        '-ms-transform': 'translate(-50%, -50%)',
        '-webkit-transform': 'translate(-50%, -50%)',
    },
}));