import React, { Component } from 'react';
import { withStyles, Checkbox, FormGroup, FormControlLabel } from '@material-ui/core';
import { styles } from './CheckBoxStyle';
import * as utils from '../../util/utils';
import * as constants from '../../../../../constants/medicalHistories/medicalHistoriesConstants';

class CheckBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      val: null
    };
  }

  componentDidMount() {
    const { val } = this.props;
    this.setState({ val });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { itemId, valMap, type, attrName } = nextProps;
    if (valMap.get(type).has(itemId)) {
      let valObj = valMap.get(type).get(itemId);
      this.setState({ val: valObj[attrName] });
    }
  }

  handleCheckBoxChange = (event) => {
    event.stopPropagation();
    let { updateState, type, itemId, valMap, attrName, changeEditFlag, encounterExistFlag } = this.props;
    let value = event.target.checked ? event.target.value : constants.CHECK_BOX_STATUS.UNCHECKED;
    this.setState({ val: value });
    if (valMap.get(type).has(itemId)) {
      let tempObj = valMap.get(type).get(itemId);
      tempObj[attrName] = value;
      utils.handleOperationType(tempObj);
    }
    updateState && updateState({ valMap });
    if (encounterExistFlag) {
      changeEditFlag && changeEditFlag();
    }
  };

  generateCheckboxs = () => {
    const { attrName, itemId = '', options = [], classes, disabledFlag, formControlLabelStyle } = this.props;
    let { val } = this.state;

    let checkBoxElms = options.map((option, index) => {
      return (
        <FormControlLabel
            key={`checkbox_${itemId}_${index}`}
            value={option.value}
            disabled={disabledFlag}
            label={option.label}
            classes={{ root: classes.formControlLabel }}
            style={formControlLabelStyle}
            control={<Checkbox classes={{ root: classes.checkBoxRoot }} checked={option.value === val} onChange={this.handleCheckBoxChange} color="primary" id={`${attrName}_checkbox_${itemId}`} />}
        />
      );
    });
    return checkBoxElms;
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.wrapper}>
        <FormGroup className={classes.checkBoxGroup}>{this.generateCheckboxs()}</FormGroup>
      </div>
    );
  }
}

export default withStyles(styles)(CheckBox);
