import React from 'react';
import { makeStyles, withStyles, Theme, createStyles, ThemeProvider, createMuiTheme,MuiThemeProvider  } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import { Provider as ReduxProvider } from 'react-redux';
import { createStore } from 'redux';
import * as Yup from 'yup';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import Chip from '@material-ui/core/Chip';
import Input from '@material-ui/core/Input';
import MultipleSelect from './MultipleSelect';
import { Grid, ListItemText, Checkbox, FormControlLabel, FormGroup, Switch, MenuItem } from '@material-ui/core';
//import DtsSetProblemProcedure from './components/DtsSetProblemProcedure';
// import SelectFieldValidator from './component/FormValidator/SelectFieldValidator';

const theme = createMuiTheme({});


const useStyles = makeStyles((theme) => ({
//   root: {
//     display: "flex",
//     flexFlow: "column",
//     height: "100vh",
//     margin: 0,
//     overflow: "hidden",
//   },
   root: {
    display: 'flex',
    flexFlow: 'column',
    height: '100vh',
    margin: 0,
    overflow: 'hidden'
  },
  button: {
    marginRight: 5
  },
  addressSelect: {
    width: 460,
    minHeight: 10,
    margin: '10px 10px 10px 10px'
  },
  error: {
    color: 'red',
    fontSize: '0.75rem'
  },
  form: {
    marginLeft: '5rem',
    marginRight: '5rem',
    marginTop: '1rem'
  },
  fdiToothLabel: {
    //width: '100%',
    display: 'inline-block',
    fontSize: 14,
    marginTop: '10px'
    //fontFamily: 'Microsoft JhengHei, Calibri'
  },
  paperProps: {
    maxHeight: 48 * 4.5 + 8,
    width: 250
  },
  multipleSelect: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    maxWidth: 300
  }

}));

const procedureSet = [
    {
        existingFilling: [
                {
                    qualifierName: 'qualifier1',
                    type: 'toggle',
                    label: 'Supernumerary',
                    supernumeraryFlag: 1
                },
                {
                    qualifierName: 'qualifier2',
                    type: 'select',
                    isMultiple: false,
                    label: 'Surface Involved ',
                    required: true,
                    options: [
                        {
                            label: 'Crown Surface',
                            value: 10
                        },
                        {
                            label: 'Root Surface',
                            value: 20
                        },
                        {
                            label: 'Both crown and root surface',
                            value: 30
                        }
                    ]
                },
                {
                    qualifierName: 'qualifier3',
                    type: 'select',
                    isMultiple: false,
                    label: 'Reason for Restoration ',
                    required: false,
                    options: [
                        {
                            label: 'Due to previous carious experience',
                            value: 10
                        },
                        {
                            label: 'NOT due to caries',
                            value: 20
                        },
                        {
                            label: 'Others (Please specify in the "Details" box)' ,
                            value: 30
                        }
                    ]
                },
                {
                    qualifierName: 'qualifier4',
                    type: 'select',
                    isMultiple: false,
                    label: 'Restoration Materials ',
                    required: true,
                    options: [
                        {
                            label: 'Amalgam/GIC with metal additives (e.g. Miracle Mix)',
                            value: 10
                        },
                        {
                            label: 'Composite resin/GIC/Compomer',
                            value: 20
                        },
                        {
                            label: 'Cast metal',
                            value: 30
                        },
                        {
                            label: 'Ceramic/Ceramo-metal (VMK)',
                            value: 40
                        },
                        {
                            label: 'Temporary filling material',
                            value: 50
                        }
                    ]
                }
            ]
    },
    {
        scaling: [
            {
                type: 'toogle',
                label: 'Supernumerary'
            },
            {
                qualifierName: 'qualifier2',
                type: 'select',
                isMultiple: true,
                label: 'Dental Arches ',
                required: true,
                options: [
                    {
                        label: 'All',
                        value: 10
                    },
                    {
                        label: 'Upper dental arch ',
                        value: 20
                    },
                    {
                        label: 'Lower dental arch ',
                        value: 30
                    }
                ]
            },
            {
                qualifierName: 'qualifier3',
                type: 'select',
                isMultiple: true,
                label: 'Local Anaesthetic / Medication ',
                required: true,
                options: [
                    {
                        label: 'All',
                        value: 10
                    },
                    {
                        label: 'Infiltration - Lignocaine (lidocaine) hydrochloride 2% + adrenaline (epinephrine)',
                        value: 20
                    },
                    {
                        label: 'Infiltration - Mepivacaine hydrochloride 3%',
                        value: 30
                    },
                    {
                        label: 'ID Block - Lignocaine (lidocaine) hydrochloride 2% + adrenaline (epinephrine)',
                        value: 40
                    },
                    {
                        label: 'Intraligamental - Lignocaine (lidocaine) hydrochloride 2% + adrenaline (epinephrine)',
                        value: 50
                    },
                    {
                        label: 'Intraligamental - Mepivacaine hydrochloride 3%',
                        value: 60
                    },
                    {
                        label: 'Ethyl chloride',
                        value: 70
                    },
                    {
                        label: 'Other medication (Please specify in the "Details" box)',
                        value: 80
                    }
                ]
            },
            {
                qualifierName: 'qualifier3',
                type: 'select',
                isMultiple: true,
                label: 'Scalling Site ',
                required: false,
                options: [
                    {
                        label: 'All',
                        value: 10
                    },
                    {
                        label: 'Supragingival only ',
                        value: 20
                    },
                    {
                        label: 'Subgingival (subgingival curettage) ',
                        value: 30
                    }
                ]
            },
            {
                qualifierName: 'qualifier4',
                type: 'select',
                isMultiple: true,
                label: 'Local Anaesthetic / Medication ',
                required: true,
                options: [
                    {
                        label: 'All',
                        value: 10
                    },
                    {
                        label: 'Infiltration - Lignocaine (lidocaine) hydrochloride 2% + adrenaline (epinephrine)',
                        value: 20
                    },
                    {
                        label: 'Infiltration - Mepivacaine hydrochloride 3%',
                        value: 30
                    },
                    {
                        label: 'ID Block - Lignocaine (lidocaine) hydrochloride 2% + adrenaline (epinephrine)',
                        value: 40
                    },
                    {
                        label: 'Intraligamental - Lignocaine (lidocaine) hydrochloride 2% + adrenaline (epinephrine)',
                        value: 50
                    },
                    {
                        label: 'Intraligamental - Mepivacaine hydrochloride 3%',
                        value: 60
                    },
                    {
                        label: 'Ethyl chloride',
                        value: 70
                    },
                    {
                        label: 'Other medication (Please specify in the "Details" box)',
                        value: 80
                    }
                ]
            },
            {
                qualifierName: 'qualifier5',
                type: 'select',
                isMultiple: true,
                label: 'Dental Quadrants ',
                required: false,
                options: [
                    {
                        label: 'All',
                        value: 10
                    },
                    {
                        label: 'Q1 - upper right quadrant of dental arch',
                        value: 20
                    },
                    {
                        label: 'Q2 - upper left quadrant of dental arch',
                        value: 30
                    },
                    {
                        label: 'Q3 - lower left quadrant of dental arch',
                        value: 40
                    },
                    {
                        label: 'Q4 - lower right quadrant of dental arch',
                        value: 50
                    }
                ]
            }
        ]
    }
  ];


