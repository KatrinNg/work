// ******************************************************
//  Copyright (C) 2020 Li Cheuk Wai, Tony <tony.li@mongodb.com>
//
//  This file is part of HA Consulting
//
//  HA Consulting can not be copied and/or distributed without the express
//  permission of Li Cheuk Wai, Tony
//  *******************************************************
//
// this file aims to provide container for the table row

import { connect } from 'react-redux';
import * as ACTION from '../../../store/actions/documentUpload/documentAction';
import PDFnImageTableRowUI from '../components/PDFnImageTableRowUI';

const mapStateToProps = state => ({
  drawingHistory: state.pdfNImageUIReducer.drawingHistory,
  clinicalDocList: state.pdfNImageUIReducer.clinicalDocList
});

const mapDispatchToProps = dispatch=> ({
  openDrawingPreviousVersion: (drawingDocID, clinicalDoc) => {dispatch(ACTION.openDrawingPreviousVersion(drawingDocID, clinicalDoc));},
  openDrawing: (clinicalDoc)=> { dispatch(ACTION.openDrawing(clinicalDoc));},
  getDrawingHistory: (parentDocID) => {dispatch(ACTION.getDrawingHistory(parentDocID));}
});

export default connect(mapStateToProps, mapDispatchToProps)(PDFnImageTableRowUI);
