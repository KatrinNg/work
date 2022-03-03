import React, { Component } from 'react';
import { withStyles, Checkbox } from '@material-ui/core';
import { styles } from './CheckBoxStyle';
import { COMMON_ACTION_TYPE } from '../../../../../constants/common/commonConstants';


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
        const { itemId, valMap, attrName } = nextProps;
        if (valMap.has(itemId)) {
            let valObj = valMap.get(itemId);
            this.setState({ val: valObj[attrName] });
        }
    }

    handleCheckBoxChange = (event) => {
        event.stopPropagation();
        let { updateState, itemId, valMap, attrName, insertGscEnquiryLog } = this.props;
        let checkedFlag = false, countIn = 0;
        let enquiryMap = valMap;
        let value = event.target.checked;
        this.setState({ val: value });
        if (valMap.has(itemId)) {
            let tempObj = valMap.get(itemId);
            tempObj[attrName] = value;
            this.handleOperationType(tempObj);
        }
        for (let valObj of enquiryMap.values()) {
            if (valObj[attrName]) {
                countIn++;
            }
        }
        if (countIn == enquiryMap.size) {
            checkedFlag = true;
        }
        updateState && updateState({ valMap, contactCheckedFlag: checkedFlag, isEdit: true });
        let name = `Action: Click 'Checked' table list in (rowId:${itemId},checked:${value})`;
        insertGscEnquiryLog && insertGscEnquiryLog(name, '');
    };

    handleOperationType = (valObj) => {
        if (valObj.version) {
            valObj.operationType = COMMON_ACTION_TYPE.UPDATE;
        } else {
            valObj.operationType = COMMON_ACTION_TYPE.INSERT;
        }
    }

    render() {
        const { attrName, itemId = '', classes } = this.props;
        let { val } = this.state;
        return (
            <div className={classes.wrapper}>
                <Checkbox
                    checked={val}
                    onChange={this.handleCheckBoxChange}
                    color="primary"
                    id={`${attrName}_checkbox_${itemId}`}
                    key={`${attrName}_checkbox_${Math.random()}`}
                />
            </div>
        );
    }
}

export default withStyles(styles)(CheckBox);
