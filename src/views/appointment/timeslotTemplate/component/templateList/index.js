import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import TempButtons from './tempButtons';
import TempList from './templist';

class TemplateList extends React.Component {
    render() {
        const { classes } = this.props;
        return (
            <Grid container>
                <Grid item container>
                    <TempButtons />
                </Grid>
                <Grid item container className={classes.listRoot}>
                    <TempList />
                </Grid>
            </Grid>
        );
    }
}

const styles = theme => ({
    listRoot: {
        padding: `0px ${theme.spacing(1)}px ${theme.spacing(1)}px ${theme.spacing(1)}px`
    }
});

export default withStyles(styles)(TemplateList);