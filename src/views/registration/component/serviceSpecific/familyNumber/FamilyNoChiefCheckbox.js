import { Checkbox, FormControlLabel, makeStyles } from '@material-ui/core';
import * as PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { auditAction } from '../../../../../store/actions/als/logAction';
import { chiefParentCheckboxHandler } from '../../../../../store/actions/registration/registrationAction';

const useStyles = makeStyles((theme) => ({
    checkbox: {
        marginLeft: theme.spacing(1)
    },
    formControl: {
        maxHeight: '38px'
    }
}));

const FamilyNoChiefCheckbox = ({ isChief, familyNoType, comDisabled }) => {
    const classes = useStyles();

    const dispatch = useDispatch();

    const audit = useCallback(
        (desc = '', handleByOriginalApi = true, pmi = null) =>
            dispatch(auditAction(desc, null, null, handleByOriginalApi, 'patient', pmi)),
        [dispatch]
    );

    const handleOnChange = useCallback(() => {
        audit('Click Chief Patient CheckBox', false);
        dispatch(chiefParentCheckboxHandler());
    }, [dispatch, isChief]);

    return (
        <FormControlLabel
            className={classes.formControl}
            control={
                <Checkbox
                    id="chiefPatientCheckBox"
                    disabled={comDisabled || familyNoType === 'NONE'}
                    className={classes.checkbox}
                    checked={isChief}
                    onChange={handleOnChange}
                    name="checkedB"
                    color="primary"
                />
            }
            label="Chief Patient"
        />
    );
};

FamilyNoChiefCheckbox.propTypes = {
    isChief: PropTypes.bool,
    familyNoType: PropTypes.string,
    comDisabled: PropTypes.bool
};

export default FamilyNoChiefCheckbox;
