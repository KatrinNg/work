import React, { Component } from 'react';
import { Grid } from '@material-ui/core';
import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import ValidatorEnum from '../../../../enums/validatorEnum';
import CommonMessage from '../../../../constants/commonMessage';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';

class AttnGroup extends Component {
    state = { isRequiredFlag: false }

    componentDidUpdate(prevProps) {
        if ((prevProps.isSelected !== this.props.isSelected) && this.props.isSelected === false) {

            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({
                isRequiredFlag: false
            });

        }
    }

    handleAttnGroupChange = (value) => {
        let tempAttnGroup = { ...this.props.attnGroup };
        tempAttnGroup.groupCd = value;
        if (value !== this.props.attnGroup.groupCd) {
            tempAttnGroup.hosptialClinicName = '';
            if (value === '') {
                this.setState({ isRequiredFlag: false });
            } else {
                this.setState({ isRequiredFlag: false }, () => {
                    this.setState({ isRequiredFlag: true });
                });
            }
        } else {
            if (value === '') {
                this.setState({ isRequiredFlag: false });
            }
        }
        this.props.onChange(tempAttnGroup);
    }

    handleHospitalClinicNameChange = (value) => {
        let tempAttnGroup = { ...this.props.attnGroup };
        const filterHospitalList = this.filterHospitalClinic(tempAttnGroup.groupCd, this.props.hospitalList);
        const hospital = filterHospitalList.find(item => item.hcinstId===value);
        tempAttnGroup.hosptialClinicName = value;
        tempAttnGroup.desc = hospital ? hospital.name : '';
        this.props.onChange(tempAttnGroup);
    }

    filterHospitalClinic = (groupCd, list) => {
        return list && list.filter(item => item.groupCd === groupCd);
    }

    initGroupList = (groupList) => {
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

    render() {
        const { attnGroup, isSelected, groupList, hospitalList } = this.props;
        const filterHospitalList = this.filterHospitalClinic(attnGroup.groupCd, hospitalList);
        const { isRequiredFlag } = this.state;

        const _initGroupList = this.initGroupList(groupList);
        return (
            <Grid container item direction={'row'}>
                <Grid container spacing={2}>
                    <Grid item xs={3}>

                        <Grid item>
                            <SelectFieldValidator
                                id={this.props.id + '_GroupSelectedField'}
                                options={
                                    _initGroupList && _initGroupList.map(item => (
                                        { value: item.groupCd, label: item.groupName }
                                    ))}
                                value={attnGroup.groupCd}
                                onChange={e => this.handleAttnGroupChange(e.value)}
                                isDisabled={isSelected}
                                TextFieldProps={{ variant: 'outlined', label: <>Attn. Group</> }}
                                addNullOption
                                // sortBy="label"
                            />
                        </Grid>
                    </Grid>
                    <Grid item xs={5} style={{ marginLeft: 20 }}>

                        <Grid item>
                            <SelectFieldValidator
                                id={this.props.id + '_HospitalOrClinicSelectedField'}
                                options={
                                    filterHospitalList && filterHospitalList.map((item) => (
                                        { value: item.hcinstId, label: item.name }))}
                                value={attnGroup.hosptialClinicName}
                                onChange={e => this.handleHospitalClinicNameChange(e.value)}
                                isDisabled={isSelected}
                                TextFieldProps={{ variant: 'outlined', label: <>Attn. Hospital / Clinic{attnGroup.groupCd ? <RequiredIcon /> : <></>}</> }}
                                validators={(!isSelected && isRequiredFlag) ? [ValidatorEnum.required] : []}
                                errorMessages={(!isSelected && isRequiredFlag) ? [CommonMessage.VALIDATION_NOTE_REQUIRED()] : []}
                                sortBy="label"
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}

export default AttnGroup;