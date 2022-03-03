// ******************************************************
//  Copyright (C) 2020 Li Cheuk Wai, Tony <tony.li@mongodb.com>
//
//  This file is part of HA Consulting
//
//  HA Consulting can not be copied and/or distributed without the express
//  permission of Li Cheuk Wai, Tony
//  *******************************************************
//
// this file aims to provide the container for handling image list view events

import { connect } from 'react-redux';
import PDFnImageListViewUI from '../components/PDFnImageListViewUI';
import * as ACTION from '../../../store/actions/documentUpload/documentAction';

const mapStateToProps = state => ({
  clinicalDocList: state.pdfNImageUIReducer.clinicalDocList,
  openDrawingFlag: state.pdfNImageUIReducer.openDrawingFlag
});

const mapDispatchToProps = dispatch=> ({
  openDrawing: (clinicalDoc)=> { dispatch(ACTION.openDrawing(clinicalDoc));}
});

export default connect(mapStateToProps, mapDispatchToProps)(PDFnImageListViewUI);
