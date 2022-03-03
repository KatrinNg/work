import React, { Component } from 'react';
import { styles } from './TestContainerStyle';
import { withStyles } from '@material-ui/core/styles';
import { Card, CardContent, Typography } from '@material-ui/core';
import * as constants from '../../../../../../../constants/IOE/ixRequest/ixRequestConstants';
import ClickBoxField from '../../components/ClickBoxField/ClickBoxField';
import InputBoxField from '../../components/InputBoxField/InputBoxField';
import DropdownField from '../../components/DropdownField/DropdownField';
import * as utils from '../../../utils/ixUtils';
import classNames from 'classnames';
import EventEmitter from '../../../../../../../utilities/josCommonUtilties';

class TestContainer extends Component {

  UNSAFE_componentWillMount(){
    EventEmitter.on('ix_request_edit_dialog_test_scroll', this.handleScroll);
  }

  componentWillUnmount(){
    EventEmitter.remove('ix_request_edit_dialog_test_scroll', this.handleScroll);
  }

  handleScroll = (payload={}) => {
    let { labId, formId, itemId } = payload;
    let anchorElement = document.getElementById(`edit_test_${labId}_${formId}_${itemId}`);
    anchorElement && anchorElement.scrollIntoView({ behavior: 'smooth',block: 'end'});
  }

  handleTest = (id,valMap,masterTestMap) => {
    const { selectedLabId } = this.props;
    utils.handleTestItem(id,valMap,masterTestMap,selectedLabId);
  }

  generateItemByType = (item,type=constants.ITEM_VALUE.TYPE1) => {
    const { dropdownMap,middlewareObject,updateState } = this.props;
    let itemType = null;
    if (type === constants.ITEM_VALUE.TYPE1) {
      itemType = item.frmItemTypeCd;
    } else if (type === constants.ITEM_VALUE.TYPE2) {
      itemType = item.frmItemTypeCd2;
    }

    let fieldProps = {
      id:item.codeIoeFormItemId,
      middlewareObject,
      itemValType:type,
      categoryType:constants.ITEM_CATEGORY_TYPE.TEST,
      updateState
    };

    let element = null;
    switch (itemType) {
      case constants.FORM_ITEM_TYPE.CLICK_BOX:{
        if (type !== constants.ITEM_VALUE.TYPE1) {
          element = (<ClickBoxField {...fieldProps} />);
        }
        break;
      }
      case constants.FORM_ITEM_TYPE.INPUT_BOX:{
        fieldProps.maxLength = item.fieldLength;
        fieldProps.sideEffect = utils.handleInputBoxOperationType;
        fieldProps.nullAble = item.nullAble;
        element = (<InputBoxField {...fieldProps} />);
        break;
      }
      case constants.FORM_ITEM_TYPE.DROP_DOWN_LIST:{
        fieldProps.dropdownMap = dropdownMap;
        fieldProps.sideEffect = utils.handleDropdownOperationType;
        element = (<DropdownField {...fieldProps} />);
        break;
      }
      default:
        break;
    }
    return element;
  }

  generateItem = item => {
    let type1Element = this.generateItemByType(item,constants.ITEM_VALUE.TYPE1);
    let type2Element = this.generateItemByType(item,constants.ITEM_VALUE.TYPE2);

    return (
      <div>
        <div>
          <span>{item.frmItemName}</span>
        </div>
        <div>{type1Element}</div>
        <div>{type2Element}</div>
      </div>
    );
  }

  generateTestSign = item => {
    const { classes } = this.props;
    let element = null;
    if (item.ioeType !== constants.TEST_ITEM_IOE_TYPE.ITE) {
      let sign = '';
      switch (item.ioeType) {
        case constants.TEST_ITEM_IOE_TYPE.ITEF:
          sign = '#';
          break;
        case constants.TEST_ITEM_IOE_TYPE.ITEO:
          sign = '@';
          break;
        default:
          break;
      }
      element=(
        <div className={
            classNames(classes.signWrapper,{
              [classes.ITEFSign]:item.ioeType === constants.TEST_ITEM_IOE_TYPE.ITEF,
              [classes.ITEOSign]:item.ioeType === constants.TEST_ITEM_IOE_TYPE.ITEO
            })
          }
        >
          {sign}
        </div>
      );
    }
    return element;
  }


  generateGroupItems = items => {
    let { updateState,classes,selectedLabId,selectedFormId,middlewareObject,ioeFormMap,openCommonMessage } = this.props;
    let itemElements = [];
    if (items.length>0) {
      items.forEach(item => {
        let cbFieldProps = {
          id:item.codeIoeFormItemId,
          middlewareObject,
          selectedFormId,
          categoryType:constants.ITEM_CATEGORY_TYPE.TEST,
          sideEffect:this.handleTest,
          ioeFormMap,
          openCommonMessage,
          updateState
        };
        let itemElement = this.generateItem(item);
        let signElement = this.generateTestSign(item);
        itemElements.push(
          <div key={`${selectedLabId}_${selectedFormId}_${item.codeIoeFormItemId}`} id={`edit_test_${selectedLabId}_${selectedFormId}_${item.codeIoeFormItemId}`} className={classes.itemWrapperDiv}>
            <div className={
                classNames(classes.checkBoxDiv,{
                  [classes.checkBoxDivWithSign]:item.ioeType !== constants.TEST_ITEM_IOE_TYPE.ITE
                })
              }
            >
              <div className={classes.checkBoxWrapper}>
                <ClickBoxField {...cbFieldProps} />
              </div>
              {signElement}
            </div>
            <div className={classes.formItemDiv}>
              {itemElement}
            </div>
          </div>
        );
      });
    }
    return itemElements;
  }

  generateGroupList = () => {
    const { classes,testFrameworkMap,selectedLabId,selectedFormId } = this.props;
    let groups = [];
    if (testFrameworkMap.size > 0 ) {
      for (let [groupName, items] of testFrameworkMap) {
        let itemElements = this.generateGroupItems(items);
        groups.push(
          <Card key={`${selectedLabId}_${selectedFormId}_${groupName}`} className={classes.card}>
            <CardContent classes={{root:classes.cardContent}}>
              <Typography
                  component="div"
                  variant="subtitle1"
                  classes={{subtitle1: classes.groupNameTitle}}
              >
                <label>{groupName}</label>
              </Typography>
              <Typography component="div">{itemElements}</Typography>
            </CardContent>
          </Card>
        );
      }
    }
    return groups;
  }

  render() {
    const { classes,displayHeader=false } = this.props;
    return (
      <div>
        <Typography
            classes={{
              h6:classNames(classes.title,{
                [classes.hiddenTitle]: displayHeader === true
              })
            }}
            component="div"
            variant="h6"
            noWrap
        >
          Test
        </Typography>
        <div className={classNames(classes.wrapper,{[classes.wrapperHidden]:displayHeader === true})}>
          <div className={classNames(classes.cardContainer,{[classes.cardContainerHidden]:displayHeader === true})}>
            {this.generateGroupList()}
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(TestContainer);
