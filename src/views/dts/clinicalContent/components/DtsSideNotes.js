import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import FormLabel from '@material-ui/core/FormLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  paper: {
    height: 200,
    width: 200
  },
  control: {
    padding: theme.spacing(2)
  }
}));

export default function DtsSideNotes() {
  const [spacing, setSpacing] = React.useState(2);
  const classes = useStyles();

  const handleChange = event => {
    setSpacing(Number(event.target.value));
  };

  return (
    <div className={classes.root}>
      <Grid container className={classes.root} spacing={2}>
        <Grid item xs={12}>
          <Paper className={classes.paper} />
        </Grid>
      </Grid>
      <Grid container className={classes.root} spacing={2}>
        <Grid item xs={12}>
          <Paper className={classes.paper} />
        </Grid>
      </Grid>
      <Grid container className={classes.root} spacing={2}>
        <Grid item xs={12}>
          <Paper className={classes.paper} />
        </Grid>
      </Grid>
    </div>
  );
}
