// ******************************************************
//  Copyright (C) 2020 Li Cheuk Wai, Tony <tony.li@mongodb.com>
//
//  This file is part of HA Consulting
//
//  HA Consulting can not be copied and/or distributed without the express
//  permission of Li Cheuk Wai, Tony
//  *******************************************************
//
// this file aims to provide the container for handling image body component event

import { connect } from 'react-redux';
import PDFnImageBodyUI from '../components/PDFnImageBodyUI';
import * as ACTION from '../../../store/actions/documentUpload/documentAction';

const mapStateToProps = state => ({
  useListViewDateTime: state.pdfNImageUIReducer.useListViewDateTime,
  useThumbnailViewDateTime: state.pdfNImageUIReducer.useThumbnailViewDateTime
});

const mapDispatchToProps = dispatch =>({
  getClinicalDocList: ()=> dispatch(ACTION.getClinicalDocList())
});

export default connect(mapStateToProps, mapDispatchToProps)(PDFnImageBodyUI);
