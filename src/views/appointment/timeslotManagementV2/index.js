import { Button, Checkbox, FormControlLabel, Grid, Radio, withStyles } from '@material-ui/core';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import RequiredIcon from '../../../components/InputLabel/RequiredIcon';
import CIMSCommonSelect from '../../../components/Select/CIMSCommonSelect';
import { AppointmentUtil, CommonUtil, EnctrAndRmUtil } from '../../../utilities';
// import AddIcon from '@material-ui/icons/Add';
// import EditIcon from '@material-ui/icons/Edit';
// import DeleteIcon from '@material-ui/icons/Delete';
import { calElementOffsetTop } from '../../../utilities/commonUtilities';
import CustomPaper from '../../compontent/CustomPaper';
import EditTimeslotPlanHeaderDialog from './components/editTimeslotPlanHeaderDialog';
import EditTimeslotDialog from './components/editTimeslotDialog';
import {
    getTimeslotPlanHdrsV2,
    createTimeslotPlanHdrV2,
    updateTimeslotPlanHdrV2,
    deleteTimeslotPlanHdrV2,
    getTimeslotPlansV2,
    createTimeslotPlanV2,
    updateState,
    reset,
    getPredefinedTimeslots,
    multipleUpdateTimeslotV2,
    getTimeslots
} from '../../../store/actions/appointment/timeslotManagementV2/timeslotManagementV2Action';
import * as moment from 'moment';
import ConfirmDeleteTimeslotPlanHeaderDialog from './components/confirmDeleteTimeslotPlanHeaderDialog';
import MultipleUpdateTimeslotDialog from './components/multipleUpdateTimeslotDialog';
import TimeslotPlanTable from './components/timeslotPlanTable';
import accessRightEnum from '../../../enums/accessRightEnum';
import Enum, { EHS_CONSTANT, SERVICE_CODE } from '../../../enums/enum';
import { getBaseRoleName, hasAccessRight } from '../../../utilities/userUtilities';
import { auditAction } from '../../../store/actions/als/logAction';
import CIMSCommonDatePicker from '../../../components/DatePicker/CIMSCommonDatePicker';

export const DISPLAY_TYPE_PLAN = 0;
export const DISPLAY_TYPE_TIMESLOT = 1;

