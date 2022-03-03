import React from 'react';
import {
    Grid,
    FormControlLabel
} from '@material-ui/core';
import _ from 'lodash';
import CIMSButton from 'components/Buttons/CIMSButton';
import CIMSCheckBox from 'components/CheckBox/CIMSCheckBox';
import FastTextField from '../../components/TextField/FastTextField';
import CIMSDatePicker from '../../components/DatePicker/CIMSDatePicker';
import { putPsoInfo } from '../../store/actions/patient/patientAction';
import { dispatch } from '../../store/util';

const PsoInfoPanel = (props) => {
    const [psoInfo, setPsoInfo] = React.useState(() => {
        return ({
            withPsoriasis: 1,
            withPASI: 1,
            lastPASIDate: '2020-06-23',
            dueDateOfLastPASI: '2021-06-23',
            reminderMsg: 'Perform Psoriasis assessment – PASI score. Last on 23/06/2020'
        });
    });

    const changePsoInfo = (name, value) => {
        let _psoInfo = _.cloneDeep(psoInfo);
        _psoInfo[name] = value;
        setPsoInfo(_psoInfo);
    };

    const updatePsoInfo = () => {
        dispatch(putPsoInfo(psoInfo));
    };

    return (
        <Grid item container xs={12}>
            <Grid item container xs={6}>
                <FormControlLabel
                    control={
                        <CIMSCheckBox
                            name={'withPsoriasis'}
                            //disabled={isAttendedAppt && !this.props.editMode || isNullCurAppt}
                            //id={`${id}nep_checkbox`}
                            value={psoInfo.withPsoriasis}
                            onChange={e => changePsoInfo('withPsoriasis', e.target.checked ? 1 : 0)}
                        />
                    }
                    label={'withPsoriasis'}
                    checked={psoInfo.withPsoriasis === 1}
                />
            </Grid>
            <Grid item container xs={6}>
                <FormControlLabel
                    control={
                        <CIMSCheckBox
                            name={'withPASI'}
                            //disabled={isAttendedAppt && !this.props.editMode || isNullCurAppt}
                            //id={`${id}nep_checkbox`}
                            value={psoInfo.withPASI}
                            onChange={e => changePsoInfo('withPASI', e.target.checked ? 1 : 0)}
                        />
                    }
                    label={'withPASI'}
                    checked={psoInfo.withPASI === 1}
                />
            </Grid>
            <Grid item container xs={6}>
                <CIMSDatePicker
                    label={<>dueDateOfLastPASI</>}
                    value={psoInfo.dueDateOfLastPASI}
                    inputVariant="outlined"
                    onChange={e => changePsoInfo('dueDateOfLastPASI', e)}
                />
            </Grid>
            <Grid item container xs={6}>
                <FastTextField
                    fullWidth
                    variant={'outlined'}
                    onBlur={(e) => changePsoInfo('reminderMsg', e.target.value)}
                    value={psoInfo.reminderMsg}
                    label={'reminderMsg'}
                />
            </Grid>
            <Grid item container xs={6}>
                <CIMSButton
                    onClick={updatePsoInfo}
                >
                    Update PsoInfo
                </CIMSButton>
            </Grid>
        </Grid>
    );

};

export default PsoInfoPanel;