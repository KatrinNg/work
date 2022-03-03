import React, { useEffect } from "react"
import MainContentUI from '../common/MainContentUI'
import { useDispatch, useSelector } from 'react-redux'
import * as ActionTypes from 'redux/actionTypes';
const WeightBearingStatus2 = () => {
    const dispatch = useDispatch();
    const { weightBearingStatus2List } = useSelector(state => state.adminmode)
    useEffect(()=>{
        dispatch({
            type: ActionTypes.FETCH_WEIGHT_BEARING_STATUS_2,
            payload: {
                "login_id": "@CMSIT",
                "hosp_code": "TPH",
                "dept": "OT",
            }
        })
    }, [dispatch])
    
    const handleSave = (data, newData) => {
        dispatch({
            type: ActionTypes.SAVE_TREATMENT_PROPERTIES,
            payload: {
                "login_id": "@CMSIT",
                "hosp_code": "TPH",
                "dept": "OT",
                "treatment_properties_dept": data,
                callback: (data) => {

                    if (data === "SUCCESS") {
                        dispatch({
                            type: ActionTypes.SET_ADMINMODE_DATA,
                            payload: {
                                weightBearingStatus2List: newData
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
        <MainContentUI id={'weightBearingStatus2'} title="Weight Bearing Status (2) List" list={weightBearingStatus2List} onSave={ handleSave}/>
    )
}

export default WeightBearingStatus2;