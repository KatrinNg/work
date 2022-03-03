import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';
import { useStyles } from './style';
import buttonCloseBtn from 'resource/Icon/demo-icon/button-close-btn-red.svg';
import { useDispatch } from 'react-redux';
import IconButton from '@material-ui/core/IconButton';
import Switch from 'components/Switch/Switch';
import Select from 'components/CommonSelect/CommonSelect';
import * as ActionTypes from 'redux/actionTypes';
export default function ActivitiesItemTitle(props) {
    const classes = useStyles();
    const dispatch = useDispatch();
    const { itemIndex, treatmentActivities=[], item, handleChangeState } = props;
    const [optionalSwitch, setOptionalSwitch] = useState(!item.treatment_optional ? false: true);
    function handleClose() {
        props.handleDel(itemIndex)
    }

    // const [optionalSwitch, setOptionalSwitch] = useState(false)
    const onOptionalSwitch = (val) => {
        if (val) {
            let isHave = false;
            const newList = [...treatmentActivities];
            newList.forEach((item, i) => {
                if (item.treatment_optional* 1 === (itemIndex + 1)) {
                    isHave = true;
                }
            })
            if (isHave) {
                dispatch({
                    type: ActionTypes.MESSAGE_OPEN_MSG,
                    payload: {
                        open: true,
                        messageInfo: {
                            message: 'Another item has been selected to this current item.',
                            messageType: 'success',
                            btn2Label: 'ok',
                        },
                    }
                });
                return
            }
        } else {
            handleChangeState('treatment_optional', '')
        }
        setOptionalSwitch(val)
        // handleChangeState('optionalSwitch', val)
    }

    const getOptionList = () => {
        const list = []
        treatmentActivities?.forEach((element, index) => {
            if (!element.optionalSwitch && itemIndex !== index) {
                list.push({
                    label: index+1,
                    value: index+1
                })
            }
        });
        list.push({
            label: 'N/A',
            value: ''
        })
        return list
    }

    const handleSelect = (e) => {
        handleChangeState('treatment_optional', e.target.value)
    }

    return (
        <Grid container justifyContent="space-between" alignItems="center" className={classes.ActivitiesItemTitle}>
            <Grid className={classes.itemIndex} >{itemIndex + 1}</Grid>
            <Grid>
                <Grid container alignItems="center">
                    <Grid className={classes.titleBaseFontStyle}>Optional</Grid>
                    <Grid style={{marginRight: 14}}>
                        <Switch checked={optionalSwitch} onChange={(e, val) => onOptionalSwitch(val)}/>
                    </Grid>
                    <Grid className={classes.titleBaseFontStyle} style={{width: 23}}>{optionalSwitch && "To"}</Grid>
                    <Grid item style={{ width: 90, marginRight: 45}}>
                        {optionalSwitch && <Select fullWidth={true} onChange={handleSelect} id={'optional-select-item'+ itemIndex} items={getOptionList()} noMsg={true} value={item.treatment_optional}/>}
                    </Grid>
                    <Grid className={classes.deleteButtonBox}>
                        <IconButton onClick={handleClose}>
                            <img alt="" className={classes.activityDeleteButton} src={buttonCloseBtn} />
                        </IconButton>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}