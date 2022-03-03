import { makeStyles } from '@material-ui/styles';

export default makeStyles((theme) => ({
    widgetWrapper: (props) => ({
        display: 'flex',
        minHeight: '100%',
        // padding: `5px 8px`,
        // maxHeight: "445px",
        margin: '0px 24px 13px 31px',
    }),
    widgetHeader: {
        padding: theme.spacing(2),
        paddingBottom: theme.spacing(1),
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    widgetRoot: {
        boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.15)',
    },
    widgetBody: props => ({
        padding: 8 ,
        width: "calc(100% - 10px)",
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
        borderRadius: 15
    },
    
    commandWidget: (props) => ({
        backgroundColor: props.background,
    }),
    
    header: props => ({
        padding: 1,
        paddingLeft: 25,
        color: props.color ?? "white",
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#e0e0e0',
        height: 35
    }),
    title: props => ({
        fontFamily: 'PingFangTC',
        fontSize: 12,
        color: '#000'
    }),

    
}));
