import { Button, makeStyles, TextField } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import * as PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { familyNoTypes } from '../../../../../constants/registration/registrationConstants';
import ButtonStatusEnum from '../../../../../enums/administration/buttonStatusEnum';
import * as registrationActionType from '../../../../../store/actions/registration/registrationActionType';
import SearchFamilyNoDialog from './SearchFamilyNoDialog';

const useStyles = makeStyles((theme) => ({
    searchBtn: {
        minWidth: 'auto',
        maxWidth: '45px',
        maxHeight: '38px',
        marginLeft: theme.spacing(1)
    }
}));

const FamilyNoSearchField = ({
    familyNoType,
    isFamilyNoValid,
    updatePatientBaseInfo,
    comDisabled,
    isNextReg,
    pmiGrpName
}) => {
    const classes = useStyles();

    const dispatch = useDispatch();

    const patientOperationStatus = useSelector((state) => state.registration.patientOperationStatus);

    const isEdit = patientOperationStatus === ButtonStatusEnum.EDIT;

    const [searchValue, setsearchValue] = useState('');

    const [isSearchDialogOpen, setisSearchDialogOpen] = useState(false);

    const toggle = () => setisSearchDialogOpen(!isSearchDialogOpen);

    const resetValue = () => {
        updatePatientBaseInfo({ pmiGrpId: '', pmiGrpName: '', isChief: false });
        setsearchValue('');
    };

    const resetFamilyNoChecking = useCallback(
        () => dispatch({ type: registrationActionType.RESET_FAMILY_NO_CHECKING }),
        [dispatch]
    );

    useEffect(() => {
        if (pmiGrpName) setsearchValue(pmiGrpName);
        else setsearchValue('');
    }, [pmiGrpName]);

    useEffect(() => {
        // Reset value when family type changed
        if (familyNoType !== familyNoTypes.EXISTING) resetValue();
        // Reset is Chief if pmiGrpName changed
        else if (familyNoType === familyNoTypes.EXISTING && pmiGrpName && !isEdit)
            updatePatientBaseInfo({ isChief: false });
    }, [familyNoType]);

    const onBlurHandler = (e) => {
        if (pmiGrpName !== e.target.value.toUpperCase()) {
            resetFamilyNoChecking();
            if (familyNoType === familyNoTypes.EXISTING)
                updatePatientBaseInfo({ isChief: false, pmiGrpName: e.target.value.toUpperCase() });
            else
                updatePatientBaseInfo({
                    familyNoType: familyNoTypes.EXISTING,
                    pmiGrpName: e.target.value.toUpperCase()
                });
        }
    };

    return (
        <>
            <SearchFamilyNoDialog
                isSearchDialogOpen={isSearchDialogOpen}
                toggle={toggle}
                updatePatientBaseInfo={updatePatientBaseInfo}
            />
            <form>
                <TextField
                    disabled={comDisabled || isNextReg}
                    required={familyNoType === familyNoTypes.EXISTING}
                    id="searchFamilyNo"
                    name="familyNo"
                    label="Family Number"
                    variant="outlined"
                    value={searchValue}
                    onChange={(e) => setsearchValue(e.target.value.toUpperCase())}
                    onBlur={onBlurHandler}
                    error={familyNoType === familyNoTypes.EXISTING && isFamilyNoValid === 'N'}
                    helperText={
                        familyNoType === familyNoTypes.EXISTING && isFamilyNoValid === 'N' && 'Invalid family number.'
                    }
                />

                <Button
                    id="searchIconBtn"
                    disabled={comDisabled || isNextReg}
                    className={classes.searchBtn}
                    variant="contained"
                    color="primary"
                    onClick={toggle}
                >
                    <SearchIcon />
                </Button>
            </form>
        </>
    );
};

FamilyNoSearchField.propTypes = {
    pmiGrpName: PropTypes.string,
    familyNoType: PropTypes.string,
    isFamilyNoValid: PropTypes.string,
    updatePatientBaseInfo: PropTypes.func,
    comDisabled: PropTypes.bool,
    isNextReg: PropTypes.bool
};

export default FamilyNoSearchField;
