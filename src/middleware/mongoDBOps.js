// ******************************************************
//  Copyright (C) 2020 Li Cheuk Wai, Tony <tony.li@mongodb.com>
//
//  This file is part of HA Consulting
//
//  HA Consulting can not be copied and/or distributed without the express
//  permission of Li Cheuk Wai, Tony
//  *******************************************************
//
// this file aims to provide the middleware component for async call with mongoDB data services

import * as ACTION from '../store/actions/documentUpload/documentAction';
import util from 'util';
import Constant from '../constants/documentUpload/Constant';

const getDrawingHistoryFromMongoDB = (theParentDocID) => {
  return new Promise((theResolved) => {
    fetch(util.format('%sgetDrawingHistory?ParentDocID=%s',Constant.targetUploadServiceURL, theParentDocID), {
      method: 'GET'
    }).then(response => response.json()).then((data) => {
      theResolved(data);
    });
  });
};


const getDrawingFromMongoDB = (theDocID) => {
  return new Promise((theResolved) => {
    console.log(util.format('%s - getDrawingFromMongoDB Called and DrawingDocID: %s', new Date(), theDocID));
    fetch(util.format('%sgetDrawing?docID=%s', Constant.targetUploadServiceURL, theDocID), {
      method: 'GET'
    }).then(response => response.json()).then((data) => {
      theResolved(data);
    });
  });
};

const getListOfClinicDocFromMongoDB = (thePMI, theEncounteredID) => {
  return new Promise((theResolved) => {
    console.log(util.format('%s - getListClinicDocFromMongoDB Called', new Date()));
    fetch(util.format('%suploadedList?PMI=%s&EncounteredID=%s',Constant.targetUploadServiceURL, thePMI, theEncounteredID), {
      method: 'GET'
    }).then(response => response.json()).then((data) => {
      theResolved(data);
    });
  });
};

// the core middleware logic for mongoDB operations
const mongoDB = (store) => (next) => (action) => {
  switch (action.type) {
    case ACTION.OPEN_DRAWING:
      next(action);
      console.log(action);
      if (action.clinicalDoc.lastDrawingDocID) {
        getDrawingFromMongoDB(action.clinicalDoc.lastDrawingDocID).then((theDrawing) => {
          console.log(theDrawing);
          store.dispatch({
            type: ACTION.GOT_DRAWING,
            drawingDocID: action.clinicalDoc.lastDrawingDocID,
            savedDrawing: theDrawing.stageJSON
          });
        });
      }
      break;
    case ACTION.OPEN_DRAWING_PRE:
      next(action);
      console.log(action);
      getDrawingFromMongoDB(action.drawingDocID).then((theDrawing) => {
        console.log(theDrawing);
        store.dispatch({
          type: ACTION.GOT_DRAWING,
          drawingDocID: action.drawingDocID,
          savedDrawing: theDrawing.stageJSON
        });
      });
      break;
    case ACTION.GET_DRAWING_HISTORY:
      next(action);
      getDrawingHistoryFromMongoDB(action.parentDocID).then((theHistory) => {
        console.log(theHistory);
        store.dispatch({
          type: ACTION.GOT_DRAWING_HISTORY,
          targetParentDocID: action.parentDocID,
          drawingHistory: theHistory
        });

      });
      break;
    case ACTION.START_COMPONENT:
    case ACTION.USE_THUMBNAIL_VIEW:
    case ACTION.USE_LIST_VIEW:
    case ACTION.GET_CLINICAL_DOC_LIST:
    case ACTION.SAVE_MONGODB:
      next(action);
      console.log();
      getListOfClinicDocFromMongoDB(action.PMI?action.PMI:store.getState().pdfNImageUIReducer.PMI
        , action.encounteredID?action.encounteredID:store.getState().pdfNImageUIReducer.encounteredID
      ).then((theClinicDocList) => {
        store.dispatch({
          type: ACTION.GOT_CLINICAL_DOC_LIST,
          clinicalDocList: theClinicDocList
        });
      });
      break;
    default:
      next(action);
  }
};

export default mongoDB;
