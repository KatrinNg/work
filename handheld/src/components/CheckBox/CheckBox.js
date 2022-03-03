import React from "react";
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { useStyles } from './style';
import clsx from 'clsx';
import PropTypes from 'prop-types';

export default function CheckBox(props) {
    const { icon_size = 18, customformlabelclass = '' } = props;
    const customStyle = {
        icon_size, //icon size default value 18
    }
    const classes = useStyles(customStyle);
    return (
        <FormControlLabel
            className={customformlabelclass}
            control={
            <Checkbox 
                className={classes.root}
                disableRipple
                color="default"
                checkedIcon={<span className={clsx(classes.icon, classes.checkedIcon)} />}
                icon={<span className={classes.icon} />}
                {...props}
            />
        }
        label={props.label}
      />
       
    )
}

CheckBox.propTypes = {
    icon_size: PropTypes.number
}