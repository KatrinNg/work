import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import _ from 'lodash';

import { Grid, Link, Paper } from '@material-ui/core';

import 'date-fns';

import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
import DateFieldValidator from '../../../../components/FormValidator/DateFieldValidator';
import TimeFieldValidator from '../../../../components/FormValidator/TimeFieldValidator';
import ValidatorEnum from '../../../../enums/validatorEnum';
import CommonMessage from '../../../../constants/commonMessage';
import DelayInput from '../../../compontent/delayInput';
import RadioFieldValidator from '../../../../components/FormValidator/RadioFieldValidator';

import moment from 'moment';
import { connect } from 'react-redux';
import memoize from 'memoize-one';
import Enum from '../../../../enums/enum';
import ContactInformationEnum from '../../../../enums/registration/contactInformationEnum';
import { contactHistoryAction as contactHistoryActionEnum } from '../../../../enums/dts/appointment/contactHistoryActionEnum';
import { DTS_DATE_DISPLAY_FORMAT } from '../../../../constants/dts/DtsConstant';

const styles = ({
    root: {
        margin: '1px auto auto auto',
        width: '100%',
        border: '0px'
    },
    colTitle: {
        textAlign: 'left',
        borderStyle: 'none',
        fontWeight: 'bold',
        padding: '10px'
    }
    , colLabel: {
        textAlign: 'left',
        fontWeight: 'bold'
    },
    colDetailLabel: {
        textAlign: 'left',
        padding: '10px 10px 10px 0px'
    },
    row: {
        paddingBottom: 10
    },
    radioGroupGrid: {
        marginBottom: '5px'
    },
    divLink: {
        marginRight: '8px',
        display: 'block'
    },
    link: {
        paddingRight: '8px'
    },
    divAddress: {
        overflow: 'auto',
        whiteSpace: 'nowrap'
    },
    invisible: {
        display: 'none'
    },
    divRow: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%'
    },
    singleRowTextField: {
        marginLeft: '-5px'
    }
});

class DtsContactHistoryMail extends Component {

    state = {
        note: ''
    };

    handleContactDateChange = (value) => {
        this.props.updateContHistState({
            NotificationDate: value
        }, true);
    }

    handleContactTimeChange = (value) => {
        this.props.updateContHistState({
            NotificationTime: value
        }, true);
    }

    handleContactNotesChange = (event) => {
        this.props.updateContHistState({ note: event.target.value }, true);
    }

    noteOnClick = (note) => {
        this.props.updateContHistState({ note }, true);
    }

    onNoteChange = e => {
        this.props.updateContHistState({ note: e.target.value }, true);
        this.setState({ note: e.target.value });
    }

    handleContactAddressChange = (event) => {
        this.props.updateContHistState({ address: event.target.value }, true);
    }

    addressOnClick = (address) => {
        this.props.updateContHistState({ address }, true);
    }

    getPatientAddress = memoize((_address) => {
        if (_address) {
            const region = ContactInformationEnum.REGION.find(item => item.code === _address.region);
            const district = this.props.commonCodeList.district && this.props.commonCodeList.district.find(item => item.code === _address.districtCode);
            const subDistrict = this.props.commonCodeList.sub_district && this.props.commonCodeList.sub_district.find(item => item.code === _address.subDistrictCode);
            let value;
            let addressArr = [];

            switch (_address.addressFormat) {
                case ContactInformationEnum.ADDRESS_FORMAT.LOCAL_ADDRESS: {
                    if (_address.addressLanguageCode === Enum.PATIENT_ADDRESS_ENGLISH_LANUAGE) {
                        if (_address.room) {
                            addressArr.push(_address.room);
                        }
                        if (_address.floor) {
                            addressArr.push(_address.floor);
                        }
                        if (_address.block) {
                            addressArr.push(_address.block);
                        }
                        if (_address.streetNo) {
                            addressArr.push(_address.streetNo);
                        }
                        if (_address.building) {
                            addressArr.push(_address.building);
                        }
                        if (_address.streetName) {
                            addressArr.push(_address.streetName);
                        }
                        if (_address.estate) {
                            addressArr.push(_address.estate);
                        }
                        if (subDistrict && subDistrict.engDesc) {
                            addressArr.push(subDistrict.engDesc);
                        }
                        if (district && district.engDesc) {
                            addressArr.push(district.engDesc);
                        }
                        if (region && region.engDesc) {
                            addressArr.push(region.engDesc);
                        }
                        if (addressArr.length > 0) {
                            value = addressArr.join(', ');
                        }
                    } else {
                        if (region && region.chiDesc) {
                            addressArr.push(region.chiDesc);
                        }
                        if (district && district.chiDesc) {
                            addressArr.push(district.chiDesc);
                        }
                        if (subDistrict && subDistrict.chiDesc) {
                            addressArr.push(subDistrict.chiDesc);
                        }
                        if (_address.estate) {
                            addressArr.push(_address.estate);
                        }
                        if (_address.streetNo) {
                            addressArr.push(_address.streetNo);
                        }
                        if (_address.streetName) {
                            addressArr.push(_address.streetName);
                        }
                        if (_address.building) {
                            addressArr.push(_address.building);
                        }
                        if (_address.block) {
                            addressArr.push(_address.block);
                        }
                        if (_address.floor) {
                            addressArr.push(_address.floor);
                        }
                        if (_address.room) {
                            addressArr.push(_address.room);
                        }
                        value = addressArr.join('');
                    }
                    break;
                }
                case ContactInformationEnum.ADDRESS_FORMAT.FREE_TEXT_ADDRESS: {
                    value = _address.addressText || '';
                    break;
                }
                case ContactInformationEnum.ADDRESS_FORMAT.POSTAL_BOX_ADDRESS: {
                    if (_address.addressLanguageCode === Enum.PATIENT_ADDRESS_ENGLISH_LANUAGE) {
                        if (_address.postOfficeName) {
                            addressArr.push(_address.postOfficeName);
                        }
                        if (_address.postOfficeBoxNo) {
                            addressArr.push(_address.postOfficeBoxNo);
                        }
                        if (_address.postOfficeRegion) {
                            addressArr.push(_address.postOfficeRegion);
                        }
                        value = addressArr.join(', ');
                    } else {
                        if (_address.postOfficeName) {
                            addressArr.push(_address.postOfficeName);
                        }
                        if (_address.postOfficeRegion) {
                            addressArr.push(_address.postOfficeRegion);
                        }
                        if (_address.postOfficeBoxNo) {
                            addressArr.push(_address.postOfficeBoxNo);
                        }
                        value = addressArr.join('');
                    }
                    break;
                }
                default: {
                    value = '';
                    break;
                }
            }
            return value;
        }
        return '';
    });

