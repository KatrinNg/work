import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Button from '@material-ui/core/Button';

const styles = theme => ({
    root: {
        textTransform: 'none',
        fontWeight: 400
        // boxShadow: '2px 2px 2px #6e6e6e',
        // '-moz-box-shadow': '2px 2px 2px #6e6e6e',
        // '-webkit-box-shadow': '2px 2px 2px #6e6e6e',
        // '&:hover': {
        //     backgroundColor: 'rgb(0, 152, 255)'
        // }
    },
    sizeSmall: {
        margin: theme.spacing(1),
        padding: '4px 12px'
    },
    sizeLarge: {
        margin: theme.spacing(1),
        padding: '8px 24px'
        //fontSize: '0.6rem'
    },
    label: {
        // fontSize: '0.5rem'
    },
    disabled: {
        borderColor: theme.palette.action.disabledBackground
    }
});

class CIMSButton extends Component {
    render() {
        const { classes, color, ...rest } = this.props;
        const btnColor = color ? color : 'primary';
        if (this.props.display === false) {
            return null;
        }
        return (
            <Button
                disableFocusRipple
                classes={{
                    root: classes.root,
                    label: classes.label,
                    disabled: classes.disabled,
                    sizeSmall: classes.sizeSmall,
                    sizeLarge: classes.sizeLarge
                }}
                variant="contained"
                // color="primary"
                color={btnColor}
                size="small"
                {...rest}
            >{this.props.children}</Button>
        );
    }
}

export default withStyles(styles)(CIMSButton);