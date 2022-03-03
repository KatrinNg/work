import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import "./css/input.css";

let setInputOldValue;
class PCInputBox extends Component {
  constructor(props){
    super(props);
  }

  handleFocus = (inputId) => {
    setInputOldValue = document.getElementById(inputId).value;
  }

  render(){
    const {handleChange, handleClick, toothNum, toothSeq, type, isDisable, isView, scale, fontSize, ...rest } = this.props;
    
    let isNone;
    let defBorder = '1px solid black';
    let backColor;
    let val;
    
    if (isView) {
      isNone = 'none';
    } 

    if (isDisable) {
      isNone = 'none';
      defBorder = 'none';
      backColor = '#bfbfbf';
      val = '';
    }

    const style = {
      height: 30,
      width: 30 * scale,
      border: 'none',
      padding: '0 0 0 0',
      textAlign: 'center',
      color: 'black',
      fontFamily: 'Arial, MingLiU, Helvertica, Sans-serif, Arial Unicode MS',
      pointerEvents: isNone,
      backgroundColor: backColor,
      fontSize: 20 * fontSize
    };

    const td_style = {
      border: defBorder,
      height: 30 * scale,
      width: 30 * scale,
      backgroundColor: backColor,
      align: 'center',
      borderCollapse: 'collapse',
      padding: '0 0 0 0'
    };

    const dir_style = {
      align: 'center',
      borderCollapse: 'collapse',
      padding: '0 0 0 0'
    };

    const tr_style = {
    };

    const td_style_2In = {
      border: defBorder,
      width: 90 * scale,
      height: 30 * scale,
      borderCollapse: 'collapse',
      padding: '0 0 0 0'
    };

    let loop = [];
    let x = 0;
    let upperInputLoop = [];
    let lowerInputLoop = [];
    if (toothSeq === 6) {
      for (x = 0; x < toothSeq; x++) {loop.push(x);}
      upperInputLoop = loop.map((seq) => {
        if (seq <= 2) {
          return (<td style={td_style}><input type="text" value={val} onFocus={e => this.handleFocus(e.target.id)} id={"pcInput-" + type + "_" + toothNum + "_" + seq} onChange={e => handleChange(e.target.id, setInputOldValue)} onClick={e => handleClick(e.target.id)} style={style}/></td>);
        }
      });
      lowerInputLoop = loop.map((seq) => {
        if (seq > 2 && seq <= 6) {
          return (<td style={td_style}><input type="text" value={val} onFocus={e => this.handleFocus(e.target.id)} id={"pcInput-" + type + "_" + toothNum + "_" + seq} onChange={e => handleChange(e.target.id, setInputOldValue)} onClick={e => handleClick(e.target.id)} style={style}/></td>);
        }
      });
    } else {
      return (
        <div>
          <tr style={tr_style}><td style={td_style_2In}><input type="text" value={val} onFocus={e => this.handleFocus(e.target.id)} id={"pcInput-" + type + "_" + toothNum + "_10"} onChange={e => handleChange(e.target.id, setInputOldValue)} onClick={e => handleClick(e.target.id)} style={style}/></td></tr>
          <tr style={tr_style}><td style={td_style_2In}><input type="text" value={val} onFocus={e => this.handleFocus(e.target.id)} id={"pcInput-" + type + "_" + toothNum + "_11"} onChange={e => handleChange(e.target.id, setInputOldValue)} onClick={e => handleClick(e.target.id)} style={style}/></td></tr>
        </div>
      );
    }
    return (
      <div>
        <table style={dir_style}>
        <tr style={tr_style}>{upperInputLoop}</tr>
        <tr style={tr_style}>{lowerInputLoop}</tr>
        </table>
      </div>
    );
  }
}

export default (PCInputBox);