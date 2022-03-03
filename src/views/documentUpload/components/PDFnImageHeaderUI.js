// ******************************************************
//  Copyright (C) 2020 Li Cheuk Wai, Tony <tony.li@mongodb.com>
//
//  This file is part of HA Consulting
//
//  HA Consulting can not be copied and/or distributed without the express
//  permission of Li Cheuk Wai, Tony
//  *******************************************************
//
// this file aims to provide header section for placing buttons

import React from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import axios from 'axios';
import { Toolbar } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import ViewListIcon from '@material-ui/icons/ViewList';
import ViewModuleIcon from '@material-ui/icons/ViewModule';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Constant from '../../../constants/documentUpload/Constant';
import util from 'util';

export default function PDFnImageHeaderUI({onClick, useListView, useThumbnailView, PMI, EncounteredID, CreatedBy}) {
  const [open, setOpen] = React.useState(false);
  const [remarks, setRemarks] = React.useState('');

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  //Handle for single File upload
  const onFileChangeHandler = (e) => {
    console.log('Uploader called');
    e.preventDefault();
    const formData = new FormData();
    formData.append('PMI', PMI);
    formData.append('EncounteredID', EncounteredID);
    formData.append('CreatedBy', CreatedBy);
    formData.append('Remarks', remarks);
    formData.append('file', e.target.files[0]);

    axios.post(util.format('%supload', Constant.targetUploadServiceURL), formData).then((res) => {
      if (res.status === 200) {
        //alert('File uploaded successfully.');
      }
    });
  };

  const handleRemarks=(e) =>{
    setRemarks(e.target.value);
  };
  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={1}>
          <div>
            <Toolbar>
              <ButtonGroup>
              <IconButton onClick={useListView}>
                <ViewListIcon></ViewListIcon>
              </IconButton>
                <IconButton onClick={useThumbnailView}>
                  <ViewModuleIcon></ViewModuleIcon>
                </IconButton>
              </ButtonGroup>
            <Button variant="outlined" color="primary" onClick={handleClickOpen}>
              Upload
            </Button>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
              <DialogTitle id="form-dialog-title">Upload Form</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Upload Document(s)
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Remarks"
                    type="text"
                    fullWidth
                    onChange={handleRemarks}
                />
                <Button color="primary">
                  <input type="file" className="form-control" name="file" onChange={onFileChangeHandler}/>
                </Button>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose} color="primary">
                  Done
                </Button>
              </DialogActions>
            </Dialog>
            </Toolbar>
          </div>
        </Grid>
      </Grid>
    </div>

  );
}
