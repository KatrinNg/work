import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
    Grid,
    InputLabel
} from '@material-ui/core';
import _ from 'lodash';

import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import SelectFieldValidator from '../../../components/FormValidator/SelectFieldValidator';
import RemarkForm from './component/remarkForm';
import EditModeMiddleware from '../../compontent/editModeMiddleware';

import {
    resetAll,
    fetchRemarkDetails,
    editRemarkDetails,
    cancelEdit,
    updateField,
    loadEncounterTypeList,
    updateSlipFooter,
    clearRemarkDetails
} from '../../../store/actions/administration/appointmentSlipFooter/appointmentSlipFooterAction';
import { openCommonMessage } from '../../../store/actions/message/messageAction';

import ButtonStatusEnum from '../../../enums/administration/buttonStatusEnum';
import accessRightEnum from '../../../enums/accessRightEnum';
import CIMSButtonGroup from '../../../components/Buttons/CIMSButtonGroup';

const style = () => ({
    root: {
        width: '100%',
        padding: 4
    },
    formControl: {
        marginBottom: 20,
        width: '100%'
    },
    select: {
        marginBottom: 10,
        marginTop: 5,
        width: '100%'
    },
    buttonGroup: {
        marginTop: '55px'
    },
    dialogContent: {
        textAlign: 'center',
        padding: '10px 6px 0px 6px'
    },
    dialogAction: {
        justifyContent: 'center'
    },
    shortName: {
        padding: '0 0 15px 10px',
        position: 'absolute',
        bottom: 0
    },
    abbreviate_layout: {
        border: '1px solid #cccccc',
        width: '45%',
        height: '100px'
    },
    abbreviate_label: {
        marginLeft: '3px',
        marginTop: '7px'
    }
});

class RemarkInformation extends React.Component {

    componentDidMount() {
        this.props.ensureDidMount();
        this.loadEncounterList();
        this.props.fetchRemarkDetails({ encounterTypeCd: '', subEncounterTypeCd: '' });
    }

    componentWillUnmount() {
        this.props.resetAll();
    }

    loadEncounterList = () => {
        const _encounterTypeList = _.cloneDeep(this.props.encounterCodeList);
        const filterList = _encounterTypeList.filter(item => item.clinic === this.props.clinicCd);
        this.props.loadEncounterTypeList(filterList);
    }

    handleEditRemarkDetails = () => {
        this.props.editRemarkDetails();
    }

    handleCancelEdit = () => {
        this.props.openCommonMessage({
            msgCode: '110306',
            btnActions: {
                btn1Click: () => {
                    let { encounterTypeCd, subEncounterTypeCd } = this.props;
                    let searchPara = {
                        encounterTypeCd: encounterTypeCd === '*ALL' ? '' : encounterTypeCd,
                        subEncounterTypeCd: subEncounterTypeCd === '*ALL' ? '' : subEncounterTypeCd
                    };
                    this.props.fetchRemarkDetails(searchPara);
                }
            }
        });
    }

    handleSelectFieldChange = (name, e) => {
        let idx = e.idx;
        let fieldParm = this.props.fieldMap;
        let { encounterList } = this.props;
        let searchPara = {
            encounterTypeCd: '',
            subEncounterTypeCd: ''
        };
        if (name === 'encounterType') {
            fieldParm.encounterTypeCd = e.value;
            fieldParm.encounterTypeCdShortName = e.shortName;
            if (encounterList[idx].subEncounterTypeList.length > 0) {
                fieldParm.subEncounterList = encounterList[idx].subEncounterTypeList;
            }
            else {

                fieldParm.subEncounterList = [];
            }
            fieldParm.subEncounterTypeCd = '*ALL';
            fieldParm.subEncounterTypeCdShortName = '';
        }
        else {
            fieldParm.subEncounterTypeCd = e.value;
            fieldParm.subEncounterTypeCdShortName = e.shortName;
        }

        fieldParm = {
            ...fieldParm,
            selectedEncounterIdx: idx
        };

        searchPara.encounterTypeCd = fieldParm.encounterTypeCd === '*ALL' ? '' : fieldParm.encounterTypeCd;
        searchPara.subEncounterTypeCd = fieldParm.subEncounterTypeCd === '*ALL' ? '' : fieldParm.subEncounterTypeCd;

        this.props.updateField(name, fieldParm);
        this.props.fetchRemarkDetails(searchPara);
    }

