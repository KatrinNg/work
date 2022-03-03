import React, { useState, useEffect } from "react"
import MainContentUI from '../common/MainContentUI'
import { useDispatch, useSelector } from 'react-redux'
import * as ActionTypes from 'redux/actionTypes';
const AssistiveDevice1 = () => {
    const dispatch = useDispatch();
    const { assistiveDevice1List } = useSelector(state => state.adminmode)
    useEffect(()=>{
        dispatch({
            type:ActionTypes.FETCH_ASSISTIVE_DEVICE_1_LIST,
            payload:{
                "login_id":"@CMSIT",
                "hosp_code":"TPH",
                "dept":"OT",
            }
        })
    }, [dispatch])
    
    const handleSave = (data) => {
        dispatch({
            type: ActionTypes.UPDATE_SIDELIST_DATA,
            payload: {
                login_id:'@CMSIT',
                hosp_code:'TPH',
                dept:'OT',
                treatment_properties_dept: data,
                callback: (data) => {

                    // if (data === "SUCCESS") {
                    //     dispatch({
                    //         type: ActionTypes.SET_ADMINMODE_DATA,
                    //         payload: {
                    //             weightBearingStatus1List: newData
                    //         }
                    //     });

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
        });
    }
    return (
        <MainContentUI id={'assistiveDevice1'} title="Assistive Device (1)" list={assistiveDevice1List} onSave={handleSave}/>
    )
}

export default AssistiveDevice1;