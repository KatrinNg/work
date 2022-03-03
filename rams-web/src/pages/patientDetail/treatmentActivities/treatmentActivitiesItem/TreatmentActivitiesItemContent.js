import React from "react";

import { useStyles } from './style';
import BasicInformation from './BasicInformation';
import PTView from './PTView';
import OTView from './OTView';
import { useSelector } from "react-redux";
import { CONSTANT } from 'constants/MessageList';

export default function TreatmentActivitiesItemContent(props) {
    const classes = useStyles();
    const { g_patientDetailsType } = useSelector((state) => {
        const { patientDetailsType } = state.patientDetail;
        return {
            g_patientDetailsType:patientDetailsType,
        }
    })

    const { isExpand, treatmentActivities, handleChangeState, treatmentActivitiesLists } = props;

    const onChange = (val, filed) => {
        // console.log(e, filed)
        props.handleChangeState(filed, val)
    }
    const onChangeNumber = (value, filed) => {
        props.handleChangeState(filed, value)
    }

    const onSwitchBeforeChange = (e, filed) => {
        props.handleChangeState('before', {
            ...treatmentActivities.before,
            [filed]: e.target.checked 
        })
    }
    const onSwitchAfterChange = (e, filed) => {
        props.handleChangeState('after', {
            ...treatmentActivities.after,
            [filed]: e.target.checked 
        })
    }
    const onCheck = (e) => {
        props.handleChangeState('handheld_remark', e.target.checked ? 'Y' :'N')
    }
    
    const PT = <PTView onCheck={onCheck} onSwitchAfterChange={onSwitchAfterChange} onSwitchBeforeChange={onSwitchBeforeChange} onChange={onChange} onChangeNumber={onChangeNumber} handleChangeState={handleChangeState} treatmentActivities={treatmentActivities} treatmentActivitiesLists={treatmentActivitiesLists}/>;
    const OT = <OTView onCheck={onCheck} onSwitchAfterChange={onSwitchAfterChange} onSwitchBeforeChange={onSwitchBeforeChange} onChange={onChange} onChangeNumber={onChangeNumber} handleChangeState={handleChangeState} treatmentActivities={treatmentActivities} treatmentActivitiesLists={treatmentActivitiesLists}/>;
    return (
        <div className={`${classes.TreatmentActivitiesItemContent} ${isExpand ? classes.ExpandContent : ''}`}>
            <BasicInformation handleChangeState={handleChangeState} treatmentActivities={treatmentActivities} treatmentActivitiesLists={treatmentActivitiesLists}/>
            {isExpand ? g_patientDetailsType === CONSTANT.patientDetailsType_OT ? OT : PT : null }
        </div>
    )
}