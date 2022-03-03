// ******************************************************
//  Copyright (C) 2020 Li Cheuk Wai, Tony <tony.li@mongodb.com>
//
//  This file is part of HA Consulting
//
//  HA Consulting can not be copied and/or distributed without the express
//  permission of Li Cheuk Wai, Tony
//  *******************************************************
//
// this file aims to provide body section for viewing the image and pdf

import React, { useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import PDFnImageListViewContainer from '../containers/PDFnImageListViewContainer';
import UploaderContainer from '../containers/UploaderContainer';

const useListView = ({theUseListViewDateTime, theUseThumbnailViewDateTime})=>{
  let _result = true;
  if (theUseListViewDateTime < theUseThumbnailViewDateTime) _result = false;
  return _result;
};

export default function PDFnImageBodyUI({state, onClick, useListViewDateTime, useThumbnailViewDateTime}) {
  const showView = useListView({theUseListViewDateTime: useListViewDateTime, theUseThumbnailViewDateTime: useThumbnailViewDateTime})?
    <PDFnImageListViewContainer/>:<UploaderContainer/>;
  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {showView}
        </Grid>
      </Grid>
    </div>
  );
}