const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: 48 * 4.5 + 8,
      width: 250
    }
  }
};

const id = 'app';

class ProblemProcedureDynamicForm extends React.Component {
  constructor(props) {
    super(props);

    // State also contains the updater function so it will
    // be passed down into the context provider
    this.state = {
      formData: {},
      validationSchema: {},
      isSelected: false,
      getFormKey: null,
      selectedValue: null,
      fdiToothNo: [12, 11, 20],
      value: []
    };
  }

  componentDidMount() {

  }

  componentDidUpdate(prevState) {


  }

  initForm = (formSchema) => {
    let _formData = {};
    let _validationSchema = {};

  //console.log('formSchema' + JSON.stringify(formSchema));
        for (let key of Object.keys(formSchema)) {

            _formData[key] = '';

            if (formSchema[key].type === 'text') {
                _validationSchema[key] = Yup.string();
            } else if (formSchema[key].type === 'email') {
                _validationSchema[key] = Yup.string().email();
            } else if (
                formSchema[key].type === 'select' &&
                formSchema[key].isMultiple === false
            ) {
                _validationSchema[key] = Yup.string().oneOf(
                formSchema[key].options.map((o) => o.value)
                );
            } else if (
                formSchema[key].type === 'select' &&
                formSchema[key].isMultiple === true
            ) {
                //_validationSchema[key] = Yup.string().oneOf(formSchema[key].options.map(o => o.value));
                _validationSchema[key] = Yup.string().oneOf(
                formSchema[key].options.map((item) => item.value)
                );
            }

            if (formSchema[key].required) {
                _validationSchema[key] = _validationSchema[key].required('Required');
            }
        }

        this.setState({ formData: _formData });
        this.setState({
        validationSchema: Yup.object().shape({ ..._validationSchema })
        });



  };

    checkDuplicateSelect =() => {


    }

