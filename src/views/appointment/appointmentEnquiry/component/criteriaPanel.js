import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import CIMSSelect from '../../../../components/Select/CIMSSelect';
import DateFielcValidator from '../../../../components/FormValidator/DateFieldValidator';
// import { statusList } from '../../../../enums/appointment/attendance/attendanceStatus';
import Enum from '../../../../enums/enum';
import {
    openCommonCircular,
    closeCommonCircular
} from '../../../../store/actions/common/commonAction';
import moment from 'moment';
import CIMSButtonGroup from '../../../../components/Buttons/CIMSButtonGroup';
import ApptEnum from '../enum/apptEnquiryEnum';
import {
    fetchEnquiryResult,
    printApptReport
} from '../../../../store/actions/appointment/apptEnquiry/apptEnquiryAction';
import memoize from 'memoize-one';
import _ from 'lodash';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import { EnctrAndRmUtil, CommonUtil } from '../../../../utilities';

const styles = (theme) => ({
    form: {
        width: '100%'
    },
    root: {
        width: '100%',
        display: 'flex',
        height: '100%',
        flexFlow: 'row'
    },
    paddingLeft: {
        paddingLeft: theme.spacing(2)
    }
});

class CriteriaPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            curEnquiryParam: null
        };
    }

    componentDidMount() {
        this.initCriterialInfo();
    }

    componentDidUpdate(prevProps) {
        let oldInfo = prevProps.criteriaInfo;
        let newInfo = _.cloneDeep(this.props.criteriaInfo);
        if (oldInfo && oldInfo.encounterCd !== newInfo.encounterCd && this.curSubEncounterList.length === 1) {
            newInfo.subEncounterCd = this.curSubEncounterList[0].subEncounterTypeCd;
            this.props.handleCriteriaChange({ criteria: newInfo });
        }
        if (oldInfo && oldInfo.subEncounterCd !== newInfo.subEncounterCd && this.curEncounterList.length === 1) {
            newInfo.encounterCd = this.curEncounterList[0].encounterTypeCd;
            this.props.handleCriteriaChange({ criteria: newInfo });
        }
    }

    curEncounterList = [];
    curSubEncounterList = [];

    initCriterialInfo = () => {
        const { clinicCd } = this.props;
        let tempInfo = { ...this.props.criteriaInfo, dateFrom: moment(), dateTo: moment() };
        tempInfo.clinicCd = clinicCd;
        this.props.handleCriteriaChange({ criteria: tempInfo });
    }

    handleInputChange = (name, value) => {
        // const { serviceCd } = this.props;
        let tempInfo = { ...this.props.criteriaInfo };
        let dateFrom = tempInfo.dateFrom;
        tempInfo[name] = value;

        if (name === 'type') {
            if (value === ApptEnum.APPT_TYPE.DEFAULTER_TRACING || dateFrom >= moment().endOf('days')) {
                tempInfo.status = 'N';
            }
            else {
                tempInfo.status = '*All';
            }
            this.props.changeTableHeader(value);
            this.props.handleCriteriaChange({ enquiryResult: [] });
            tempInfo.encounterCd = '*All';
            tempInfo.subEncounterCd = '*All';

        }

        if (name === 'clinicCd') {
            tempInfo.encounterCd = '*All';
            tempInfo.subEncounterCd = '*All';
            if (tempInfo.type === ApptEnum.APPT_TYPE.APPT_LIST && dateFrom <= moment().endOf('days')) {
                tempInfo.status = '*All';
            }
        }

        this.props.handleCriteriaChange({ criteria: tempInfo });
    }

    handleDateAccept = (name, value) => {
        let tempInfo = { ...this.props.criteriaInfo };
        let type = tempInfo.type;
        tempInfo[name] = value;
        if (name === 'dateFrom') {
            if (value === null || !moment(value).isValid()) {
                tempInfo.dateFrom = moment();
            }
            if (moment(tempInfo.dateTo).isBefore(moment(tempInfo.dateFrom))) {
                tempInfo.dateTo = tempInfo.dateFrom;
            }
        }

        if (name === 'dateTo') {
            if (value === null || !moment(value).isValid()) {
                tempInfo.dateTo = moment();
            }
            if (moment(tempInfo.dateFrom).isAfter(moment(tempInfo.dateTo))) {
                tempInfo.dateFrom = tempInfo.dateTo;
            }
        }

        if (tempInfo.dateFrom > moment().endOf('days') || type === ApptEnum.APPT_TYPE.DEFAULTER_TRACING) {
            tempInfo.status = 'N';
        }
        else {
            tempInfo.status = '*All';
        }
        this.props.handleCriteriaChange({ criteria: tempInfo });
    }

    handleSearch = () => {
        const { criteriaInfo } = this.props;
        let param = {
            attnStatusCd: criteriaInfo.status === '*All' ? '' : criteriaInfo.status,
            clinicCd: criteriaInfo.clinicCd,
            encounter: criteriaInfo.encounterCd === '*All' ? '' : criteriaInfo.encounterCd,
            subEncounter: criteriaInfo.subEncounterCd === '*All' ? '' : criteriaInfo.subEncounterCd,
            from: moment(criteriaInfo.dateFrom).format(Enum.DATE_FORMAT_EYMD_VALUE),
            to: moment(criteriaInfo.dateTo).format(Enum.DATE_FORMAT_EYMD_VALUE),
            reportType: criteriaInfo.type
        };
        this.setState({ curEnquiryParam: param });
        this.props.fetchEnquiryResult(param);
        this.props.resetPage();
    }

    handlePrint = () => {
        let { curEnquiryParam } = this.state;
        if (!curEnquiryParam || this.props.enquiryResult.length === 0) {
            return;
        }
        this.props.openCommonCircular();
        this.props.printApptReport(curEnquiryParam,
            () => {
                this.props.closeCommonCircular();
            }
        );
    }

    filterClinic = memoize((clinicList, serviceCd) => {
        return clinicList && clinicList.filter(item => item.serviceCd === serviceCd);
    });

    filterSubEncounterList = memoize((encounterList, encounterCd) => {
        if (!encounterList) return [];
        let tempSubEncounterList = [];
        const allSubEncounterList = CommonUtil.initSubEncounterList(encounterList);
        if (encounterCd && encounterCd !== '*All') {
            allSubEncounterList.forEach(subEncounter => {
                let encounterIdx = subEncounter.parentGp.findIndex(item => item.encounterTypeCd === encounterCd);
                if (encounterIdx > -1) {
                    tempSubEncounterList.push(subEncounter);
                }
            });
        } else {
            tempSubEncounterList = _.cloneDeep(allSubEncounterList);
        }
        return tempSubEncounterList;
    });

    filterEncounterList = memoize((encounterList, subEncounterCd) => {
        if (!encounterList) return [];
        let tempEncounterList = [];
        const allSubEncounterList = CommonUtil.initSubEncounterList(encounterList);
        if (subEncounterCd && subEncounterCd !== '*All') {
            let selectedSubEncounter = allSubEncounterList.find(item => item.subEncounterTypeCd === subEncounterCd);
            if (selectedSubEncounter && selectedSubEncounter.parentGp) {
                selectedSubEncounter.parentGp.forEach(parent => {
                    tempEncounterList.push(parent);
                });
            }
        } else {
            tempEncounterList = _.cloneDeep(encounterList);
        }
        return tempEncounterList;
    });


    render() {
        const {
            id,
            criteriaInfo,
            classes,
            enquiryResult,
            serviceCd,
            clinicList,
            encounterTypeList
        } = this.props;
        const apptTypeList = ApptEnum.APPT_TYPE_LIST;

        const curClinicList = this.filterClinic(clinicList, serviceCd);
        const siteId = CommonUtil.getSiteIdBySiteCd(criteriaInfo.clinicCd);
        const _encounterTypeList = EnctrAndRmUtil.getActiveEnctrTypeIncludeAllClinic(siteId, encounterTypeList);
        this.curEncounterList = this.filterEncounterList(_encounterTypeList, criteriaInfo.subEncounterCd);
        this.curSubEncounterList = this.filterSubEncounterList(_encounterTypeList, criteriaInfo.encounterCd);

        return (
            <ValidatorForm onSubmit={this.handleSearch} className={classes.form}>
                <Grid container className={classes.root} spacing={2}>
                    <Grid item xs={10}>
                        <Grid item container xs={12} direction={'row'} spacing={4}>
                            <Grid item xs={5}>
                                <CIMSSelect
                                    id={`${id}_appointment_type_select`}
                                    TextFieldProps={{
                                        variant: 'outlined',
                                        label: <>Report Type<RequiredIcon /></>
                                    }}
                                    value={criteriaInfo.type}
                                    options={apptTypeList && apptTypeList.map(item => ({ value: item.value, label: item.type }))}
                                    onChange={(e) => this.handleInputChange('type', e.value)}
                                />
                            </Grid>
                            <Grid item xs={5}>
                                <CIMSSelect
                                    id={`${id}_clinic_select`}
                                    TextFieldProps={{
                                        variant: 'outlined',
                                        label: <>Clinic<RequiredIcon /></>
                                    }}
                                    value={criteriaInfo.clinicCd}
                                    options={curClinicList && curClinicList.map(item => ({ value: item.clinicCd, label: item.clinicName }))}
                                    onChange={(e) => this.handleInputChange('clinicCd', e.value)}
                                    sortBy="label"
                                />
                            </Grid>

                        </Grid>
                        <Grid item container xs={12} direction={'row'} spacing={4}>
                            <Grid item container xs={5} direction={'row'}>
                                <Grid item xs={6} >
                                    <DateFielcValidator
                                        id={`${id}_date_from_date_picker`}
                                        label={'Date From'}
                                        value={criteriaInfo.dateFrom}
                                        isRequired
                                        onChange={(e) => this.handleInputChange('dateFrom', e)}
                                        onBlur={e => this.handleDateAccept('dateFrom', e)}
                                        onAccept={e => this.handleDateAccept('dateFrom', e)}

                                    />
                                </Grid>
                                <Grid item xs={6} className={classes.paddingLeft}>
                                    <DateFielcValidator
                                        id={`${id}_date_to_date_picker`}
                                        label={'Date To'}
                                        value={criteriaInfo.dateTo}
                                        isRequired
                                        onChange={(e) => this.handleInputChange('dateTo', e)}
                                        onBlur={e => this.handleDateAccept('dateTo', e)}
                                        onAccept={e => this.handleDateAccept('dateTo', e)}

                                    />
                                </Grid>
                            </Grid>
                            <Grid item container xs={5} direction={'row'}>
                                <Grid item xs={4}>
                                    <CIMSSelect
                                        id={`${id}_encounter_select`}
                                        TextFieldProps={{
                                            variant: 'outlined',
                                            label: 'Encounter'
                                        }}
                                        options={this.curEncounterList && this.curEncounterList.map(item => ({
                                            value: item.encounterTypeCd,
                                            label: item.description
                                        }))}
                                        value={criteriaInfo.encounterCd}
                                        onChange={(e) => this.handleInputChange('encounterCd', e.value)}
                                        sortBy="label"
                                        addAllOption
                                        addNullOption={false}
                                    />
                                </Grid>

                                <Grid item xs={4} className={classes.paddingLeft}>
                                    <CIMSSelect
                                        id={`${id}_sub_encounter_select`}
                                        TextFieldProps={{
                                            variant: 'outlined',
                                            label: 'Sub-encounter'
                                        }}
                                        options={this.curSubEncounterList && this.curSubEncounterList.map(item => ({
                                            value: item.subEncounterTypeCd,
                                            label: item.description
                                        }))}
                                        value={criteriaInfo.subEncounterCd}
                                        onChange={(e) => this.handleInputChange('subEncounterCd', e.value)}
                                        sortBy="label"
                                        addAllOption
                                        addNullOption={false}
                                    />
                                </Grid>

                                <Grid item xs={4} className={classes.paddingLeft}>
                                    <CIMSSelect
                                        id={`${id}_status_select`}
                                        TextFieldProps={{
                                            variant: 'outlined',
                                            label: 'Status'
                                        }}
                                        options={Enum.ATTENDANCE_STATUS_LIST && Enum.ATTENDANCE_STATUS_LIST.map((item) => ({
                                            value: item.value,
                                            label: item.label
                                        }))}
                                        value={criteriaInfo.status}
                                        onChange={(e) => this.handleInputChange('status', e.value)}
                                        isDisabled={criteriaInfo.type === ApptEnum.APPT_TYPE.DEFAULTER_TRACING || criteriaInfo.dateFrom > moment().endOf('days')}
                                        sortBy="label"
                                        addAllOption
                                        addNullOption={false}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item container xs={2} alignItems={'center'} justify={'flex-end'} style={{ paddingRight: 0 }}>
                        <CIMSButtonGroup
                            customStyle={{
                                position: 'unset',
                                right: 0,
                                width: 'auto',
                                zIndex: 999,
                                padding: 0
                            }}
                            buttonConfig={
                                [
                                    {
                                        id: `${id}_appointment_enquiry_search_button`,
                                        name: 'Search',
                                        type: 'submit'
                                        // onClick: this.handleSearch
                                    },
                                    {
                                        id: `${id}_appointment_enquiry_print_button`,
                                        name: 'Print',
                                        onClick: this.handlePrint,
                                        disabled: (enquiryResult.length === 0)
                                    }
                                ]
                            }
                        />
                        {/* <CIMSButton
                        id={`${id}_appointment_enquiry_search_button`}
                        children={'Search'}
                        onClick={this.handleSearch}
                    />
                    <CIMSButton
                        id={`${id}_appointment_enquiry_print_button`}
                        children={'Print'}
                        onClick={this.handlePrint}
                        disabled={enquiryResult.length === 0}
                    /> */}
                    </Grid>
                </Grid>
            </ValidatorForm>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        enquiryResult: state.apptEnquiry.enquiryResult,
        serviceCd: state.login.service.serviceCd,
        encounterTypeList: state.common.encounterTypeList
    };
};

const mapDispatchToProps = {
    fetchEnquiryResult,
    printApptReport,
    openCommonCircular,
    closeCommonCircular
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(CriteriaPanel));