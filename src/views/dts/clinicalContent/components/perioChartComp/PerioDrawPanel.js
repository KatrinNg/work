import React, { Component } from "react";
import { Stage, Layer, Text, Shape } from "react-konva";


class PerioDrawPanel extends Component {

  constructor(props){
    super(props);
    this.state = {
    };
  }

  componentWillMount() {
  }

  componentDidMount() {
  }

  componentDidUpdate(prevProps) {
  }

  componentWillUnmount() {
  }

  handleTriangleDraw = (val, obj) => {
    switch (val) {
      case 0:
        obj.color = "#ffffff"; obj.lineWidth = 0; return obj;
      case 1:
        obj.color = "#ffffff"; obj.lineWidth = 1; return obj;
      case 2:
        obj.color = "#990000"; obj.lineWidth = 0; return obj;
      default:
        obj.color = "#ffffff"; obj.lineWidth = 0; return obj;
    }
  }

  handleMidLeftDraw = (val, obj) => {
    switch (val) {
      case 0:
        obj.text = ""; return obj;
      case 1:
        obj.text = "+ve"; return obj;
      case 2:
        obj.text = "-ve"; return obj;
      default:
    }
  }

  handleMidRightDraw = (val, obj) => {
    switch (val) {
      case 0:
        obj.text = ""; return obj;
      case 1:
        obj.text = "I"; return obj;
      case 2:
        obj.text = "II"; return obj;
      case 3:
        obj.text = "III"; return obj;
      default:
        obj.text = ""; return obj;
    }
  }

  handleTopLeftDraw = (val, obj) => {
    switch (val) {
      case 0:
        obj.width = 20; obj.height = 15; obj.fontSize = 10; obj.opacity = 0.2; return obj;
      case 1:
        obj.width = 80; obj.height = 50; obj.fontSize = 30; obj.opacity = 1; return obj;
      default:
        obj.width = 20; obj.height = 15; obj.fontSize = 10; obj.opacity = 0.2; return obj;
    }
  }

  render(){
    const {pdState, handleClick, border, scale} = this.props;
    let left = {color: "", lineWidth: ""};
    let right = {color: "", lineWidth: ""};
    let top = {color: "", lineWidth: ""};
    let bottom = {color: "", lineWidth: ""};
    let midLeft = {text: ""};
    let midRight = {text: ""};
    let topLeft = {width: "", height: "", fontSize: "", opacity: ""};

    left = this.handleTriangleDraw(pdState.left.val, left);
    right = this.handleTriangleDraw(pdState.right.val, right);
    top = this.handleTriangleDraw(pdState.top.val, top);
    bottom = this.handleTriangleDraw(pdState.bottom.val, bottom);
    midLeft = this.handleMidLeftDraw(pdState.midLeft.val, midLeft);
    midRight = this.handleMidRightDraw(pdState.midRight.val, midRight);
    topLeft = this.handleTopLeftDraw(pdState.topLeft.val, topLeft);

    return (
      <table border={border}>
        <Stage width={90 * scale} height={60 * scale}>
          <Layer>
            <Shape
                sceneFunc={(context, shape) => {
                  context.beginPath();
                  context.moveTo(0 * scale, 10 * scale);
                  context.lineTo(0 * scale, 50 * scale);
                  context.lineTo(20 * scale, 30 * scale);
                  context.closePath();
                  context.fillStrokeShape(shape);
                }}
                fill={left.color}
                name="left"
                stroke="#990000"
                strokeWidth={left.lineWidth}
                onClick={handleClick}
            />
            <Shape
                sceneFunc={(context, shape) => {
                  context.beginPath();
                  context.moveTo(20 * scale, 0 * scale);
                  context.lineTo(70 * scale, 0 * scale);
                  context.lineTo(45 * scale, 20 * scale);
                  context.closePath();
                  context.fillStrokeShape(shape);
                }}
                fill={top.color}
                name="top"
                stroke="#990000"
                strokeWidth={top.lineWidth}
                onClick={handleClick}
            />
            <Shape
                sceneFunc={(context, shape) => {
                  context.beginPath();
                  context.moveTo(90 * scale, 10 * scale);
                  context.lineTo(90 * scale, 50 * scale);
                  context.lineTo(70 * scale, 30 * scale);
                  context.closePath();
                  context.fillStrokeShape(shape);
                }}
                fill={right.color}
                name="right"
                stroke="#990000"
                strokeWidth={right.lineWidth}
                onClick={handleClick}
            />
            <Shape
                sceneFunc={(context, shape) => {
                  context.beginPath();
                  context.moveTo(20 * scale, 60 * scale);
                  context.lineTo(70 * scale, 60 * scale);
                  context.lineTo(45 * scale, 40 * scale);
                  context.closePath();
                  context.fillStrokeShape(shape);
                }}
                fill={bottom.color}
                name="bottom"
                stroke="#990000"
                strokeWidth={bottom.lineWidth}
                onClick={handleClick}
            />
            <Text
                name="midLeft"
                fontSize={15 * scale}
                text={midLeft.text}
                fontFamily="Arial"
                align="right"
                verticalAlign="middle"
                width={35 * scale}
                height={25 * scale}
                x={11 * scale}
                y={17 * scale}
                onClick={handleClick}
            />
            <Text
                name="midRight"
                fontSize={20 * scale}
                text={midRight.text}
                fontFamily="Arial"
                align="center"
                verticalAlign="middle"
                width={25 * scale}
                height={20 * scale}
                x={45 * scale}
                y={22 * scale}
                onClick={handleClick}
            />
            <Text
                name="topLeft"
                fontSize={topLeft.fontSize * scale}
                text="NC"
                opacity={topLeft.opacity}
                fontFamily="Arial"
                align="center"
                verticalAlign="middle"
                width={topLeft.width * scale}
                height={topLeft.height * scale}
                x={2 * scale}
                y={2 * scale}
                onClick={handleClick}
            />
          </Layer>
        </Stage>
      </table>
    );
  }
}

export default (PerioDrawPanel);