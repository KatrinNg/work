import React from 'react';
import {
    Grid,
    ButtonGroup,
    Button,
    IconButton,
    Tooltip,
    Typography
} from '@material-ui/core';
import {Autorenew} from '@material-ui/icons';
import moment from 'moment';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import DatePicker from '../../../../components/FormValidator/DateFieldValidator';
import Enum from '../../../../enums/enum';
export default function (props) {
    const {
        classes,
        id,
        calendarViewValue,
        dateFrom,
        dateTo,
        subtractDate,
        addDate,
        backToday,
        calendarViewValueOnChange,
        openPreviewWindow,
        handleRefresh,
        handleRedistribution,
        hasRedistributionRight,
        changeMonthViewDate,
        monthViewDateOnblur,
        allowCrossClinicCalendarView,
        auditAction
    } = props;
    return (
        <Grid id={id} className={classes.calendarDateBar}>
            <Grid className={'dateAction'}>
                <ButtonGroup
                    size="small"
                    className={'buttonGroup'}
                >
                    <Button
                        id={id + 'TodayButton'}
                        classes={{
                            root: classes.buttonRoot,
                            label: classes.buttonLabel,
                            disabled: classes.buttonDisabled
                        }}
                        onClick={()=>{
                            auditAction('Click Today Button',null,null,false,'ana');
                            backToday();
                        }}
                    >Today</Button>
                </ButtonGroup>
                <ButtonGroup
                    size="small"
                    className={'buttonGroup'}
                >
                    <Button
                        id={id + 'PreviousButton'}
                        classes={{
                            root: classes.buttonRoot,
                            label: classes.buttonLabel,
                            disabled: classes.buttonDisabled
                        }}
                        onClick={()=>{
                            auditAction('Click Subtract Date Button',null,null,false,'ana');
                            subtractDate();
                        }}
                    >{'<'}</Button>
                    <Button
                        id={id + 'NextButton'}
                        classes={{
                            root: classes.buttonRoot,
                            label: classes.buttonLabel,
                            disabled: classes.disabled
                        }}
                        onClick={()=>{
                            auditAction('Click Add Date Button',null,null,false,'ana');
                            addDate();
                        }}
                    >{'>'}</Button>
                </ButtonGroup>
                {/* <label>
                    {
                        calendarViewValue === 'M' ? moment(dateFrom).format('MMM, YYYY') :
                            calendarViewValue === 'W' ? moment(dateFrom).format('D MMM, YYYY (ddd)') + ' ~ ' + moment(dateTo).format('D MMM, YYYY (ddd)') :
                                moment(dateFrom).format('D MMM, YYYY (ddd)')
                    }
                </label> */}
                {
                    calendarViewValue==='M'
                    ?
                    <DatePicker
                        id={id + 'MonthViewDatePicker'}
                        value={dateFrom}
                        format={Enum.DATE_FORMAT_EMY_VALUE}
                        classes={{
                            root:classes.monthViewPicker
                        }}
                        onChange={changeMonthViewDate}
                        onBlur={monthViewDateOnblur}
                        // onDateAccept={(value)=>{


                        // }}
                        onAccept={monthViewDateOnblur}
                        openTo={'year'}
                        views={['year','month']}
                        absoluteMessage
                    />
                    :calendarViewValue === 'W' ? moment(dateFrom).format('D MMM, YYYY (ddd)') + ' ~ ' + moment(dateTo).format('D MMM, YYYY (ddd)') :
                    moment(dateFrom).format('D MMM, YYYY (ddd)')
                }
            </Grid>
            <Grid item container style={{width:50}}>
                <Tooltip
                    title={
                        <Typography>
                            Refresh
                        </Typography>
                        }
                    placement={'bottom'}
                    classes={{ tooltipPlacementBottom: classes.tooltipPlacementBottom }}
                >
                    <IconButton
                        color={'primary'}
                        onClick={()=>{
                            auditAction('Click Refresh Button',null,null,false,'ana');
                            handleRefresh();
                        }}
                    >
                        <Autorenew />
                    </IconButton>
                </Tooltip>
            </Grid>
            {hasRedistributionRight?
                <Grid container style={{width:150}}>
                    <CIMSButton
                        id={id + 'RedistributionButton'}
                        children={'Redistribution'}
                        onClick={()=>{
                            auditAction('Click Redistribution Button',null,null,false,'ana');
                            handleRedistribution();
                        }}
                    />
                </Grid>
            :null}
            {
                calendarViewValue === 'D' ?
                    <Grid container style={{ width: 150 }}>
                        <CIMSButton
                            id={id + 'PrintApptListButton'}
                            children={`Print Appt. List${allowCrossClinicCalendarView ? ' (Primary)' : ''}`}
                            onClick={()=>{
                                auditAction('Click Print Appt. List Button',null,null,false,'ana');
                                openPreviewWindow();
                            }}
                        />
                    </Grid>
                    : null
            }

            <ButtonGroup
                size="small"
                className={classes.dateBarViewType}
                style={{
                    margin: 8
                }}
            >
                <Button
                    id={id + 'ViewTypeDayButton'}
                    classes={{
                        root: classes.buttonRoot,
                        label: classes.buttonLabel,
                        disabled: classes.buttonDisabled
                    }}
                    disabled={calendarViewValue === 'D'}
                    onClick={() => {
                        auditAction('Click Day View Button',null,null,false,'ana');
                        calendarViewValueOnChange('D');
                    }}
                >Day</Button>
                <Button
                    id={id + 'ViewTypeWeekButton'}
                    classes={{
                        root: classes.buttonRoot,
                        label: classes.buttonLabel,
                        disabled: classes.disabled
                    }}
                    disabled={calendarViewValue === 'W'}
                    onClick={() => {
                        auditAction('Click Week View Button',null,null,false,'ana');
                        calendarViewValueOnChange('W');
                    }}
                >Week</Button>
                <Button
                    id={id + 'ViewTypeMonthButton'}
                    classes={{
                        root: classes.buttonRoot,
                        label: classes.buttonLabel,
                        disabled: classes.buttonDisabled
                    }}
                    disabled={calendarViewValue === 'M'}
                    onClick={() => {
                        auditAction('Click Month View Button',null,null,false,'ana');
                        calendarViewValueOnChange('M');
                    }}
                >Month</Button>
            </ButtonGroup>
        </Grid>
    );
}
