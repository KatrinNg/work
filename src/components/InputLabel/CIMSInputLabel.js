import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import { Typography } from '@material-ui/core';

const styles = () => ({
    root: {
        paddingLeft: 0,
        fontWeight: 'bold',
        wordBreak: 'break-word'
    }
});

class CIMSInputLabel extends Component {
    render() {
        const { classes, ...rest } = this.props;
        return (
            <Typography component="label"
                classes={{
                    root: classes.root
                }}
                {...rest}
            >{this.props.children}</Typography>
        );
    }
}

export default withStyles(styles)(CIMSInputLabel);