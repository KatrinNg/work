import { makeStyles } from '@material-ui/styles';

export default makeStyles((theme) => ({
    tabsRoot: {
        minHeight: 30,
    },
    tabsIndicator: {
        display: 'none',
    },
    tabWrapper: {
        display: 'flex',
        flexDirection: 'row-reverse',
        '& :first-child': {
            marginBottom: 0
        }
    },
    tabRoot: {
        minHeight: 30,
        padding: '0px 10px',
        borderTop: 'solid 4px #FFFFFF',
        marginRight: 5,
        borderBottom: 'none',
        textTransform: 'none',
        color:'#000000'
    },
    tabSelected: {
        borderTop: 'solid 4px #3ab395',
        color: '#3ab395'
    },
    closeIcon: {
        marginLeft: 5,
        cursor: 'pointer',
        height:18,
        width: 18,
        margin: 0
    },
    panelTitle: {
        backgroundColor: '#39ad90',
        height: 30,
        color: '#FFFFFF',
        justifyContent: 'center',
        paddingLeft: '12px'
    },
}));