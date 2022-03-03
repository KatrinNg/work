import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import {Select,MenuItem,Checkbox,ListItemText} from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import {styles} from './EditTemplateDialogCss';

  const names = [
    'Name',
    'Details'
  ];

class SelectAndCheckBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            personName:[],
            defaultValue:''
        };
      }

      componentDidMount() {
        if(this.props.defaultValue===0){
            let newPersonName=['Name'];
            this.setState({personName:newPersonName});

        }else if(this.props.defaultValue===1){
          let newPersonName=['Details'];
          this.setState({personName:newPersonName});

        }else if(this.props.defaultValue===2){
          this.setState({personName:names});
        }
      }

      UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.defaultValue !== this.state.defaultValue) {
          if(nextProps.defaultValue===0){
              let newPersonName=['Name'];
              this.setState({personName:newPersonName});

          }else if(nextProps.defaultValue===1){
            let newPersonName=['Details'];
            this.setState({personName:newPersonName});

          }else if(nextProps.defaultValue===2){
            this.setState({personName:names});
          }

          this.setState({ defaultValue: nextProps.defaultValue });
        }
      }



      handleChange=(e)=>{
        let {onChange} = this.props;
        if(e.target.value.length===2){
            onChange&&onChange(2);
        }else if(e.target.value.length===0){
            onChange&&onChange(3);
        }else if(e.target.value.length===1){
            if(e.target.value[0]==='Name'){
                onChange&&onChange(0);
            }else{
                onChange&&onChange(1);
            }
        }
        this.setState({personName:e.target.value});
      }

    render() {
        const { classes } = this.props;
        const { personName } = this.state;
        return (
            <FormControl className={classes.formControl}>
                <Select
                    id="mutiple-checkbox"
                    multiple
                    value={personName}
                    onChange={this.handleChange}
                    renderValue={selected => selected.join(', ')}
                    variant="outlined"
                >
                {names.map(name => (
                    <MenuItem key={name} value={name}>
                        <Checkbox id={'mutiple_checkbox_'+name} color="primary" checked={personName.indexOf(name) > -1} />
                        <ListItemText primary={name} />
                    </MenuItem>
                ))}
                </Select>
          </FormControl>
        );
    }
}

export default withStyles(styles)(SelectAndCheckBox);