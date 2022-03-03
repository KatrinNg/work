import React from 'react';
import { withStyles } from '@material-ui/core/styles';

const styles = () => ({
    root: {
        fontWeight: 'bold'
    }
});

class FormInputLabel extends React.Component {
    render() {
        const { classes, children, ...rest } = this.props;
        return (
            <label className={classes.root} {...rest}>
                {children}
            </label>
        );
    }
}

export default withStyles(styles)(FormInputLabel);