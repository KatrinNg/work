export default {
    inputRoot: {
        '& $input': {
            width: 0,
            minWidth: 30
        },
        '&[class*="MuiOutlinedInput-root"]': {
            padding: 0,
            '& $input': {
                padding: 0
            },
            '& $input:first-child': {
                paddingLeft: 14
            }
        },
        '&[class*="MuiOutlinedInput-root"][class*="MuiOutlinedInput-marginDense"]': {
            padding: 6,
            '& $input': {
                padding: '4.5px 4px'
            }
        }
    }
};