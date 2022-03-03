import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(() => ({
    title: {
        fontFamily: 'PingFangTC',
        fontSize: '14px',
        fontWeight: '600',
        fontStretch: 'normal',
        fontStyle: 'normal',
        lineHeight: 'normal',
        letterSpacing: 'normal',
        color: '#000',
        marginBottom: 8
    },
    widget: {
        padding: '25px 29px '
    },
    button: {
        borderRadius: 10
    }
}));