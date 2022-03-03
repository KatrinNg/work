// ******************************************************
//  Copyright (C) 2020 Li Cheuk Wai, Tony <tony.li@mongodb.com>
//
//  This file is part of HA Consulting
//
//  HA Consulting can not be copied and/or distributed without the express
//  permission of Li Cheuk Wai, Tony
//  *******************************************************
//
// this file aims to provide the reactJS UI for hooking up with HA UI
// Expecting Arguments
// 1. Service String
// 2. CreatedBy String
// 3. PMI String
// 4. EncounteredID String
//

import React from 'react';
import PDFnImageHeaderContainer from '../containers/PDFnImageHeaderContainer.js';
import PDFnImageBodyContainer from '../containers/PDFnImageBodyContainer.js';
import makeStyles from '@material-ui/core/styles/makeStyles.js';

const useStyles = makeStyles({
  root: {
    backgroundColor: 'white'
  },
  typography: {
    color: 'black'
  }
});

export default function PDFnImageUI({PMI, EncounteredID, CreatedBy}) {
  const classes = useStyles();
  return (
    <div className={classes.root} style={{width:'100%'}}>
      <h4 className={classes.typography}> hidden line-- PMI: {PMI}, EncounteredID: {EncounteredID}, Created By: {CreatedBy}</h4>
      <div>
        <PDFnImageHeaderContainer/>
        <PDFnImageBodyContainer/>
      </div>
    </div>
    );
}
