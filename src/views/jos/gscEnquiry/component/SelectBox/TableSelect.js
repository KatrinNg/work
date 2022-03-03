import React, { Component } from 'react';
import { Select, MenuItem, withStyles } from '@material-ui/core';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import {COMMON_ACTION_TYPE} from '../../../../../constants/common/commonConstants';
import { getState } from '../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

const customTheme = (theme) => {
  return createMuiTheme({
      ...theme,
      overrides: {
          MuiMenu: {
              paper: {
                  backgroundColor: color.cimsBackgroundColor
              }
          },
          MuiInputBase: {
              input: {
                  '&.Mui-disabled': {
                      color: color.cimsTextColor,
                      backgroundColor: color.cimsDisableColor
                  }
              }
          }
      }
  });
};

const styles = () => ({
  selectMenu: {
    paddingRight: 0,
    color: color.cimsTextColor,
    fontSize: font.fontSize,
    fontFamily: font.fontFamily
  },
  menuItem: {
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    backgroundColor: color.cimsBackgroundColor,
    color: color.cimsTextColor
  }
});

class TableSelect extends Component {
  constructor(props){
    super(props);
    this.state = {
      value: null
    };
  }

  componentDidMount() {
    const { val } = this.props;
    this.setState({ value: val });
  }

  UNSAFE_componentWillReceiveProps(nextProps){
    const { itemId, valMap, attrName } = nextProps;
    if (valMap.has(itemId)) {
      let valObj = valMap.get(itemId);
      this.setState({ value: valObj[attrName] });
    }
  }

  handleOperationType = (valObj) => {
    if (valObj.version) {
      valObj.operationType = COMMON_ACTION_TYPE.UPDATE;
    } else {
      valObj.operationType = COMMON_ACTION_TYPE.INSERT;
    }
  }

  handleSelectChange = event => {
    let { updateState, itemId, valMap, attrName, insertGscEnquiryLog, chtGspdOption = [] } = this.props;
    let value = event.target.value;
    let logVal = chtGspdOption.find(obj => obj.value === value)?.title;
    let name = `Action: Select in ${attrName} table list (rowId: ${itemId}; value: ${logVal})`;
    this.setState({ value });
    if (valMap.has(itemId)) {
      let tempObj = valMap.get(itemId);
      tempObj[attrName] = value;
      this.handleOperationType(tempObj);
    }
    updateState && updateState({ valMap });
    insertGscEnquiryLog && insertGscEnquiryLog(name, '');
  }

  render() {
    const { classes, attrName, itemId, options, ...rest } = this.props;
    let { value } = this.state;
    return (
      <MuiThemeProvider theme={customTheme}>
        <Select
            id={`${attrName}_selectbox_${itemId}`}
            style={{ width: '100%' }}
            classes={{ selectMenu: classes.selectMenu }}
            onChange={this.handleSelectChange}
            value={value}
            {...rest}
        >
          {options.length ? options.map(item => {
            return (<MenuItem className={classes.menuItem} key={item.value} value={item.value}>{item.title}</MenuItem>);
          }) : null}
        </Select>
      </MuiThemeProvider>
    );
  }
}

export default withStyles(styles)(TableSelect);
