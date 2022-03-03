import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Link from '@material-ui/core/Link';

const styles = theme => ({
    root: {
        textTransform: 'none',
        fontWeight: 'bold',
		display: 'flex',
    	alignItems: 'center',
    	justifyContent: 'center'
    },
    sizeSmall: {
        margin: theme.spacing(1),
        padding: '4px 12px'
    },
    sizeLarge: {
        margin: theme.spacing(1),
        padding: '8px 24px'
        //fontSize: '0.6rem'
    }
});

class CIMSLink extends Component {
    render() {
        const { classes, color, ...rest } = this.props;
        const btnColor = color ? color : 'primary';
        if (this.props.display === false) {
            return null;
        }
        return (
            <Link
                disableFocusRipple
                href="#"
                classes={{
                    root: classes.root,
                    label: classes.label,
                    disabled: classes.disabled,
                    sizeSmall: classes.sizeSmall,
                    sizeLarge: classes.sizeLarge
                }}
                variant="contained"
                color={btnColor}
                size="small"
                {...rest}
            >{this.props.children}</Link>
        );
    }
}

export default withStyles(styles)(CIMSLink);