    prepareSearchPara = (para) => {
        return {
            encounterTypeCd: para.encounterTypeCd === '*ALL' ? '' : para.encounterTypeCd,
            subEncounterTypeCd: para.subEncounterTypeCd === '*ALL' ? '' : para.subEncounterTypeCd
        };
    }

    remarkDetailsOnChange = (value, idx, field) => {
        const { encounterTypeCd, subEncounterTypeCd } = this.props;

        let remarkDetails = _.cloneDeep(this.props.remarkDetails);
        let tempRemarkDetails = [];

        remarkDetails.forEach((remark, i) => {
            let tempRemark = {};
            if (idx === i) {
                if (field === 'disPlayOrder') {
                    tempRemark.disPlayOrder = value;
                    tempRemark.content = remark.content;
                }
                else {
                    tempRemark.disPlayOrder = remark.disPlayOrder;
                    tempRemark.content = value;
                }
            }
            else {
                tempRemark.disPlayOrder = remark.disPlayOrder;
                tempRemark.content = remark.content;
            }

            tempRemark.encounterTypeCd = encounterTypeCd;
            tempRemark.subEncounterTypeCd = subEncounterTypeCd;

            tempRemarkDetails.push(tempRemark);
        });


        remarkDetails[idx].disPlayOrder = value;

        this.props.updateField('remarkDetails', { remarkDetails: tempRemarkDetails });
    }

    createSubmitObj = (data) => {

        let { encounterTypeCd, subEncounterTypeCd } = this.props;

        let obj = {
            encounterTypeCd: encounterTypeCd === '*ALL' ? '' : encounterTypeCd,
            subEncounterTypeCd: subEncounterTypeCd === '*ALL' ? '' : subEncounterTypeCd,
            appointmentSlipDetailDto: data
        };

        return obj;
    }

    handleSubmitChanges = () => {
        //this.props.openCommonCircular();
        let tempRemarkDetails = [...this.props.remarkDetails];

        for (let i = 19; i >= 0; i--) {
            if (tempRemarkDetails[i].disPlayOrder !== '' || tempRemarkDetails[i].content !== '' || (tempRemarkDetails[i].disPlayOrder !== '' && tempRemarkDetails[i].content !== '')) {
                break;
            } else {
                tempRemarkDetails.pop();
            }
        }
        let obj = this.createSubmitObj(tempRemarkDetails);

        this.props.updateSlipFooter(obj);
    }

    handleClearRemarks = () => {
        this.props.clearRemarkDetails();
    }


