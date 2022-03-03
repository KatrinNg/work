import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './SpecimenContainerStyle';
import { Card, CardContent, Typography } from '@material-ui/core';
import * as ServiceProfileConstants from '../../../../../../constants/IOE/serviceProfile/serviceProfileConstants';
import ClickBoxField from '../../components/ClickBoxField/ClickBoxField';
import InputBoxField from '../../components/InputBoxField/InputBoxField';
import DropdownField from '../../components/DropdownField/DropdownField';
import * as utils from '../../../ServiceProfile/utils/dialogUtils';
import classNames from 'classnames';

class SpecimenContainer extends Component {

  handleSpecimen = (id,valMap) => {
    utils.handleSepcimenItem(id,valMap);
  }

  generateItemByType = (item,type=ServiceProfileConstants.ITEM_VALUE.TYPE1) => {
    const { dropdownMap,middlewareObject,updateState } = this.props;
    let itemType = null;
    if (type === ServiceProfileConstants.ITEM_VALUE.TYPE1) {
      itemType = item.frmItemTypeCd;
    } else if (type === ServiceProfileConstants.ITEM_VALUE.TYPE2) {
      itemType = item.frmItemTypeCd2;
    }

    let fieldProps = {
      id:item.codeIoeFormItemId,
      middlewareObject,
      itemValType:type,
      categoryType:ServiceProfileConstants.ITEM_CATEGORY_TYPE.SPECIMEN,
      nullAble: item.nullAble,
      updateState
    };

    let element = null;
    switch (itemType) {
      case ServiceProfileConstants.FORM_ITEM_TYPE.CLICK_BOX:{
        if (type !== ServiceProfileConstants.ITEM_VALUE.TYPE1) {
          element = (<ClickBoxField {...fieldProps} />);
        }
        break;
      }
      case ServiceProfileConstants.FORM_ITEM_TYPE.INPUT_BOX:{
        fieldProps.maxLength = item.fieldLength;
        fieldProps.sideEffect = utils.handleInputBoxOperationType;
        element = (<InputBoxField {...fieldProps} />);
        break;
      }
      case ServiceProfileConstants.FORM_ITEM_TYPE.DROP_DOWN_LIST:{
        fieldProps.dropdownMap = dropdownMap;
        element = (<DropdownField {...fieldProps} />);
        break;
      }
      default:
        break;
    }
    return element;
  }

  generateItem = item => {
    let type1Element = this.generateItemByType(item,ServiceProfileConstants.ITEM_VALUE.TYPE1);
    let type2Element = this.generateItemByType(item,ServiceProfileConstants.ITEM_VALUE.TYPE2);

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

  generateGroupItems = items => {
    let { updateState,classes,selectedLabId,selectedFormId,middlewareObject } = this.props;
    let itemElements = [];
    if (items.length>0) {
      items.forEach(item => {
        let cbFieldProps = {
          id:item.codeIoeFormItemId,
          middlewareObject,
          selectedFormId,
          categoryType:ServiceProfileConstants.ITEM_CATEGORY_TYPE.SPECIMEN,
          sideEffect:this.handleSpecimen,
          updateState
        };
        let itemElement = this.generateItem(item);

        itemElements.push(
          <div key={`${selectedLabId}_${selectedFormId}_${item.codeIoeFormItemId}`} className={classes.itemWrapperDiv}>
            <div className={classes.checkBoxDiv}>
              <ClickBoxField {...cbFieldProps} />
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
    const { classes,specimenFrameworkMap,selectedLabId,selectedFormId } = this.props;
    let groups = [];
    if (specimenFrameworkMap.size > 0 ) {
      for (let [groupName, items] of specimenFrameworkMap) {
        let itemElements = this.generateGroupItems(items);
        groups.push(
          <Card key={`${selectedLabId}_${selectedFormId}_${groupName}`} className={classes.card}>
            <CardContent classes={{root:classes.cardContent}}>
              <Typography
                  component="div"
                  variant="subtitle1"
                  classes={{
                    subtitle1: classes.groupNameTitle
                  }}
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
          Specimen
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

export default withStyles(styles)(SpecimenContainer);
