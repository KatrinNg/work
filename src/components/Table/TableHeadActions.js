import React from 'react';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Typography from '@material-ui/core/Typography';
import CIMSTableCell from '../TableCell/CIMSTableCell';
import { withStyles } from '@material-ui/core/styles';
import memoize from 'memoize-one';
import _ from 'lodash';

const styles = () => ({
    labelRoot: {
        fontSize: 'inherit',
        fontWeight: 'inherit',
        lineHeight: 'inherit',
        fontFamily: 'inherit',
        color: 'inherit',
        // width: 'inherit',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden'
    },
    sortLabelRoot: {
        fontSize: 'inherit'
    }
});

class TableHeadActions extends React.Component {

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
    };

    filterMultiRows = memoize(this.getMultiRows);

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
    createSortHandler = (event, data) => {
        if (typeof this.props.onRequestSort === 'function') {
            this.props.onRequestSort(event, data);
        }
    }

    render() {
        const {
            headRows,
            classes,
            cellStyle,
            headStyle,
            isAction,
            isNoData,
            isMultiHead,
            id,
            orderDirection,
            scroll
        } = this.props;
        let headRowsArray = [];
        const initRows = isMultiHead ? this.filterMultiRows(headRows, headRowsArray) : [headRows];
        let orderBy = this.props.orderBy || '';

        return (
            <TableHead id={id}>
                {
                    initRows && initRows.map(
                        (rowListItem, index) => (
                            <TableRow
                                key={index}
                                className={headStyle}
                                id={id + '_tableRow_' + index}
                            >
                                {
                                    rowListItem && rowListItem.map(
                                        (row, cellIndex) => (
                                            <CIMSTableCell
                                                id={id + '_tableRow_' + index + '_tableCell_' + cellIndex}
                                                variant={'head'}
                                                key={cellIndex}
                                                align={'left'}
                                                padding={'default'}
                                                style={{
                                                    width: row.width,
                                                    position: 'relative',
                                                    top: scroll,
                                                    zIndex: 2
                                                }}
                                                className={cellStyle}
                                                rowSpan={row.child && row.child.length > 0 ? 1 : (initRows.length - index)}
                                                colSpan={row.child && row.child.length > 0 ? this.getLastChildNumber(row) : 1}
                                                onClick={row.disableOrder ? () => { } : (e) => { this.createSortHandler(e, row); }}
                                            >
                                                <Tooltip title={row.label} enterDelay={300}>
                                                    {
                                                        (row.child && row.child.length > 0) || row.disableOrder || !orderDirection ?
                                                            <Typography className={classes.labelRoot}>{row.label}</Typography> :
                                                            <TableSortLabel
                                                                id={id + '_tableRow_' + index + '_tableCellLabel_' + cellIndex}
                                                                active={(_.isString(orderBy) && orderBy === row.name) || (_.isArray(orderBy) && orderBy.indexOf(row.name) > -1)}
                                                                direction={orderDirection}
                                                                className={`${classes.sortLabelRoot} ${row.LongitudinalLayout ? 'lengthwaysFont' : ''}`}
                                                                style={row.LongitudinalLayout ? { flexDirection: 'column' } : {}}
                                                                tabIndex={-1}
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
                                            variant={'head'}
                                            align={'left'}
                                            padding={'default'}
                                            className={cellStyle}
                                            rowSpan={initRows.length}
                                        >
                                            <Typography className={classes.labelRoot}></Typography>
                                        </CIMSTableCell> : null
                                }
                            </TableRow>
                        )
                    )
                }
            </TableHead>
        );
    }
}

TableHeadActions.propTypes = {
    // onRequestSort: PropTypes.func.isRequired,
    // order: PropTypes.string.isRequired,
    // orderBy: PropTypes.string.isRequired
};

export default withStyles(styles)(TableHeadActions);