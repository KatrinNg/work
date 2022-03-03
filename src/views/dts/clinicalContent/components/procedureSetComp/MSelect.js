import React, { useState } from 'react';
import { withStyles, makeStyles, useTheme } from '@material-ui/core/styles';
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Input from "@material-ui/core/Input";
import FormHelperText from "@material-ui/core/FormHelperText";

const styles = (theme) => ({
    formControl: {
        margin: theme.spacing(1),
        width: 600
      }
});

const MSelect = React.forwardRef((props, ref) => {

    const { state = [], data, name, label, handleOnChange, disable, hasError, classes } = props;

    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;

    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: 600
            }
        }
    };

    return (
        <FormControl variant="outlined" className={classes.formControl} error={hasError}>
            <InputLabel>{label}</InputLabel>
            <Select
                multiple
                required
                name={name}
                value={state}
                onChange={handleOnChange}
                input={<Input />}
                MenuProps={MenuProps}
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

export default withStyles(styles)(MSelect);