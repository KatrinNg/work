import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import FastTextFieldValidator from '../../../../../components/TextField/FastTextFieldValidator';
import RequiredIcon from '../../../../../components/InputLabel/RequiredIcon';
import ValidatorEnum from '../../../../../enums/validatorEnum';
import CommonMessage from '../../../../../constants/commonMessage';
import { updateState } from '../../../../../store/actions/appointment/timeslotTemplate';
import { StatusEnum } from '../../../../../enums/appointment/timeslot/timeslotTemplateEnum';

const DetailForm = (props) => {
    const { templateDetailInfo, status } = props;

    const handleOnChange = (object) => {
        let _tempDetailInfo = _.cloneDeep(templateDetailInfo);
        _tempDetailInfo = { ..._tempDetailInfo, ...object };
        props.updateState({ templateDetailInfo: _tempDetailInfo });
    };

    return (
        <Grid item container spacing={2}>
            <Grid item container>
                <FastTextFieldValidator
                    id="timeslot_template_detail_detailName"
                    label={<>Template Name<RequiredIcon /></>}
                    variant="outlined"
                    value={templateDetailInfo && templateDetailInfo.templateName}
                    onBlur={e => handleOnChange({ templateName: e.target.value })}
                    validators={[ValidatorEnum.required]}
                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                    disabled={status === StatusEnum.VIEW}
                    inputProps={{ maxLength: 10 }}
                    calActualLength
                />
            </Grid>
            <Grid item container>
                <FastTextFieldValidator
                    id="timeslot_template_detail_detailDesc"
                    label={<>Template Description</>}
                    variant="outlined"
                    value={templateDetailInfo && templateDetailInfo.templateDesc}
                    onBlur={e => handleOnChange({ templateDesc: e.target.value })}
                    disabled={status === StatusEnum.VIEW}
                    inputProps={{ maxLength: 50 }}
                    calActualLength
                />
            </Grid>
        </Grid>
    );
};

const mapState = state => ({
    templateDetailInfo: state.timeslotTemplate.templateDetailInfo,
    status: state.timeslotTemplate.status
});

const mapDispatch = {
    updateState
};

export default connect(mapState, mapDispatch)(DetailForm);