import React, { useState } from 'react';
import { withStyles, makeStyles, useTheme } from '@material-ui/core/styles';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from "@material-ui/core/FormControl";
import Checkbox from '@material-ui/core/Checkbox';

const styles = (theme) => ({
    formControl: {
        margin: theme.spacing(0)
      }
});

const MSelect = React.forwardRef((props, ref) => {

    const { state = false, name, label, handleOnChange, isHeader, disable, classes } = props;

    let isDisable = (!isHeader && disable) ? true : false;
    // state = (isHeader && disable) ? false : state;

    return (
        <FormControl component="fieldset" className={classes.formControl}>
            <FormGroup>
            <FormControlLabel
                control={<Checkbox checked={state} onChange={handleOnChange} name={name} />}
                label={label}
                disabled={isDisable}
            />
            </FormGroup>
        </FormControl>
    );
});

export default withStyles(styles)(MSelect);