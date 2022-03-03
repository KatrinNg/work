// ******************************************************
//  Copyright (C) 2020 Li Cheuk Wai, Tony <tony.li@mongodb.com>
//
//  This file is part of HA Consulting
//
//  HA Consulting can not be copied and/or distributed without the express
//  permission of Li Cheuk Wai, Tony
//  *******************************************************
//
// this file aims to provide Tool bar for drawing pad

import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import SaveIcon from '@material-ui/icons/Save';
import LayersClearIcon from '@material-ui/icons/LayersClear';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import ClearIcon from '@material-ui/icons/Clear';
import { Toolbar } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import SettingsBackupRestoreIcon from '@material-ui/icons/SettingsBackupRestore';
import CreateIcon from '@material-ui/icons/Create';

export default ({ enableCircleMode, enableCrossMode, saveToMongoDB , enableDrawingMode,
                  clearDrawing, restoreDrawingFromMongoDB, closeDrawing}) => {

  return (
    <AppBar position={'static'}>
      <Toolbar>
        <IconButton variant={'contained'} onClick={closeDrawing}>
          <ExitToAppIcon></ExitToAppIcon>
        </IconButton>
        <IconButton variant={'contained'} onClick={clearDrawing}>
          <LayersClearIcon></LayersClearIcon>
        </IconButton>
        <IconButton variant={'contained'} onClick={restoreDrawingFromMongoDB}>
          <SettingsBackupRestoreIcon></SettingsBackupRestoreIcon>
        </IconButton>
        <IconButton variant={'contained'} onClick={enableDrawingMode}>
          <CreateIcon/>
        </IconButton>
        <IconButton variant={'contained'} onClick={enableCircleMode}>
          <RadioButtonUncheckedIcon/>
        </IconButton>
        <IconButton variant={'contained'} onClick={enableCrossMode}>
          <ClearIcon/>
        </IconButton>
        <IconButton variant={'contained'} onClick={saveToMongoDB}>
          <SaveIcon></SaveIcon>
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};
