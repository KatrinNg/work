import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';

const styles = () => ({
    container: {
        boxSizing: 'border-box',
        display: 'flex',
        flexWrap: 'wrap',
        width: '100%',
        marginBottom: 0
    }
});

class CIMSGrid extends Component {
    render() {
        const { classes, ...rest } = this.props;
        return (
            <Grid
                classes={{
                    container: classes.container
                }}
                {...rest}
            >{this.props.children}</Grid>
        );
    }
}

export default withStyles(styles)(CIMSGrid);