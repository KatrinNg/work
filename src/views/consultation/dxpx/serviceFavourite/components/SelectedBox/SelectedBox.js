import React, { Component } from 'react';
import { withStyles, Grid, Chip, Tooltip } from '@material-ui/core';
import { styles } from './SelectedBoxStyle';

class SelectedBox extends Component {
  handleChipDelete = templateId => {
    const { selectedTemplateSet,selectedTemplateIdSet, updateState,insertDxpxLog,type } = this.props;
    for (let item of selectedTemplateSet.values()) {
        if (templateId === item.templateId) {
        insertDxpxLog(`[${type} Service Favourite Dialog] Action:Click 'X' in selected problem (Code Term ID: ${item.codeTermId}; ${type}: ${item.diagnosisName})`,'');
        selectedTemplateSet.delete(item);
        selectedTemplateIdSet.delete(templateId);
        updateState &&
          updateState({
            selectedTemplateSet,
            selectedTemplateIdSet
          });
      }
    }
  };

  generateChips = () => {
    const { classes, selectedTemplateSet } = this.props;
    let chips = [];
    if (selectedTemplateSet.size > 0) {
      for (let item of selectedTemplateSet.values()) {
        let label = item.displayKey===0||item.displayKey===2?
          (item.diagnosisDisplayName.length > 20
            ? `${item.diagnosisDisplayName.substring(0, 17)}...`
            : item.diagnosisDisplayName):
            (item.displayKey===1?
              (item.remarks.length > 20
              ? `${item.remarks.substring(0, 17)}...`
              : item.remarks):'');
        chips.push(
          <Tooltip
              key={item.templateId}
              title={item.diagnosisDisplayName}
              classes={{'tooltip':classes.tooltip}}
          >
            <Chip
                id={`template_chip_${item.templateId}`}
                label={label}
                onDelete={() => {
                this.handleChipDelete(item.templateId);
              }}
                className={classes.chip}
                color="primary"
                classes={{label:classes.label}}
            />
          </Tooltip>
        );
      }
    }
    return chips;
  };

  render() {
    const { classes, legendText = '' } = this.props;
    return (
      <Grid container>
        <fieldset className={classes.fieldSetWrapper}>
          <legend className={classes.legend}>{legendText}</legend>
          <div className={classes.wrapper}>
            {this.generateChips()}
          </div>
        </fieldset>
      </Grid>
    );
  }
}

export default withStyles(styles)(SelectedBox);
