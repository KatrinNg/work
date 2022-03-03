import React from 'react';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Typography from '@material-ui/core/Typography';
import CIMSTableCell from '../../../../../components/TableCell/CIMSTableCell';
import { withStyles } from '@material-ui/core/styles';
import {Checkbox} from '@material-ui/core';
import PropTypes from 'prop-types';

const styles = () => ({
    labelRoot: {
        fontSize: 'inherit',
        fontWeight: 'inherit',
        lineHeight: 'inherit',
        fontFamily: 'inherit',
        color: 'inherit'
    },
    sortLabelRoot: {
        fontSize: 'inherit'
    }
});

class TableHeadActions extends React.Component {
    // createSortHandler = (event, property) => {
    //     if (this.props.onRequestSort) {
    //         this.props.onRequestSort(event, property);
    //     }
    // };

    getMultiRows = (rows, headRowsArray) => {
        if (rows && rows.length > 0) {
            headRowsArray.push(rows);
            let nChilds = [];
            for (let i = 0; i < rows.length; i++) {
                if (rows[i]['child'] && rows[i]['child'].length > 0) {
                    nChilds = nChilds.concat(rows[i]['child']);
                }
            }
            this.getMultiRows(nChilds, headRowsArray);
        }
        return headRowsArray;
    }

    getLastChildNumber = (row) => {
        if (row.child && row.child.length > 0) {
            let count = 0;
            for (let i = 0; i < row.child.length; i++) {
                count = count + this.getLastChildNumber(row.child[i]);
            }
            return count;
        } else {
            return 1;
        }
    }
    cellOnClick = (data,event)=>{
        if(data.disableOnClick !== true&&typeof this.props.cellOnClick === 'function'){
            this.props.cellOnClick(data,event);
        }
    }

    render() {
        const { headRows, classes, cellStyle, headStyle, isAction, isNoData, isMultiHead, id,orderDirection,onSelectAllClick,numSelected, rowCount,bodyData } = this.props;
        let headRowsArray = [];
        const initRows = isMultiHead ? this.getMultiRows(headRows, headRowsArray) : [headRows];
        let orderBy = this.props.orderBy || '';
        return (
            <TableHead>
                {
                    initRows && initRows.map(
                        (rowListItem, index) => (
                            <TableRow className={headStyle}
                                id={id + '_tableRow_' + index}
                                key={index}
                            >
                                <CIMSTableCell
                                    align={'left'}
                                    className={cellStyle}
                                    // padding={'0'}
                                    style={{ width:'3%',textAlign:'center',padding:0}}
                                    variant={'head'}
                                >
                                <Checkbox
                                    color="primary"
                                    checked={numSelected === rowCount&&bodyData.length>0}
                                    id={'checkbox_all'}
                                    onChange={onSelectAllClick}
                                />
                                </CIMSTableCell>

                                {
                                    rowListItem && rowListItem.map(
                                        (row, cellIndex) => (
                                            <CIMSTableCell
                                                align={'left'}
                                                className={cellStyle}
                                                colSpan={row.child && row.child.length > 0 ? this.getLastChildNumber(row) : 1}
                                                id={id + '_tableRow_' + index + '_tableCell_' + cellIndex}
                                                key={row.name}
                                                onClick={(e)=>{this.cellOnClick(row,e);}}
                                                padding={'default'}
                                                rowSpan={row.child && row.child.length > 0 ? 1 : (initRows.length - index)}
                                                style={{ width: row.width }}
                                                variant={'head'}
                                            >
                                                <Tooltip enterDelay={300}
                                                    title={row.label}
                                                >
                                                    {
                                                        (row.child && row.child.length > 0) || row.disableOrder || !orderDirection ?
                                                            <Typography className={classes.labelRoot}>{row.label}</Typography> :
                                                            <TableSortLabel
                                                                active={orderBy.indexOf(row.name) > -1}
                                                                className={`${classes.sortLabelRoot} ${row.LongitudinalLayout ? 'lengthwaysFont' : ''}`}
                                                                direction={orderDirection}
                                                                id={id + '_tableRow_' + index + '_tableCellLabel_' + cellIndex}
                                                                style={row.LongitudinalLayout ? { flexDirection: 'column' } : {}}
                                                            >
                                                                <Typography className={classes.labelRoot}>{row.label}</Typography>
                                                            </TableSortLabel>
                                                    }
                                                </Tooltip>
                                            </CIMSTableCell>
                                        )
                                    )
                                }
                                {
                                    isAction && !isNoData && index === 0 ?
                                        <CIMSTableCell
                                            align={'left'}
                                            className={cellStyle}
                                            padding={'default'}
                                            rowSpan={initRows.length}
                                            variant={'head'}
                                        >
                                            <Typography className={classes.labelRoot}></Typography>
                                        </CIMSTableCell> : null
                                }
                            </TableRow>
                        )
                    )
                }
                {/* <TableRow>
                    {headRows && headRows.map(
                        row => (
                            <CIMSTableCell
                                variant={'head'}
                                key={row.name}
                                align={'left'}
                                padding={'default'}
                                style={{ width: row.width }}
                                className={cellStyle}
                            // sortDirection={orderBy.indexOf(row.name) > -1 ? order : false}
                            >
                                <Tooltip title={row.label} enterDelay={300}>
                                    <TableSortLabel
                                        // active={orderBy.indexOf(row.name) > -1}
                                        // direction={order}
                                        // onClick={this.createSortHandler(row.name)}
                                        className={`${classes.sortLabelRoot} ${row.LongitudinalLayout ? 'lengthwaysFont' : ''}`}
                                        style={row.LongitudinalLayout ? { flexDirection: 'column' } : {}}
                                    >
                                        <Typography className={classes.labelRoot}>{row.label}</Typography>
                                    </TableSortLabel>
                                </Tooltip>
                            </CIMSTableCell>
                        ),
                        this,
                    )}
                    {
                        isAction && !isNoData ?
                            <CIMSTableCell
                                variant={'head'}
                                align={'left'}
                                padding={'default'}
                                className={cellStyle}
                            >
                                <Typography className={classes.labelRoot}></Typography>
                            </CIMSTableCell> : null
                    }
                </TableRow> */}
            </TableHead>
        );
    }
}

TableHeadActions.propTypes = {
    onSelectAllClick: PropTypes.func.isRequired,
    numSelected: PropTypes.number.isRequired,
    rowCount: PropTypes.number.isRequired
    // onRequestSort: PropTypes.func.isRequired,
    // order: PropTypes.string.isRequired,
    // orderBy: PropTypes.string.isRequired
};

export default withStyles(styles)(TableHeadActions);