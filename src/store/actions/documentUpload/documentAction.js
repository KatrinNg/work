// ******************************************************
//  Copyright (C) 2020 Li Cheuk Wai, Tony <tony.li@mongodb.com>
//
//  This file is part of HA Consulting
//
//  HA Consulting can not be copied and/or distributed without the express
//  permission of Li Cheuk Wai, Tony
//  *******************************************************
//
// this file aims to provide the actions for the redux


export const START_COMPONENT = 'START';
export const ENABLE_CIRCLE = 'ENABLE_CIRCLE';
export const ENABLE_CROSS = 'ENABLE_CROSS';
export const ENABLE_DRAWING = 'ENABLE_DRAWING';
export const CLEAR_ALL_KONVA_ELEMENTS = 'CLEAR_ALL_KONVA_ELEMENTS';
export const SAVE_MONGODB = 'SAVE_MONGODB';
export const SAVED_MONGODB = 'SAVED_MONGODB';
export const UPDATE_DRAWINGS = 'ADD_DRAWINGS';
export const RESTORE_DRAWING = 'RESTORE_DRAWING';
export const GOT_DRAWING = 'GOT_DRAWING';
export const GOT_DRAWING_HISTORY = 'GOT_DRAWING_HISTORY';
export const USE_LIST_VIEW = 'USE_LIST_VIEW';
export const USE_THUMBNAIL_VIEW = 'USE_THUMBNAIL_VIEW';
export const GET_CLINICAL_DOC_LIST = 'GET_CLINICAL_DOC_LIST';
export const GOT_CLINICAL_DOC_LIST = 'GOT_CLINICAL_DOC_LIST';
export const OPEN_DRAWING = 'OPEN_DRAWING';
export const CLOSE_DRAWING = 'CLOSE_DRAWING';
export const GET_DRAWING_HISTORY = 'GET_DRAWING_HISTORY';
export const OPEN_DRAWING_PRE = 'OPEN_DRAWING_PRE';

let seq = 0;

export const getDrawingHistory = (theParentDocID)=>({
  type: GET_DRAWING_HISTORY,
  parentDocID: theParentDocID,
  sequence: seq++
});

export const getClinicalDocList = ()=>({
  type: GET_CLINICAL_DOC_LIST,
  sequence: seq++
});

// TODO: hard coded the startup parameters
export function startup() {
  return {
    type: START_COMPONENT,
    createdBy: 'Tony',
    PMI: 'P0001',
    encounteredID: 'E0001',
    sequence: seq++
  };
}

export const closeDrawing = ()=> ({
  type: CLOSE_DRAWING,
  sequence: seq++
});

export const openDrawingPreviousVersion = (drawingDocID, clinicalDoc)=> ({
  type: OPEN_DRAWING_PRE,
  drawingDocID: drawingDocID,
  clinicalDoc: clinicalDoc,
  restoreDrawingDateTime: new Date(),
  sequence: seq++
});

export const openDrawing = (clinicalDoc)=> ({
  type: OPEN_DRAWING,
  clinicalDoc: clinicalDoc,
  restoreDrawingDateTime: new Date(),
  sequence: seq++
});

export const useListView = ()=>({
  type: USE_LIST_VIEW,
  useListViewDateTime: new Date(),
  sequence: seq++
});

export const useThumbnailView = ()=>({
  type: USE_THUMBNAIL_VIEW,
  useThumbnailViewDateTime: new Date(),
  sequence: seq++
});

export const restoreDrawingFromMongoDB = ()=>({
  type: RESTORE_DRAWING,
  restoreDrawingDateTime: new Date(),
  sequence: seq++
});

export const updateDrawing=(theStage)=> ({
  type: UPDATE_DRAWINGS,
  currentStage: theStage,
  updateDrawingDateTime: new Date(),
  sequence: seq++
});

export const savedToMongoDB= ()=>({
  type: SAVED_MONGODB,
  sequence: seq++
});

export const saveToMongoDB = () => ({
  type: SAVE_MONGODB,
  sequence: seq++
});

export const clearAllKonvaElements = () => ({
  type: CLEAR_ALL_KONVA_ELEMENTS,
  clearDrawingDateTime: new Date(),
  sequence: seq++
});

export const enableCircleMode = () => ({
  type: ENABLE_CIRCLE,
  sequence: seq++
});

export const enableCrossMode = () => ({
  type: ENABLE_CROSS,
  sequence: seq++
});

export const enableDrawingMode = () => ({
  type: ENABLE_DRAWING,
  sequence: seq++
});

