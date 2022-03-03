import "./components/perioChartComp/css/textarea.css";
import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import { connect } from 'react-redux';
import { MuiThemeProvider, withStyles } from '@material-ui/core/styles';
import dtstheme from '../theme';
import Typography from '@material-ui/core/Typography';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import PCInputBox from "./components/perioChartComp/PCInputBox";
import PerioDraw from "./components/perioChartComp/PerioDraw";
import PerioDrawTextField from "./components/perioChartComp/PerioDrawTextField";
import PerioDrawControl from "./components/perioChartComp/PerioDrawControl";
import _ from 'lodash';
import { getNextPCInputBoxId, 
  getPrevPCInputBoxId, 
  cleanPockInputBoxVal, 
  cleanRecInputBoxVal, 
  getPockToothInputType, 
  getRecToothInputType, 
  getListPDStateObj, 
  getListPDStateObjT, 
  getList32WithTwo, 
  getList32WithSix, 
  getToothNumByInputId, 
  getTypeFromInputId, 
  removeArrItem, 
  convertToDtoPerioChart, 
  getBoolByNum, 
  getNumByBool, 
  getDtoPCObj, 
  getDtoPCToothObj,
  getInputPock,
  getInputRec,
  getPCIRes,
  getNum,
  chkPCInputId,
  showPerioChartWithData
} from "./components/perioChartComp/common/PerioChartUnits.js";
import {
  updatePerioChartData_saga
} from '../../../store/actions/dts/clinicalContent/perioChartAction';

const styles = (theme) => ({
  button: {
    borderRadius: 10,
    backgroundColor:"#e0e0eb"
  },
  font: {
    fontFamily: 'Microsoft JhengHei, Calibri',
    fontSize: '12pt',
    color: '#404040'
  },
  addTheme: {
    padding: '0 0 0 0'
  }
});

let dts_perioChart_current_input_id = "";
let dts_perioChart_current_input_stay = false;

class perioChart extends Component {

  constructor(props){
    super(props);

    this.state = {
      inputId: "",
      listPDState: getListPDStateObj(),
      listPCSeq: getList32WithSix,
      // listRecSeq: getList32WithSix,
      listRecSeq: (this.props.location.state.copyPCState.is2RecInput === 1) ? getList32WithTwo : getList32WithSix,
      isRecSixInput: true,
      isFullSeqInputFocus: true,
      isBleedInputMode: false,
      isSuppInputMode: false,
      isConfirmChart: false,
      btnRecInputNumText: "Rec SIX to TWO",
      btnRecInputSeqText: "To Quadrant Mode",
      btnBleedInputText: "Bleed (Mouse)",
      btnSuppInputText: "Supp (Mouse)",
      newEncntrId: this.props.location.state.newEncntrId,
      encntrId: this.props.location.state.copyPCState.encntrId,
      copyPCState: this.props.location.state.copyPCState,
      selToothNum: 0,
      selEPT: 0,
      selMob: 0
    };
  }

  componentWillMount() {
  }

  componentDidMount() {
    let transFormData = showPerioChartWithData(this.props.location.state.copyPCState, "");
    this.setState({
      listPDState: transFormData
    });
    if (this.props.location.state.copyPCState.isCmplChart === 1) {
      this.markCmplChart();
    } else {
      this.unmarkCmplChart();
    }
    document.addEventListener("keyup", this.handleKeyUp, true);
    document.addEventListener("keydown", this.handleKeyDown);
    document.getElementById('perioChart-textArea-Remark-id').value = this.props.location.state.copyPCState.remark;
    if (this.props.location.state.copyPCState.is2RecInput === 1) {
      this.setPCInputWithTwo();
    } else {
      this.setPCInputWithSix();
    }

  }

  componentDidUpdate(prevProps) {
    // if(this.props.currPCDataState != prevProps.currPCDataState) {
    //   let transFormData = showPerioChartWithData(this.props.currPCDataState, "");
    //   this.setState({
    //     listPDState: transFormData
    //   });
    // }
  }

