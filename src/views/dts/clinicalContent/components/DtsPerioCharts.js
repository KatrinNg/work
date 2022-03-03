import "./perioChartComp/css/textarea.css";
import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";
import PCInputBox from "./perioChartComp/PCInputBox";
import PerioDraw from "./perioChartComp/PerioDraw";
import PerioDrawTextField from "./perioChartComp/PerioDrawTextField";
import PerioDrawControl from "./perioChartComp/PerioDrawControl";
import { getNextPCInputBoxId, cleanPockInputBoxVal, cleanRecInputBoxVal, getPockToothInputType, getRecToothInputType, getListPDStateObj, getListPDStateObjT, getList32WithTwo, getList32WithSix, getToothNumByInputId, getTypeFromInputId, removeArrItem } from "./perioChartComp/common/PerioChartUnits.js";

const styles = (theme) => ({
  button: {
    borderRadius: 10,
    backgroundColor:"#e0e0eb"
  }
});

class DtsPerioCharts extends Component {

  constructor(props){
    super(props);

    this.state = {
      inputId: "",
      listPDState: getListPDStateObj(),
      listPCSeq: getList32WithSix,
      listRecSeq: getList32WithSix,
      isRecSixInput: true,
      isFullSeqInputFocus: true,
      isBleedInputMode: false,
      isConfirmChart: false,
      btnRecInputNumText: "Rec SIX to TWO",
      btnRecInputSeqText: "To Quadrant Mode",
      btnBleedInputText: "To Bleed Mode",
      btnConfirmChartText: "Perio Chart not confirm",
      selToothNum: 0,
      selEPT: 0,
      selMob: 0
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

  handlePCInputChange = (inputId, inputOldValue) => {
    let nVal = document.getElementById(inputId).value;
    let type = getTypeFromInputId(inputId);
    const getListPDState =  this.state.listPDState;
    const nextInput = (id) => {
      let fSeq = this.state.isFullSeqInputFocus;
      let sixN = this.state.isRecSixInput;
      let nID = getNextPCInputBoxId(id, fSeq, sixN);

      while ((getListPDState[getToothNumByInputId(nID)].props.isImplant) || (getListPDState[getToothNumByInputId(nID)].props.isExtract) || (getListPDState[getToothNumByInputId(nID)].topLeft.val === 1)) {
        nID = getNextPCInputBoxId(nID, fSeq, sixN);
      }
      document.getElementById(nID).focus();
    };

    if (type === getPockToothInputType) {
      switch(true) {
        case (nVal.includes("*")):
          if ((nVal === "*")) {
            document.getElementById(inputId).value = "10";
            nextInput(inputId);
            break;
          } else {
            document.getElementById(inputId).value = "";
            inputId = "";
            break;
          }
        case (nVal.includes(".")):
          document.getElementById(inputId).value = document.getElementById(inputId).value.replace(".", "");
          nextInput(inputId);
          break;
        case (nVal.includes(" ")):
          document.getElementById(inputId).value = inputOldValue;
          nextInput(inputId);
          break;
        case (nVal.includes("2")):
        case (nVal.includes("3")):
          document.getElementById(inputId).value = "";
          break;
        case (parseInt(nVal) > 3) && (parseInt(nVal) < 11) && (!nVal.includes("+")):
          nextInput(inputId);
          break;
        case (nVal.replace("10", "").includes(1)):
          document.getElementById(inputId).style.backgroundColor = "#FFA07A";
          document.getElementById(inputId).value = inputOldValue;
          nextInput(inputId);
          break;
        case (nVal.replace("10", "").includes(0)):
          document.getElementById(inputId).style.backgroundColor = "#ffffff";
          document.getElementById(inputId).value = inputOldValue;
          nextInput(inputId);
          break;
        case (nVal.includes("+")):
          document.getElementById(inputId).value = "+";
          nextInput(inputId);
          break;
        case (parseInt(nVal) > 10):
          document.getElementById(inputId).value = "";
          break;
        default:
          document.getElementById(inputId).value = "";
      }
    } else {
      switch(true) {
        case (nVal.includes("+")):
          document.getElementById(inputId).value = "+";
          nextInput(inputId);
          break;
        case (nVal.includes(".")):
          document.getElementById(inputId).value = document.getElementById(inputId).value.replace(".", "");
          nextInput(inputId);
          break;
        case (nVal.includes(" ")):
//        case (nVal.includes(".")):
          document.getElementById(inputId).value = inputOldValue;
          nextInput(inputId);
          break;
        case (parseInt(nVal) === 1):
          break;
        case (parseInt(nVal) > 0) && (parseInt(nVal) < 10):
          nextInput(inputId);
          break;
        case (parseInt(nVal) > 9) && (parseInt(nVal) < 16):
          nextInput(inputId);
          break;
        case (parseInt(nVal) > 15):
          document.getElementById(inputId).value = "";
          break;
        default:
          document.getElementById(inputId).value = "";
      }
    }
  }

  changeRecInputNum = () => {
    let isRec6Input = this.state.isRecSixInput;
    if (isRec6Input) {
      this.setState({
        listRecSeq: getList32WithTwo,
        isRecSixInput: false,
        btnRecInputNumText: "Rec TWO to SIX"
      });
      cleanRecInputBoxVal(isRec6Input);
    } else {
      this.setState({
        listRecSeq: getList32WithSix,
        isRecSixInput: true,
        btnRecInputNumText: "Rec SIX to TWO"
      });
      cleanRecInputBoxVal(isRec6Input);
    }
  }

  changeRecInputSeq = () => {
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
        btnBleedInputText: "To Bleed Mode"
      });
    } else {
      this.setState({
        isBleedInputMode: true,
        btnBleedInputText: "To Not Bleed Mode"
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
    let name = e.target.attrs.name;
    let oVal = eval("this.state.listPDState[" + i + "]." + name + ".val") + 1;
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
    this.setState({inputId: inputId});
    let isBleedMode = this.state.isBleedInputMode;
    if (isBleedMode) {
      document.getElementById(inputId).style.backgroundColor = "#FFA07A";
    } else {
      document.getElementById(inputId).style.backgroundColor = "#ffffff";
    }
  }

  testForExtract = (e) => {
    const i = 3;
    this.setState(prevState => {
      let item = Object.assign({}, prevState.listPDState[i]);
      item.props.isExtract = true;
      return { item };
    });
    const j = 10;
    this.setState(prevState => {
      let item = Object.assign({}, prevState.listPDState[j]);
      item.props.isExtract = true;
      return { item };
    });
  }

  testForImplant = (e) => {
    const i = 5;
    this.setState(prevState => {
      let item = Object.assign({}, prevState.listPDState[i]);
      item.props.isImplant = true;
      return { item };
    });
    const j = 23;
    this.setState(prevState => {
      let item = Object.assign({}, prevState.listPDState[j]);
      item.props.isImplant = true;
      return { item };
    });
    const k = 30;
    this.setState(prevState => {
      let item = Object.assign({}, prevState.listPDState[k]);
      item.props.isImplant = true;
      return { item };
    });
  }

  render(){

    const {classes} = this.props;

    const table = {
      borderCollapse: "collapse"
    };
    const td_head = {
      align: "right"
    };
    const td_remark = {
      verticalAlign: "top",
      paddingLeft: 10,
      paddingTop: 20,
      width: 450
    };

    const upperToothNums = ["18", "17", "16", "15", "14", "13", "12", "11", "21", "22", "23", "24", "25", "26", "27", "28"];
    const lowerToothNums = ["48", "47", "46", "45", "44", "43", "42", "41", "31", "32", "33", "34", "35", "36", "37", "38"];

    const btnRecInputNumText = this.state.btnRecInputNumText;
    const btnRecInputSeqText = this.state.btnRecInputSeqText;
    const btnBleedInputText = this.state.btnBleedInputText;
    const btnConfirmChartText = this.state.btnConfirmChartText;
    const getListPDState =  this.state.listPDState;
    const getListPCSeq =  this.state.listPCSeq;
    const getListRecSeq =  this.state.listRecSeq;
    const getToothNum =  parseInt(this.state.selToothNum);
    const smallDraw = 1;
    const isExtractForPDControl = getListPDState[getToothNum].props.isExtract;
    const isNCForPDControl = (getListPDState[getToothNum].topLeft.val === 1) ? true: false;

    let upperPCLoop = getListPDState.map((pdState, i) => {
      if (i <= 15) {
        return (<td height="45" width="45"><PerioDraw border="0" scale={smallDraw} pdState={pdState} handleClick={this.handlePerioDrawOnClick.bind(this, i)} isExtract={getListPDState[i].props.isExtract} isImplant={getListPDState[i].props.isImplant} /></td>);
      }
    });
    let upperPockLoop = getListPCSeq.map((seq, i) => {
      if (i <= 15) {
        let isNC = (getListPDState[i].topLeft.val === 1) ? true: false;
        return (<td width="45"><PCInputBox handleChange={this.handlePCInputChange} handleClick={this.handleOnClickNumInput} toothNum={i} toothSeq={seq} type={getPockToothInputType} isExtract={getListPDState[i].props.isExtract} isImplant={getListPDState[i].props.isImplant} isNC={isNC} /></td>);
      }
    });

    let upperNumLoop = upperToothNums.map((upperToothNum, i) => <td width="45" key={i} align="center">{upperToothNum}</td>);
    let upperRecLoop = getListRecSeq.map((seq, i) => {
      if (i <= 15) {
        let isNC = (getListPDState[i].topLeft.val === 1) ? true: false;
        return (<td width="45"><PCInputBox handleChange={this.handlePCInputChange} handleClick={this.handleOnClickNumInput} toothNum={i} toothSeq={seq} type={getRecToothInputType} isExtract={getListPDState[i].props.isExtract} isImplant={getListPDState[i].props.isImplant} isNC={isNC} /></td>);
      }
    });
    let upperDCLoop = getListPDState.map((pdState, i) => {
      if (i <= 15) {
        return (<td height="30" width="45"><PerioDrawTextField border="0" scale={smallDraw} isImplant={getListPDState[i].props.isImplant} /></td>);
      }
    });
    let lowerDCLoop = getListPDState.map((pdState, i) => {
      if (i > 15 && i < 32) {
        return (<td height="30" width="45"><PerioDrawTextField border="0" scale={smallDraw} isImplant={getListPDState[i].props.isImplant} /></td>);
      }
    });
    let lowerRecLoop = getListRecSeq.map((seq, i) => {
      if (i > 15 && i < 32) {
        let isNC = (getListPDState[i].topLeft.val === 1) ? true: false;
        return (<td width="45"><PCInputBox handleChange={this.handlePCInputChange} handleClick={this.handleOnClickNumInput} toothNum={i} toothSeq={seq} type={getRecToothInputType} isExtract={getListPDState[i].props.isExtract} isImplant={getListPDState[i].props.isImplant} isNC={isNC} /></td>);
      }
    });
    let lowerNumLoop = lowerToothNums.map((lowerToothNum, i) => <td width="45" key={i} align="center">{lowerToothNum}</td>);
    let lowerPockLoop = getListPCSeq.map((seq, i) => {
      if (i > 15 && i < 32) {
        let isNC = (getListPDState[i].topLeft.val === 1) ? true: false;
        return (<td width="45"><PCInputBox handleChange={this.handlePCInputChange} handleClick={this.handleOnClickNumInput} toothNum={i} toothSeq={seq} type={getPockToothInputType} isExtract={getListPDState[i].props.isExtract} isImplant={getListPDState[i].props.isImplant} isNC={isNC} /></td>);
      }
    });
    let lowerPCLoop = getListPDState.map((pdState, i) => {
      if (i > 15 && i < 32) {
        return (<td height="45" width="45"><PerioDraw border="0" scale={smallDraw} pdState={pdState} handleClick={this.handlePerioDrawOnClick.bind(this, i)} isExtract={getListPDState[i].props.isExtract} isImplant={getListPDState[i].props.isImplant} /></td>);
      }
    });
    

    return (

      <div>
        <table width="1420">
          <tr>
          <td align="left">
          <Button className={classes.button} onClick={this.changeRecInputNum}>{btnRecInputNumText}</Button>
          <Button className={classes.button} onClick={this.changeRecInputSeq}>{btnRecInputSeqText}</Button>
          <Button className={classes.button} onClick={this.changeBleedMode}>{btnBleedInputText}</Button>
          <Button className={classes.button} onClick={this.testForExtract}>Test for extraction</Button>
          <Button className={classes.button} onClick={this.testForImplant}>Test for implant</Button>
          </td>
          <td align="right">
          <Button className={classes.button} onClick={this.createNewChart}>New Chart</Button>
          {/* <Button onClick={this.changeConfirmChart}>{btnConfirmChartText}</Button> */}
          </td>
          </tr>
        </table>
        <table border="1px solid black" style={table}>
          <tr>
            <td width="10" align="center">M</td><td></td>
            {upperPCLoop}
          </tr>
          <tr>
            <td align="center">Pock</td><td><Grid>B</Grid><Grid>P</Grid></td>
            {upperPockLoop}
          </tr>
          <tr>
            <td></td><td></td>
            {upperNumLoop}
          </tr>
          <tr>
            <td align="center">Rec</td><td><Grid>B</Grid><Grid>P</Grid></td>
            {upperRecLoop}
          </tr>
          <tr>
            <td></td><td></td>
            {upperDCLoop}
          </tr>
          <tr>
            <td></td><td></td>
            {lowerDCLoop}
          </tr>
          <tr>
            <td align="center">Rec</td><td><Grid>L</Grid><Grid>B</Grid></td>
            {lowerRecLoop}
          </tr>
          <tr>
            <td></td><td></td>
            {lowerNumLoop}
          </tr>
          <tr>
            <td align="center">Pock</td><td><Grid>L</Grid><Grid>B</Grid></td>
            {lowerPockLoop}
          </tr>
          <tr>
            <td width="20" align="center">M</td><td></td>
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
    );
  }
}

export default withStyles(styles)(DtsPerioCharts);