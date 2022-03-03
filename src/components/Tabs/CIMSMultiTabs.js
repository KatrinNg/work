import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';

const styles = (theme) => ({
    root: {
        minHeight: 20,
        paddingTop: 0,//Consultation test
        borderBottom: `1px solid ${theme.palette.grey[300]}`,
        width: '100%'
    },
    flexContainer: {
        minHeight: 20
    },
    scrollButtons: {
        width: 'auto'
    }
});

class CIMSMultiTabs extends React.Component {
    render() {
        const { classes, children, ...rest } = this.props;
        return (
            <Tabs
                classes={{
                    root: classes.root,
                    flexContainer: classes.flexContainer,
                    scrollButtons: classes.scrollButtons
                }}
                indicatorColor="primary"
                textColor="primary"
                variant="scrollable"
                scrollButtons="on"
                {...rest}
            >{children}</Tabs>
        );
    }
}

export default withStyles(styles)(CIMSMultiTabs);