// ******************************************************
//  Copyright (C) 2020 Li Cheuk Wai, Tony <tony.li@mongodb.com>
//
//  This file is part of HA Consulting
//
//  HA Consulting can not be copied and/or distributed without the express
//  permission of Li Cheuk Wai, Tony
//  *******************************************************
//
// this file aims to provide the drawing pad component for drawing and adapted Konva for drawing


import React from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Konva from 'konva';
import * as ACTION from '../../../store/actions/documentUpload/documentAction';
import Constant from '../../../constants/documentUpload/Constant';
import util from 'util';


class DrawingPad extends React.Component {
  constructor() {
    super();
  }

  // When the dialog reopened from the List UI
  componentDidMount() {
    this.buildStage({ theSavedStage: this.props.savedStage, theClinicalDoc: this.props.clinicalDoc });
  }

  isPenDrawing = false;
  lastLine = null;
  stage = null;
  drawingLayer = null;
  backgroundLayer = null;
  backgroundImage = null;
  image = null;

  // Rebuild the Drawing Pad
  buildStage = ({ theSavedStage, theClinicalDoc }) => {
    // This avoids the new changes being replaced when switch the drawing mode.
    if (this.props.restoreDrawingDateTime< this.props.updateDrawingDateTime &&
    this.props.clearDrawingDateTime < this.props.updateDrawingDateTime) return;

    if (this.stageContainer !== undefined) {
      // build a new stage node to 'stage' div
      if (theSavedStage && (this.props.restoreDrawingDateTime>= this.props.updateDrawingDateTime &&
        this.props.restoreDrawingDateTime>= this.props.clearDrawingDateTime)) {
        this.stage = Konva.Stage.create(theSavedStage, 'stage');
        this.drawingLayer = this.stage.findOne('#drawingLayer');
      } else {
        this.stage = new Konva.Stage({
          container: 'stage',
          width: window.innerWidth,
          height: window.innerHeight
        });
        this.drawingLayer = new Konva.Layer({ id: 'drawingLayer' });
        this.stage.add(this.drawingLayer);
      }

      // build background image layer
      this.backgroundLayer = new Konva.Layer({ id: 'backgroundImageLayer' });
      this.stage.add(this.backgroundLayer);
      this.image = new window.Image();
      this.image.width = window.innerWidth;
      this.image.height =  window.innerHeight;

      // Directly Map the Download URL for Image
      this.image.src = util.format('%s%s%s', Constant.targetDownloadServiceURL, 'downloadBinary/', theClinicalDoc.fileID);
      this.backgroundImage = new Konva.Image({ image: this.image });
      this.backgroundLayer.add(this.backgroundImage);
      this.image.addEventListener('load', this.handleLoad);
      this.backgroundLayer.moveToBottom();

      this.stage.on('mousedown', this.mouseDownHandle);
      this.stage.on('mouseup', this.mouseUpHandle);
      this.stage.on('mousemove', this.mouseMoveHandle);
      this.stage.on('mouseleave', this.mouseLeaveHandle);
      console.log('Build Drawing Pad Completed');
    }
  }

  mouseDownHandle = (theEvent) => {
    console.log(theEvent);
    switch (this.props.currentDrawingMode) {
      case ACTION.ENABLE_CIRCLE:
        this.addCircle(theEvent);
        break;
      case ACTION.ENABLE_CROSS:
        this.addCross(theEvent);
        break;
      case ACTION.ENABLE_DRAWING:{
        this.isPenDrawing = true;
        let pos = this.stage.getPointerPosition();
        this.lastLine = new Konva.Line({
          stroke: '#df4b26',
          strokeWidth: 5,
          globalCompositeOperation: 'source-over',
          points: [pos.x, pos.y]
        });
        this.drawingLayer.add(this.lastLine);
        this.drawAfterChanges();
        break;
      }
    }
  }

  // This dispatch the drawing to Redux
  drawAfterChanges = () => {
    this.backgroundLayer.moveToBottom();
    this.drawingLayer.draw();
    this.props.updateDrawing(this.stage.toJSON());
  }

  addCircle = (theEvent) => {
    const _circle = new Konva.Circle({ x: theEvent.evt.layerX, y: theEvent.evt.layerY, radius: 10, stroke: 'red' });
    this.drawingLayer.add(_circle);
    this.drawAfterChanges();
  }

  addCross = (theEvent) => {
    const _x1 = theEvent.evt.layerX - 10;
    const _x2 = theEvent.evt.layerX + 10;
    const _y1 = theEvent.evt.layerY - 10;
    const _y2 = theEvent.evt.layerY + 10;
    const _line1 = new Konva.Line({ points: [_x1, _y1, _x2, _y2], stroke: 'red' });
    const _line2 = new Konva.Line({ points: [_x2, _y1, _x1, _y2], stroke: 'red' });
    this.drawingLayer.add(_line1);
    this.drawingLayer.add(_line2);
    this.drawAfterChanges();
  }

  mouseMoveHandle = (theEvent) => {
    if (this.isPenDrawing === true) {
      const pos = this.stage.getPointerPosition();
      let newPoints = this.lastLine.points().concat([pos.x, pos.y]);
      this.lastLine.points(newPoints);
      this.drawAfterChanges();
    }
  }

  mouseUpHandle = (theEvent) => {
    this.isPenDrawing = false;
  }

  mouseLeaveHandle = (theEvent) => {
    this.isPenDrawing = false;
  }

  // When the Image is loaded From the URL, then redraw the Image Layer
  handleLoad = () => {
    this.backgroundLayer.draw();
  }

  render() {
    return (
      <Grid container>
        <Grid item xs={12}>
          <Paper>
            {// Create the Stage, the is the container for all Konva elements
            }
            <div ref={(ref) => {
              this.stageContainer = ref;
            }} id={'stage'} isload={
              this.buildStage({theSavedStage: this.props.savedStage,
              theClinicalDoc: this.props.clinicalDoc})
            }
            >
            </div>
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

export default DrawingPad;
