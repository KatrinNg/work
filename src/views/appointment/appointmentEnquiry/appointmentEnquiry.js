import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import CIMSTable from '../../../components/Table/CIMSTable';
import CriteriaPanel from './component/criteriaPanel';
import {
    updateField,
    restAll
} from '../../../store/actions/appointment/apptEnquiry/apptEnquiryAction';
import ApptEnum from './enum/apptEnquiryEnum';
import moment from 'moment';
import Enum from '../../../enums/enum';
import * as CaseNoUtilities from '../../../utilities/caseNoUtilities';
import * as PatientUtilities from '../../../utilities/patientUtilities';
import * as AppointmentUtilities from '../../../utilities/appointmentUtilities';
import * as CommonUtilities from '../../../utilities/commonUtilities';

const styles = (theme) => ({
    root: {
        width: '100%',
        display: 'flex',
        height: '100%',
        paddingTop: 10,
        flexFlow: 'column'
    },
    tableRoot: {
        marginTop: theme.spacing(1)
    },
    dateInput: {
        marginLeft: 20
    }
});

function genTableHeader(type) {
    let rows = [];
    let list = [];
    if (type === ApptEnum.APPT_TYPE.APPT_LIST) {
        list = ApptEnum.APPT_LIST_HEADER;
    }
    else {
        list = ApptEnum.DEFAULTER_TRANCING_HEADER;
    }

    for (let i = 0; i < list.length; i++) {
        let newRow = {
            name: list[i]['labelCd'],
            label: list[i]['labelName'],
            width: list[i]['labelLength'],
            split: list[i]['site'] === '1'
        };
        if (newRow.name === 'caseNo') {
            newRow.customBodyRender = (value) => {
                return CaseNoUtilities.getFormatCaseNo(value);
            };
        }
        if (newRow.name === 'hkid') {
            newRow.customBodyRender = (value, rowData) => {
                return PatientUtilities.getPatientAnyDocNo(rowData);
            };
        }
        rows.push(newRow);
    }
    return rows;
}

function filterEnquiryResult(originData, type) {
    let resultList = [];
    if (originData && originData.length > 0) {
        originData.forEach((d, index) => {
            if (d.patientDto) {
                let patientDto = d.patientDto;
                let filterSet = {};
                filterSet.patientName = CommonUtilities.getFullName(patientDto.engSurname, patientDto.engGivename);
                filterSet.caseNo = d.caseNo ? d.caseNo : '';
                filterSet.hkid = patientDto.hkid;
                filterSet.otherDocNo = patientDto.otherDocNo;
                filterSet.genderCd = patientDto.genderCd;
                filterSet.age = `${patientDto.age}${patientDto.ageUnit[0]}`;
                filterSet.phoneNo = patientDto.phoneNo;
                filterSet.docTypeCd = patientDto.docTypeCd;
                filterSet.encounter = d.encounter;
                filterSet.subEncounter = d.subEncounter;

                if (type === ApptEnum.APPT_TYPE.APPT_LIST) {
                    filterSet.appointmentTime = `${moment(d.appointmentDate).format(Enum.DATE_FORMAT_EDMY_VALUE)} ${d.appointmentTime}`;
                    filterSet.attnStatusCd = d.attnStatusCd;
                    filterSet.remark = d.remark;
                    // filterSet.remarkAndMemo = `${d.remark ? d.remark : ''}${d.remark && d.memo ? '. ' : ''}${d.memo ? d.memo : ''}`;
                    filterSet.remarkAndMemo = AppointmentUtilities.getFormatRemarkAndMemo(d);
                    filterSet.caseTypeCd = d.caseTypeCd === 'N' ? 'New' : 'Old';
                } else {
                    filterSet.defaulterNumber = d.defaulterNumber;
                }
                filterSet.rowId = index + 1;
                resultList.push(filterSet);
            }
        });
    }
    // defaulter tracing report (Records default sorting by Encounter, Sub-encounter, Name)
    if (type === ApptEnum.APPT_TYPE.DEFAULTER_TRACING) {
        resultList.sort((a, b) => {
            if (a.encounter != b.encounter) {
                return  a.encounter.localeCompare(b.encounter);
            } else if (b.subEncounter != a.subEncounter) {
                return a.subEncounter.localeCompare(b.subEncounter);
            } else if (b.patientName != a.patientName) {
                return a.patientName.localeCompare(b.patientName);
            }
        });
    }
    return resultList;

}

class AppointmentEnquiry extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tableRows: genTableHeader(ApptEnum.APPT_TYPE.APPT_LIST),
            tableOptions: {
                rowsPerPage: 10,
                rowsPerPageOptions: [5, 10, 15],
                rowExpand: true,
                onSelectIdName: 'rowId',
                onSelectedRow: () => { }
            }
        };
    }

    componentDidMount() {
        this.tableRef.setDividerScale('60');
    }

    componentWillUnmount() {
        this.props.restAll();
    }

    updateCriteriaInfo = (info) => {
        this.props.updateField(info);
    }

    changeTableHeader = (type) => {
        let tempHeader = genTableHeader(type);
        this.setState({ tableRows: tempHeader });
    }

    resetTablePageToDefault = () => {
        this.tableRef.updatePage(0);
    }

    render() {
        const { classes, serviceCd, clinicCd, clinicList, criteria, enquiryResult } = this.props;
        const filterReusltList = filterEnquiryResult(enquiryResult, criteria.type);

        return (
            <Grid container className={classes.root}>
                <Grid container>
                    <Grid container>
                        <CriteriaPanel
                            id={'appointment_enquiry_criteria'}
                            serviceCd={serviceCd}
                            clinicCd={clinicCd}
                            clinicList={clinicList}
                            criteriaInfo={criteria}
                            handleCriteriaChange={this.updateCriteriaInfo}
                            changeTableHeader={this.changeTableHeader}
                            resetPage={this.resetTablePageToDefault}
                        />
                    </Grid>
                    <Grid container className={classes.tableRoot}>
                        <CIMSTable
                            id={'appointment_enquiry_enquiry_result_table'}
                            innerRef={ref => this.tableRef = ref}
                            rows={this.state.tableRows}
                            options={this.state.tableOptions}
                            data={filterReusltList}
                        />
                    </Grid>
                </Grid>
            </Grid>

        );

    }
}

const mapStateToProps = (state) => {
    return {
        serviceCd: state.login.service.serviceCd,
        clinicCd: state.login.clinic.clinicCd,
        clinicList: state.common.clinicList,
        codeList: state.login.codeList,
        ...state.apptEnquiry
    };
};

const mapDispatchToProps = {
    updateField,
    restAll
};


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(AppointmentEnquiry));