  getFormElement = (elementName, elementSchema) => {

    const { classes } = this.props;

    if (elementSchema.type === 'text' || elementSchema.type === 'email') {
      return (
        <React.Fragment>
          {' '}
          {elementSchema.label + ': '}
          <TextField variant="outlined" label={elementSchema.label} />{' '}
        </React.Fragment>
      );
    }

    if (elementSchema.type === 'toggle') {
      return (
        <React.Fragment>
          <FormGroup row style={{ width: '100%' }}>
            <FormControlLabel
                control={
                <Switch
                    checked={this.state.supernumerary}
                    color="primary"
                    name="supernumerary"
                />
              }
                label="supernumerary"
            />
            <div style={{ marginTop: 12 }}>
              <label>*FDI Tooth No. {this.getSelectedFDIToothNo()} </label>
            </div>
          </FormGroup>
        </React.Fragment>
      );
    }

    if (elementSchema.type === 'select' && elementSchema.isMultiple === true) {

        const { id='', options=[] } = this.props;

          return (
            <>
            <FormControl id={'qualifier_multiple_select'} style={{width:'100%',fontFamily:'Arial'}}>

                <InputLabel htmlFor={elementName}>
                    {elementSchema.label + ': '}
                  </InputLabel>

                <MultipleSelect
                    name={elementName}
                    id="qualifier_select"
                    options={elementSchema && elementSchema.options.map((item) => ({value:item, label:item.label}))}
                    value={[this.state[elementName]]}
                    onChange={this.props.handleChange}
                />

            </FormControl>
            </>
          );
    }

    if (elementSchema.type === 'select' && elementSchema.isMultiple === false) {
      return (
        <React.Fragment>
          {elementSchema.label && (
            <label htmlFor={elementName.name}>{elementSchema.label + ': '} </label>
          )}

          <Select
              native
              value={elementSchema.options.value}
              name={elementName.name}
              onChange={(e) => this.hanldeQualifierSelect(e.target.value)}
          >
            <option value="">Choose...</option>
            {/* {elementSchema.options.map((optn, index) => (
              <option key value={optn.value} label={optn.label || optn.value} />
            ))} */}
          </Select>
        </React.Fragment>
      );
    }
  };

  checkIsArray = (elementArray, options) => {

  };
  onSubmit = (values, { setSubmitting, resetForm, setStatus }) => {
    //console.log(values);
    setSubmitting(false);
  };

  getFormData = (value) => {
    console.log('value: ' + JSON.stringify(value));

    console.log('value length: ' + Object.keys(value));

      this.initForm(value);
      this.setState({ isSelected: true });
      this.setState({ getFormKey: value });


  };

  hanldeQualifierSelect = (e) => {
    this.setState({ selectedValue: e });
  };

  getSelectedFDIToothNo = () => {
    let selectedFDIToothNo = '';

    let tempArray = this.state.fdiToothNo;

    if (Array.isArray(tempArray)) {
      for (let i = 0; i < tempArray.length; i++) {
        selectedFDIToothNo += tempArray[i] + ', ';
      }
    }

    if (selectedFDIToothNo.endsWith(', ')) {
      selectedFDIToothNo = selectedFDIToothNo.slice(0, -2) + '';
    }
    return selectedFDIToothNo;
  };

  render() {
    const { classes, className, ...rest } = this.props;

    //console.log('procedureSet: ' + JSON.stringify(procedureSet));
    return (
        <div>
            <Button
                className={classes.button}
                variant="contained"
                color="primary"
                onClick={(e) => this.getFormData(procedureSet[0].existingFilling)}
                value="Existing Filling"
            >Existing Filling
            </Button>

            <Button
                className={classes.button}
                variant="contained"
                color="primary"
                onClick={(e) => this.getFormData(procedureSet[1].scaling)}
                value="Scaling"
            > Scaling
            </Button>

            <Button
                className={classes.button}
                variant="contained"
                color="primary"
                onClick={(e) => this.getFormData(procedureSet)}
                value="Set"
            >
            Set
            </Button>

            {this.state.isSelected === true && (
            <MuiThemeProvider theme={theme}>
                <Formik
                    enableReinitialize
                    initialValues={this.state.formData}
                    validationSchema={this.state.validationSchema}
                //ref="form"
                    onSubmit={this.onSubmit}
                >
                {(props) => (
                    <Form className={classes.form}>
                    <Field name="startDate">
                        {({ field, form, meta }) =>
                        Object.keys(this.state.getFormKey).map((key, ind) => (
                            <div key={key}>
                                {this.getFormElement(key, this.state.getFormKey[key])}
                            </div>
                        ))
                        }
                    </Field>
                    </Form>
                )}
                </Formik>
            </MuiThemeProvider>

            )}
        </div>

    );
  }
}
export default withStyles(useStyles)(ProblemProcedureDynamicForm);