import './css/textarea.css';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles, makeStyles, useTheme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import axios from 'axios';
import CheckBox from './CheckBox';
import ProcedureSetBox from './ProcedureSetBox';
import { 
  procTermCncpt 
} from './common/ProcedureSetUnit';
import {
  getProcedureSetGroup_saga
} from '../../../../../store/actions/dts/clinicalContent/procedureSetAction';

const styles = (theme) => ({
});

class ProcedureSetForm extends Component {

  constructor(props){
    super(props);

    this.state = {
      listTermCncpt: [],
      saveTermCncptIdList: []
    };
  }

  componentWillMount() {
  }

  componentDidMount() {
  }

  componentDidUpdate(prevProps) {
    if(this.props.cmnSetId != prevProps.cmnSetId) {
      this.props.getProcedureSetGroup_saga({setId:this.props.cmnSetId});
    }

    if(this.props.procedureSetGroup != prevProps.procedureSetGroup) {
      let procedureSetGroup = this.props.procedureSetGroup;
      let listTermCncpt = [];
      let i;
      for (i = 0; i < procedureSetGroup.length; i++) {
        let termCncpt = {...procTermCncpt};
        termCncpt.name = procedureSetGroup[i].siteName;
        termCncpt.id = procedureSetGroup[i].termCncptId;
        termCncpt.serviceId = procedureSetGroup[i].codeTermServiceId;
        listTermCncpt.push(termCncpt);
      }
      
      this.setState({listTermCncpt: listTermCncpt});
      let j;
      for (j = 0; j < listTermCncpt.length; j++) {
        let sel = this.state[listTermCncpt[j].id];
        if (sel) {
          this.setState({[listTermCncpt[j].id]: false});
        }
      }
    }

    if(this.props.save != prevProps.save) {
      let listTermCncpt = this.state.listTermCncpt;
      let i;
      let saveTermCncptIdList = [];
      for (i = 0; i < listTermCncpt.length; i++) {
        let checkedBox = this.state[listTermCncpt[i].id];
        if (checkedBox) {
          saveTermCncptIdList.push(listTermCncpt[i].id);
        }
      }
      this.setState({saveTermCncptIdList: saveTermCncptIdList});
    }
  }

  componentWillUnmount() {
  }

  handleCheckBoxOnChange = (event) => {
    let result = event.target.checked;
    
    this.setState({[event.target.name]: result });
    let x = document.getElementById(event.target.name);
    if (result) {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
  }

  render(){

    const {cmnSetId, save, classes} = this.props;

    const saveIdList = this.state.saveTermCncptIdList;

    const HeadTextTypography = withStyles({
        root: {
          color: "#000099",
          margin: "1rem",
          fontWeight: "500"
        }
      })(Typography);

    const isHeader = true;

    const listTermCncpt = this.state.listTermCncpt; 

    const colNum = 3;
    const remainNum = ((listTermCncpt.length % colNum) > 0) ? 1 : 0;
    const rowNum = (Math.floor(listTermCncpt.length / colNum)) + remainNum;

    let boxList = [rowNum - 1];

    let j;
    for (j = 0; j < colNum; j++) {
      boxList[j] = listTermCncpt.map((termCncpt, i) => {
        if (i >= (j * rowNum) && i < ((j + 1) * rowNum)) {
            let disable = (this.state[termCncpt.id]) ? false : true;
            return (
                <tr><CheckBox 
                    state={this.state[termCncpt.id]}
                    name={termCncpt.id}
                    label={<HeadTextTypography variant="h7">{termCncpt.name}</HeadTextTypography>}
                    handleOnChange={this.handleCheckBoxOnChange}
                    isHeader={isHeader}
                    />
                    {this.state["saveResult_" + termCncpt.id]}
                    <ProcedureSetBox saveResult={this.state["saveResult_" + termCncpt.id]} termCncptId={termCncpt.id} termDesc={termCncpt.name} codTermServId={termCncpt.serviceId} disable={disable} divId={termCncpt.id} cmnSetId={cmnSetId} saveIdList={saveIdList} /></tr>);
        }
    });
    }

    let boxForm = boxList.map((box, i) => {
      return (
          <td key={i} width="630">
              {box}
          </td>);
    });

    return (
      <div>
          <table>
              {boxForm}
          </table>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    procedureSetGroup: state.clinicalContentProcedureSet.procedureSetGroup
  };
};

const mapDispatchToProps = {
  getProcedureSetGroup_saga
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ProcedureSetForm));