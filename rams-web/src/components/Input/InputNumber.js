import React from "react";
import { TextField, IconButton, InputAdornment } from "@material-ui/core";
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import { useStyles } from './styles';
const InputNumber = ({ value = "", onChange, style={}, suffix="", textAlign='right', ...rest }) => {
    const classes = useStyles({textAlign});
    const handleChange = (e) => {
        onChange(e.target.value)
    }
    const handleAdd = () => {
        const newValue = value * 1 + 1;
        onChange(newValue)
    }
    const handleMinus = () => {
        const newValue = value * 1 - 1;
        if (newValue < 0) return;
        onChange(newValue);
    }
    return (
        <TextField
            fullWidth
            variant="outlined"
            style={{ paddingTop: 0, paddingBottom: 0,...style }}
            type="number"
            value={value}
            onChange={handleChange}
            InputProps={{
                style: {
                    borderRadius: 8,
                },
                startAdornment: <InputAdornment position="start">
                    <IconButton
                        aria-label="toggle minus"
                        style={{ padding: 0 }}
                        onClick={handleMinus}
                    >
                        <RemoveIcon />
                    </IconButton>
                </InputAdornment>,
                endAdornment: <InputAdornment position="end">
                    {suffix}
                    <IconButton
                        aria-label="toggle add"
                        style={{ padding: 0 }}
                        onClick={handleAdd}
                    >
                        <AddIcon />
                    </IconButton>
                </InputAdornment>,
                classes: {
                    input: classes.textField,
                    root: classes.root
                },
            }}
            inputProps={{
                // min: 0,
            }}
            {...rest}
        />
    )
}

export default InputNumber;