// ******************************************************
//  Copyright (C) 2020 Li Cheuk Wai, Tony <tony.li@mongodb.com>
//
//  This file is part of HA Consulting
//
//  HA Consulting can not be copied and/or distributed without the express
//  permission of Li Cheuk Wai, Tony
//  *******************************************************
//
// this file aims to provide the reducer of the redux

import {START_COMPONENT} from '../../actions/documentUpload/documentAction';
import * as ACTION from '../../actions/documentUpload/documentAction';

export default function pdfNImageUIReducer(state= {
  useListViewDateTime: new Date(0),
  useThumbnailViewDateTime: new Date(0),
  //initial state PMI
  PMI:191
} , action){
  // console.log(state);

  // Migrate History to the clinicalDoc Array
  const migrateDrawingHistoryToClinicalDoc = ({theClinicalDocList, theParentDocID, theDrawingHistory}) => {
    if (!theClinicalDocList) return [];
    theClinicalDocList.map((theDoc)=>{
      if (theDoc.fileID === theParentDocID){
        theDoc.drawingHistory = theDrawingHistory;
      }
    });
    return theClinicalDocList;
  };

  switch(action.type){
    case START_COMPONENT:
      return {
        ...state,
        createdBy: action.createdBy,
        PMI: action.PMI,
        encounteredID: action.encounteredID
      };
      // break;
    case ACTION.OPEN_DRAWING_PRE:
    case ACTION.OPEN_DRAWING:
      return {
        ...state,
        openDrawingFlag: true
      };
      // break;
    case ACTION.CLOSE_DRAWING:
      return {
        ...state,
        openDrawingFlag: false
      };
      // break;
    // expect the migrate the history to the clinical doc
    case ACTION.GOT_DRAWING_HISTORY:
      {console.log(state.clinicalDocList);
      const _drawingHistory = {...state.drawingHistory};
      _drawingHistory[action.targetParentDocID] = action.drawingHistory;
      return {
        ...state,
        drawingHistory : _drawingHistory
      };
      // break;
    }
    case ACTION.GOT_CLINICAL_DOC_LIST:
      return {
        ...state,
        clinicalDocList: action.clinicalDocList
      };
      // break;
    case ACTION.USE_LIST_VIEW:
      return {
        ...state,
        useListViewDateTime: action.useListViewDateTime
      };
      // break;
    case ACTION.USE_THUMBNAIL_VIEW:
      return {
        ...state,
        useThumbnailViewDateTime: action.useThumbnailViewDateTime
      };
      // break;
    default:
      // console.log('pdfNImageUIReducer Event not found');
      return state;
  }
}

