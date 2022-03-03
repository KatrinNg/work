import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(() => ({
    remarkTextField: {
        width: '100%', 
        padding: '0',
        marginBottom: 26,
        '& .MuiOutlinedInput-multiline': {
            padding: '6px 9px 6px 7px',
            background: '#fff'
        }
    },
    confirmBtn: {
        borderRadius: 10,
    },
    remarkTitle: {
        fontSize: 16,
        fontWeight: 600,
        marginBottom: 12
    },
    remarkSecTitle: {
        fontSize: 12,
        color: '#737578'
    },
    paperScrollPaper: {
        backgroundColor: '#f8f8f8',
        margin: 0,
        width: '96%',
    },
    MuiDialogTitleRoot: {
        paddingBottom: 9
    },
    MuiDialogContentRoot: {
        padding: '8px 22px'
    }
}));