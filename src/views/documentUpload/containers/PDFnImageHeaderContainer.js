// ******************************************************
//  Copyright (C) 2020 Li Cheuk Wai, Tony <tony.li@mongodb.com>
//
//  This file is part of HA Consulting
//
//  HA Consulting can not be copied and/or distributed without the express
//  permission of Li Cheuk Wai, Tony
//  *******************************************************
//
// this file aims to provide the container for handling image header component event

import { connect } from 'react-redux';
import PDFnImageHeaderUI from '../components/PDFnImageHeaderUI';
import * as ACTION from '../../../store/actions/documentUpload/documentAction';

const mapDispatchToProps = (dispatch)=>({
  useListView: () => dispatch(ACTION.useListView()),
  useThumbnailView: ()=> dispatch(ACTION.useThumbnailView())
});

const mapStateToProps = state => ({
  PMI: state.pdfNImageUIReducer.PMI,
  EncounteredID: state.pdfNImageUIReducer.encounteredID,
  CreatedBy: state.pdfNImageUIReducer.createdBy
});

export default connect(mapStateToProps, mapDispatchToProps)(PDFnImageHeaderUI);
