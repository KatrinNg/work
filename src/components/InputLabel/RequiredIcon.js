import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';

const styles = () => ({
    root: {
        color: 'red',
        display: 'inline',
        fontWeight: 'unset',
        fontSize: 'unset'
    }
});

class RequiredIcon extends Component {
    render() {
        const { classes, ...rest } = this.props;
        return (
            <span
                className={classes.root}
                {...rest}
            >*</span>
        );
    }
}

export default withStyles(styles)(RequiredIcon);