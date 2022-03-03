import './components/procedureSetComp/css/textarea.css';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles, makeStyles, useTheme } from '@material-ui/core/styles';
import Button from "@material-ui/core/Button";
import NSelect from './components/procedureSetComp/NSelect';
import ProcedureSetForm from './components/procedureSetComp/ProcedureSetForm';
import { 
  procCmnSet
} from './components/procedureSetComp/common/ProcedureSetUnit';
import {
  getProcedureCommonSet_saga
} from '../../../store/actions/dts/clinicalContent/procedureSetAction';

const styles = (theme) => ({
});

class ProcedureSet extends Component {

  constructor(props){
    super(props);

    this.state = {
      selPSType: "",
      selPSValue: 0,
      listCmnSet: [],
      blnSave: 0,
      blnSaveDisable: true,
      latestEncounter: this.props.latestEncounter
    };
  }

  componentWillMount() {
  }

  componentDidMount() {
    this.props.getProcedureCommonSet_saga();
  }

  componentDidUpdate(prevProps) {
    if(this.props.procedureCommonSet != prevProps.procedureCommonSet) {
      let procedureCommonSet = this.props.procedureCommonSet;
      let listCmnSet = [];
      let i;
      for (i = 0; i < procedureCommonSet.length; i++) {
        let procCS = {...procCmnSet};
        procCS.value = procedureCommonSet[i].clcDefCmnUsedSetId;
        procCS.label = procedureCommonSet[i].setGrp;
        listCmnSet.push(procCS);
      }
      this.setState({listCmnSet: listCmnSet});
    }
  }

  componentWillUnmount() {
  }

  handleSelectOnChange = (event) => {
    this.setState({selPSType: event.target.value});
    this.setState({selPSValue: event.target.value});
    if (event.target.value !== 0) {
      let blnSaveDisable = this.state.blnSaveDisable;
      if (blnSaveDisable) {
        this.setState({blnSaveDisable: false});
      }
    } else {
      this.setState({blnSaveDisable: true});
    }
  }

  handleSaveOnClick = () => {
    let saveNum = this.state.blnSave;
    this.setState({blnSave: ++saveNum});
  };

  render(){

    const { classes } = this.props;
    const selPSType = this.state.selPSType;
    const selPSValue = this.state.selPSValue;
    const listCmnSet = this.state.listCmnSet;
    const saveNum = this.state.blnSave;
    const isReadOnly = (this.state.latestEncounter.readOnly || this.state.blnSaveDisable) ? true : false;

    const td_save = {
      verticalAlign: "bottom",
      align: "right"
    };

    return (
        <div>
            <table width={1850}><td>
            <NSelect 
                state={selPSType}
                data={listCmnSet} 
                name={"qsHeaderComboBox"}
                label={"Procedure Set"}
                disable={false}
                handleOnChange={this.handleSelectOnChange}
            />
            </td>
            <td style={td_save}>
              <Button onClick={this.handleSaveOnClick} disabled={isReadOnly} >Save</Button>
            </td>
            </table>
            <ProcedureSetForm cmnSetId={selPSValue} save={saveNum} />
        </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    procedureCommonSet: state.clinicalContentProcedureSet.procedureCommonSet,
    latestEncounter: state.clinicalContentEncounter.latestEncounter
  };
};

const mapDispatchToProps = {
  getProcedureCommonSet_saga
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ProcedureSet));