import React, { useState, useEffect } from "react"
import MainContentUI from '../common/MainContentUI'
import { useDispatch, useSelector } from 'react-redux'
import * as ActionTypes from 'redux/actionTypes';
const WeightBearingStatus2 = () => {
    const dispatch = useDispatch();
    const { categoryList } = useSelector(state => state.adminmode)
    const getList = () => {
        dispatch({
            type: ActionTypes.FETCH_ADMIN_CATEGORY_LIST,
            payload: {
                "login_id": "@CMSIT",
                "hosp_code": "TPH",
                "dept": "OT",
            }
        })
    }
    useEffect(()=>{
        getList();
    }, [dispatch])

    
    
    const handleSave = (data, newData) => {
        dispatch({
            type: ActionTypes.SAVE_ADMIN_CATEGORY_LIST,
            payload: {
                "login_id": "@CMSIT",
                "hosp_code": "TPH",
                "dept": "OT",
                "category_dept": data,
                callback: (data) => {

                    if (data === "SUCCESS") {
                        // dispatch({
                        //     type: ActionTypes.SET_ADMINMODE_DATA,
                        //     payload: {
                        //         weightBearingStatus2List: newData
                        //     }
                        // });
                        getList();
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
        <MainContentUI id={`categoryList`} title="Category List" list={categoryList} onSave={ handleSave} fieldName="treatment_category"/>
    )
}

export default WeightBearingStatus2;