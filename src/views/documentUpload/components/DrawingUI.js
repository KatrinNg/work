// ******************************************************
//  Copyright (C) 2020 Li Cheuk Wai, Tony <tony.li@mongodb.com>
//
//  This file is part of HA Consulting
//
//  HA Consulting can not be copied and/or distributed without the express
//  permission of Li Cheuk Wai, Tony
//  *******************************************************
//
// this file aims to provide container for the drawing components

import React from 'react';
import DrawingPadContainter from '../containers/DrawingPadContainter.js';
import DrawingToolBarContainer from '../containers/DrawingToolBarContainer.js';

export default () => {
  return (
    <React.Fragment>
      <DrawingToolBarContainer/>
      <DrawingPadContainter/>
    </React.Fragment>
  );
};