  componentWillUnmount() {
    document.removeEventListener("keyup", this.handleKeyUp);
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  handleKeyDown = (event) => {
    if (chkPCInputId(document.activeElement.id)){
      if (event.keyCode === 9) {
        event.preventDefault();
        event.stopPropagation();
        let getListPDState =  this.state.listPDState;
        if(event.shiftKey) {
          dts_perioChart_current_input_id = this.prevInput(dts_perioChart_current_input_id, getListPDState);
        } else {
          dts_perioChart_current_input_id = this.nextInput(dts_perioChart_current_input_id, getListPDState);
        }
        document.getElementById(dts_perioChart_current_input_id).focus();
        dts_perioChart_current_input_stay = true;
      }
    }
  }

  handleKeyUp = (event) => {
    let inputId = document.activeElement.id;
    if (chkPCInputId(inputId) && !event.shiftKey){
      if (((inputId.indexOf(getPockToothInputType) > -1) && event.keyCode !== 96 && event.keyCode !== 96) || (inputId.indexOf(getRecToothInputType) > -1) ) {
        if (!dts_perioChart_current_input_stay) {
          let getListPDState =  this.state.listPDState;
          dts_perioChart_current_input_id = this.nextInput(dts_perioChart_current_input_id, getListPDState);
          if (dts_perioChart_current_input_id != null) {
            document.getElementById(dts_perioChart_current_input_id).focus();
          }
        }
      } else if (inputId.indexOf(getPockToothInputType) > -1) {
        dts_perioChart_current_input_stay = false;
      }
    }
  }

  nextInput = (id, listPDS) => {
    if ((typeof id) === "string") {
      let fSeq = this.state.isFullSeqInputFocus;
      let sixN = this.state.isRecSixInput;
      let nID = getNextPCInputBoxId(id, fSeq, sixN);

      while ((listPDS[getToothNumByInputId(nID)].props.isExtract) || (listPDS[getToothNumByInputId(nID)].topLeft.val === 1)) {
        nID = getNextPCInputBoxId(nID, fSeq, sixN);
      }
      document.getElementById(nID).focus();
      return nID;
    } else {
      return null;
    }
  }

  prevInput = (id, listPDS) => {
    let fSeq = this.state.isFullSeqInputFocus;
    let sixN = this.state.isRecSixInput;
    let nID = getPrevPCInputBoxId(id, fSeq, sixN);

    while ((listPDS[getToothNumByInputId(nID)].props.isExtract) || (listPDS[getToothNumByInputId(nID)].topLeft.val === 1)) {
      nID = getPrevPCInputBoxId(nID, fSeq, sixN);
    }
    document.getElementById(nID).focus();
    return nID;
  }

  savePerioChart = (e) => {
    let objPCDto = getDtoPCObj;
    let isRecSixInput = this.state.isRecSixInput;
    let isCompleteChart = this.state.isCompleteChart;
    let listPDState = this.state.listPDState;

    objPCDto.encntrId = this.state.newEncntrId;
    objPCDto.dspTooth = 'P';
    objPCDto.is2RecInput = getNumByBool(!isRecSixInput);
    objPCDto.remark = document.getElementById('perioChart-textArea-Remark-id').value;
    objPCDto.isPerioTeam = 0;
    objPCDto.isCmplChart = getNumByBool(isCompleteChart);
    objPCDto.createBy = 'Derek';
    objPCDto = convertToDtoPerioChart(getDtoPCObj, listPDState);

    this.props.updatePerioChartData_saga(objPCDto);
  }

  handlePCInputChange = (inputId, inputOldValue) => {
    let nVal = document.getElementById(inputId).value;
    let type = getTypeFromInputId(inputId);
    let pcIR;
    if (type === getPockToothInputType) {
      pcIR = getInputPock(inputOldValue, nVal);
    } else {
      pcIR = getInputRec(inputOldValue, nVal);
    }
    document.getElementById(inputId).value = pcIR.val;
    dts_perioChart_current_input_stay = pcIR.stay;
    if (pcIR.color !== null) {
      document.getElementById(inputId).style.backgroundColor = pcIR.color;
      if (type === getPockToothInputType) {
        let getListPDState =  this.state.listPDState;
        dts_perioChart_current_input_id = this.nextInput(dts_perioChart_current_input_id, getListPDState);
        document.getElementById(dts_perioChart_current_input_id).focus();
      }
    }
  }

  changeRecInputNum = () => {
    let isRec6Input = this.state.isRecSixInput;
    if (!isRec6Input) {
      cleanRecInputBoxVal(false);
      this.setPCInputWithSix();
    } else {
      cleanRecInputBoxVal(isRec6Input);
      this.setPCInputWithTwo();
    }
  }

  setPCInputWithSix = () => {
    this.setState({
      listRecSeq: getList32WithSix,
      isRecSixInput: true,
      btnRecInputNumText: "Rec SIX to TWO"
    });
  }

  setPCInputWithTwo = () => {
    this.setState({
      listRecSeq: getList32WithTwo,
      isRecSixInput: false,
      btnRecInputNumText: "Rec TWO to SIX"
    });
  }

  markCmplChart = () => {
    this.setState({
      isCompleteChart: true,
      btnCompleteChartText: 'Mark as NOT Completed Chart'
    });
  }

  unmarkCmplChart = () => {
    this.setState({
      isCompleteChart: false,
      btnCompleteChartText: 'Mark as Completed Chart'
    });
  }

  changeCompleteChart = () => {
    if (!this.state.isCompleteChart) {
      this.markCmplChart();
    } else {
      this.unmarkCmplChart();
    }
  }

  changePCInputSeq = () => {
    if (this.state.isFullSeqInputFocus) {
      this.setState({
        isFullSeqInputFocus: false,
        btnRecInputSeqText: "To Convention Mode"
      });
    } else {
      this.setState({
        isFullSeqInputFocus: true,
        btnRecInputSeqText: "To Quadrant Mode"
      });
    }
  }

  changeBleedMode = () => {
    if (this.state.isBleedInputMode) {
      this.setState({
        isBleedInputMode: false,
        btnBleedInputText: 'Bleed (Mouse)'
      });
    } else {
      this.setState({
        isBleedInputMode: true,
        btnBleedInputText: 'Bleed (Num)'
      });
    }
  }

  changeSuppMode = () => {
    if (this.state.isSuppInputMode) {
      this.setState({
        isSuppInputMode: false,
        btnSuppInputText: 'Supp (Mouse)'
      });
    } else {
      this.setState({
        isSuppInputMode: true,
        btnSuppInputText: 'No Supp'
      });
    }
  }

  changeConfirmChart = () => {
    if (this.state.isConfirmChart) {
      this.setState({
        isConfirmChart: false,
        btnConfirmChartText: "Perio Chart not confirm"
      });
    } else {
      this.setState({
        isConfirmChart: true,
        btnConfirmChartText: "Perio Chart confirmed"
      });
    }
  }

  createNewChart = () => {
    this.setState({listPDState : getListPDStateObj()});
    cleanPockInputBoxVal();
    cleanRecInputBoxVal(this.state.isRecSixInput);
  }

  handleTriangleDraw = (i, segment, val) => {
    switch (val) {
      case 0:
        this.setState(prevState => {
          let item = Object.assign({}, prevState.listPDState[i]); eval("item." + segment + ".val = 0;"); return { item };
        });
        break;
      case 1:
        this.setState(prevState => {
          let item = Object.assign({}, prevState.listPDState[i]); eval("item." + segment + ".val = 1;"); return { item };
        });
        break;
      case 2:
        this.setState(prevState => {
          let item = Object.assign({}, prevState.listPDState[i]); eval("item." + segment + ".val = 2;"); return { item };
        });
        break;
      default:
        break;
    }
  }

  handleMidLeftDraw = (i, segment, val) => {
    switch (val) {
      case 0:
        this.setState(prevState => {
          let item = Object.assign({}, prevState.listPDState[i]); eval("item." + segment + ".val = 0;"); return { item };
        });
        break;
      case 1:
        this.setState(prevState => {
          let item = Object.assign({}, prevState.listPDState[i]); eval("item." + segment + ".val = 1;"); return { item };
        });
        break;
      case 2:
        this.setState(prevState => {
          let item = Object.assign({}, prevState.listPDState[i]); eval("item." + segment + ".val = 2;"); return { item };
        });
        break;
      default:
    }
  }

  handleMidRightDraw = (i, segment, val) => {
    switch (val) {
      case 0:
        this.setState(prevState => {
          let item = Object.assign({}, prevState.listPDState[i]); eval("item." + segment + ".val = 0;"); return { item };
        });
        break;
      case 1:
        this.setState(prevState => {
          let item = Object.assign({}, prevState.listPDState[i]); eval("item." + segment + ".val = 1;"); return { item };
        });
        break;
      case 2:
        this.setState(prevState => {
          let item = Object.assign({}, prevState.listPDState[i]); eval("item." + segment + ".val = 2;"); return { item };
        });
        break;
      case 3:
        this.setState(prevState => {
          let item = Object.assign({}, prevState.listPDState[i]); eval("item." + segment + ".val = 3;"); return { item };
        });
        break;
      default:
    }
  }

  handleTopLeftDraw = (i, segment, val) => {
    switch (val) {
      case 0:
        this.setState(prevState => {
          let item = Object.assign({}, prevState.listPDState[i]); eval("item." + segment + ".val = 0;"); return { item };
        });
        break;
      case 1:
        this.setState(prevState => {
          let item = Object.assign({}, prevState.listPDState[i]); eval("item." + segment + ".val = 1;"); return { item };
        });
        break;
      default:
    }
  }

  handleCleanDraw = (i) => {
    this.setState(prevState => {
      let item = Object.assign({}, prevState.listPDState[i]);
      item.top.val = 0;
      item.bottom.val = 0;
      item.left.val = 0;
      item.right.val = 0;
      item.midLeft.val = 0;
      item.midRight.val = 0;
      return { item };
    });
  }

  handlePerioDrawOnClick = (i, e) => {
    let curSelToothNum = this.state.selToothNum;
    let name = e.target.attrs.name;
    let oVal = eval("this.state.listPDState[" + i + "]." + name + ".val") + 1;
    if (curSelToothNum != i) {
      this.setState({selToothNum: i});
    } 
    if (name === "top" || name === "bottom" || name === "left" || name === "right") {
      oVal = (oVal > 2) ? 0 : oVal;
      this.handleTriangleDraw(i, name, oVal);
    } else if (name === "midLeft") {
      oVal = (oVal > 2) ? 0 : oVal;
      this.handleMidLeftDraw(i, name, oVal);
    } else if (name === "midRight") {
      oVal = (oVal > 3) ? 0 : oVal;
      this.handleMidRightDraw(i, name, oVal);
    } else if (name === "topLeft") {
      oVal = (oVal > 1) ? 0 : oVal;
      if (oVal === 1) {
        this.handleCleanDraw(i);
      }
      this.handleTopLeftDraw(i, name, oVal);
    } else {
      console.log("Derek handlePerioDrawOnClick - no match");
    }
  };

  handlePerioDrawControlOnClick = (e) => {
    let i = parseInt(this.state.selToothNum);
    let name = e.target.attrs.name;
    let oVal = eval("this.state.listPDState[" + i + "]." + name + ".val") + 1;
    if (name === "top" || name === "bottom" || name === "left" || name === "right") {
      oVal = (oVal > 2) ? 0 : oVal;
      this.handleTriangleDraw(i, name, oVal);
    }
  };

  handleDrawConfirmOnClick = (e) => {
    let getListPDState =  this.state.listPDState;
    let selTNum = parseInt(this.state.selToothNum);

    selTNum = selTNum === 31 ? selTNum = 0 : selTNum + 1;
    while ((getListPDState[selTNum].props.isImplant) || (getListPDState[selTNum].props.isExtract) || (getListPDState[selTNum].topLeft.val === 1)) {
      selTNum = selTNum === 31 ? selTNum = 0 : selTNum + 1;
    }

    let nc = (this.state.listPDState[selTNum].topLeft.val === 0) ? false : true;
    this.setState({selEPT: this.state.listPDState[selTNum].midLeft.val});
    this.setState({selMob: this.state.listPDState[selTNum].midRight.val});
    this.setState({selToothNum: selTNum});
  };

  handleDrawResetOnClick = (e) => {
    let selTNum = parseInt(this.state.selToothNum);
    this.handleCleanDraw(selTNum);
    this.setState({selEPT: 0});
    this.setState({selMob: 0});
  };

  handleChangeNCCheck = (e) => {
    let i = parseInt(this.state.selToothNum);
    let getListPDState =  this.state.listPDState;
    let val = (getListPDState[i].topLeft.val === 1) ? true: false;
    if (val) {
      this.handleTopLeftDraw(i, "topLeft", 0);
    } else {
      this.handleCleanDraw(i);
      this.setState({selEPT: 0});
      this.setState({selMob: 0});
      this.handleTopLeftDraw(i, "topLeft", 1);
    }
  };

  handleChangeEPT = (e) => {
    let i = parseInt(this.state.selToothNum);
    let val = parseInt(e.target.value);
    this.setState({selEPT: val});
    this.handleMidLeftDraw(i, "midLeft", val);
  };

  handleChangeMob = (e) => {
    let i = parseInt(this.state.selToothNum);
    let val = parseInt(e.target.value);
    this.setState({selMob: val});
    this.handleMidRightDraw(i, "midRight", val);
  };

  handleChangeToothNum = (e) => {
    let selTNum = parseInt(e.target.value);
    let nc = (this.state.listPDState[selTNum].topLeft.val === 0) ? false : true;

    this.setState({selToothNum: selTNum});
    this.setState({selEPT: this.state.listPDState[selTNum].midLeft.val});
    this.setState({selMob: this.state.listPDState[selTNum].midRight.val});
  };

  handleOnClickNumInput = (inputId) => {
    dts_perioChart_current_input_id = inputId;
    this.setState({inputId: inputId});
    if (inputId.indexOf(getPockToothInputType) > -1) {
      let isBleedMode = this.state.isBleedInputMode;
      let isSuppMode = this.state.isSuppInputMode;
      if (isSuppMode) {
        let iColor = document.getElementById(inputId).style.backgroundColor;
        if (iColor != 'rgb(255, 255, 102)') {
          document.getElementById(inputId).style.backgroundColor = '#ffff66';
        } else {
          document.getElementById(inputId).style.backgroundColor = '#ffffff';
        }
      } else if (isBleedMode) {
        let iColor = document.getElementById(inputId).style.backgroundColor;
        if (iColor != 'rgb(255, 160, 122)') {
          document.getElementById(inputId).style.backgroundColor = '#FFA07A';
        } else {
          document.getElementById(inputId).style.backgroundColor = '#ffffff';
        }
      }
    }
  }

  // testForExtract = (e) => {
  //   const i = 3;
  //   this.setState(prevState => {
  //     let item = Object.assign({}, prevState.listPDState[i]);
  //     item.props.isExtract = true;
  //     return { item };
  //   });
  //   const j = 10;
  //   this.setState(prevState => {
  //     let item = Object.assign({}, prevState.listPDState[j]);
  //     item.props.isExtract = true;
  //     return { item };
  //   });
  // }

  // testForImplant = (e) => {
  //   const i = 5;
  //   this.setState(prevState => {
  //     let item = Object.assign({}, prevState.listPDState[i]);
  //     item.props.isImplant = true;
  //     return { item };
  //   });
  //   const j = 23;
  //   this.setState(prevState => {
  //     let item = Object.assign({}, prevState.listPDState[j]);
  //     item.props.isImplant = true;
  //     return { item };
  //   });
  //   const k = 30;
  //   this.setState(prevState => {
  //     let item = Object.assign({}, prevState.listPDState[k]);
  //     item.props.isImplant = true;
  //     return { item };
  //   });
  // }

  testForSupp = (e) => {
    const i = 15;
    this.setState(prevState => {
      let item = Object.assign({}, prevState.listPDState[i]);
      item.props.isSupp = true;
      return { item };
    });
    const j = 23;
    this.setState(prevState => {
      let item = Object.assign({}, prevState.listPDState[j]);
      item.props.isSupp = true;
      return { item };
    });
    const k = 31;
    this.setState(prevState => {
      let item = Object.assign({}, prevState.listPDState[k]);
      item.props.isSupp = true;
      return { item };
    });
  }

  render(){

    const {classes} = this.props;

    const pcPanelSize = 1;
    const pcFontSize = 1;

    const table = {
      borderCollapse: 'collapse',
      padding: '0 0 0 0'
    };

    const td_remark = {
      verticalAlign: "top",
      paddingLeft: 10,
      paddingTop: 20
    };

    const td_hd_font = {
      borderCollapse: 'collapse',
      padding: 0,
      fontSize: 15 * pcFontSize,
      backgroundColor: 'rgb(123, 193, 217)',
      color: 'white',
      fontWeight: 400
    };

    const td_horizontal_bar = {
      borderLeft: '0px solid black',
      borderRight: '0px solid black',
      borderBottom: '10px solid black',
      borderCollapse: 'collapse',
      padding: 0
    };

    const td_vertical_bar_dc = {
      borderRight: '9px solid black',
      borderCollapse: 'collapse',
      padding: 0
    };

    const td_vertical_bar = {
      borderRight: '7px solid black',
      borderCollapse: 'collapse',
      padding: "0 0 0 0"
    };

    const td_vh_bar = {
      borderRight: '9px solid black',
      borderBottom: '10px solid black',
      borderCollapse: 'collapse',
      padding: 0
    };

    const tr_chart = {
      color: 'black',
      align: 'center'
    };

    const upperToothNums = ["18", "17", "16", "15", "14", "13", "12", "11", "21", "22", "23", "24", "25", "26", "27", "28"];
    const lowerToothNums = ["48", "47", "46", "45", "44", "43", "42", "41", "31", "32", "33", "34", "35", "36", "37", "38"];

    const btnRecInputNumText = this.state.btnRecInputNumText;
    const btnRecInputSeqText = this.state.btnRecInputSeqText;
    const btnBleedInputText = this.state.btnBleedInputText;
    const btnCompleteChartText = this.state.btnCompleteChartText;
    const btnSuppInputText = this.state.btnSuppInputText;
    const getListPDState =  this.state.listPDState;
    const getListPCSeq =  this.state.listPCSeq;
    const getListRecSeq =  this.state.listRecSeq;
    const getToothNum =  parseInt(this.state.selToothNum);
    const isView = false;
    const isExtractForPDControl = getListPDState[getToothNum].props.isExtract;
    const isNCForPDControl = (getListPDState[getToothNum].topLeft.val === 1) ? true: false;
    const copyPCState = this.state.copyPCState;

    let upperPCLoop = getListPDState.map((pdState, i) => {
      if (i <= 15) {
        let isDisable = false;
        isDisable = (getListPDState[i].props.isImplant) ? true: isDisable;
        isDisable = (getListPDState[i].props.isExtract) ? true: isDisable;
        if (i === 7) {
          return (<td style={td_vertical_bar}>
            <td style={isDisable ? {backgroundColor: "#bfbfbf"} : {padding: 0}}><PerioDraw border="0" scale={pcPanelSize} pdState={pdState} handleClick={this.handlePerioDrawOnClick.bind(this, i)} isDisable={isDisable} /></td>
            </td>);
        } else {
          return (<td style={isDisable ? {backgroundColor: "#bfbfbf"} : {padding: 0}}><PerioDraw border="0" scale={pcPanelSize} pdState={pdState} handleClick={this.handlePerioDrawOnClick.bind(this, i)} isDisable={isDisable} /></td>);
        }
      }
    });
    let upperPockLoop = getListPCSeq.map((seq, i) => {
      if (i <= 15) {
        let isDisable = false;
        isDisable = (getListPDState[i].topLeft.val === 1) ? true: isDisable;
        isDisable = (getListPDState[i].props.isExtract) ? true: isDisable;
        if (i === 7) {
          return (<td style={td_vertical_bar}>
            <td style={isDisable ? {backgroundColor: "#bfbfbf"} : {padding: 0}}><PCInputBox handleChange={this.handlePCInputChange} handleClick={this.handleOnClickNumInput} toothNum={i} toothSeq={seq} type={getPockToothInputType} isDisable={isDisable} isView={isView} scale={pcPanelSize} fontSize={pcFontSize} /></td>
            </td>);
        } else {
          return (<td style={isDisable ? {backgroundColor: "#bfbfbf"} : {padding: 0}}><PCInputBox handleChange={this.handlePCInputChange} handleClick={this.handleOnClickNumInput} toothNum={i} toothSeq={seq} type={getPockToothInputType} isDisable={isDisable} isView={isView} scale={pcPanelSize} fontSize={pcFontSize} /></td>);
        }
      }
    });
    let upperNumLoop = upperToothNums.map((upperToothNum, i) => {
      if (i === 7) {
        return (<td style={td_vertical_bar_dc}>
          <td color="black">{upperToothNum}</td>
          </td>);
      } else {
        return (<td padding="0">{upperToothNum}</td>);
      }
    });
    let upperRecLoop = getListRecSeq.map((seq, i) => {
      if (i <= 15) {
        let isDisable = false;
        isDisable = (getListPDState[i].topLeft.val === 1) ? true: isDisable;
        isDisable = (getListPDState[i].props.isExtract) ? true: isDisable;
        if (i === 7) {
          return (<td style={td_vertical_bar}>
            <td style={isDisable ? {backgroundColor: "#bfbfbf"} : {padding: 0}}><PCInputBox handleChange={this.handlePCInputChange} handleClick={this.handleOnClickNumInput} toothNum={i} toothSeq={seq} type={getRecToothInputType} isDisable={isDisable} isView={isView} scale={pcPanelSize} fontSize={pcFontSize} /></td>
            </td>);
        } else {
          return (<td style={isDisable ? {backgroundColor: "#bfbfbf"} : {padding: 0}}><PCInputBox handleChange={this.handlePCInputChange} handleClick={this.handleOnClickNumInput} toothNum={i} toothSeq={seq} type={getRecToothInputType} isDisable={isDisable} isView={isView} scale={pcPanelSize} fontSize={pcFontSize} /></td>);
        }
      }
    });
    let upperDCLoop = getListPDState.map((pdState, i) => {
      if (i <= 15) {
        if (i === 7) {
          return (<td style={td_vh_bar}>
            <td><PerioDrawTextField border="0" scale={pcPanelSize} isImplant={getListPDState[i].props.isImplant} isSupp={getListPDState[i].props.isSupp} /></td>
            </td>);
        } else {
          return (<td style={td_horizontal_bar}><PerioDrawTextField border="0" scale={pcPanelSize} isImplant={getListPDState[i].props.isImplant} isSupp={getListPDState[i].props.isSupp} /></td>);
        }
      }
    });
    let lowerDCLoop = getListPDState.map((pdState, i) => {
      if (i > 15 && i < 32) {
        if (i === 23) {
          return (<td style={td_vertical_bar_dc}>
            <td><PerioDrawTextField border="0" scale={pcPanelSize} isImplant={getListPDState[i].props.isImplant} isSupp={getListPDState[i].props.isSupp} /></td>
            </td>);
        } else {
          return (<td><PerioDrawTextField border="0" scale={pcPanelSize} isImplant={getListPDState[i].props.isImplant} isSupp={getListPDState[i].props.isSupp} /></td>);
        }
      }
    });
    let lowerRecLoop = getListRecSeq.map((seq, i) => {
      if (i > 15 && i < 32) {
        let isDisable = false;
        isDisable = (getListPDState[i].topLeft.val === 1) ? true: isDisable;
        isDisable = (getListPDState[i].props.isExtract) ? true: isDisable;
        if (i === 23) {
          return (<td style={td_vertical_bar}>
            <td style={isDisable ? {backgroundColor: "#bfbfbf"} : {padding: 0}}><PCInputBox handleChange={this.handlePCInputChange} handleClick={this.handleOnClickNumInput} toothNum={i} toothSeq={seq} type={getRecToothInputType} isDisable={isDisable} isView={isView} scale={pcPanelSize} fontSize={pcFontSize} /></td>
            </td>);
        } else {
          return (<td style={isDisable ? {backgroundColor: "#bfbfbf"} : {padding: 0}}><PCInputBox handleChange={this.handlePCInputChange} handleClick={this.handleOnClickNumInput} toothNum={i} toothSeq={seq} type={getRecToothInputType} isDisable={isDisable} isView={isView} scale={pcPanelSize} fontSize={pcFontSize} /></td>);
        }
      }
    });
    let lowerNumLoop = lowerToothNums.map((lowerToothNum, i) => {
      if (i === 7) {
        return (<td style={td_vertical_bar_dc}>
          <td color="black">{lowerToothNum}</td>
          </td>);
      } else {
        return (<td padding="0">{lowerToothNum}</td>);
      }
    });
    let lowerPockLoop = getListPCSeq.map((seq, i) => {
      if (i > 15 && i < 32) {
        let isDisable = false;
        isDisable = (getListPDState[i].topLeft.val === 1) ? true: isDisable;
        isDisable = (getListPDState[i].props.isExtract) ? true: isDisable;
        if (i === 23) {
          return (<td style={td_vertical_bar}>
            <td style={isDisable ? {backgroundColor: "#bfbfbf"} : {padding: 0}}><PCInputBox handleChange={this.handlePCInputChange} handleClick={this.handleOnClickNumInput} toothNum={i} toothSeq={seq} type={getPockToothInputType} isDisable={isDisable} isView={isView} scale={pcPanelSize} fontSize={pcFontSize} /></td>
            </td>);
        } else {
          return (<td style={isDisable ? {backgroundColor: "#bfbfbf"} : {padding: 0}}><PCInputBox handleChange={this.handlePCInputChange} handleClick={this.handleOnClickNumInput} toothNum={i} toothSeq={seq} type={getPockToothInputType} isDisable={isDisable} isView={isView} scale={pcPanelSize} fontSize={pcFontSize} /></td>);
        }
      }
    });
    let lowerPCLoop = getListPDState.map((pdState, i) => {
      if (i > 15 && i < 32) {
        let isDisable = false;
        isDisable = (getListPDState[i].props.isImplant) ? true: isDisable;
        isDisable = (getListPDState[i].props.isExtract) ? true: isDisable;
        if (i === 23) {
          return (<td style={td_vertical_bar}>
            <td style={isDisable ? {backgroundColor: "#bfbfbf"} : {padding: 0}}><PerioDraw border="0" scale={pcPanelSize} pdState={pdState} handleClick={this.handlePerioDrawOnClick.bind(this, i)} isDisable={isDisable} /></td>
            </td>);
        } else {
          return (<td style={isDisable ? {backgroundColor: "#bfbfbf"} : {padding: 0}}><PerioDraw border="0" scale={pcPanelSize} pdState={pdState} handleClick={this.handlePerioDrawOnClick.bind(this, i)} isDisable={isDisable} /></td>);
        }
      }
    });
    

    return (

      // <MuiThemeProvider theme={dtstheme} className={classes.addTheme} >
      <div>
        <table width="1550">
          <tr>
          <td align="left">
          <CIMSButton onClick={this.changeRecInputNum}>{btnRecInputNumText}</CIMSButton>
          <CIMSButton onClick={this.changePCInputSeq}>{btnRecInputSeqText}</CIMSButton>
          <CIMSButton onClick={this.changeBleedMode}>{btnBleedInputText}</CIMSButton>
          <CIMSButton className={classes.button} onClick={this.changeSuppMode}>{btnSuppInputText}</CIMSButton>
          {/* <CIMSButton onClick={this.testForExtract}>Test for extraction</CIMSButton>
          <CIMSButton onClick={this.testForImplant}>Test for implant</CIMSButton> */}
          <CIMSButton className={classes.button} onClick={this.testForSupp}>Test for Supp</CIMSButton>
          </td>
          <td align="right">
          <CIMSButton onClick={this.createNewChart}>Blank Chart</CIMSButton>
          <CIMSButton onClick={this.changeCompleteChart}>{btnCompleteChartText}</CIMSButton>
          <CIMSButton onClick={this.savePerioChart}>Save Perio Chart</CIMSButton>
          </td>
          </tr>
        </table>
        {/* <table border="1px solid black" style={table}> */}
        <table style={table}>
          <tr align="center">
            <td style={td_hd_font} width="10" align="center">M</td><td style={td_hd_font} ></td>
            {upperPCLoop}
          </tr>
          <tr align="center">
            <td style={td_hd_font} align="center">Pocket</td><td style={td_hd_font}><Grid>B</Grid><Grid>P</Grid></td>
            {upperPockLoop}
          </tr>
          <tr align="center">
            <td style={td_hd_font}></td><td style={td_hd_font}></td>
            {upperNumLoop}
          </tr>
          <tr align="center">
            <td style={td_hd_font} align="center">Rec</td><td style={td_hd_font} ><Grid>B</Grid><Grid>P</Grid></td>
            {upperRecLoop}
          </tr>
          <tr style={tr_chart}>
            <td style={td_hd_font}></td><td style={td_hd_font}></td>
            {upperDCLoop}
          </tr>
          <tr style={tr_chart}>
            <td style={td_hd_font}></td><td style={td_hd_font}></td>
            {lowerDCLoop}
          </tr>
          <tr align="center">
            <td style={td_hd_font} align="center">Rec</td><td style={td_hd_font}><Grid>L</Grid><Grid>B</Grid></td>
            {lowerRecLoop}
          </tr>
          <tr align="center">
            <td style={td_hd_font}></td><td style={td_hd_font}></td>
            {lowerNumLoop}
          </tr>
          <tr align="center">
            <td style={td_hd_font} align="center">Pocket</td><td style={td_hd_font}><Grid>L</Grid><Grid>B</Grid></td>
            {lowerPockLoop}
          </tr>
          <tr align="center">
            <td style={td_hd_font} width="10" align="center">M</td><td style={td_hd_font}></td>
            {lowerPCLoop}
          </tr>
        </table>

        <table>
          <tr>
            <td>
              <PerioDrawControl pdState={this.state.listPDState[getToothNum]} selToothNum={getToothNum} selEPT={this.state.selEPT} selMob={this.state.selMob}
                  handleClick={this.handlePerioDrawControlOnClick.bind(this)}
                  handleClickDrawConfirm={this.handleDrawConfirmOnClick.bind(this)}
                  handleClickDrawReset={this.handleDrawResetOnClick.bind(this)}
                  handleChangeEPT={this.handleChangeEPT.bind(this)}
                  handleChangeMob={this.handleChangeMob.bind(this)}
                  handleChangeToothNum={this.handleChangeToothNum.bind(this)}
                  handleChangeNCCheck={this.handleChangeNCCheck.bind(this)}
                  isExtract={isExtractForPDControl}
                  isNC={isNCForPDControl}
              />
            </td>
            <td style={td_remark}>
              <div>
              POCK Input Box: <br/>
              &nbsp;&nbsp;&nbsp;&nbsp; Input "*" == "10" <br/>
              &nbsp;&nbsp;&nbsp;&nbsp; Input "1" == bleed (red color) <br/>
              &nbsp;&nbsp;&nbsp;&nbsp; Input "0" == NO bleed (no color) <br/>
              &nbsp;&nbsp;&nbsp;&nbsp; Input "." == to next input box <br/>
              REC Input Box: <br/>
              &nbsp;&nbsp;&nbsp;&nbsp; Input "." == to next input box <br/>
              </div>
            </td>
          </tr>
        </table>
        </div>
      // </MuiThemeProvider>
    );
  }
}

const mapStateToProps = (state) => {
  return {
  };
};

const mapDispatchToProps = {
  updatePerioChartData_saga
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(perioChart));