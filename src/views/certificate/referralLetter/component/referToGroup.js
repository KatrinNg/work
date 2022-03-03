import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import _ from 'lodash';
import memoize from 'memoize-one';
import CIMSFormLabel from '../../../../components/InputLabel/CIMSFormLabel';
import { Grid } from '@material-ui/core';
import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import FastTextFieldValidator from '../../../../components/TextField/FastTextFieldValidator';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
import ValidatorEnum from '../../../../enums/validatorEnum';
import CommonMessage from '../../../../constants/commonMessage';

const styles = makeStyles(theme => ({
    referToGpRoot: {
        padding: theme.spacing(2)
    }
}));

const filterHospitalClinic = (props) => {
    const { referTo, hospital } = props;
    if (!referTo.groupCd) {
        return hospital;
    } else {
        if (referTo.groupCd === 'DH') {
            return hospital && hospital.filter(x => x.groupCd === referTo.groupCd && (!referTo.letterSvcCd || x.svcCd === referTo.letterSvcCd));
        } else {
            return hospital && hospital.filter(x => x.groupCd === referTo.groupCd);
        }
    }
};

const loadAvailSvc = memoize((serviceList, hospital) => {
    let curSvcList = _.cloneDeep(serviceList);
    let dhHosptial = hospital.filter(item => item.groupCd === 'DH');
    let dhSvcCdList = [];
    dhHosptial.forEach(h => {
        if (dhSvcCdList.findIndex(svcCd => svcCd === h.svcCd) === -1) {
            dhSvcCdList.push(h.svcCd);
        }
    });
    curSvcList = curSvcList.filter(svc => {
        let idx = dhSvcCdList.findIndex(svcCd => svc.svcCd === svcCd);
        return idx > -1;
    });
    return curSvcList;
});


const initGroupList = (groupList) => {
    let _groupList = [];
    const haGp = groupList && groupList.find(item => item.groupCd === 'HA');
    const dhGp = groupList && groupList.find(item => item.groupCd === 'DH');
    const privateGp = groupList && groupList.find(item => item.groupCd === 'Private');
    const othersGp = groupList && groupList.find(item => item.groupCd === 'Others');
    if (haGp) {
        _groupList.push(haGp);
    }
    if (dhGp) {
        _groupList.push(dhGp);
    }
    if (privateGp) {
        _groupList.push(privateGp);
    }
    if (othersGp) {
        _groupList.push(othersGp);
    }

    return _groupList;
};