const TimeslotManagementV2 = (props) => {
    const {
        classes,
        sites,
        rooms,
        sessionsConfig,
        siteId,
        svcCd,
        tabsActiveKey,
        getTimeslotPlanHdrsV2,
        loadingTimeslotPlanHdrs,
        timeslotPlanHdrs,
        createTimeslotPlanHdrV2,
        updateTimeslotPlanHdrV2,
        deleteTimeslotPlanHdrV2,
        getTimeslotPlansV2,
        createTimeslotPlanV2,
        loadingTimeslotPlans,
        timeslotPlans,
        updateState,
        reset,
        isSystemAdmin,
        isServiceAdmin,
        isClinicalAdmin,
        loginInfo,
        loadingPredefinedTimeslots,
        predefinedTimeslots,
        getPredefinedTimeslots,
        auditAction,
        multipleUpdateTimeslotV2,
        quotaConfig,
        getTimeslots,
        clinicConfig
    } = props;

    const id = 'TimeslotManagementV2';

    const [filteredSites, setFilteredSites] = useState([]);
    const [site, setSite] = useState(null);

    const [filteredRooms, setFilteredRooms] = useState([]);
    const [room, setRoom] = useState(null);
    const [isAHPRoom, setIsAHPRoom] = useState(false);

    const [sessions, setSessions] = useState([]);
    const [sessionIds, setSessionIds] = useState([]);

    const [timeslotPlanHdrOptions, setTimeslotPlanHdrOptions] = useState([]);
    const [timeslotPlanHdrId, setTimeslotPlanHdrId] = useState(null);
    const [timeslotPlanHdr, setTimeslotPlanHdr] = useState(null);

    const [timeslotPlanHdrForEdit, setTimeslotPlanHdrForEdit] = useState(null);
    const [isEditTimeslotPlanHeaderDialogOpen, setIsEditTimeslotPlanHeaderDialogOpen] = useState(false);
    const [isDeleteTimeslotPlanHeaderDialogOpen, setIsDeleteTimeslotPlanHeaderDialogOpen] = useState(false);
    const [isEditTimeslotDialogOpen, setIsEditTimeslotDialogOpen] = useState(false);
    const [isMultipleUpdateTimeslotDialogOpen, setIsMultipleUpdateTimeslotDialogOpen] = useState(false);

    const [qtTypes, setQtTypes] = useState([]);

    const [displayType, setDisplayType] = useState(DISPLAY_TYPE_PLAN);

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const isShowAvailable = AppointmentUtil.getQuotaDisplaySiteParams({ serviceCd: svcCd, siteId: siteId }) === 'Available';
    const dateRangeLimit = CommonUtil.initDateRnage(clinicConfig, svcCd, siteId, Enum.CLINIC_CONFIGNAME.TMSLT_PLANNING_DATE_RANGE_LIMIT) || 365;

    useEffect(() => {
        // Only handle qt1 so far
        // const qtTypes = [
        //     CommonUtil.quotaConfig(quotaConfig)
        //         .map((x) => ({ ...x, code: x.code?.toLowerCase() }))
        //         .find((x) => x.code === 'qt1')
        // ];
        const qtTypes = CommonUtil.quotaConfig(quotaConfig).map((x) => ({ ...x, code: x.code?.toLowerCase() }));
        setQtTypes(qtTypes);
    }, [quotaConfig]);

    useEffect(() => {
        console.log('qtTypes: ', qtTypes);
    }, [qtTypes]);

    // EHS Specific
    const [isPT, setIsPT] = useState(false);
    const [isCPY, setIsCPY] = useState(false);
    const [isDT, setIsDT] = useState(false);
    const [isOT, setIsOT] = useState(false);

    const bodyPaperRef = useRef(null);
    const [paperMaxHeight, setPaperMaxHeight] = useState(0);

    const updatePaperMaxHeight = () => {
        const bodyPaperOffsetTop = calElementOffsetTop(bodyPaperRef?.current);

        let newMaxHeight = window.innerHeight - bodyPaperOffsetTop - 15;

        if (newMaxHeight < 560 - bodyPaperOffsetTop) {
            newMaxHeight = 560 - bodyPaperOffsetTop;
        }

        if (newMaxHeight !== paperMaxHeight) {
            setPaperMaxHeight(newMaxHeight);
        }
    };

    useLayoutEffect(() => {
        window.addEventListener('resize', () => {
            updatePaperMaxHeight();
        });
        updatePaperMaxHeight();
        return () =>
            window.removeEventListener('resize', () => {
                updatePaperMaxHeight();
            });
    }, []);

    useEffect(() => {
        updatePaperMaxHeight();
    }, [bodyPaperRef?.current?.offsetTop, tabsActiveKey]);

    const setIsAHP = () => {
        switch (getBaseRoleName(loginInfo.userDto)) {
            case Enum.BASE_ROLE_AHPS.PT: {
                setIsPT(true);
                break;
            }
            case Enum.BASE_ROLE_AHPS.OT: {
                setIsOT(true);
                break;
            }
            case Enum.BASE_ROLE_AHPS.CPY: {
                setIsCPY(true);
                break;
            }
            case Enum.BASE_ROLE_AHPS.Dietitian: {
                setIsDT(true);
                break;
            }
            default: {
                setIsDT(false);
                setIsCPY(false);
                setIsOT(false);
                setIsPT(false);
                break;
            }
        }
    };

    useEffect(() => {
        reset();
        setIsAHP();

        let filteredSites = sites?.filter((site) => site.siteId === siteId);
        if (isSystemAdmin || isServiceAdmin || hasAccessRight(accessRightEnum.EhsAllowCrossSiteViewingForTimeslotManagement)) {
            filteredSites = sites
                ?.filter((clinic) => clinic.serviceCd === svcCd)
                .sort((a, b) => {
                    return a.clinicName.localeCompare(b.clinicName);
                });
        }

        if (filteredSites.length > 0) {
            setSite(filteredSites.find((site) => site.siteId === siteId));
        }
        setFilteredSites(filteredSites);

        const newSessions = [];
        const newSessionIds = [];
        if (sessionsConfig) {
            sessionsConfig.forEach((session) => {
                newSessions.push({ label: session.sessDesc, value: session.sessId, item: session });
                newSessionIds.push(session.sessId);
            });
        }
        setSessions(newSessions);
        setSessionIds(newSessionIds);

        return () => {
            reset();
        };
    }, []);

    const getTimeslotPlanHdrs = () => {
        getTimeslotPlanHdrsV2(svcCd, site.siteId);
    };

    useEffect(() => {
        if (site) {
            const filteredRooms =
                rooms?.filter((item) => (item.siteId === site.siteId || !item.siteId) && EnctrAndRmUtil.isActiveRoom(item) && item.rmCd !== 'AH') || [];
            if (filteredRooms.length > 0) {
                if (isPT) {
                    setRoom(filteredRooms.find((room) => room.rmCd === EHS_CONSTANT.ROOM_AHPS.PT));
                } else if (isOT) {
                    setRoom(filteredRooms.find((room) => room.rmCd === EHS_CONSTANT.ROOM_AHPS.OT));
                } else if (isCPY) {
                    setRoom(filteredRooms.find((room) => room.rmCd === EHS_CONSTANT.ROOM_AHPS.CPY));
                } else if (isDT) {
                    setRoom(filteredRooms.find((room) => room.rmCd === EHS_CONSTANT.ROOM_AHPS.Dietitian));
                } else {
                    setRoom(filteredRooms[0]);
                }
            } else {
                setRoom(null);
            }
            setFilteredRooms(filteredRooms);
        }
    }, [site]);

    useEffect(() => {
        if (room) {
            if (Object.values(EHS_CONSTANT.ROOM_AHPS).includes(room.rmCd)) {
                !isAHPRoom && setIsAHPRoom(true);
            } else {
                isAHPRoom && setIsAHPRoom(false);
            }
        }
    }, [room]);

    useEffect(() => {
        const newTimeslotPlanOptions = [];
        if (displayType === DISPLAY_TYPE_PLAN) {
            timeslotPlanHdrs?.map((timeslotPlan) => {
                if (timeslotPlan.rmIds?.includes(room?.rmId) && sessionIds.includes(timeslotPlan?.sessId)) {
                    let weekDays = [];
                    if (timeslotPlan.weekday) {
                        for (let i = 0; i < timeslotPlan.weekday.length; i++) {
                            if (timeslotPlan.weekday[i] === '1') {
                                switch (i) {
                                    case 0: {
                                        weekDays.push('Sun');
                                        break;
                                    }
                                    case 1: {
                                        weekDays.push('Mon');
                                        break;
                                    }
                                    case 2: {
                                        weekDays.push('Tue');
                                        break;
                                    }
                                    case 3: {
                                        weekDays.push('Wed');
                                        break;
                                    }
                                    case 4: {
                                        weekDays.push('Thu');
                                        break;
                                    }
                                    case 5: {
                                        weekDays.push('Fri');
                                        break;
                                    }
                                    case 6: {
                                        weekDays.push('Sat');
                                        break;
                                    }
                                    default: {
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    newTimeslotPlanOptions.push({
                        label: `${moment(timeslotPlan.sdate).format(Enum.DATE_FORMAT_DMY)} - ${moment(timeslotPlan.edate).format(Enum.DATE_FORMAT_DMY)} - ${
                            sessions.find((session) => session.value === timeslotPlan.sessId)?.label
                        } - ${weekDays.toString()}`,
                        value: timeslotPlan.tmsltPlanHdrId,
                        item: timeslotPlan
                    });
                }
            });
        }

        if (newTimeslotPlanOptions.length > 0) {
            if (timeslotPlanHdrId) {
                setTimeslotPlanHdr(
                    newTimeslotPlanOptions.find((timeslotPlanOption) => timeslotPlanOption.value === timeslotPlanHdrId)?.item || newTimeslotPlanOptions[0].item
                );
                setTimeslotPlanHdrId(null);
            } else {
                setTimeslotPlanHdr(newTimeslotPlanOptions[0].item);
            }
        } else {
            setTimeslotPlanHdr(null);
        }

        setTimeslotPlanHdrOptions(newTimeslotPlanOptions);
    }, [timeslotPlanHdrs, room, sessionIds, displayType]);

    const openEditTimeslotPlanHeaderDialog = (timeslotPlanHdr) => {
        auditAction('Timeslot Management V2 - Open Edit Timeslot Plan Header Dialog', null, null, false, 'ana');
        if (timeslotPlanHdr) {
            setTimeslotPlanHdrForEdit(timeslotPlanHdr);
        } else {
            setTimeslotPlanHdrForEdit(null);
        }
        setIsEditTimeslotPlanHeaderDialogOpen(true);
    };

    const closeEditTimeslotPlanHeaderDialog = () => {
        auditAction('Timeslot Management V2 - CLose Edit Timeslot Plan Header Dialog', null, null, false, 'ana');
        setTimeslotPlanHdrForEdit(null);
        setIsEditTimeslotPlanHeaderDialogOpen(false);
    };

    const openDeleteTimeslotPlanHeaderDialog = () => {
        auditAction('Timeslot Management V2 - Open Delete Timeslot Plan Header Dialog', null, null, false, 'ana');
        setIsDeleteTimeslotPlanHeaderDialogOpen(true);
    };

    const closeDeleteTimeslotPlanHeaderDialog = () => {
        auditAction('Timeslot Management V2 - Close Delete Timeslot Plan Header Dialog', null, null, false, 'ana');
        setIsDeleteTimeslotPlanHeaderDialogOpen(false);
    };

    const openEditTimeslotDialog = () => {
        auditAction('Timeslot Management V2 - Open Edit Timeslot Dialog', null, null, false, 'ana');
        setIsEditTimeslotDialogOpen(true);
    };

    const closeEditTimeslotDialog = () => {
        auditAction('Timeslot Management V2 - Close Edit Timeslot Dialog', null, null, false, 'ana');
        setIsEditTimeslotDialogOpen(false);
    };

    const openMultipleUpdateTimeslotDialog = () => {
        auditAction('Timeslot Management V2 - Open Multiple Update Dialog', null, null, false, 'ana');
        setIsMultipleUpdateTimeslotDialogOpen(true);
    };

    const closeMultipleUpdateTimeslotDialog = () => {
        auditAction('Timeslot Management V2 - Close Multiple Update Dialog', null, null, false, 'ana');
        setIsMultipleUpdateTimeslotDialogOpen(false);
    };

    const handleCreateTimeslotPlanHdr = (param) => {
        auditAction('Timeslot Management V2 - Create Timeslot Plan Header', null, null, false, 'ana');
        createTimeslotPlanHdrV2(param, (timeslotPlanHdrId) => {
            setIsEditTimeslotPlanHeaderDialogOpen(false);
            getTimeslotPlanHdrs();
            if (timeslotPlanHdrId) {
                setTimeslotPlanHdrId(timeslotPlanHdrId);
            }
        });
    };

    const handleUpdateTimeslotPlanHdr = (param) => {
        auditAction('Timeslot Management V2 - Update Timeslot Plan Header', null, null, false, 'ana');
        updateTimeslotPlanHdrV2(param, (timeslotPlanHdrId) => {
            setIsEditTimeslotPlanHeaderDialogOpen(false);
            getTimeslotPlanHdrs();
            if (timeslotPlanHdrId) {
                setTimeslotPlanHdrId(timeslotPlanHdrId);
            }
        });
    };

    const handleDeleteTimeslotPlanHdr = () => {
        if (timeslotPlanHdr) {
            auditAction('Timeslot Management V2 - Delete Timeslot Plan Header', null, null, false, 'ana');
            deleteTimeslotPlanHdrV2(timeslotPlanHdr.groupId, () => {
                closeDeleteTimeslotPlanHeaderDialog();
                getTimeslotPlanHdrs();
            });
        }
    };

    const passDateRangeLimit = (startDate, endDate) => {
        return Math.abs(Math.ceil(moment(startDate).diff(moment(endDate), 'day', true))) <= dateRangeLimit;
    };

    const getTimeslotPlans = () => {
        if (displayType === DISPLAY_TYPE_PLAN && timeslotPlanHdr) {
            getTimeslotPlansV2(timeslotPlanHdr.tmsltPlanHdrId);
        } else if (displayType === DISPLAY_TYPE_TIMESLOT) {
            if (
                moment(startDate).isValid() &&
                moment(endDate).isValid() &&
                moment(startDate).isSameOrBefore(moment(endDate)) &&
                passDateRangeLimit(startDate, endDate)
            ) {
                getTimeslots({
                    rmId: room.rmId,
                    dateFrom: moment(startDate).format(Enum.DATE_FORMAT_EYMD_VALUE),
                    dateTo: moment(endDate).format(Enum.DATE_FORMAT_EYMD_VALUE)
                });
            }
        } else {
            updateState({ timeslotPlans: [] });
        }
    };

    useEffect(() => {
        if (site && tabsActiveKey === accessRightEnum.eventManagement) {
            getPredefinedTimeslots(svcCd);
            getTimeslotPlanHdrs();
            getTimeslotPlans();
            // if (displayType === DISPLAY_TYPE_PLAN) {
            //     getTimeslotPlanHdrs();
            // } else if (displayType === DISPLAY_TYPE_TIMESLOT) {
            //     getTimeslotPlans();
            // }
        } else {
            reset();
        }
    }, [site, tabsActiveKey]);

    const handleCreateTimeslotPlan = (param) => {
        if (timeslotPlanHdr) {
            auditAction('Timeslot Management V2 - Create Timeslot', null, null, false, 'ana');
            createTimeslotPlanV2(timeslotPlanHdr.tmsltPlanHdrId, param, () => {
                closeEditTimeslotDialog();
                getTimeslotPlans();
            });
        }
    };

    const handleMultipleUpdateTimeslot = (param) => {
        auditAction('Timeslot Management V2 - Create Timeslot', null, null, false, 'ana');
        multipleUpdateTimeslotV2(param, () => {
            closeMultipleUpdateTimeslotDialog();
            // getTimeslotPlans();
            setDisplayType(DISPLAY_TYPE_TIMESLOT);
            setStartDate(param?.startDate);
            setEndDate(param?.endDate);
        });
    };

    // useEffect(() => {
    //     updateState({ timeslotPlans: [] });
    // }, [displayType]);

    useEffect(() => {
        if (displayType === DISPLAY_TYPE_PLAN) {
            getTimeslotPlans();
        }
    }, [timeslotPlanHdr]);

    useEffect(() => {
        if (displayType === DISPLAY_TYPE_TIMESLOT) {
            getTimeslotPlans();
        }
    }, [displayType, room, startDate, endDate]);

    const isAHPRelatedRoom = () => {
        if (isPT && room?.rmCd === EHS_CONSTANT.ROOM_AHPS.PT) {
            return true;
        } else if (isOT && room?.rmCd === EHS_CONSTANT.ROOM_AHPS.OT) {
            return true;
        } else if (isCPY && room?.rmCd === EHS_CONSTANT.ROOM_AHPS.CPY) {
            return true;
        } else if (isDT && room?.rmCd === EHS_CONSTANT.ROOM_AHPS.Dietitian) {
            return true;
        } else {
            return false;
        }
    };

    const canEditHeaderOrPlan = () => {
        return isSystemAdmin || isServiceAdmin || (isClinicalAdmin && site?.siteId === siteId) || (svcCd === SERVICE_CODE.EHS && isAHPRelatedRoom());
    };

    return (
        <div style={{ height: '100%', margin: 0 }}>
            <div style={{ padding: '10px 4px' }}>
                <Grid container spacing={1}>
                    <Grid item xs={12} container style={{ padding: '0px 4px', flexWrap: 'nowrap' }}>
                        <Grid item xs="auto" style={{ width: '260px', marign: 0, marginRight: '5px' }} id="ehs_calendar_control_container">
                            <div style={{ margin: 5 }}>
                                <h3 style={{ marginBottom: 0, marginTop: 0 }}>
                                    Site
                                    <RequiredIcon />
                                </h3>

                                <CIMSCommonSelect
                                    options={filteredSites.map((item) => ({ value: item.siteId, label: item.siteDesc }))}
                                    id={`${id}_site_select`}
                                    inputProps={{
                                        isClearable: false
                                    }}
                                    value={site ? { value: site.siteId, label: site.siteDesc } : null}
                                    onChange={(value) => setSite(filteredSites.find((site) => site.siteId === value.value))}
                                    placeholder="Please Select"
                                />
                            </div>

                            <div style={{ margin: 5 }}>
                                <h3 style={{ marginBottom: 0 }}>
                                    Room
                                    <RequiredIcon />
                                </h3>
                                <CIMSCommonSelect
                                    options={filteredRooms.map((item) => ({ value: item.rmId, label: item.rmDesc }))}
                                    id={`${id}_room_select`}
                                    inputProps={{
                                        isClearable: false
                                    }}
                                    value={room ? { value: room.rmId, label: room.rmDesc } : null}
                                    onChange={(value) => setRoom(filteredRooms.find((room) => room.rmId === value.value))}
                                    placeholder="Please Select"
                                />
                            </div>
                            {sessions.length > 0 && (
                                <div style={{ margin: 5 }}>
                                    <h3 style={{ marginBottom: 5 }}>Sessions</h3>
                                    <CustomPaper style={{ maxHeight: '150px', border: '1px solid lightGray', background: 'white' }} elevation={0}>
                                        <Grid container style={{ width: '100%', margin: 0 }} spacing={1}>
                                            {sessions.map((session, i) => (
                                                <Grid item xs={12} key={`session-${i}`} style={{ paddingLeft: 20 }}>
                                                    <FormControlLabel
                                                        control={<Checkbox id={`${id}_session_${i}_checkBox`} color="primary" />}
                                                        label={session.label}
                                                        checked={sessionIds.includes(session.value)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSessionIds([...sessionIds, session.value]);
                                                            } else {
                                                                setSessionIds(sessionIds.filter((sessionId) => sessionId !== session.value));
                                                            }
                                                        }}
                                                    />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </CustomPaper>
                                </div>
                            )}

                            <div style={{ margin: 5 }}>
                                <h3 style={{ marginBottom: 5 }}>
                                    Display
                                    <RequiredIcon />
                                </h3>
                                <CustomPaper style={{ maxHeight: '150px', border: '1px solid lightGray', background: 'white' }} elevation={0}>
                                    <Grid container style={{ width: '100%', margin: 0, padding: '0px 20px' }} spacing={1}>
                                        <Grid item xs={6}>
                                            <FormControlLabel
                                                control={<Radio id={`${id}_timeslot_plan_display_type_plan_radioBtn`} color="primary" />}
                                                label="Plan"
                                                checked={displayType === DISPLAY_TYPE_PLAN}
                                                onChange={() => {
                                                    if (displayType !== DISPLAY_TYPE_PLAN) {
                                                        updateState({ timeslotPlans: [] });
                                                        setDisplayType(DISPLAY_TYPE_PLAN);
                                                    }
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <FormControlLabel
                                                control={<Radio id={`${id}_timeslot_plan_display_type_timeslot_raidoBtn`} color="primary" />}
                                                label="Timeslot"
                                                checked={displayType === DISPLAY_TYPE_TIMESLOT}
                                                onChange={() => {
                                                    if (displayType !== DISPLAY_TYPE_TIMESLOT) {
                                                        updateState({ timeslotPlans: [] });
                                                        setDisplayType(DISPLAY_TYPE_TIMESLOT);
                                                    }
                                                }}
                                            />
                                        </Grid>
                                    </Grid>
                                </CustomPaper>
                            </div>

                            {displayType === DISPLAY_TYPE_PLAN && (
                                <>
                                    <div style={{ margin: 5 }}>
                                        <h3 style={{ marginBottom: 0 }}>
                                            Timeslot Period
                                            <RequiredIcon />
                                        </h3>
                                        <CIMSCommonSelect
                                            options={timeslotPlanHdrOptions}
                                            id={`${id}_timeslot_header_select`}
                                            inputProps={{
                                                isClearable: false
                                            }}
                                            value={
                                                timeslotPlanHdrOptions.find(
                                                    (timeslotPlanOption) => timeslotPlanOption.value === timeslotPlanHdr?.tmsltPlanHdrId
                                                ) || null
                                            }
                                            onChange={(value) => setTimeslotPlanHdr(value.item)}
                                            placeholder="Please Select"
                                        />
                                    </div>

                                    {canEditHeaderOrPlan() && (
                                        <>
                                            <div style={{ margin: 5 }}>
                                                <Grid container spacing={1}>
                                                    <Grid item xs={6} style={{ textAlign: 'center' }}>
                                                        <Button
                                                            id={`${id}_timeslot_header_update_btn`}
                                                            color="primary"
                                                            variant="contained"
                                                            style={{
                                                                textTransform: 'unset',
                                                                fontSize: '16px',
                                                                // minWidth: 'unset',
                                                                margin: '0px'
                                                            }}
                                                            fullWidth
                                                            disabled={!timeslotPlanHdr}
                                                            onClick={() => openEditTimeslotPlanHeaderDialog(timeslotPlanHdr)}
                                                        >
                                                            {/* <EditIcon /> Update */}
                                                            Update
                                                        </Button>
                                                    </Grid>
                                                    <Grid item xs={6} style={{ textAlign: 'center' }}>
                                                        <Button
                                                            id={`${id}_timeslot_header_delete_btn`}
                                                            color="primary"
                                                            variant="contained"
                                                            style={{
                                                                textTransform: 'unset',
                                                                fontSize: '16px',
                                                                // minWidth: 'unset',
                                                                margin: '0px'
                                                            }}
                                                            fullWidth
                                                            disabled={!timeslotPlanHdr}
                                                            onClick={() => openDeleteTimeslotPlanHeaderDialog()}
                                                        >
                                                            {/* <DeleteIcon /> Delete */}
                                                            Delete
                                                        </Button>
                                                    </Grid>
                                                </Grid>
                                            </div>

                                            <div style={{ margin: 5 }}>
                                                <Grid container spacing={1}>
                                                    <Grid item xs={12}>
                                                        <Button
                                                            id={`${id}_timeslot_header_edit_btn`}
                                                            color="primary"
                                                            variant="contained"
                                                            fullWidth
                                                            style={{ textTransform: 'unset', fontSize: '16px', alignItems: 'center' }}
                                                            onClick={() => openEditTimeslotPlanHeaderDialog()}
                                                        >
                                                            {/* <AddIcon /> New Timeslot Period */}
                                                            New Timeslot Period
                                                        </Button>
                                                    </Grid>
                                                </Grid>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </Grid>
                        <Grid
                            item
                            xs
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                borderLeft: '1px solid lightGray',
                                borderRadius: 0,
                                paddingLeft: '10px'
                                // ,
                                // background: 'white'
                            }}
                            id={`${id}_body`}
                        >
                            <div id={`${id}_body_title`} style={{ textAlign: 'center', fontSize: '24px', width: '100%', marginTop: '10px' }}>
                                <b>{room?.rmDesc} Timeslot Management</b>
                            </div>

                            <Grid container spacing={1} style={{ alignItems: 'center', width: '100%', margin: 0 }}>
                                {displayType === DISPLAY_TYPE_PLAN && (
                                    <>
                                        <Grid item xs={12} md={5} container spacing={1}>
                                            <Grid item xs={12} md={4} id={`${id}_timeslot_plan_header_start_date`}>
                                                <b>Start Date: </b>
                                                {timeslotPlanHdr?.sdate && moment(timeslotPlanHdr.sdate).format(Enum.DATE_FORMAT_DMY)}
                                            </Grid>
                                            <Grid item xs={12} md={4} id={`${id}_timeslot_plan_header_end_date`}>
                                                <b>End Date: </b>
                                                {timeslotPlanHdr?.edate && moment(timeslotPlanHdr.edate).format(Enum.DATE_FORMAT_DMY)}
                                            </Grid>
                                            <Grid item xs={12} md={4} id={`${id}_timeslot_plan_header_session`}>
                                                <b>Session: </b>
                                                {timeslotPlanHdr?.sessId && sessions.find((session) => session.value === timeslotPlanHdr.sessId)?.label}
                                            </Grid>
                                        </Grid>

                                        <Grid item xs={12} md={5} container spacing={1} id={`${id}_timeslot_plan_header_weekdays`}>
                                            <Grid item xs>
                                                <FormControlLabel
                                                    classes={{ root: classes.weekDayCheckBoxRoot }}
                                                    control={
                                                        <Checkbox
                                                            id={`${id}_timeslot_plan_header_weekdays_sunday_checkBox`}
                                                            color="primary"
                                                            disableRipple
                                                            classes={{ root: classes.weekDayCheckBoxRoot }}
                                                        />
                                                    }
                                                    label="Sun"
                                                    checked={timeslotPlanHdr?.weekday[0] === '1'}
                                                    disabled
                                                />
                                            </Grid>
                                            <Grid item xs>
                                                <FormControlLabel
                                                    classes={{ root: classes.weekDayCheckBoxRoot }}
                                                    control={
                                                        <Checkbox
                                                            id={`${id}_timeslot_plan_header_weekdays_monday_checkBox`}
                                                            color="primary"
                                                            disableRipple
                                                            classes={{ root: classes.weekDayCheckBoxRoot }}
                                                        />
                                                    }
                                                    label="Mon"
                                                    checked={timeslotPlanHdr?.weekday[1] === '1'}
                                                    disabled
                                                />
                                            </Grid>
                                            <Grid item xs>
                                                <FormControlLabel
                                                    classes={{ root: classes.weekDayCheckBoxRoot }}
                                                    control={
                                                        <Checkbox
                                                            id={`${id}_timeslot_plan_header_weekdays_tuesday_checkBox`}
                                                            color="primary"
                                                            disableRipple
                                                            classes={{ root: classes.weekDayCheckBoxRoot }}
                                                        />
                                                    }
                                                    label="Tue"
                                                    checked={timeslotPlanHdr?.weekday[2] === '1'}
                                                    disabled
                                                />
                                            </Grid>
                                            <Grid item xs>
                                                <FormControlLabel
                                                    classes={{ root: classes.weekDayCheckBoxRoot }}
                                                    control={
                                                        <Checkbox
                                                            id={`${id}_timeslot_plan_header_weekdays_wednesday_checkBox`}
                                                            color="primary"
                                                            disableRipple
                                                            classes={{ root: classes.weekDayCheckBoxRoot }}
                                                        />
                                                    }
                                                    label="Wed"
                                                    checked={timeslotPlanHdr?.weekday[3] === '1'}
                                                    disabled
                                                />
                                            </Grid>
                                            <Grid item xs>
                                                <FormControlLabel
                                                    classes={{ root: classes.weekDayCheckBoxRoot }}
                                                    control={
                                                        <Checkbox
                                                            id={`${id}_timeslot_plan_header_weekdays_thursday_checkBox`}
                                                            color="primary"
                                                            disableRipple
                                                            classes={{ root: classes.weekDayCheckBoxRoot }}
                                                        />
                                                    }
                                                    label="Thu"
                                                    checked={timeslotPlanHdr?.weekday[4] === '1'}
                                                    disabled
                                                />
                                            </Grid>
                                            <Grid item xs>
                                                <FormControlLabel
                                                    classes={{ root: classes.weekDayCheckBoxRoot }}
                                                    control={
                                                        <Checkbox
                                                            id={`${id}_timeslot_plan_header_weekdays_friday_checkBox`}
                                                            color="primary"
                                                            disableRipple
                                                            classes={{ root: classes.weekDayCheckBoxRoot }}
                                                        />
                                                    }
                                                    label="Fri"
                                                    checked={timeslotPlanHdr?.weekday[5] === '1'}
                                                    disabled
                                                />
                                            </Grid>
                                            <Grid item xs>
                                                <FormControlLabel
                                                    classes={{ root: classes.weekDayCheckBoxRoot }}
                                                    control={
                                                        <Checkbox
                                                            id={`${id}_timeslot_plan_header_weekdays_saturday_checkBox`}
                                                            color="primary"
                                                            disableRipple
                                                            classes={{ root: classes.weekDayCheckBoxRoot }}
                                                        />
                                                    }
                                                    label="Sat"
                                                    checked={timeslotPlanHdr?.weekday[6] === '1'}
                                                    disabled
                                                />
                                            </Grid>
                                        </Grid>
                                    </>
                                )}
                                {displayType === DISPLAY_TYPE_TIMESLOT && (
                                    <Grid item xs={12} md={10} container spacing={1}>
                                        <Grid item xs={12} md={6} lg={3}>
                                            <CIMSCommonDatePicker
                                                id={`${id}_start_date_datePicker`}
                                                InputProps={{
                                                    classes: {
                                                        input: classes.datePickerInput
                                                    }
                                                }}
                                                label={
                                                    <span>
                                                        Start Date
                                                        <RequiredIcon />
                                                    </span>
                                                }
                                                value={startDate}
                                                onChange={(value) => {
                                                    if (moment(endDate).isValid() && moment(value).isAfter(moment(endDate))) {
                                                        setEndDate(value);
                                                    }
                                                    setStartDate(value);
                                                }}
                                            />
                                            {startDate && !moment(startDate).isValid() && (
                                                <small style={{ color: 'red' }}>Invalid Date Format: DD-MM-YYYY</small>
                                            )}
                                        </Grid>
                                        <Grid item xs={12} md={6} lg={3}>
                                            <CIMSCommonDatePicker
                                                id={`${id}_end_date_datePicker`}
                                                InputProps={{
                                                    classes: {
                                                        input: classes.datePickerInput
                                                    }
                                                }}
                                                label={
                                                    <span>
                                                        End Date
                                                        <RequiredIcon />
                                                    </span>
                                                }
                                                value={endDate}
                                                onChange={(value) => {
                                                    if (moment(startDate).isValid() && moment(value).isBefore(moment(startDate))) {
                                                        setStartDate(value);
                                                    }
                                                    setEndDate(value);
                                                }}
                                                error={endDate && (!moment(endDate).isValid() || !passDateRangeLimit(startDate, endDate))}
                                            />
                                            {endDate && !moment(endDate).isValid() && <small style={{ color: 'red' }}>Invalid Date Format: DD-MM-YYYY</small>}
                                            {endDate && moment(endDate).isValid() && !passDateRangeLimit(startDate, endDate) && (
                                                <small style={{ color: 'red' }}>Please select the date range within {dateRangeLimit} days.</small>
                                            )}
                                        </Grid>
                                    </Grid>
                                )}
                                {canEditHeaderOrPlan() && (
                                    <Grid item xs={12} md={4} lg={2} container spacing={1}>
                                        <Grid item xs={6}>
                                            <Button
                                                id={`${id}_timeslot_plan_header_edit_timeslot_btn`}
                                                color="primary"
                                                variant="contained"
                                                fullWidth
                                                style={{
                                                    textTransform: 'unset',
                                                    fontSize: '16px',
                                                    minWidth: 'unset',
                                                    visibility: displayType === DISPLAY_TYPE_PLAN ? 'visible' : 'hidden'
                                                }}
                                                onClick={() => openEditTimeslotDialog()}
                                                disabled={!timeslotPlanHdr}
                                            >
                                                Add Timeslot
                                            </Button>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Button
                                                id={`${id}_timeslot_plan_header_multiple_update_btn`}
                                                color="primary"
                                                variant="contained"
                                                fullWidth
                                                style={{ textTransform: 'unset', fontSize: '16px', minWidth: 'unset' }}
                                                onClick={() => openMultipleUpdateTimeslotDialog()}
                                                // disabled={!timeslotPlanHdrs?.length > 0}
                                            >
                                                Multiple Update
                                            </Button>
                                        </Grid>
                                    </Grid>
                                )}
                                {displayType === DISPLAY_TYPE_TIMESLOT && (
                                    <Grid item xs={12}>
                                        {`* Quota Display: ${isShowAvailable ? 'Available' : 'Booked'} Quota/Total Quota`}
                                    </Grid>
                                )}
                            </Grid>

                            <CustomPaper ref={bodyPaperRef} style={{ maxHeight: paperMaxHeight, borderRadius: '0px', margin: '5px 10px', width: 'auto' }}>
                                {displayType === DISPLAY_TYPE_PLAN ? (
                                    <TimeslotPlanTable
                                        id={`${id}_PLAN_TABLE`}
                                        room={room}
                                        timeslotPlans={timeslotPlans.map((x) => ({ ...x, refId: x.tmsltPlanId }))}
                                        // timeslotPlans={timeslotPlans}
                                        loadingTimeslotPlans={loadingTimeslotPlans}
                                        loadingTimeslotPlanHdrs={loadingTimeslotPlanHdrs}
                                        maxHeight={paperMaxHeight}
                                        qtTypes={qtTypes}
                                        displayType={displayType}
                                    />
                                ) : null}

                                {displayType === DISPLAY_TYPE_TIMESLOT ? (
                                    <TimeslotPlanTable
                                        id={`${id}_TIMESLOT_TABLE`}
                                        room={room}
                                        timeslotPlans={timeslotPlans.filter((x) => sessionIds.includes(x.sessId)).map((x) => ({ ...x, refId: x.tmsltId }))}
                                        // timeslotPlans={timeslotPlans}
                                        loadingTimeslotPlans={loadingTimeslotPlans}
                                        loadingTimeslotPlanHdrs={loadingTimeslotPlanHdrs}
                                        maxHeight={paperMaxHeight}
                                        qtTypes={qtTypes}
                                        displayType={displayType}
                                        isShowAvailable={isShowAvailable}
                                    />
                                ) : null}
                            </CustomPaper>
                        </Grid>
                    </Grid>
                </Grid>
                {isEditTimeslotPlanHeaderDialogOpen ? (
                    <EditTimeslotPlanHeaderDialog
                        id={`${id}_EditTimeslotPlanHeaderDialog`}
                        open={isEditTimeslotPlanHeaderDialogOpen}
                        handleOnClose={() => closeEditTimeslotPlanHeaderDialog()}
                        handleCreateTimeslotPlanHdr={(param) => handleCreateTimeslotPlanHdr(param)}
                        handleUpdateTimeslotPlanHdr={(param) => handleUpdateTimeslotPlanHdr(param)}
                        site={site}
                        room={room}
                        sessions={sessions}
                        timeslotPlanHdr={timeslotPlanHdrForEdit}
                    />
                ) : null}
                {isDeleteTimeslotPlanHeaderDialogOpen ? (
                    <ConfirmDeleteTimeslotPlanHeaderDialog
                        id={`${id}_ConfirmDeleteTimeslotPlanHeaderDialog`}
                        open={isDeleteTimeslotPlanHeaderDialogOpen}
                        handleOnClose={() => closeDeleteTimeslotPlanHeaderDialog()}
                        handleDeleteTimeslotPlanHdr={() => handleDeleteTimeslotPlanHdr()}
                        site={site}
                        room={room}
                        sessions={sessions}
                        timeslotPlanHdr={timeslotPlanHdr}
                    />
                ) : null}
                {isEditTimeslotDialogOpen ? (
                    <EditTimeslotDialog
                        id={`${id}_EditTimeslotDialog`}
                        open={isEditTimeslotDialogOpen}
                        handleOnClose={() => closeEditTimeslotDialog()}
                        encounterTypes={room?.encntrTypeList}
                        handleCreateTimeslotPlan={(param) => handleCreateTimeslotPlan(param)}
                        timeslotPlanHdr={timeslotPlanHdr}
                        timeslotPlans={timeslotPlans}
                        loadingPredefinedTimeslots={loadingPredefinedTimeslots}
                        predefinedTimeslots={predefinedTimeslots}
                        qtTypes={qtTypes}
                        sessionsConfig={sessionsConfig}
                    />
                ) : null}
                {isMultipleUpdateTimeslotDialogOpen ? (
                    <MultipleUpdateTimeslotDialog
                        id={`${id}_MultipleUpdateTimeslotDialog`}
                        open={isMultipleUpdateTimeslotDialogOpen}
                        handleOnClose={() => closeMultipleUpdateTimeslotDialog()}
                        site={site}
                        room={room}
                        svcCd={svcCd}
                        sessions={sessions}
                        timeslotPlans={timeslotPlans}
                        isAHPRoom={isAHPRoom}
                        handleMultipleUpdateTimeslot={(param) => handleMultipleUpdateTimeslot(param)}
                        qtTypes={qtTypes}
                        dateRangeLimit={dateRangeLimit}
                        passDateRangeLimit={(startDate, endDate) => passDateRangeLimit(startDate, endDate)}
                    />
                ) : null}
            </div>
        </div>
    );
};

const styles = (theme) => ({
    weekDayCheckBoxRoot: {
        cursor: 'default',
        '&:hover': {
            background: 'transparent !important'
        }
    },
    datePickerInput: {
        height: '20px'
    }
});

const mapStateToProps = (state) => {
    return {
        sites: state.common.clinicList,
        rooms: state.common.rooms,
        sessionsConfig: state.common.sessionsConfig,
        siteId: state.login.clinic.siteId,
        svcCd: state.login.service.svcCd,
        tabsActiveKey: state.mainFrame.tabsActiveKey,
        loadingTimeslotPlanHdrs: state.timeslotManagementV2.loadingTimeslotPlanHdrs,
        timeslotPlanHdrs: state.timeslotManagementV2.timeslotPlanHdrs,
        loadingTimeslotPlans: state.timeslotManagementV2.loadingTimeslotPlans,
        timeslotPlans: state.timeslotManagementV2.timeslotPlans,
        isSystemAdmin: state.login.isSystemAdmin,
        isServiceAdmin: state.login.isServiceAdmin,
        isClinicalAdmin: state.login.isClinicalAdmin,
        loginInfo: state.login.loginInfo,
        loadingPredefinedTimeslots: state.timeslotManagementV2.loadingPredefinedTimeslots,
        predefinedTimeslots: state.timeslotManagementV2.predefinedTimeslots,
        quotaConfig: state.common.quotaConfig,
        dateRangeLimit: state.timeslotManagementV2.dateRangeLimit,
        clinicConfig: state.common.clinicConfig
    };
};

const mapDispatchToProps = {
    getTimeslotPlanHdrsV2,
    createTimeslotPlanHdrV2,
    updateTimeslotPlanHdrV2,
    deleteTimeslotPlanHdrV2,
    getTimeslotPlansV2,
    createTimeslotPlanV2,
    updateState,
    reset,
    getPredefinedTimeslots,
    auditAction,
    multipleUpdateTimeslotV2,
    getTimeslots
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(TimeslotManagementV2));
