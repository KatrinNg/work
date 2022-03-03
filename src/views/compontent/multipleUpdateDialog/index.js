import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import CIMSPromptDialog from '../../../components/Dialog/CIMSPromptDialog';
import {
    Grid
} from '@material-ui/core';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import ActionRender from './actionRender';
import RecurrenceRender from './recurrenceRender';
import FilterRender from './filterRender';
import { RECURRENCE_TABS, ACTION_ENUM, MULTIPLE_UPDATE_TYPE } from '../../../constants/appointment/editTimeSlot';

const id = 'multiple_update_slots_dialog';
const MultipleUpdateDialog = React.forwardRef((props, refs) => {
    const {
        classes,
        type,
        siteId,
        rmId,
        dateRangeLimit
    } = props;

    const [multipleUpdateData, setMultipleUpdateData] = React.useState({
        clinic: null,
        room: null,
        startDate: null,
        endDate: null,
        wholeDay: false,
        startTime: null,
        endTime: null,
        action: null,
        //timeslot management
        duration: null,
        repeatEvery: 1,
        remark: null,
        session: null,
        multiUpTab: RECURRENCE_TABS.DAILY,
        weekDay: '0000000',
        monthRule: null,
        monthRepeatOn: null,
        monthOrdinal: null,
        monthWkDay: null,
        overallQt: null,
        qt1: '',
        qt2: '',
        qt3: '',
        qt4: '',
        qt5: '',
        qt6: '',
        qt7: '',
        qt8: '',
        //unavailable period
        roomList: null,
        isWholeClinic: 0,
        unavailableReasonForFilter: null,
        unavailableReasonForAction: null,
        unavailableRemark: null
    });

    const formRef = React.useRef(null);

    const updateData = (obj) => {
        setMultipleUpdateData({
            ...multipleUpdateData,
            ...obj
        });
    };

    React.useEffect(() => {
        updateData({
            clinic: siteId,
            room: rmId || null
        });
    }, []);

    const isSaveBtnDisabled = React.useMemo(() => {
        if (type === MULTIPLE_UPDATE_TYPE.UnavailablePeriod) {
            return false;
        }
        const { action, overallQt, qt1, qt2, qt3, qt4, qt5, qt6, qt7, qt8 } = multipleUpdateData;
        return action === ACTION_ENUM.UPDATE
            && !overallQt && !qt1 && !qt2 && !qt3 && !qt4 && !qt5 && !qt6 && !qt7 && !qt8 ? true : false;
    }, [
        multipleUpdateData.action,
        multipleUpdateData.overallQt,
        multipleUpdateData.qt1,
        multipleUpdateData.qt2,
        multipleUpdateData.qt3,
        multipleUpdateData.qt4,
        multipleUpdateData.qt5,
        multipleUpdateData.qt6,
        multipleUpdateData.qt7,
        multipleUpdateData.qt8,
        type
    ]);

    return (
        <CIMSPromptDialog
            id={id}
            open
            dialogTitle={'Multiple Update'}
            classes={{ paper: classes.dialogPaper }}
            draggable
            dialogContentText={
                <Grid container>
                    <ValidatorForm className={classes.form} ref={formRef}>
                        <FilterRender
                            id={`${id}_header`}
                            type={type}
                            multipleUpdateData={multipleUpdateData}
                            updateData={updateData}
                            dateRangeLimit={dateRangeLimit}
                        />
                        <ActionRender
                            id={`${id}_action`}
                            type={type}
                            multipleUpdateData={multipleUpdateData}
                            updateData={updateData}
                        />
                        {
                            type === MULTIPLE_UPDATE_TYPE.TimeSlotManagement ?
                                <RecurrenceRender
                                    id={`${id}_recurrence`}
                                    multipleUpdateData={multipleUpdateData}
                                    updateData={updateData}
                                    disabled={multipleUpdateData.action !== ACTION_ENUM.INSERT_UPDATE && multipleUpdateData.action !== ACTION_ENUM.INSERT}
                                />
                                : null
                        }
                    </ValidatorForm>
                </Grid>
            }
            dialogActions={
                <Grid container justify="flex-end">
                    <CIMSButton
                        id={`${id}_saveBtn`}
                        children="Save"
                        disabled={isSaveBtnDisabled}
                        onClick={() => {
                            const validation = formRef.current && formRef.current.isFormValid(false);
                            validation.then(result => {
                                if(result) {
                                    props.onSave && props.onSave(multipleUpdateData);
                                } else {
                                    formRef.current.focusFail();
                                    props.onError && props.onError();
                                }
                            });
                        }}
                    />
                    <CIMSButton
                        id={`${id}_cancelBtn`}
                        children="Cancel"
                        onClick={() => { props.onCancel && props.onCancel(); }}
                    />
                </Grid>
            }
        />
    );
});

const styles = theme => ({
    dialogPaper: {
        width: '85%'
    },
    form: { width: '100%' }
});
const mapState = state => ({});
const mapDispatch = {};
export default connect(mapState, mapDispatch)(withStyles(styles)(MultipleUpdateDialog));