const ReferToGroup = (props) => {
    const classes = styles();
    const { referTo, isSelected, serviceList, group, hospital, specialty } = props;
    let groupList = initGroupList(group);
    // let curSvcList = _.cloneDeep(serviceList);
    let curSvcList = loadAvailSvc(serviceList, hospital);
    let hospitalList = filterHospitalClinic(props);
    const specialtyList = specialty;
    const othersHAInst = hospitalList.find(item => item.name === 'Others');
    const othersGp = referTo.groupCd === 'Others' && othersHAInst.hcinstId === referTo.rfrHcinstId;
    const dhGp = referTo.groupCd === 'DH';

    const updateRefterTo = (name, value) => {
        let newReferTo = _.cloneDeep(props.referTo);
        newReferTo[name] = value;
        if (name === 'groupCd') {
            if (value !== props.referTo.groupCd) {
                newReferTo.rfrHcinstId = '';
                newReferTo.hosptialClinicName = '';
                newReferTo.specialty = '';
                newReferTo.letterSvcCd = '';
                newReferTo.others = '';
            }
        }
        if (name === 'rfrHcinstId') {
            newReferTo.others = '';
            if (value !== props.referTo.rfrHcinstId) {
                newReferTo.specialty = '';
                const curHospital = hospital && hospital.find(item => item.hcinstId === value);
                newReferTo.hosptialClinicName = curHospital ? curHospital.name : null;
                if (!newReferTo.groupCd) {
                    if (curHospital) {
                        newReferTo.groupCd = curHospital.groupCd;
                        if (newReferTo.groupCd === 'DH') {
                            newReferTo.letterSvcCd = curHospital.svcCd;
                        }
                    }
                } else if (newReferTo.groupCd === 'DH') {
                    // const curHospital = hospital && hospital.find(item => item.hcinstId === value);
                    if (curHospital) {
                        newReferTo.letterSvcCd = curHospital.svcCd;
                    }
                }
            }
        }
        if (name === 'letterSvcCd') {
            newReferTo.hosptialClinicName = '';
            newReferTo.rfrHcinstId = '';
        }
        props.onChange(newReferTo);
    };

    return (
        <CIMSFormLabel
            fullWidth
            labelText={'Refer To'}
            className={classes.referToGpRoot}
        >
            <Grid container item spacing={1}>
                <Grid container item direction={'row'} spacing={1}>
                    <Grid item xs={4}>
                        <SelectFieldValidator
                            id={props.id + '_GroupSelectedField'}
                            options={
                                groupList && groupList.map(item => (
                                    { value: item.groupCd, label: item.groupName }
                                ))}
                            value={referTo.groupCd}
                            onChange={e => updateRefterTo('groupCd', e.value)}
                            validators={[ValidatorEnum.required]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            isDisabled={isSelected}
                            TextFieldProps={{
                                variant: 'outlined',
                                label: <>Group<RequiredIcon /></>
                            }}
                        />
                    </Grid>
                    {dhGp ?
                        <Grid item xs={4}>
                            <SelectFieldValidator
                                id={props.id + '_SerivceSelectedSelectedField'}
                                options={
                                    curSvcList && curSvcList.map((item) => (
                                        { value: item.serviceCd, label: item.serviceName }))}
                                value={referTo.letterSvcCd}
                                onChange={e => updateRefterTo('letterSvcCd', e.value)}
                                validators={[ValidatorEnum.required]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                TextFieldProps={{
                                    variant: 'outlined',
                                    label: <>Service<RequiredIcon /></>
                                }}
                                isDisabled={isSelected}
                                sortBy="label"
                            />
                        </Grid>
                        : null
                    }
                    {
                        isSelected ?
                            <Grid item xs={4}>
                                <FastTextFieldValidator
                                    id={props.id + '_HospitalOrClinicTxtField'}
                                    value={referTo.hosptialClinicName || ''}
                                    label={<>Hospital / Clinic<RequiredIcon /></>}
                                    variant={'outlined'}
                                    disabled
                                />
                            </Grid>
                            : <Grid item xs={4}>
                                <SelectFieldValidator
                                    id={props.id + '_HospitalOrClinicSelectedField'}
                                    options={hospitalList && hospitalList.map(item => ({ value: item.hcinstId, label: item.name }))}
                                    value={referTo.rfrHcinstId}
                                    onChange={e => updateRefterTo('rfrHcinstId', e.value)}
                                    validators={[ValidatorEnum.required]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    isDisabled={isSelected}
                                    TextFieldProps={{
                                        variant: 'outlined',
                                        label: <>Hospital / Clinic<RequiredIcon /></>
                                    }}
                                    sortBy="label"
                                />
                            </Grid>
                    }

                    {(!dhGp && !othersGp) ?
                        isSelected ?
                            <Grid item xs={4}>
                                <FastTextFieldValidator
                                    id={props.id + '__SpecialtyTxtField'}
                                    value={referTo.specialtyName || ''}
                                    label={<>Specialty<RequiredIcon /></>}
                                    variant={'outlined'}
                                    disabled
                                />
                            </Grid>
                            : <Grid item xs={4}>
                                <SelectFieldValidator
                                    id={props.id + '_SpecialtySelectedField'}
                                    options={
                                        specialtyList && specialtyList.map((item) => (
                                            { value: item.specialtyCd, label: item.specialtyName }))}
                                    value={referTo.specialty}
                                    onChange={e => updateRefterTo('specialty', e.value)}
                                    isDisabled={isSelected}
                                    TextFieldProps={{
                                        variant: 'outlined',
                                        label: <>Specialty<RequiredIcon /></>
                                    }}
                                    validators={[ValidatorEnum.required]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    sortBy="label"
                                />
                            </Grid>
                        : null
                    }

                    {othersGp ?
                        <Grid item xs={4}>
                            <FastTextFieldValidator
                                id={props.id + '_PleaseSpecifyTextField'}
                                value={referTo.others}
                                onBlur={e => updateRefterTo('others', e.target.value)}
                                inputProps={{ maxLength: 50 }}
                                variant={'outlined'}
                                label={'Please Specify'}
                                disabled={isSelected}
                                calActualLength
                            />
                        </Grid>
                        : null
                    }
                </Grid>
                <Grid container item>
                    <FastTextFieldValidator
                        id={`${props.id}_Details`}
                        value={referTo.details}
                        multiline
                        trim="none"
                        rows={4}
                        calActualLength
                        inputProps={{ maxLength: 1000 }}
                        variant={'outlined'}
                        label="Details (For internal record only)"
                        onBlur={e => updateRefterTo('details', e.target.value)}
                        disabled={isSelected}
                    />
                </Grid>
            </Grid>

        </CIMSFormLabel >
    );
};


export default ReferToGroup;