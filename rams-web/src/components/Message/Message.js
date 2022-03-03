import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import MessageDialog from './MessageDialog';
import * as ActionTypes from 'redux/actionTypes';

export default function Message() {
    const dispatch = useDispatch();
    const { g_open, g_messageInfo } = useSelector(
        state => ({
            g_open: state.message?.open,
            g_messageInfo: state.message?.messageInfo
        })
    );

    const setOpen = (isOpen, messageInfo, isSnackBar = false) => {
        dispatch({
            type: ActionTypes.MESSAGE_OPEN_MSG,
            payload: {
                open: isOpen,
                messageInfo,
                isSnackBar
            },
        });
    }

    return (
        <MessageDialog
            g_open={g_open}
            g_messageInfo={g_messageInfo}
            setOpen={setOpen}
        />
    );
}