import React, { Component } from 'react';
import {
  Paper,
  TextField,
  Popper,
  Grid
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import _ from 'lodash';
import { connect } from 'react-redux';
import {
  updateSearchBarValue
} from '../../../store/actions/common/commonAction';

const style = {
  root: {
    //flexGrow: 1,
    padding: '2px 4px',
    display:'flex',
    alignItems: 'center',
    margin:5,
    // borderRadius: '15px',
    border: '1px solid rgba(0,0,0,0.42)',
    height: 25
    //width: '90%',
    // position: 'relative'
  },
  input: {
    marginLeft: 8,
    flex: 1,
    fontSize: '12pt'
  },
  iconButton: {
    padding: 10
  },
  paper: {
    zIndex: 1,
    // left: 0,
    // right: 0,
    marginTop: 3,
    maxHeight: 200,
    marginLeft:9,
    position: 'absolute',
    transform: 'translate3d(-180px, 3px, 0px)'
  },
  menu: {
    width: 390,
    maxHeight: 150,
    overflowY: 'auto'
  },
  menu_list: {
    fontSize: '12pt',
    paddingTop: 2,
    paddingBottom: 3,
    height: 'auto',
    whiteSpace: 'inherit',
    backgroundColor: 'white'
  },
  menu_list_select: {
    fontSize: '12pt',
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingTop: 2,
    paddingBottom: 3,
    height: 'auto',
    whiteSpace: 'inherit'
  },
  mr15: {
    wordBreak: 'break-all',
    marginRight: 15,
    minWidth: 330,
    minHeight: 24,
    fontSize: 14
  },
  container: {
    flexGrow: 1,
    position: 'relative'
  }
};
class EditTemplateText extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      count: -1,
      isOnMenu: false,
      isOnInput: false,
      val:this.props.searchInputvalue,
      DisplayNameType:false
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.dataList !== this.props.dataList) {
      this.setState({ count: -1 });
    }
    if(nextProps.searchInputvalue !== this.props.searchInputvalue){
    this.setState({val:nextProps.searchInputvalue});
    }
  }

  componentWillUnmount() {
    // this.props.updateSearchBarValue('', false);
  }

  // enter search
  search = () => {
    if (this.props.onChange) {
      if (this.state.val) {
        this.props.onChange(this.state.val);
        if (!this.props.disabledDropdown) {
          this.setState({ open: true });
        }
      } else {
        this.setState({ open: true });
      }
    }
  };


  // whichone choose
  handleClose = item => {

    this.props.onSelectItem(item);
    if (this.props.keepData) {
      let str = this.getSelectedString(item);
      this.setState({ open: false });
      this.props.updateSearchBarValue(str, true);
    } else {
      this.setState({ open: false });
      this.props.updateSearchBarValue('');
    }
    this.setState({
      val: item.termDisplayName
    });
  };

  // keyboard event
  keyDown = e => {
    if (this.state.open) {
      let temp = _.cloneDeep(this.state.count);
      let dataList = this.props.dataList || [];
      let len = dataList.length; //patient count
      if (e.keyCode === 40) {
        if (temp > -2 && temp < len - 1) {
          temp = temp + 1;
        } else if (temp === len - 1) {
          temp = -2;
        } else {
          temp = 0;
        }
      }
      if (e.keyCode === 38) {
        if (temp > 0 && temp < len) {
          temp = temp - 1;
        } else if (temp === -1) {
          temp = -2;
        } else if (temp === 0) {
          temp = -2;
        } else {
          temp = len - 1;
        }
      }
      if (e.keyCode === 13) {
        if (temp === -2) {
          this.handleNotFound();
          temp = -1;
        } else if (temp === -1) {
          temp = -1;
        } else {
          this.handleClose(this.props.dataList[temp]);
          temp = -1;
        }
      }
      if (temp > 3) {
        document.getElementById(this.props.id + '_Container').scrollTop = (temp - 3) * 30;
        //this.refs.myInput.scrollTop = (temp - 3) * 35;
      } else if (temp > 0 && temp <= 3) {
        //this.refs.myInput.scrollTop = 0;
        document.getElementById(this.props.id + '_Container').scrollTop = 0;
      }
      this.setState({ count: temp });
    } else {
      if (e.keyCode === 13) {
        this.search();
      }
    }
  };

  itemKeyDown = (e, item) => {
    if (e.keyCode === 13) {
      this.props.onSelectItem(item);
      if (this.props.keepData) {
        let str = this.getSelectedString(item);
        this.setState({ open: false });
        this.props.updateSearchBarValue(str, true);
      } else {
        this.setState({ open: false });
        this.props.updateSearchBarValue('');
      }
    }
  }

  handleNotFound = (e) => {
    this.setState({ open: false });
    this.props.updateSearchBarValue('', false);
    if (this.props.handleNotFound) {
      this.props.handleNotFound(e);
    }
  }

  closeSearchData = (e) => {
    this.setState({ open: false });
    this.props.updateSearchBarValue('', false);
    if (this.props.closeSearchData) {
      this.props.closeSearchData(e);
    }
  }


  handleMenuMouseOver = () => {
    this.setState({ isOnMenu: true });
  }

  handleMenuMouseLeave = () => {
    this.setState({ isOnMenu: false });
  }



  getSelectedString(item) {
    let str = '';
    if (this.props.displayField != null) {
      this.props.displayField.forEach((displayField, index) => {
        str = str + (index === 0 ? item[displayField] : ', ' + item[displayField]);
      });
    } else {
      str = item;
    }
    return str;
  }

  handleDisplayName=(e)=>{
    let value = e.target.value;
    this.setState({val: value});
    if(this.props.onSelectItem!==undefined){
      this.props.onSelectItem(value);
    }
  };

  render() {
    const { classes} = this.props;
    return (
      <Paper
          className={classes.root}
          elevation={1}
          onMouseLeave={this.handleMenuMouseLeave}
          onMouseOver={this.handleMenuMouseOver}

      >
        <Grid
            alignItems="center"//Cancel AutoFill in Google Browser
            autoComplete="off"//Cancel AutoFill in Google Browser
            container
            justify="space-between"
        >

              <TextField
                  autoComplete="off"
                  className={classes.input}
                  id={this.props.id + ' displayName'}
                  inputProps={{
                maxLength: 1000
              }}
                  InputProps={{
                disableUnderline: true,
                style:{
                  fontSize: '1rem',
                  fontFamily: 'Arial'
                  //paddingBottom: 12
                }
               }}
                  inputRef={node => {
              this.anchorel = node;
            }}
                  onChange={this.handleDisplayName}
                  value={this.state.val}
              />

        </Grid>
        <Popper
            anchorEl={this.anchorel}
            open={this.state.open}
            style={{zIndex:3000}}
        >
          <Paper className={classes.paper}>

          </Paper>
        </Popper>
      </Paper>
    );
  }
}

function mapStateToProps(state) {
  return {
    value: state.common.searchBarValue,
    keepDataSelected: state.common.keepDataSelected
  };
}

const mapDispatchToProps = {
  updateSearchBarValue
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(style)(EditTemplateText));
