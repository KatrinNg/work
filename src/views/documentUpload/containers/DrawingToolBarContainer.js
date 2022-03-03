// ******************************************************
//  Copyright (C) 2020 Li Cheuk Wai, Tony <tony.li@mongodb.com>
//
//  This file is part of HA Consulting
//
//  HA Consulting can not be copied and/or distributed without the express
//  permission of Li Cheuk Wai, Tony
//  *******************************************************
//
// this file aims to provide the container for handling Drawing Tool Bar Event

import {
  clearAllKonvaElements, closeDrawing,
  enableCircleMode,
  enableCrossMode,
  enableDrawingMode,
  restoreDrawingFromMongoDB,
  saveToMongoDB
} from '../../../store/actions/documentUpload/documentAction';
import { connect } from 'react-redux';
import DrawingToolBar from '../components/DrawingToolBar';

const mapStateToProps= state => {
  return {
  };
};

const mapDispatchToProps= dispatch=>({
  closeDrawing: ()=> dispatch(closeDrawing()),
  enableCircleMode: ()=> dispatch(enableCircleMode()),
  enableCrossMode: () => dispatch(enableCrossMode()),
  enableDrawingMode: ()=> dispatch(enableDrawingMode()),
  saveToMongoDB: ()=> dispatch(saveToMongoDB()),
  restoreDrawingFromMongoDB: ()=>dispatch(restoreDrawingFromMongoDB()),
  clearDrawing: ()=> dispatch(clearAllKonvaElements())
});

export default connect(mapStateToProps, mapDispatchToProps)(DrawingToolBar);
