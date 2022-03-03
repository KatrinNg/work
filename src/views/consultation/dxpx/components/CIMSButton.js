import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Button from '@material-ui/core/Button';

const styles = theme => ({
    root: {
        // margin: theme.spacing.unit,
        marginLeft:8,
        marginRight:8,
        marginTop:3,
        marginBottom:3,
        padding: '3px',
        color: '#0579c8',
        border: '1px solid #0579c8',
        backgroundColor: '#ffffff',
        textTransform: 'none',
        boxShadow: '2px 2px 2px #6e6e6e',
        '-moz-box-shadow': '2px 2px 2px #6e6e6e',
        '-webkit-box-shadow': '2px 2px 2px #6e6e6e',
        '&:hover': {
            backgroundColor: '#0579c8',
            border: '1px solid #ffffff',
            color: '#ffffff'
        }
    },
    label: {
        fontSize: '1rem'
    },
    disabled: {
        borderColor: theme.palette.action.disabledBackground
    }
});

class CIMSButton extends Component {
    render() {
        const { classes, ...rest } = this.props;
        if (this.props.display === false) {
            return null;
        }
        return (
            <Button
                classes={{
                    root: classes.root,
                    label: classes.label,
                    disabled: classes.disabled
                }}
                variant="contained"
                color="primary"
                size="small"
                {...rest}
            >{this.props.children}</Button>
        );
    }
}

export default withStyles(styles)(CIMSButton);