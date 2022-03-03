import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';
import {generateRandomId} from 'utility/utils'

const IOSSwitch = withStyles((theme) => ({
  root: {
    width: 72,
    height: 29,
    padding: 0,
    margin: theme.spacing(1),
  },
  switchBase: {
    padding: 1,
    '&$checked': {
      transform: 'translateX(43px)',
      color: theme.palette.common.white,
      '& + $track': {
        backgroundColor: '#21d15c',
        opacity: 1,
        border: 'none',
        '&:before': {
            position: 'absolute',
            left: '-10px',
            top: '0',
            content: '"YES"',
            width: 72,
            height:29,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'MyriadPro-Regular',
            fontSize: '16px',
            fontWeight: 'normal',
            fontStretch: 'normal',
            fontStyle: 'normal',
            color: '#fff',
          },
      },
    },
    '&$focusVisible $thumb': {
      color: '#21d15c',
      border: '6px solid #fff',
    },
  },
  thumb: {
    width: 24,
    height: 24,
    marginTop: 2
  },
  track: {
    borderRadius: 29 / 2,
    border: `1px solid ${theme.palette.grey[400]}`,
    // backgroundColor: theme.palette.grey[50],
    backgroundColor: '#bcbcbc',
    opacity: 1,
    transition: theme.transitions.create(['background-color', 'border']),
    '&:before': {
        position: 'absolute',
        left: '10px',
        top: '0',
        content: '"NO"',
        width: 72,
        height:29,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'MyriadPro-Regular',
        fontSize: '16px',
        fontWeight: 'normal',
        fontStretch: 'normal',
        fontStyle: 'normal',
        color: '#fff',
      },
  },
  checked: {},
  focusVisible: {},
}))

(({ classes, ...props }) => {
  return (
    <Switch
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked,
      }}
      {...props}
    />
  );
});


export default function CustomizedSwitches(props) {
  return (
    <IOSSwitch {...props} name={`switch_${generateRandomId()}`} />
  );
}