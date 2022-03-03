import {
    makeStyles
} from "@material-ui/styles";

export default makeStyles(theme => ({
    datepickerRoot: {
        height: 40,
        margin: '0px 0px 0px 5px',
        border: 'solid 1px #bbb',
        paddingLeft: 10,
        borderRadius: 8,
        justifyContent: 'center',
        '& .MuiInput-underline:hover:not(.Mui-disabled):before':{ 
            border: 'none'
        },
        '& :before': {
            border: 'none'
        },
        '& :after': {
            border: 'none'
        },
        '& .MuiFormHelperText-root.Mui-error': {
            position: 'absolute',
            top: 36
        },
        '& .MuiInputBase-root': {
            fontSize: 14,
        }
    },
    textField: {
        borderRadius: 8,
        height: 40,
        border: 'none',
    },
}));
