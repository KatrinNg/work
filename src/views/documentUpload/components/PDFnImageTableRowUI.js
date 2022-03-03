// ******************************************************
//  Copyright (C) 2020 Li Cheuk Wai, Tony <tony.li@mongodb.com>
//
//  This file is part of HA Consulting
//
//  HA Consulting can not be copied and/or distributed without the express
//  permission of Li Cheuk Wai, Tony
//  *******************************************************
//
// this file aims to provide table row for collapsible table for keeping the drawing version.

import React from 'react';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp.js';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown.js';
import Collapse from '@material-ui/core/Collapse';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DrawingUI from './DrawingUI.js';

const useStyles = makeStyles({
  root: {
    '& > *': {
      borderBottom: 'unset'
    }
  }
});

export default ({ theDoc, openDrawingFlag, openDrawing, getDrawingHistory, drawingHistory=[],
                  clinicalDocList, openDrawingPreviousVersion})=>{
  const [open, setOpen] = React.useState(false);
  const classes = useStyles();

  // Issue Open Drawing if Doc is defined
  const openDrawingHandle= (theDoc)=>{
    if (theDoc) {
      openDrawing(theDoc);
    }
  };

  // issue when click collapse
  const collapseHandle = ()=>{
    setOpen(!open);
    getDrawingHistory(theDoc.fileID);
  };

  const getTargetDrawingHistory = (theFileID)=>{
    let _result = [];
    if (drawingHistory[theFileID]) _result = drawingHistory[theFileID];
    return _result;
  };

  return (
    <React.Fragment>
      <TableRow data-id={theDoc.fileID} className={classes.root} >
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={collapseHandle}>
            {open ? <KeyboardArrowUpIcon/> : <KeyboardArrowDownIcon/>}
          </IconButton>
        </TableCell>
        <TableCell onClick={() => openDrawingHandle(theDoc)}>{theDoc.fileID}</TableCell>
        <TableCell onClick={() => openDrawingHandle(theDoc)}>{theDoc.fileName}</TableCell>
        <TableCell onClick={() => openDrawingHandle(theDoc)}>{theDoc.fileSize}</TableCell>
        <TableCell onClick={() => openDrawingHandle(theDoc)}>{theDoc.createdDatetime}</TableCell>
      </TableRow>
      <TableRow >
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Typography variant="h6" gutterBottom component="div">
                History
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    getTargetDrawingHistory(theDoc.fileID).map((historyRow) => (
                      <TableRow key={historyRow.docID} onClick={() => openDrawingPreviousVersion(historyRow.docID, theDoc)}>
                        <TableCell component="th" scope="row">
                          {historyRow.createdDateTime}
                        </TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};
