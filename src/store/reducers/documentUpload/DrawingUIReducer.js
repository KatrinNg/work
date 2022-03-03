// ******************************************************
//  Copyright (C) 2020 Li Cheuk Wai, Tony <tony.li@mongodb.com>
//
//  This file is part of HA Consulting
//
//  HA Consulting can not be copied and/or distributed without the express
//  permission of Li Cheuk Wai, Tony
//  *******************************************************
//
// this file aims to provide the reducer of redux

import * as ACTION from '../../actions/documentUpload/documentAction';
import util from 'util';
import { START_COMPONENT } from '../../actions/documentUpload/documentAction';
import Constant from '../../../constants/documentUpload/Constant';

// Function to persist the drawings to mongoDB
const persistDrawingToMongoDB = (theJSON) => {
  console.log(util.format('%s - persistDrawingToMongoDB Called', new Date, theJSON));
  fetch(util.format('%ssaveDrawing', Constant.targetUploadServiceURL), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(theJSON)
  });
  return true;
};

export const drawingUIReducer = (state = {
  saveToMongoDBHistory: [],
  restoreDrawingDateTime: new Date(0),
  clearDrawingDateTime: new Date(0),
  updateDrawingDateTime: new Date(0)
}, action) => {
  // console.log('wake');
  // console.log(state);
  // console.log(action);
  switch (action.type) {
    case START_COMPONENT:
      return {
        ...state,
        createdBy: action.createdBy,
        PMI: action.PMI,
        encounteredID: action.encounteredID
      };
      // break;
    case ACTION.OPEN_DRAWING:
    case ACTION.OPEN_DRAWING_PRE:
      return {
        ...state,
        clinicalDoc: action.clinicalDoc,
        restoreDrawingDateTime: action.restoreDrawingDateTime
      };
      // break;
    case ACTION.CLOSE_DRAWING:
      return {
        ...state
      };
    case ACTION.RESTORE_DRAWING:
      return {
        ...state,
        restoreDrawingDateTime: action.restoreDrawingDateTime
      };
      // break;
    case ACTION.GOT_DRAWING:
      return {
        ...state,
        drawingDocID: action.drawingDocID,
        previousStage: action.savedDrawing
      };
    case ACTION.CLEAR_ALL_KONVA_ELEMENTS:
      return {
        ...state,
        clearDrawingDateTime: action.clearDrawingDateTime
      };
    case ACTION.UPDATE_DRAWINGS:
      return {
        ...state,
        updateDrawingDateTime: action.updateDrawingDateTime,
        currentStage: action.currentStage
      };
      // break;
    case ACTION.ENABLE_CIRCLE:
    case ACTION.ENABLE_DRAWING:
    case ACTION.ENABLE_CROSS:
      return {
        ...state,
        currentDrawingMode: action.type
      };
      // break;
    case ACTION.SAVE_MONGODB:{
      const _saveToMongoDBNow = new Date();
      persistDrawingToMongoDB({
        parentFileID: state.clinicalDoc.fileID,
        stageJSON: state.currentStage,
        createdDateTime: _saveToMongoDBNow
      });
      state.saveToMongoDBHistory.push(_saveToMongoDBNow);
      state.saveToMongoDBNow = _saveToMongoDBNow;
      return {
        ...state,
        previousStage: state.currentStage
      };
      // break;
    }
    default:
      // console.log('drawing UI Event not found');
      return state;
  }
};

