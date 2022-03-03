import React, { Component } from 'react';
import { withStyles, FormGroup, FormControlLabel, Checkbox } from '@material-ui/core';
import { styles } from './JPrinterStyle';
import Button from 'components/JButton';

class JPrinter extends Component {
  constructor(props){
    super(props);
    this.state={
      reminderIsChecked: props.reminderIsChecked || false,
      lableIsChecked: props.lableIsChecked || false,
      outputFormIsChecked: props.outputFormIsChecked || false,
      printDisabledFlag: props.printDisabledFlag || true,
      disabledFlag: props.disabledFlag || false,
      printForceDisabledFlag: props.printForceDisabledFlag || false
    };
  }

  static getDerivedStateFromProps(props, state) {
    let { disabledFlag,reminderIsChecked,lableIsChecked,outputFormIsChecked } = props;
    if(disabledFlag !== state.disabledFlag){
      return {
        disabledFlag
      };
    }
    if(reminderIsChecked !== state.reminderIsChecked || lableIsChecked !== state.lableIsChecked || outputFormIsChecked !== state.outputFormIsChecked){
      return {
        reminderIsChecked,
        lableIsChecked,
        outputFormIsChecked
      };
    }
    // if(lableIsChecked !== state.lableIsChecked){
    //   return {
    //     lableIsChecked
    //   };
    // }
    // if(outputFormIsChecked !== state.outputFormIsChecked){
    //   return {
    //     outputFormIsChecked
    //   };
    // }
  }

  handleCheckboxChange = (event,name) => {
    const { onPrinterCheckboxChange } = this.props;
    let { reminderIsChecked,lableIsChecked,outputFormIsChecked } = this.state;
    let printDisabledFlag = true;
    if (event.target.checked) {
      printDisabledFlag = false;
    } else {
      if (name === 'reminderIsChecked') {
        reminderIsChecked = event.target.checked;
      } else if (name === 'lableIsChecked') {
        lableIsChecked = event.target.checked;
      } else {
        outputFormIsChecked = event.target.checked;
      }
      let tempSet = new Set([reminderIsChecked, lableIsChecked, outputFormIsChecked]);
      if (tempSet.size>1) {
        printDisabledFlag = false;
      } else {
        let array = Array.from(tempSet);
        printDisabledFlag = array[0]?false:true;
      }
    }
    this.setState({
      printDisabledFlag,
      [name]:event.target.checked
    });
    onPrinterCheckboxChange&&onPrinterCheckboxChange(event,name,printDisabledFlag);
  }

  handlePrint = () => {
    const { handlePrint } = this.props;
    let {
      reminderIsChecked,
      lableIsChecked,
      outputFormIsChecked
    } = this.state;
    handlePrint&&handlePrint(reminderIsChecked,lableIsChecked,outputFormIsChecked);
  }

  render() {
    const {classes, printForceDisabledFlag=false} = this.props;
    let {reminderIsChecked,lableIsChecked,outputFormIsChecked,disabledFlag} = this.state;
    let printBtnDisabled = !printForceDisabledFlag?((!(reminderIsChecked || lableIsChecked || outputFormIsChecked))||disabledFlag):true;
    // let printDisabledFlag = !(reminderIsChecked || lableIsChecked || outputFormIsChecked);
    const resProps = {
      classes:{label:classes.buttonLabel}
    };

    return (
      <div className={classes.wrapper}>
        <div className={classes.checkboxWrapper}>
          <FormGroup row>
            <FormControlLabel
                className={classes.formControlLabel}
                control={
                  <Checkbox
                      className={classes.checkbox}
                      checked={reminderIsChecked}
                      onChange={(e)=>{this.handleCheckboxChange(e,'reminderIsChecked');}}
                      id="printer_checkbox_reminder"
                      color="primary"
                      disabled={disabledFlag}
                  />
                }
                label="Reminder"
            />
            <FormControlLabel
                className={classes.formControlLabel}
                control={
                  <Checkbox
                      className={classes.checkbox}
                      checked={lableIsChecked}
                      onChange={(e)=>{this.handleCheckboxChange(e,'lableIsChecked');}}
                      id="printer_checkbox_label"
                      color="primary"
                      disabled={disabledFlag}
                  />
                }
                label="Label"
            />
            <FormControlLabel
                className={classes.formControlLabel}
                control={
                  <Checkbox
                      className={classes.checkbox}
                      checked={outputFormIsChecked}
                      onChange={(e)=>{this.handleCheckboxChange(e,'outputFormIsChecked');}}
                      id="printer_checkbox_output_form"
                      color="primary"
                      disabled={disabledFlag}
                  />
                }
                label="Output Form"
            />
          </FormGroup>
        </div>
        <div className={classes.btnWrapper}>
        <Button style={{fontSize:'1rem'}} {...resProps} id="printer_btn_print" disabled={printBtnDisabled} onClick={this.handlePrint}>Print</Button>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(JPrinter);
