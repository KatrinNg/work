import React, { Component } from 'react';
import SelectFieldValidator from '../../../../components/JSelect/JMuiSelect/JSelectFieldValidator';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

const customTheme = (theme) =>{
  return createMuiTheme({
    ...theme,
    overrides: {
      MuiMenu: {
        paper: {
          backgroundColor: theme.palette.cimsBackgroundColor
        }
      },
      MuiFormLabel:{
        root:{
          color: theme.palette.cimsPlaceholderColor
        }
      },
      MuiOutlinedInput:{
        input:{
          padding:'9px 9px'
        }
      },
      MuiInputBase:{
        input:{
          height:'unset',
          padding:0
        }
      },
      MuiInputLabel: {
        shrink: {
          color: `${theme.palette.cimsLabelColor} !important`
        }
      }
    }
  });
};

class MultipleSelect extends Component {
  constructor(props) {
    super(props);
    let { value=[] } = props;
    this.state = {
      options: [],
      optionVals: value,
      defaultValue:'All',
      optionList:[]
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.state.optionVals) {
      this.setState({
        optionVals: nextProps.value
      });
    }
  }

  handleChange=(event)=>{
    const { onChange, isPastRecordEdit, name } = this.props;
    let value = event===null?[]:(event||[]);
    if(event!==null){
      value = value.map(item =>(item.value));
    }
    onChange&&onChange(name,value);
    this.setState({optionVals:!isPastRecordEdit?value:this.state.optionVals});
  }

  render() {
    const { id='', options=[], name } = this.props;
    let { optionVals } = this.state;
    let optionList = [];
    optionList = options.length>0?optionVals:null;

    return (
      <ValidatorForm
          ref="form"
      >
        <MuiThemeProvider theme={customTheme}>
          <SelectFieldValidator
              id={id}
              options={options && options.map(item => ({ value: item.value, label: item.title }))}
              TextFieldProps={{
                variant: 'standard',
                label: <>{name}</>
              }}
              value={optionList}
              onChange={this.handleChange}
              placeholder=""
              msgPosition="bottom"
              isMulti
              fullWidth
          />
        </MuiThemeProvider>
      </ValidatorForm>
    );
  }
}

export default MultipleSelect;