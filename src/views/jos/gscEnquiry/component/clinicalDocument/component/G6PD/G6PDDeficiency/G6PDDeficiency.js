import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './G6PDDeficiencyStyle';
import { Table, TableRow, TableCell, TableHead, Checkbox } from '@material-ui/core';
import * as commonConstants from '../../../../../../../../constants/common/commonConstants';

class G6PDDeficiency extends Component {
    constructor(props) {
        super(props);
        this.state = {
            checkedRow: null
        };
    }

    handleChange = (rowId, event) => {
        const { valMap, updateState, neonatalDocId, dataCommon,changeEditFlag } = this.props;
        let cheBox = event.target.checked;
        if (valMap.size > 0 && valMap.has(rowId)) {
            let tempObj = valMap.get(rowId);
            if (tempObj.version) {
                tempObj.opType = cheBox ? commonConstants.COMMON_ACTION_TYPE.UPDATE : commonConstants.COMMON_ACTION_TYPE.DELETE;
                tempObj.itemVal = cheBox;
            } else if (tempObj.opType == commonConstants.COMMON_ACTION_TYPE.INSERT && !cheBox) {
                valMap.delete(rowId);
            } else {
                tempObj.opType = commonConstants.COMMON_ACTION_TYPE.INSERT;
                tempObj.itemVal = cheBox;
            }
        } else {
            let obj = {
                docId: neonatalDocId,
                patientKey: dataCommon.patientKey,
                opType: commonConstants.COMMON_ACTION_TYPE.INSERT,
                itemVal: cheBox,
                docItemId: Math.random(),
                formItemId: rowId,
                createDtm: '',
                dbUpdateDtm: '',
                createBy: '',
                updateBy: '',
                updateDtm: '',
                version: '',
                itemValErrorFlag: false
            };
            valMap.set(obj.formItemId, obj);
        }
        updateState && updateState({ valMap });
        changeEditFlag && changeEditFlag();
    }

    renderCheckBox = (rowId) => {
        let { valMap, roleActionType } = this.props;
        let checkedFalg = false;
        let roleActionFlag = (roleActionType != 'D' && roleActionType != 'N') ? true : false;
        if (valMap.size > 0 && valMap.has(rowId)) {
            let objItems = valMap.get(rowId);
            checkedFalg = objItems.itemVal;
        }
        return (
            <Checkbox
                color="primary"
                id={`checked_${rowId}_${Math.random()}`}
                checked={checkedFalg}
                disabled={roleActionFlag}
                onChange={(event) => this.handleChange(rowId, event)}
                inputProps={{ 'aria-label': 'primary checkbox' }}
            />
        );
    }

