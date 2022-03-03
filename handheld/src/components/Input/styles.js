import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(() => ({
    root: {
        
    },
    SLayout: {
        position: 'relative',
        width: '100%'
    },
    textField: (props) => ({
        paddingTop: 0,
        paddingBottom: 0,
        height: 40,
        textAlign: props.textAlign
    }),
    inputNumber: {
        
    }
}));