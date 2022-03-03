import React, { useEffect } from "react"
import MainContentUI from '../common/MainContentUI'
import { useDispatch, useSelector } from 'react-redux'
import * as ActionTypes from 'redux/actionTypes';
const WeightBearingStatus1 = () => {
    const dispatch = useDispatch();
    const { weightBearingStatus1List } = useSelector(state => state.adminmode)
    useEffect(()=>{
        dispatch({
            type: ActionTypes.FETCH_WEIGHT_BEARING_Status_1,
            payload: {
                "login_id": "@CMSIT",
                "hosp_code": "TPH",
                "dept": "PT",
                "type": "weight_bearing_status_1"
            }
        })
    }, [dispatch])
    
    const handleSave = (data, newData) => {
        dispatch({
            type: ActionTypes.SAVE_TREATMENT_PROPERTIES,
            payload: {
                "login_id": "@CMSIT",
                "hosp_code": "TPH",
                "dept": "PT",
                "treatment_properties_dept": data,
                callback: (data) => {

                    if (data === "SUCCESS") {
                        dispatch({
                            type: ActionTypes.SET_ADMINMODE_DATA,
                            payload: {
                                weightBearingStatus1List: newData
                            }
                        });

                        dispatch({
                            type: ActionTypes.MESSAGE_OPEN_MSG,
                            payload: {
                                open: true,
                                messageInfo: {
                                    message: 'Save successfully',
                                    messageType: 'success',
                                    btn2Label: 'OK',
                                },
                            }
                        });
                    }


                }
            }
        })
    }
    return (
        <MainContentUI id={'weightBearingStatus1'} title="Weight Bearing Status (1) List" list={weightBearingStatus1List} onSave={ handleSave}/>
    )
}

export default WeightBearingStatus1;