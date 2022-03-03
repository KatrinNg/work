import { TableRow, withStyles } from '@material-ui/core';

const CustomTableRow = withStyles((theme) => ({
    root: {
        '&$selected, &$selected:hover': {
            backgroundColor: '#d4efdb !important'
        },
        '&:hover': {
            backgroundColor: 'lightGray !important'
        },
        '&:nth-of-type(odd)': {
            backgroundColor: '#f4f4f4'
        },
        '&:nth-of-type(even)': {
            backgroundColor: 'white'
        }
    },
    selected: {}
}))(TableRow);

export default CustomTableRow;
