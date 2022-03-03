import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core';
import moment from 'moment';
import CIMSPromptDialog from '../../components/Dialog/CIMSPromptDialog';
import Enum from '../../enums/enum';
import { getPatientCaseNo, resetAll } from '../../store/actions/patient/patientAction';
import { cleanSubTabs } from '../../store/actions/mainFrame/mainFrameAction';
import { selectCaseTrigger, updateState, selectCaseOk, selectCaseCancel } from '../../store/actions/caseNo/caseNoAction';
import { CommonUtil, CaseNoUtil, EnctrAndRmUtil } from '../../utilities';
import AutoScrollTable from '../../components/Table/AutoScrollTable';
import _ from 'lodash';

const styles = () => ({
    container: {
        maxWidth: '80vw'
    }
});

class CaseNoSelectDialog extends Component {

    state = {
        columns: [
            {
                label: 'Case No.',
                name: 'caseNo',
                 width: 150,
                customBodyRender: (value,rowData) => {
                    //return CaseNoUtil.getFormatCaseNo(value);
                    return CaseNoUtil.getCaseAlias(rowData);
                }
            },
            {
                label: 'Encounter', name: 'encounterTypeCd', width: 100,
                customBodyRender: (value) => {
                    return EnctrAndRmUtil.getEncounterTypeDescByTypeCd(value, this.props.encounterTypeList);
                }
            },
            {
                label: 'Room', name: 'subEncounterTypeCd', width: 150,
                customBodyRender: (value, rowData) => {
                    return EnctrAndRmUtil.getRmDescByCd(value, rowData.encounterTypeCd, this.props.encounterTypeList);
                }
            },
            {
                label: 'Patient Status', name: 'patientStatus', width: 150,
                customBodyRender: (value) => {
                    let status = this.props.patient_status.find(x => x.code === value);
                    return status && status.superCode;
                }
            },
            { label: 'Case Reference', name: 'caseReference', width: 150 },
            { label: 'Owner Clinic', name: 'ownerClinicCd', width: 120 },
            {
                label: 'Registration Date', name: 'regDtm', width: 150,
                customBodyRender: (value) => {
                    return value && moment(value).format(Enum.DATE_FORMAT_EDMY_VALUE);
                }
            },
            { label: 'Remark', name: 'remark', width: 150 }
        ],
        selectIndex: []
    }

    componentWillUnmount() {
        this.props.updateState({ caseSelectCallBack: null });
    }

    handleTableRowClick = (e, row, index) => {
        if (this.state.selectIndex.indexOf(index) > -1) {
            this.setState({ selectIndex: [] });
        } else {
            this.setState({ selectIndex: [index] });
        }
    }

    handleTableRowDbClick = (e, row, index) => {
        const { selectCaseList } = this.props;
        let selectCase = selectCaseList[index];
        let selectCaseNo = selectCaseList[index].caseNo;
        this.props.getPatientCaseNo(selectCaseList, selectCaseNo);
        this.props.selectCaseTrigger({ trigger: Enum.CASE_SELECTOR_STATUS.CLOSE });
        this.props.caseSelectCallBack && this.props.caseSelectCallBack(_.cloneDeep(selectCase));
        this.props.selectCaseOk(_.cloneDeep(selectCase));
    }

    render() {
        const { classes, selectCaseList, openSelectCase } = this.props;
        return (
            <CIMSPromptDialog
                id="indexPatient_selectCaseNoDialog"
                dialogTitle="Select Case No."
                dialogContentText={
                    <AutoScrollTable
                        id="caseNoSelectDialog_scrollTable"
                        columns={this.state.columns}
                        store={selectCaseList}
                        selectIndex={this.state.selectIndex}
                        handleRowClick={this.handleTableRowClick}
                        handleRowDbClick={this.handleTableRowDbClick}
                        classes={{
                            container: classes.container
                        }}
                    />
                }
                open={openSelectCase === Enum.CASE_SELECTOR_STATUS.OPEN}
                buttonConfig={
                    [
                        {
                            id: 'indexPatient_selectCaseNoDialog_okBtn',
                            name: 'OK',
                            disabled: this.state.selectIndex.length === 0,
                            onClick: () => {
                                let selectCase = selectCaseList[this.state.selectIndex[0]];
                                let selectCaseNo = selectCase.caseNo;
                                this.props.getPatientCaseNo(selectCaseList, selectCaseNo);
                                this.props.selectCaseTrigger({ trigger: Enum.CASE_SELECTOR_STATUS.CLOSE });
                                this.props.caseSelectCallBack && this.props.caseSelectCallBack(_.cloneDeep(selectCase));
                                this.props.selectCaseOk(_.cloneDeep(selectCase));
                            }
                        },
                        {
                            id: 'indexPatient_selectCaseNoDialog_cancelBtn',
                            name: 'Cancel',
                            onClick: () => {
                                let isUseCaseNo = CommonUtil.isUseCaseNo();
                                if (isUseCaseNo){
                                    this.props.cleanSubTabs();
                                    this.props.resetAll();
                                    this.props.selectCaseTrigger({ trigger: Enum.CASE_SELECTOR_STATUS.CLOSE });
                                } else {
                                    this.props.selectCaseTrigger({ trigger: Enum.CASE_SELECTOR_STATUS.NO_NEED });
                                }
                                this.props.caseSelectCallBack && this.props.caseSelectCallBack(null);
                                this.props.selectCaseCancel();
                            }
                        }
                    ]
                }
            />
        );
    }
}

const mapStateToProps = (state) => {
    return {
        patientInfo: state.patient.patientInfo,
        selectCaseList: (state.caseNo.selectCaseList || []).filter(item => item.statusCd === 'A'),
        caseNoInfo: state.patient.caseNoInfo,
        openSelectCase: state.caseNo.openSelectCase,
        caseSelectCallBack: state.caseNo.caseSelectCallBack,
        encounterTypeList: state.common.encounterTypeList,
        patient_status: state.common.commonCodeList && state.common.commonCodeList.patient_status || []
    };
};

const mapDispatchToProps = {
    getPatientCaseNo,
    resetAll,
    cleanSubTabs,
    selectCaseTrigger,
    updateState,
    selectCaseOk,
    selectCaseCancel
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(CaseNoSelectDialog));