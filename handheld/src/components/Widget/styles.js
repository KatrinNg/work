import { makeStyles } from '@material-ui/styles';

export default makeStyles((theme) => ({
    widgetWrapper: (props) => ({
        display: 'flex',
        minHeight: '100%',
        width:"100%"
    }),
    widgetRoot: {
        boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.2)',
    },
    widgetBody: props => ({
        padding: '13px 20px 28px 21px ' ,
        // width: "calc(100% - 10px)",
        width: '100%',
        height: "100%",
        alignItems: "center",
     
    }),
    noPadding: {
        padding: '0 !important',
    },
    paper: {
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        overflow: 'hidden',
        borderRadius: 10
    },
    
    header: props => ({
        height: 40,
        color: props.color ?? "white",
        backgroundColor: '#39ad90',
    }),
    title: props => ({
        fontFamily: 'PingFangTC',
        color: '#fff',
        fontSize: 16,
        fontWeight: 600,
        fontStretch: 'normal',
        fontStyle: 'normal',
        height: 40,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    }),

    
}));
