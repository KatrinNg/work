import React, { Component } from 'react';
import {
    Grid,
    Button
} from '@material-ui/core';
import * as appointmentUtilities from '../../../../../utilities/appointmentUtilities';
import moment from 'moment';
import Enum from '../../../../../enums/enum';
import QuotaButton from '../quotaButton';
import UnavaButton from '../unavaButton';

import * as patientUtilities from '../../../../../utilities/patientUtilities';

class DayViewRow extends Component {
    moreBtnOnClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof this.props.moreOnClick === 'function') {
            this.props.moreOnClick(this.props.rowData);
        }
    };
    handleHours = (hours) => {
        if (moment() >= moment(hours, 'HH:mm') && moment() < moment((hours.substring(0, 3) + '30'), 'HH:mm')) {
            return hours;
        } else if (moment() >= moment((hours.substring(0, 3) + '30'), 'HH:mm') && moment() < moment((hours.substring(0, 3) + '00'), 'HH:mm').add(1, 'hours')) {
            return moment((hours.substring(0, 3) + '30'), 'HH:mm').format('HH:mm');
        } else if (moment() == moment((hours.substring(0, 3) + '00'), 'HH:mm').add(1, 'hours')) {
            return moment((hours.substring(0, 3) + '00'), 'HH:mm').format('HH:mm');
        }
        return hours;
    }
    seletRow = () => {
        if (typeof this.props.selectTimeSlot === 'function') {
            let hours = this.handleHours(this.props.rowData.time);
            let params = { ...this.props.rowData, time: hours };
            this.props.selectTimeSlot(params);
        }
    };
    onHover = (e, action, remark, patientRemark) => {
        if (typeof this.props.remarkHover === 'function') {
            this.props.remarkHover(e.currentTarget, action, remark, patientRemark, this.props.rowData);
        }
    };
    render() {
        const { id, classes, rowData, quotaName, bookQuota, openPatientSummary, countryList, viewOnly } = this.props;
        let quotasData = {
            quotas: {},
            quotasBooked: {},
            overallQt: rowData['overallQt'],
            isUnavailable: rowData['isUnavailable']
        };
        let tmp = [...Array(8).keys()];
        for (let i = 0; i < tmp.length; i++) {
            quotasData.quotas['qt' + (i + 1)] = rowData['qt' + (i + 1)];
            quotasData.quotasBooked['qt' + (i + 1) + 'Booked'] = rowData['qt' + (i + 1) + 'Booked'];
        }

        return (
            !rowData ? null :
                <Grid id={id} className={'row slot'}>
                    <Grid className={'leftCell'}>
                        <Grid className={'rowCellContainer'}>
                            <Grid className={'slotTime'}>{rowData.stime + ' - ' + rowData.etime}</Grid>
                            {
                                <QuotaButton
                                    quotasData={quotasData}
                                    quotaName={quotaName}
                                    bookQuota={bookQuota}
                                    calendar="day"
                                    bookingData={{
                                        ...quotasData,
                                        calendar: 'day',
                                        datetime: rowData.datetime
                                    }}
                                    viewOnly={viewOnly}
                                />
                            }
                        </Grid>
                    </Grid>
                    <Grid id={id + 'SelectButton'} className={moment(rowData.date + ' ' + rowData.time, Enum.DATE_FORMAT_EYMD_VALUE + ' ' + Enum.TIME_FORMAT_24_HOUR_CLOCK) < moment().subtract(1, 'hours') || rowData.tolalRemain === 0 ? 'rightCell noSlot' : 'rightCell'} onClick={moment(rowData.date + ' ' + rowData.time, Enum.DATE_FORMAT_EYMD_VALUE + ' ' + Enum.TIME_FORMAT_24_HOUR_CLOCK) < moment().subtract(1, 'hours') || rowData.tolalRemain === 0 ? null : this.seletRow}>

                        {!rowData.appts || rowData.appts.length <= 0 ? null :
                            <Grid className={'slotRemarks'} >
                                {rowData.appts.map((item, index) => {
                                    if (index < 3) {
                                        let patientClass, patientRemark = null;
                                        if (item.dod && item.dod !== null) {
                                            patientClass = 'deadRoot';
                                        } else if (item.genderCd) {
                                            switch (item.genderCd) {
                                                case Enum.GENDER_MALE_VALUE:
                                                    patientClass = 'maleRoot';
                                                    break;
                                                case Enum.GENDER_FEMALE_VALUE:
                                                    patientClass = 'femaleRoot';
                                                    break;
                                                case Enum.GENDER_UNKNOWN_VALUE:
                                                    patientClass = 'unknownSexRoot';
                                                    break;
                                                default:
                                                    patientClass = 'anonymousRoot';
                                                    break;
                                            }
                                        } else {
                                            patientClass = 'anonymousRoot';
                                        }
                                        patientRemark = appointmentUtilities.slotRemark(item, countryList);
                                        return (
                                            <Grid
                                                key={index}
                                                className={'remark ' + (viewOnly ? '' : 'remarkClickable ') + patientClass}
                                                //className={'remark'}
                                                onMouseEnter={(e) => this.onHover(e, true, item, patientRemark)}
                                                onMouseLeave={(e) => this.onHover(e, false, item, patientRemark)}
                                                onClick={(e) => {
                                                    if (!viewOnly)
                                                        openPatientSummary(item);
                                                }}
                                            >
                                                {patientRemark}
                                            </Grid>
                                        );
                                    }
                                }
                                )}
                            </Grid>
                        }
                        {
                            //!rowData.remark || rowData.remark.length <= 0 ? null :
                            //<Grid className={'slotRemarks'} >
                            //{rowData.remark.map((item, index) =>
                            //index >= 2 ? null :
                            //<Grid
                            //key={index}
                            //className={'remark'}
                            //onMouseEnter={(e) => this.onHover(e, true, item)}
                            //onMouseLeave={(e) => this.onHover(e, false, item)}
                            //>
                            //{
                            //appointmentUtilities.slotRemark(item)
                            //}
                            //</Grid>
                            //)}
                            //</Grid>
                        }
                        {!rowData.appts || rowData.appts.length <= 3 ? null :
                            <Grid className={'moreRemark'}>
                                <Button
                                    id={id + 'MoreButton'}
                                    size="small"
                                    color="primary"
                                    className={classes.button}
                                    onClick={this.moreBtnOnClick}
                                >
                                    {`+${rowData.appts.length - 3} more`}
                                </Button>
                            </Grid>
                        }
                    </Grid>
                </Grid>
        );
    }
}
export default DayViewRow;