    render() {
        const { classes } = this.props;
        let { status, encounterList, subEncounterList } = this.props;
        return (
            <Grid container className={classes.root} >
                <Grid container item>
                    <ValidatorForm
                        id={'appointmentSlipFooterEncorunterCriteriaForm'}
                        ref={'form'}
                        onSubmit={() => { }}
                        style={{ width: '100%' }}
                    >
                        <Grid container direction={'column'} spacing={0}>
                            <Grid item container xs={8} direction={'row'}>
                                <Grid item container xs={8} direction={'row'}>
                                    <Grid item container xs={6} direction={'row'}>
                                        <SelectFieldValidator
                                            // labelText={'Encounter'}
                                            className={classes.select}
                                            id={'appointmentSlipFooterEncounterTypeSelectField'}
                                            isDisabled={status !== ButtonStatusEnum.VIEW}
                                            options={
                                                //{ value: '', label: 'All' },
                                                encounterList &&
                                                encounterList.map((item, idx) => (
                                                    item.isAll ? { value: '*ALL', label: '*ALL', shortName: item.shortName, idx: idx }
                                                        : { value: item.encounterTypeCd, label: item.encounterTypeCd, shortName: item.shortName, idx: idx }
                                                ))
                                            }
                                            value={this.props.encounterTypeCd}
                                            onChange={e => { this.handleSelectFieldChange('encounterType', e); }}
                                            TextFieldProps={{
                                                variant: 'outlined',
                                                disabled: true,
                                                label: 'Encounter'
                                            }}
                                        />
                                    </Grid>
                                    <Grid item container xs={6} alignContent={'flex-end'} style={{ position: 'relative' }}>
                                        <InputLabel className={classes.shortName}>{this.props.encounterTypeCdShortName}</InputLabel>
                                    </Grid>
                                </Grid>

                                <Grid item container xs={8} direction={'row'}>
                                    <Grid item container direction={'row'} xs={6} >
                                        <SelectFieldValidator
                                            // labelText={'Sub-encounter'}
                                            className={classes.select}
                                            id={'appointmentSlipFooterSubEncounterTypeSelectField'}
                                            //disabled={this.props.status===ButtonStatusEnum.VIEW}
                                            isDisabled={status !== ButtonStatusEnum.VIEW}
                                            options={
                                                subEncounterList &&
                                                subEncounterList.map((item, idx) => (
                                                    item.isAll ? { value: '*ALL', label: '*ALL', shortName: item.shortName, idx: idx }
                                                        : { value: item.subEncounterTypeCd, label: item.subEncounterTypeCd, shortName: item.shortName, idx: idx }
                                                ))
                                            }
                                            value={this.props.subEncounterTypeCd}
                                            onChange={e => { this.handleSelectFieldChange('subEncounterType ', e); }}
                                            TextFieldProps={{
                                                variant: 'outlined',
                                                disabled: true,
                                                label: 'Sub-encounter'
                                            }}
                                        />
                                    </Grid>
                                    <Grid item container xs={6} alignContent={'flex-end'} style={{ position: 'relative' }}>
                                        <InputLabel className={classes.shortName}>{this.props.subEncounterTypeCdShortName}</InputLabel>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </ValidatorForm>
                </Grid>
                <Grid container>
                    <RemarkForm
                        id={'appointmentSlipFooterRemarkForm'}
                        remarkDetails={this.props.remarkDetails}
                        currentStatus={status}
                        remarkDetailsOnChange={this.remarkDetailsOnChange}
                    />
                </Grid>
                <Grid container style={{ display: 'flex' }}>
                    <Grid container style={{ flex: 1 }}>
                        <Grid container className={classes.abbreviate_layout} direction={'column'}>
                            <label className={classes.abbreviate_label}>@subent_c@ : sub encounter type location(chi)</label>
                            <label className={classes.abbreviate_label}>@subent_e@ : sub encounter type location(eng)</label>
                            <label className={classes.abbreviate_label}>@phone@ : sub encounter type phone</label>
                        </Grid>
                    </Grid>
                    <CIMSButtonGroup
                        buttonConfig={
                            [
                                {
                                    id: 'appointmentSlipFooterClear',
                                    children: 'Clear',
                                    disabled: this.props.status === ButtonStatusEnum.VIEW,
                                    onClick: this.handleClearRemarks
                                },
                                {
                                    id: 'appointmentSlipFooterEditButton',
                                    children: 'Edit',
                                    disabled: this.props.status !== ButtonStatusEnum.VIEW,
                                    onClick: this.handleEditRemarkDetails
                                },
                                {
                                    id: 'appointmentSlipFooterSaveButton',
                                    children: 'Save',
                                    disabled: this.props.status === ButtonStatusEnum.VIEW,
                                    onClick: this.handleSubmitChanges
                                },
                                {
                                    id: 'appointmentSlipFooterCancelButton',
                                    children: 'Cancel',
                                    disabled: this.props.status === ButtonStatusEnum.VIEW,
                                    onClick: this.handleCancelEdit
                                }
                            ]
                        }
                    />
                </Grid>
                <EditModeMiddleware componentName={accessRightEnum.appointmentSlipFooterSetting} when={status === ButtonStatusEnum.EDIT} />
            </Grid>
        );
    }
}


const mapStateToProps = (state) => {
    return {
        ...state.appointmentSlipFooter,
        ...state.appointmentSlipFooter.dialogParm,
        ...state.appointmentSlipFooter.fieldMap,
        encounterCodeList: state.common.encounterTypeList,
        clinicCd: state.login.clinic.clinicCd
    };
};

const mapDispatchToProps = {
    resetAll,
    fetchRemarkDetails,
    editRemarkDetails,
    cancelEdit,
    updateField,
    loadEncounterTypeList,
    updateSlipFooter,
    clearRemarkDetails,
    openCommonMessage
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(style)(RemarkInformation));