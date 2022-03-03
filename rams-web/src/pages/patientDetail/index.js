import React, { useRef, useState, useEffect, createContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from "react-router-dom";
import {
    Grid,
} from '@material-ui/core';
import Navigation from './Navigation';
import PatientDetails from './PatientDetails/PatientDetails';
import Precautions from './Precautions';
import HealthReference from './healthReference'
import MeasureHealthStatus from './measureHealthStatus'
import useStyles from './styles';
import TreatmentActivities from './treatmentActivities/TreatmentActivities';

import { generateRandomId } from 'utility/utils';
import ColorButton from 'components/ColorButton/ColorButton';
import * as ActionTypes from 'redux/actionTypes';
import TherapeuticGroup from './TherapeuticGroup';
import {isEmpty} from 'lodash'
export const IndexContextState = createContext();

const Index = () => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const history = useHistory();
    const { g_patientDetailsType, treatmentActivities,g_patientDetail, g_selectedTherapeuticGroup } = useSelector(
        (state) => {
            const {patientDetailsType='PT', treatmentActivities,patientDetail, selectedTherapeuticGroup} = state.patientDetail;
            return {
                g_patientDetailsType:patientDetailsType,
                treatmentActivities:treatmentActivities,
                g_patientDetail: patientDetail,
                g_selectedTherapeuticGroup: selectedTherapeuticGroup,
            }
        }
    );
    const [listOfSection] = useState([
        {
            text: 'Patient Details',
            ref: useRef(),
            className: generateRandomId(),
            component: PatientDetails,
        },
        {
            text: 'Precautions',
            ref: useRef(),
            className: generateRandomId(),
            component: Precautions,
        },
        {
            text: 'Health Reference Value',
            ref: useRef(),
            className: generateRandomId(),
            component: HealthReference,
        },
        {
            text: 'Measure Health Status',
            ref: useRef(),
            className: generateRandomId(),
            component: MeasureHealthStatus,
        },
        {
            text: 'Treatment Activities',
            ref: useRef(),
            className: generateRandomId(),
            component: TreatmentActivities,
        },
        {
            text: 'Therapeutic Group',
            ref: useRef(),
            className: generateRandomId(),
            component: TherapeuticGroup,
        },
    ]);
    const [forceErrorDisplay, setForceErrorDisplay] = useState(false);
    const [isValidValue, setIsValidValue] = useState(false);
    const case_no = g_patientDetailsType === 'PT' ? 'HN01108000T' : 'HN06000037Z';
    const room_id = g_patientDetailsType === 'PT' ? '4BC' : 'G037';
    const getData = () => {
        dispatch({
            type: ActionTypes.FETCH_PATIENT_PRESCRIPTION,
            payload: {
                "login_id":"@CMSIT",
                "dept": g_patientDetailsType,
                "case_no":case_no,
                "hosp_code":"TPH"
            }
        })
        dispatch({
            type: ActionTypes.FETCH_ROOT_LIST,
            payload: {
                "login_id":"@CMSIT",
                "dept":g_patientDetailsType,
                "hosp_code":"TPH"
            }
        })
        dispatch({
            type: ActionTypes.FETCH_PATIENT_DETAIL_MASTER_LIST,
            payload: {
                "login_id":"@CMSIT",
                "hosp_code":"HAH",
                "dept":g_patientDetailsType
            
            }
        })
        dispatch({
            type: ActionTypes.FETCH_MASTER_LIST_STATIC,
            payload: {
                "login_id":"@CMSIT",
                "hosp_code":"TPH",
                "room_id":  room_id,
                "dept":g_patientDetailsType
            }
        })
        dispatch({
            type: ActionTypes.FETCH_PROTOCOL_LIST,
            payload: {
                "login_id":"@CMSIT",
                "hosp_code":"TPH",
                "dept":g_patientDetailsType
            
            }
        })
        dispatch({
            type: ActionTypes.FETCH_THERAPEUTIC_GROUP_CALENDAR_LIST,
            payload: {
                "login_id":"@CMSIT",
                "dept":g_patientDetailsType,
                "start_date":"2021/01/01",
                "end_date":"2021/12/31",
                "room_id":"ALL",
                "hosp_code":"TPH"            
            }
        })
        dispatch({
            type: ActionTypes.FETCH_THERAPEUTIC_GROUP_PATIENT_LIST,
            payload: {
                "login_id":"@CMSIT",
                "dept":g_patientDetailsType,
                "hosp_code":"TPH",
                "category":"Caregiver training",
                "group_name":"Caregiver Education",
               // "room_id":"ALL",
                  
            }
        })
        dispatch({
            type: ActionTypes.FETCH_THERAPEUTIC_GROUP_PATIENT_DATA,
            payload: {
                "login_id":"@CMSIT",
                "dept":  g_patientDetailsType,
                "case_no": case_no,
                "hosp_code":"TPH"            
            }
        })
    }
    useEffect(() => {
        getData();
    }, [g_patientDetailsType, room_id])

    const switchPatientDetailsType = () => {
        dispatch({
            type: ActionTypes.SWITCH_PATIENT_DETAILS_TYPE,
            payload: {
                patientDetailsType:g_patientDetailsType=='PT'?'OT':'PT'
            }
        });
    }

    const checkValidation = () => {
        let isPass = true;
        let text = ''
        if (!g_patientDetail.room_id || !g_patientDetail.therapist_id || !g_patientDetail.patient_conditions || !g_patientDetail.status || !g_patientDetail.o2 || isEmpty(g_patientDetail.patient_details_remarks)) {
            text = 'Patient Detail'
            isPass = false;
        }
        if (g_patientDetailsType === 'OT') {
            if (!g_patientDetail.wheelchair || !g_patientDetail.assistive_device_1 || !g_patientDetail.assistive_device_2 || !g_patientDetail.weight_bearing_status_1 || !g_patientDetail.weight_bearing_status_2 || !g_patientDetail.fall_risk) {
                text = 'Patient Detail'
                isPass = false;
            }
        }
        treatmentActivities.forEach(element => {
            if (!element.treatment_seq || !element.treatment_category || !element.treatment_name || !element.treatment_doc) {
                text = 'Treatment Activities'
                isPass = false
            }
        });
        g_selectedTherapeuticGroup.forEach(element => {
            if (!element.hosp_code || !element.dept || !element.category || !element.group_name) {
                text = 'Therapeutic Group'
                isPass = false
            }
        });
        return {isPass, text}
    }

    const handleSave = (index) => {
        
        // return

        const {isPass, text} = checkValidation();
        // console.log(isValid)
        if (!isPass) {
            setForceErrorDisplay(true);
            dispatch({
                type: ActionTypes.MESSAGE_OPEN_MSG,
                payload: {
                    open: true,
                    messageInfo: {
                        message: `Error in "${text}", please review and update.`,
                        messageType: 'error',
                        btn2Label: 'OK'
                    },
                }
            });
            return
        }
        const payload = {
            "login_id": "@CMSIT",
            "hosp_code": "TPH", 
            "dept": g_patientDetailsType,
            "case_no": case_no,
            "action": "UPDATE",
            "patient_details": { // the data has set in reduce g_patientDetail
                "room_id": g_patientDetail.room_id,
                "therapist_id":g_patientDetail.therapist_id,
                "patient_conditions":g_patientDetail.patient_conditions,
                "status":g_patientDetail.status,
                "o2":g_patientDetail.o2,
                "wheelchair": g_patientDetail.wheelchair,
                "assistive_device_1":g_patientDetail.assistive_device_1,
                "assistive_device_2":g_patientDetail.assistive_device_2,
                "weight_bearing_status_1":g_patientDetail.weight_bearing_status_1,
                "weight_bearing_status_2":g_patientDetail.weight_bearing_status_2,
                "patient_details_remarks":g_patientDetail.patient_details_remarks,
                "fall_risk":g_patientDetail.fall_risk,
                "precautions":g_patientDetail.precautions,
                "precautions_remarks_1":g_patientDetail.precautions_remarks_1,
                "precautions_remarks_2":g_patientDetail.precautions_remarks_2,
                "sbp_lower":g_patientDetail.sbp_lower,
                "sbp_upper":g_patientDetail.sbp_upper,
                "dbp_lower":g_patientDetail.dbp_lower,
                "dbp_upper":g_patientDetail.dbp_upper,
                "spo2":g_patientDetail.spo2,
                "pulse_lower":g_patientDetail.pulse_lower,
                "pulse_upper":g_patientDetail.pulse_upper,
                "continuous_spo2":g_patientDetail.continuous_spo2,
                "first_attend_login":g_patientDetail.first_attend_login,
                "first_attend_logout":g_patientDetail.first_attend_logout,
                "subsequent_attend_login":g_patientDetail.subsequent_attend_login,
                "subsequent_attend_logout":g_patientDetail.subsequent_attend_logout,
            },
            "treatment_data": treatmentActivities,
            "therapeutic_group_patient": g_selectedTherapeuticGroup
        
        }
        dispatch({
            type: ActionTypes.FETCH_SAVE_PRECAUTIONS,
            payload: payload,
            callback: () => {
                dispatch({
                    type: ActionTypes.MESSAGE_OPEN_MSG,
                    payload: {
                        open: true,
                        messageInfo: {
                            message: 'Patient details saved successfully',
                            messageType: 'success',
                            btn2Label: 'OK'
                        },
                    }
                });
            }
        });
        
    }

    const toPatientSummary = () => {
        history.push('/patientSummary')
    }
    return (<>
        <IndexContextState.Provider value={{forceErrorDisplay, setIsValidValue}}>
        <div className={`scrollerObserver ${classes.layout}`} style={{  }}>
            <div className={classes.STopNav}>
                <Grid container >
                    <Grid className={classes.navLeft}>
                        <Navigation root="scrollerObserver" listOfSections={listOfSection} />
                    </Grid>
                    <Grid onClick={()=>{toPatientSummary()}}>
                        <span className={classes.navSummaryBtn}>Patient Summary</span>
                    </Grid>
                </Grid>
            </div>
            <div className={classes.SContentLayout}>
                <div className={classes.SContent}>
                    
                    <div className={classes.SContentAbsolute}>
                        {listOfSection.map((item, index) => {
                            const Section = item.component;
                            return (
                                <div ref={item.ref} className={item.className} key={item.text}>
                                    {Section && <Section
                                        title={item.text}
                                    />}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
            <Grid container alignItems='center' justifyContent='space-between' className={classes.footer}>
                <ColorButton onClick={switchPatientDetailsType} style={{marginLeft: 49,  height: 40}} variant="contained" color="primary">{`To ${g_patientDetailsType=='PT'?'OT':'PT'}`}</ColorButton>
                <Grid>
                    <ColorButton style={{ height: 40}} variant="contained">Cancel</ColorButton>
                    <ColorButton style={{marginRight: 49, marginLeft: 5, height: 40}} variant="contained" color="primary" onClick={handleSave}>Save</ColorButton>
                </Grid>
            </Grid>
        </div>
        </IndexContextState.Provider>
    </>)
}

export default Index;