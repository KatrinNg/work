import React, { useState } from 'react';
import { withStyles, makeStyles, useTheme } from '@material-ui/core/styles';
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from "@material-ui/core/FormHelperText";

const styles = (theme) => ({
    formControl: {
        margin: theme.spacing(1),
        width: 600
      }
});

const NSelect = React.forwardRef((props, ref) => {

    const { state = [], data, name, label, handleOnChange, disable, hasError, classes } = props;
    
    return (
        <FormControl variant="outlined" className={classes.formControl} error={hasError}>
        <InputLabel>{label}</InputLabel>
        <Select
            value={state}
            name={name}
            onChange={handleOnChange}
            label={label}
            disabled={disable}
            >
            {data.map((d) => (
                <MenuItem key={d.value} value={d.value}>
                {d.label}
                </MenuItem>
            ))}
            </Select>
            {hasError && <FormHelperText>This is required!</FormHelperText>}
        </FormControl>
    );
});

export default withStyles(styles)(NSelect);