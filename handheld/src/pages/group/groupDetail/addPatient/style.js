import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(() => ({
    title: {
        fontSize: 14,
        fontWeight: 500,
        marginBottom: 7
    },
    textField: {
        "& .MuiOutlinedInput-root": {
            background: "#fff !important",
        },
    },
    addPatientBox: {
        padding: '18px 22px 26px 21px',
        background: '#f6f5f5'
    },
    scanIconBox: {
        width: 43,
        height: 43,
        background: '#fff',
        border: '1px solid #d6d6d6',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',   
    }
}));