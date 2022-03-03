import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(() => ({
    toolbar: (e) => {
        const { customWidth } = e;
        const width = customWidth;
        return {
                width,
                textAlign: 'center',
                height: 50,
            }
    },
    iconImg: {
        width: 28,
        height: 28,
    },
    toolbarName: {
        fontFamily: 'PingFangTC',
        fontSize: '16px',
        fontWeight: 600,
        fontStretch: 'normal',
        fontStyle: 'normal',
        color: '#000',
        display: 'inline-block',
        width: 135
    },
    eventBox: {
        height: 18,
        width: '100%',
        lineHeight: '18px',
        display: 'flex',
        alignItems: 'center',
        // position: 'relative',
        '&:hover': {
            // background: 'rgba(0, 0, 0, 0.47)'
        }
    },
    eventIcon: {
        background: 'none',
        width: 12,
        height: 12,
        marginLeft: 2,
        display: 'inline-block',
        verticalAlign: 'middle'
    },
    emptyIconStyle:{
        // marginLeft: '0 !important',
    },
    name: {
        marginLeft: 0,
        fontFamily: 'PingFangTC',
        fontSize: 10,
        fontWeight: 500,
        fontStretch: 'normal',
        fontStyle: 'normal',
        overflow: 'hidden',
        marginRight: 5
        // position: 'absolute',
        // top: 0,
        // left: 17
    }
}));