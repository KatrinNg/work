// ******************************************************
//  Copyright (C) 2020 Li Cheuk Wai, Tony <tony.li@mongodb.com>
//
//  This file is part of HA Consulting
//
//  HA Consulting can not be copied and/or distributed without the express
//  permission of Li Cheuk Wai, Tony
//  *******************************************************
//
// this file aims to provide List view for presenting the documents

import React, { useState } from 'react';
import { Container } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Dialog from '@material-ui/core/Dialog';
import DrawingUI from './DrawingUI.js';
import makeStyles from '@material-ui/core/styles/makeStyles.js';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import IconButton from '@material-ui/core/IconButton';
import Box from '@material-ui/core/Box';
import Collapse from '@material-ui/core/Collapse';
import Typography from '@material-ui/core/Typography';
import PDFnImageTableRowUI from './PDFnImageTableRowUI.js';
import PDFnImageTableRowContainer from '../containers/PDFnImageTableRowContainer.js';
import DrawingUIContainer from '../containers/DrawingUIContainer.js';

const useRowStyles = makeStyles({
  root: {
    '& > *': {
      borderBottom: 'unset'
    }
  }
});

export default ({ clinicalDocList, openDrawing, openDrawingFlag }) => {
  let _result = [];
  const classes = useRowStyles();

  const openDrawingDialog = (theEvent) => {
    clinicalDocList.map((theDoc) => {
      if (theDoc.fileID === theEvent.currentTarget.dataset.id) openDrawing(theDoc);
    });
  };

  return (
    <React.Fragment>
      {
      <Dialog fullScreen open={openDrawingFlag}>
        <DrawingUIContainer/>
      </Dialog>
      }
      {/* <Container component={Paper}> */}
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>File ID</TableCell>
              <TableCell>File Name</TableCell>
              <TableCell>File Size</TableCell>
              <TableCell>Created Date Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              //buildTableData({ theClinicalDocList: clinicalDocList })
              clinicalDocList? clinicalDocList.map(theDoc=>(
                // <div key={theDoc}>
                <PDFnImageTableRowContainer key={theDoc} theDoc={theDoc} openDrawing={openDrawing}></PDFnImageTableRowContainer>
                // </div>
              )): <div/>
            }

          </TableBody>
        </Table>
      {/* </Container> */}
    </React.Fragment>
  );
};
