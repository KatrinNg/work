import React, { useState, useEffect } from "react"
import MainContentUI from '../common/MainContentUI'
import { useDispatch, useSelector } from 'react-redux'
import * as ActionTypes from 'redux/actionTypes';
const WeightBearingStatus2 = () => {
    const dispatch = useDispatch();
    const { categoryGroupList } = useSelector(state => state.adminmode)
    useEffect(()=>{
        dispatch({
            type: ActionTypes.FETCH_CATEGORY_GROUPLIST_DATA,
            payload: {
                "login_id": "@CMSIT",
                "hosp_code": "TPH",
                "dept": "OT",
            }
        })
    }, [dispatch])
    
    const handleSave = (data, newData) => {
        dispatch({
            type: ActionTypes.SAVE_ADMIN_CATEGORY_LIST,
            payload: {
                "login_id": "@CMSIT",
                "hosp_code": "TPH",
                "dept": "OT",
                "therapeutic_category_hosp": data,
                callback: (data) => {

                    if (data === "SUCCESS") {
                        // dispatch({
                        //     type: ActionTypes.SET_ADMINMODE_DATA,
                        //     payload: {
                        //         weightBearingStatus2List: newData
                        //     }
                        // });

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
        <MainContentUI id={`categoryListGroup`} title="Category List - Group" list={categoryGroupList} onSave={ handleSave} fieldName="category"/>
    )
}

export default WeightBearingStatus2;