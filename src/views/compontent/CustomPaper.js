import { Paper, withStyles } from '@material-ui/core';
import React from 'react';

const CustomPaper = withStyles((theme) => ({
    root: {
        overflow: 'auto',
        background: 'white',
        width: '100%',
        '&:hover': {
            '&::-webkit-scrollbar-thumb': {
                background: '#babec5 !important'
            }
        },
        '&::-webkit-scrollbar': {
            width: '16px',
            height: '16px',
            background: 'transparent'
        },
        '&::-webkit-scrollbar-track': {
            boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
            webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)'
        },
        '&::-webkit-scrollbar-thumb': {
            background: '#dadce0',
            boxShadow: 'none',
            borderRadius: '8px',
            border: '4px solid white',
            minHeight: '40px'
        }
    }
}))(Paper);

export default CustomPaper;
