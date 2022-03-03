
import {
    makeStyles
} from "@material-ui/styles";

export default makeStyles(theme => ({
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
    
}));