    render() {
        const { classes } = this.props;
        return (
            <div style={{ maxHeight: 580, overflow: 'auto' }}>
                <Table>
                    <TableHead>
                        <TableRow className={classes.tableHeadRow}>
                            <TableCell className={classes.tableHeadCell} style={{ width: '5%' }}></TableCell>
                            <TableCell className={classes.tableHeadCell} style={{ textAlign: 'center' }} colSpan={2}>Content</TableCell>
                            <TableCell className={classes.tableHeadCell} style={{ textAlign: 'center', width: '15%' }}>✔after mentioned</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableRow>
                        <TableCell className={classes.textCenter}>1.</TableCell>
                        <TableCell className={classes.tableContentCell} colSpan={2}>Greeting & Self Introduction</TableCell>
                        <TableCell className={classes.textCenter}>
                            {this.renderCheckBox(2052)}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className={classes.textCenter}>2.</TableCell>
                        <TableCell className={classes.tableContentCell} colSpan={2}>Introduction of GSU</TableCell>
                        <TableCell className={classes.textCenter}>
                            {this.renderCheckBox(2053)}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className={classes.textCenter}>3.</TableCell>
                        <TableCell className={classes.tableContentCell} colSpan={2}>Inform parents G6PD screening result</TableCell>
                        <TableCell className={classes.textCenter}>
                            {this.renderCheckBox(2054)}
                        </TableCell>
                    </TableRow>
                    {/* Test1 --start */}
                    <TableRow>
                        <TableCell className={classes.textCenter} rowSpan={14}>4.</TableCell>
                        <TableCell className={classes.textCenterWidth} rowSpan={3}>4.1</TableCell>
                        <TableCell className={classes.tableContentCell}>What is G6PD deficiency (state the proper name)</TableCell>
                        <TableCell className={classes.textCenter}>
                            {this.renderCheckBox(2055)}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className={classes.tableContentCell}>Heredity - X-linked- more male affected</TableCell>
                        <TableCell className={classes.textCenter}>
                            {this.renderCheckBox(2056)}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className={classes.tableContentCell}>Common - incidence of male 4%, female 0.5%</TableCell>
                        <TableCell className={classes.textCenter}>
                            {this.renderCheckBox(2057)}
                        </TableCell>
                    </TableRow>
                    {/* Test1 --end */}

                    {/* Test2 --start */}
                    <TableRow>
                        <TableCell className={classes.textCenterWidth} rowSpan={5}>4.2</TableCell>
                        <TableCell className={classes.tableContentCell}>PATHOGENESIS</TableCell>
                        <TableCell className={classes.textCenter}>
                            {this.renderCheckBox(2058)}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className={classes.tableContentCell}>Not enough enzymes in RBC</TableCell>
                        <TableCell className={classes.textCenter}>
                            {this.renderCheckBox(2059)}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className={classes.tableContentCell}>Haemolysis aggravated by certain substances/chemicals</TableCell>
                        <TableCell className={classes.textCenter}>
                            {this.renderCheckBox(2060)}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className={classes.tableContentCell}>Release large amount of bilirubin</TableCell>
                        <TableCell className={classes.textCenter}>
                            {this.renderCheckBox(2061)}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className={classes.tableContentCell}>Clinical finding -jaundice</TableCell>
                        <TableCell className={classes.textCenter}>
                            {this.renderCheckBox(2062)}
                        </TableCell>
                    </TableRow>
                    {/* Test2 --end */}

                    {/* Test3 --start */}
                    <TableRow>
                        <TableCell className={classes.textCenterWidth} rowSpan={6}>4.3</TableCell>
                        <TableCell className={classes.tableContentCell}>PRECAUTIONS</TableCell>
                        <TableCell className={classes.textCenter}>
                            {this.renderCheckBox(2063)}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className={classes.tableContentCell}>Avoid certain Chinese medicine (specific)</TableCell>
                        <TableCell className={classes.textCenter}>
                            {this.renderCheckBox(2064)}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className={classes.tableContentCell}>Avoid certain drugs</TableCell>
                        <TableCell className={classes.textCenter}>
                            {this.renderCheckBox(2065)}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className={classes.tableContentCell}>Avoid broad beans & their products</TableCell>
                        <TableCell className={classes.textCenter}>
                            {this.renderCheckBox(2066)}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className={classes.tableContentCell}>Avoid contact of mothballs or naphthalene containing products</TableCell>
                        <TableCell className={classes.textCenter}>
                            {this.renderCheckBox(2067)}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className={classes.tableContentCell}>Avoidance of above substances will lead a normal life</TableCell>
                        <TableCell className={classes.textCenter}>
                            {this.renderCheckBox(2068)}
                        </TableCell>
                    </TableRow>
                    {/* Test3 --end */}
                    <TableRow>
                        <TableCell className={classes.textCenter}>5.</TableCell>
                        <TableCell className={classes.tableContentCell} colSpan={2}>Tell the doctor about baby having G6PD Deficiency when consult doctor</TableCell>
                        <TableCell className={classes.textCenter}>
                            {this.renderCheckBox(2069)}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className={classes.textCenter}>6.</TableCell>
                        <TableCell className={classes.tableContentCell} colSpan={2}>Recurrence risk</TableCell>
                        <TableCell className={classes.textCenter}>
                            {this.renderCheckBox(2070)}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className={classes.textCenter}>7.</TableCell>
                        <TableCell className={classes.tableContentCell} colSpan={2}>Remind the child of precautions when the child grows up</TableCell>
                        <TableCell className={classes.textCenter}>
                            {this.renderCheckBox(2071)}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className={classes.textCenter}>8.</TableCell>
                        <TableCell className={classes.tableContentCell} colSpan={2}>Follow up at MCHC</TableCell>
                        <TableCell className={classes.textCenter}>
                            {this.renderCheckBox(2072)}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className={classes.textCenter}>9.</TableCell>
                        <TableCell className={classes.tableContentCell} colSpan={2}>Conclusion</TableCell>
                        <TableCell className={classes.textCenter}>
                            {this.renderCheckBox(2073)}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className={classes.textCenter}>10.</TableCell>
                        <TableCell className={classes.tableContentCell} colSpan={2}>Q & A</TableCell>
                        <TableCell className={classes.textCenter}>
                            {this.renderCheckBox(2074)}
                        </TableCell>
                    </TableRow>
                </Table>
            </div>
        );
    }
}

export default withStyles(styles)(G6PDDeficiency);