    getAddressType = (address) => {
        //fieldName
        if (address.addressTypeCode === Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE) {
            return 'Correspondence Address: ';
        } else if (address.addressTypeCode === Enum.PATIENT_RESIDENTIAL_ADDRESS_TYPE) {
            return 'Residential Address: ';
        } else if (address.addressTypeCode === Enum.PATIENT_CONTACT_PERSON_ADDRESS_TYPE) {
            return 'Contact Person Address: ';
        }
        return 0;
    }

    getNoteList = (contactHistoryMailNotesListSucceed) => {
        let tempNoteList = [];
        (contactHistoryMailNotesListSucceed)
            .map(
                (contactHistoryTelNotesItem, index) => {
                    tempNoteList.push({ 'label': contactHistoryTelNotesItem.remark, 'value': contactHistoryTelNotesItem.remark });
                    return (
                        // <Link style={{ display: 'inline' }} key={'notesLink' + index} className={classes.link}
                        //     onClick={() => this.noteOnClick(contactHistoryTelNotesItem.remark)}
                        // >
                        //     {contactHistoryTelNotesItem.remark}
                        // </Link>
                        tempNoteList
                    );
                }
            );
        return tempNoteList;
    }
    render() {
        const { classes, contactHistoryMailNotesListSucceed, appointment, contactHistoryInfo, contactHistoryAction, ...rest } = this.props;
        return (
            <Grid container className={classes.root}>
                <Grid container spacing={0}>
                    <div className={(contactHistoryAction == contactHistoryActionEnum.VIEW ? classes.invisible : classes.divRow)}>
                        <Grid item xs={2}>
                            &nbsp;
                        </Grid>
                        <Grid item xs={10} className={classes.radioGroupGrid}>
                            <div className={classes.divAddress}>
                                {appointment?.patientDto?.addressList?.length > 0 ?
                                    (appointment.patientDto.addressList.map((addressListItem, index) =>
                                        <div key={'row' + index} className={classes.divLink}>
                                            <label>{this.getAddressType(addressListItem)}</label>
                                            <Link key={'addressLink' + index} className={classes.link}
                                                onClick={() => {
                                                    this.addressOnClick(this.getPatientAddress(addressListItem));
                                                }}
                                            >{this.getPatientAddress(addressListItem)}</Link>
                                        </div>
                                    )) : (
                                        <Paper elevation={0} className={classes.colDetailLabel}>This patient has no mail address in record.</Paper>
                                    )
                                }
                            </div>
                        </Grid>
                    </div>

                    <Grid item xs={2}>
                        <Paper elevation={0} className={classes.colTitle + ' ' + classes.colLabel}>Mail Address:{contactHistoryAction == contactHistoryActionEnum.VIEW || <RequiredIcon />}</Paper>
                    </Grid>
                    <Grid item xs={10} className={classes.row}>
                        {contactHistoryAction == contactHistoryActionEnum.VIEW ? <Paper elevation={0} className={classes.colDetailLabel}>{(contactHistoryInfo.address)}</Paper> :
                            <DelayInput
                                className={classes.singleRowTextField}
                                id={'addressInput'}
                                variant="outlined"
                                InputProps={{
                                    style: {
                                        height: '30px',
                                        width: '900px',
                                        margin: '5px',
                                        color: 'black'
                                    }
                                }}
                                value={this.props.contactHistoryInfo.address}
                                onChange={this.handleContactAddressChange}
                                isRequired
                                validators={[ValidatorEnum.required]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                msgPosition="bottom"
                            />}
                    </Grid>

                    <Grid item xs={2}>
                        <Paper elevation={0} className={classes.colTitle + ' ' + classes.colLabel}>Printed Time:</Paper>
                    </Grid>
                    <Grid item xs={2}>
                        {contactHistoryAction == contactHistoryActionEnum.VIEW ? <Paper elevation={0} className={classes.colDetailLabel}>{(contactHistoryInfo.NotificationDate ? contactHistoryInfo.NotificationDate.format('YYYY-MM-DD HH:mm') : '')}</Paper> :
                            <DateFieldValidator
                                label={<>{DTS_DATE_DISPLAY_FORMAT}<RequiredIcon /></>}
                                format={DTS_DATE_DISPLAY_FORMAT}
                                isRequired
                                style={{ width: 'inherit' }}
                                id={'contactDateInput'}
                                value={contactHistoryInfo.NotificationDate}
                                placeholder=""
                                onChange={this.handleContactDateChange}
                                msgPosition="bottom"
                            />}
                    </Grid>
                    <Grid item xs={2} style={{ paddingLeft: 5 }}>
                        {contactHistoryAction == contactHistoryActionEnum.VIEW ? '' :
                            <TimeFieldValidator
                                label={<>HH:mm<RequiredIcon /></>}
                                isRequired
                                id={'contactTimeInput'}
                                helperText=""
                                value={contactHistoryInfo.NotificationTime}
                                placeholder=""
                                onChange={this.handleContactTimeChange}
                                msgPosition="bottom"
                            />}
                    </Grid>
                    <Grid item xs={2}>
                        <Paper elevation={0} className={classes.colTitle + ' ' + classes.colLabel}>Caller Name:</Paper>
                    </Grid>
                    <Grid item xs={4}>
                        {/* <Paper  elevation={0} className={classes.colDetailLabel}>{this.props.loginName}</Paper> */}
                        <Paper elevation={0} className={classes.colDetailLabel}>{contactHistoryInfo.callerName}</Paper>
                    </Grid>

                    <Grid item xs={2}>
                        <Paper elevation={0} className={classes.colTitle + ' ' + classes.colLabel}>Contact Status.:</Paper>
                    </Grid>
                    <Grid item xs={10}>
                        <Paper elevation={0} className={classes.colDetailLabel}>{contactHistoryInfo.status == 'A' ? 'Succeed' : 'Failed'}</Paper>
                    </Grid>

                    <div className={(contactHistoryAction == contactHistoryActionEnum.VIEW ? classes.invisible : classes.divRow)}>
                        <Grid item xs={2}>
                            &nbsp;
                        </Grid>
                        <Grid item xs={10}>
                            {!_.isEmpty(contactHistoryMailNotesListSucceed) &&
                                <RadioFieldValidator
                                    isRequired
                                    value={this.state.note}
                                    onChange={this.onNoteChange}
                                    list={this.getNoteList(contactHistoryMailNotesListSucceed)}
                                    validators={[ValidatorEnum.required]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    RadioGroupProps={{ className: classes.radioGroup }}
                                    RadioProps={{ classes: { root: classes.optionRoot } }}
                                />
                                //     contactHistoryMailNotesListSucceed.map((contactHistoryMailNotesItem, index) =>
                                //         <Link style={{display: 'inline'}} key={'notesLink'+index} className={classes.link}
                                //             onClick={() => {this.noteOnClick(contactHistoryMailNotesItem.remark);}}
                                //         >{contactHistoryMailNotesItem.remark}
                                //         </Link>
                                //     )
                            }
                        </Grid>
                    </div>

                    <Grid item xs={2}>
                        <Paper elevation={0} className={classes.colTitle + ' ' + classes.colLabel}>Notes:</Paper>
                    </Grid>
                    <Grid item xs={10}>
                        {contactHistoryAction == contactHistoryActionEnum.VIEW ? <Paper elevation={0} className={classes.colDetailLabel}>{contactHistoryInfo.note}</Paper> :
                            <DelayInput
                                className={classes.dailyNoteTextField}
                                id={'notesInput'}
                                label={'Notes'}
                                multiline
                                rows={3}
                                variant="outlined"
                                value={this.props.contactHistoryInfo.note}
                                onChange={this.handleContactNotesChange}
                            />}
                    </Grid>

                </Grid>
            </Grid>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        commonCodeList: state.common.commonCodeList,
        contactHistoryMailNotesListSucceed: state.dtsRemindAppointment.contactHistoryMailNotesListSucceed
    };
};

export default connect(mapStateToProps)(withStyles(styles)(DtsContactHistoryMail));
