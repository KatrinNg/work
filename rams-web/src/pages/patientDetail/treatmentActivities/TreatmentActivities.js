import React, { useEffect, useState, useRef } from 'react';
import Widget from 'components/Widget/Widget';
import { useStyles } from './styles';
import { Grid, Button } from '@material-ui/core';
import TreatmentActivitiesItem from './treatmentActivitiesItem/TreatmentActivitiesItem';
import { useDispatch, useSelector } from 'react-redux';
import * as ActionTypes from 'redux/actionTypes';
import SearchSelectList from 'components/SearchSelectList/SearchSelectList';
import AddIcon from '@material-ui/icons/Add';
import ColorButton from 'components/ColorButton/ColorButton';
import {protocolData} from '../mockData';
import { TramRounded } from '@material-ui/icons';

const TreatmentActivities = ({ title}) => {
    const classes = useStyles();
    const [protocolValue, setProtocolValue] = useState('');
    const pendingValueRef = useRef(null)
    const dispatch = useDispatch();

    const { treatmentActivities, roomChange, treatmentChange, protocolList } = useSelector(
        state => ({
            treatmentActivities: state.patientDetail?.treatmentActivities,
            roomChange: state.patientDetail?.roomChange,
            treatmentChange: state.patientDetail?.treatmentChange,
            protocolList: state.patientDetail?.protocolList,
        })
    );
    console.log(protocolList)
  
    // useEffect(() => {
        
        
    // }, [])

    const handleAddIndividual = () => {
        const id = treatmentActivities.length ? treatmentActivities[treatmentActivities.length - 1].id* 1 : 1;
        const newList = [...treatmentActivities, {
            // id: id,
            "treatment_seq": id + 1 + '',
            "treatment_optional": "",
            "treatment_category": "",
            "treatment_name": "",
            "treatment_doc": "",
            "position": "",
            "side": "",
            "region": "",
            "set": "",
            "repetition": "",
            "resistance": "",
            "resistance_unit": "",
            "walking_aids": "",
            "assistive_device_1": "",
            "assistive_device_2": "",
            "weight_bearing_status_1": "",
            "weight_bearing_status_2": "",
            "assistance_device_2": "",
            "distance": "",
            "duration": "",
            "befor_bp": "N",
            "befor_spo2": "N",
            "after_bp": "N",
            "after_spo2": "N",
            "handheld_remark": "N",
            'remark': '',
        }]
        // setActivityList(newList);
        dispatch({
            type: ActionTypes.SET_PATIENT_DETAIL,
            payload: {
                treatmentActivities: newList,
            }
        });
        onTreatmentChange();
    }

    const onTreatmentChange = () => {
        !treatmentChange && dispatch({
            type: ActionTypes.SET_PATIENT_DETAIL,
            payload: {
                treatmentChange: true,
            }
        });
    }

    const handleSelect = (value, obj) => {
        // dispatch({
        //     type: ActionTypes.SET_PATIENT_DETAIL,
        //     payload: {
        //         protocolValue: value,
        //     }
        // });
        // console.log(value, obj)
        setProtocolValue(value);
        pendingValueRef.current = obj;
        onTreatmentChange();
    }

    const handleChangeState = (filed, value, index) => {
        let newActivities = [...treatmentActivities];
        if (Array.isArray(filed) && Array.isArray(value)) {
            filed.forEach((item, i) => {
                newActivities[index] = {
                    ...newActivities[index],
                    [item]: value[i]
                }
            })
        } else {
            newActivities[index] = {
                ...newActivities[index],
                [filed]: value
            }
        }
        dispatch({
            type: ActionTypes.SET_PATIENT_DETAIL,
            payload: {
                treatmentActivities: newActivities
            }
        })
        onTreatmentChange();
    }

    const handleDel = (index) => {
        const newList = [...treatmentActivities];
        let isHave = false;
        let temp = []
        newList.forEach((item, i) => {
            if (item.optionalSelect === (index + 1)) {
                temp.push(i)
                isHave = true;
            }
        })
        dispatch({
            type: ActionTypes.MESSAGE_OPEN_MSG,
            payload: {
                open: true,
                messageInfo: {
                    message: (isHave? 'Another item has been optional to this current item ' :'') + 'Are you sure to remove activity?',
                    messageType: 'success',
                    btn1Label: 'Cancel',
                    btn2Label: 'Yes',
                    btn2Action: () => {
                        temp.forEach((i) => {
                            newList[i].optionalSelect = 'N/A'
                        })
                        console.log(newList)
                        newList.splice(index, 1);
                        
                        dispatch({
                            type: ActionTypes.SET_PATIENT_DETAIL,
                            payload: {
                                treatmentActivities: newList
                            }
                        })
                        onTreatmentChange();
                    }
                },
            }
        });
        
    }

    const handleAddProtocol = () => {
        if (!pendingValueRef.current) return;
        const id = treatmentActivities.length ? treatmentActivities[treatmentActivities.length - 1].treatment_seq* 1 : 1;
        const newList = [...treatmentActivities]
        pendingValueRef.current?.protocol_treatment_list.forEach((item) => {
            newList.push({
                treatment_seq: id + 1 + '',
                ...item
            })
        })
        // setActivityList(newList);
        dispatch({
            type: ActionTypes.SET_PATIENT_DETAIL,
            payload: {
                treatmentActivities: newList,
            }
        });
        setProtocolValue('');
        pendingValueRef.current = null
        onTreatmentChange();
    }

    return (
        <div>
            <Widget title={title} bodyClass={classes.widget}>
                <div className={classes.title}>Protocol</div>
                <Grid container alignItems="center">
                    <Grid style={{width: 440, marginRight: 10}}>
                        <SearchSelectList handleSelect={handleSelect} value={protocolValue} labelFiled='protocol_name' valueFiled='protocol_name' disabled={roomChange} placeholder='-Select Protocol-' options={protocolList}/>
                    </Grid>
                    <Grid >
                        <Grid container alignItems='center' >
                            <ColorButton onClick={handleAddProtocol}  disabled={!protocolValue} variant="contained" color="primary" startIcon={<AddIcon />}>Add</ColorButton>
                            <span style={{margin: '0 15px'}}>Or</span>
                            <ColorButton disabled={roomChange} onClick={handleAddIndividual} variant="outlined" color="primary">Add Individual</ColorButton>
                        </Grid>
                    </Grid>
                </Grid>
            </Widget>
            {
                treatmentActivities ? treatmentActivities.map((item, index) => {
                    return <TreatmentActivitiesItem treatmentActivities={treatmentActivities} key={item.treatment_seq+ '_' + index} handleChangeState={(filed, value) => handleChangeState(filed, value, index)} itemIndex={index} item={item} handleDel={handleDel}/>
                }) : null
            }
        </div>
    )
}

export default TreatmentActivities;