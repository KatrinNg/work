import React,{Component} from 'react';
import SelectFieldValidator from '../../../../../components/JSelect/JMuiSelect/JSelectFieldValidator';
import ValidatorForm from '../../../../../components/FormValidator/ValidatorForm';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { getState } from '../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

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
          padding:0,
          '&.Mui-disabled': {
            color: color.cimsTextColor,
            backgroundColor: color.cimsDisableColor
          }
        }
      },
      MuiInputLabel: {
        shrink: {
          color: `${theme.palette.cimsLabelColor} !important`
        }
      },
      MuiMenuItem: {
        root: {
          color: theme.palette.cimsTextColor,
          fontSize: font.fontSize,
          fontFamily: font.fontFamily
        }
      }
    }
  });
};

class SearchSelect extends Component {
  constructor(props){
    super(props);
    const {value,options=[],children=[]}=props;
    this.state={
      value:value||(options.length?options[0].value:children.length?children[0].props.value:''),
      options:this.props.options
    };
  }
  componentDidMount(){
    const {onChange,value,name,id}=this.props;
    if(name==='Service'){
      if(id.indexOf('officerInChargeMaintenance')!=-1){
        onChange&&value&&onChange(value);
      }
      else{
        onChange&&value&&onChange(name,value);
      }
    }
  }
  UNSAFE_componentWillReceiveProps(nextProp){
    if(nextProp.options!==this.state.options){
      const {value,options=[],children=[]}=nextProp;
      if(value!==undefined&&value!==''){
        this.setState({value});
      }
      else if(options.length||children.length){
        this.setState({value:options.length?options[0].value:children[0].value});
      }
        this.setState({options:options});
    }
    if(nextProp.value != this.state.value){
      this.setState({value:nextProp.value});
    }
  }
  handleChange=(e)=>{
    const {onChange, isPastRecordEdit, name, id}=this.props;
    this.setState({value:!isPastRecordEdit?e.value:this.state.value});
    if(id.indexOf('officerInChargeMaintenance')!=-1){
      onChange&&onChange(e.value);
    }else{
      onChange&&onChange(name,e.value);
    }
  }
  render(){
    const {id,name,clinicIsDisabled}=this.props;
    let {options=[]}=this.state;
    const {value}=this.state;
    options = options.length>0?options:[];
    return (
      <ValidatorForm ref="form">
        <MuiThemeProvider theme={customTheme}>
          <SelectFieldValidator
              id={id}
              options={options && options.map(item => ({ value: item.value, label: item.title }))}
              TextFieldProps={{
                variant: 'standard',
                label: <>{name}</>
              }}
              value={value}
              onChange={this.handleChange}
              placeholder=""
              msgPosition="bottom"
              fullWidth
              isDisabled={name==='Clinic'&&clinicIsDisabled?true:false}
          >
          </SelectFieldValidator>
        </MuiThemeProvider>
      </ValidatorForm>
    );
  }
}

export default SearchSelect;
