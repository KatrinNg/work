import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(() => ({
    confirmBtn: {
        borderRadius: 10,
    },
    confirmFinishTitle: {
        fontSize: 16,
        fontWeight: 600,
        marginBottom: 12
    },
    confirmFinishSecTitle: {
        fontSize: 12,
        color: '#737578'
    },
    MuiDialogContentRoot: {
        padding: '8px 22px'
    },
    paperScrollPaper: {
        backgroundColor: '#f8f8f8',
        margin: 0,
        width: '96%',
    },
    MuiDialogTitleRoot: {
        paddingBottom: 9,
    }
}));