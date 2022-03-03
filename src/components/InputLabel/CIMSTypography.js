import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';

const styles = () => ({
    root: {

    }
});

class CIMSTypography extends Component {
    render() {
        const { classes, tooltip, ...rest } = this.props;
        return (
            <Tooltip title={tooltip}>
                <Typography
                    classes={{
                        root: classes.root
                    }}
                    {...rest}
                >{this.props.children}</Typography>
            </Tooltip>

        );
    }
}

export default withStyles(styles)(CIMSTypography);