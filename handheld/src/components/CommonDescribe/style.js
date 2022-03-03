import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(() => ({
    baseFontSize: {
        fontFamily: 'PingFangTC',
        fontStretch: 'normal',
        fontStyle: 'normal',
        lineHeight: 'normal',
    },
    valueStyle: {
        fontSize: 16,
        fontWeight: 600,
        color: '#000',
    },
    label: {
        fontSize: 12,
        color: '#737578',
        marginRight: 12,
    },
    infoIcon: {
        width: 20,
        height: 20,
        objectFit: 'contain',
        // padding: 12
    },
    box: (props) => {
        return {
            margin: props.margin || '0 0 18px 0'
        }
    }
}));