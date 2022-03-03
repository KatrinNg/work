// ******************************************************
//  Copyright (C) 2020 Li Cheuk Wai, Tony <tony.li@mongodb.com>
//
//  This file is part of HA Consulting
//
//  HA Consulting can not be copied and/or distributed without the express
//  permission of Li Cheuk Wai, Tony
//  *******************************************************
//
// this file aims to provide the container for handling Drawing pad event

import { connect } from 'react-redux';
import {
  enableCircleMode,
  enableCrossMode,
  enableDrawingMode,
  savedToMongoDB,
  updateDrawing
} from '../../../store/actions/documentUpload/documentAction';
import DrawingPad from '../components/DrawingPad';


const mapStateToProps= state => {
  return {
    currentDrawingMode: state.drawingUIReducer.currentDrawingMode?state.drawingUIReducer.currentDrawingMode : 'NONE',
    saveToMongoDBNow: state.drawingUIReducer.saveToMongoDBNow?state.drawingUIReducer.saveToMongoDBNow : '',
    savedStage: state.drawingUIReducer.previousStage,
    restoreDrawingDateTime: state.drawingUIReducer.restoreDrawingDateTime,
    updateDrawingDateTime: state.drawingUIReducer.updateDrawingDateTime,
    clearDrawingDateTime: state.drawingUIReducer.clearDrawingDateTime,
    clinicalDoc: state.drawingUIReducer.clinicalDoc
  };
};

const mapDispatchToProps= dispatch=>({
  updateDrawing : (theStage)=> dispatch(updateDrawing(theStage))
});

export default connect(mapStateToProps, mapDispatchToProps)(DrawingPad);
