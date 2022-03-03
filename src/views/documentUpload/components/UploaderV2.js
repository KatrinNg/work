// ******************************************************
//  Copyright (C) 2020 Li Cheuk Wai, Tony <tony.li@mongodb.com>
//
//  This file is part of HA Consulting
//
//  HA Consulting can not be copied and/or distributed without the express
//  permission of Li Cheuk Wai, Tony
//  *******************************************************
//
// this file aims to provide the reactJS UI for uploading files to mongoDB as a single file or GridFS
//

import React from 'react';
import BinaryFileView from './BinaryFileViewV2.js';
import BinaryFileViewForNonImage from './BinaryFileViewForNonImageV2.js';
import Grid from '@material-ui/core/Grid';

function Uploader({clinicalDocList}) {
  console.log('abccccccccccccccccccc');
    console.log(clinicalDocList);
  return (
    //The main UI
    <Grid container spacing={2} style={{width:'100%'}}>
      {
        clinicalDocList ? clinicalDocList.map((_file) => {
          if (_file.fileType ==='image') return <Grid item xs={2}><BinaryFileView props={_file}/></Grid>;
          else return <Grid  item xs={2}><BinaryFileViewForNonImage props={_file}/></Grid>;
        }):<div/>
      }
    </Grid>
  );
}


export default Uploader;
