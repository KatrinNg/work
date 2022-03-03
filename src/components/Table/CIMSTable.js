import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TablePaginationActions from './TablePaginationActions';
import TableHeadActions from './TableHeadActions';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import CIMSTableCell from '../TableCell/CIMSTableCell';
import CircularProgress from '@material-ui/core/CircularProgress';
import memoize from 'memoize-one';
import classNames from 'classnames';
import * as CommonUtilities from '../../utilities/commonUtilities';
import _ from 'lodash';

function desc(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function stableSort(array, cmp) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

function getSorting(order, orderBy) {
  return order === 'desc'
    ? (a, b) => desc(a, b, orderBy)
    : (a, b) => -desc(a, b, orderBy);
}

const useStyles2 = (theme) => ({
  root: {
    width: '100%',
    height: 'fit-content'
  },
  autoOverFlow: {
    overflow: 'auto'
  },
  divider: {
    border: '2px solid #4e4e4e',
    cursor: 'col-resize',
    zIndex: 6
  },
  backdrop: {
    zIndex: 1300,
    backgroundColor: 'unset',
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'none',
    cursor: 'col-resize',
    width: '100%',
    height: '100%'
  },
  tableWrapper: {
    overflow: 'hidden',
    position: 'relative'
  },
  actionBtnRoot: {
    padding: 2
  },
  progressBarRoot: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgb(78, 78, 78, 0.3)',
    top: 0,
    left: 0
  },
  progressBar: {
    top: '50%',
    position: 'relative',
    left: '50%',
    marginTop: '-20px',
    marginLeft: '-20px'
  },
  paginationToolbar: {
    height: 40,
    minHeight: 40
  },
  rowHover: {
    backgroundColor: theme.palette.action.hover
  },
  rowCursor: {
    cursor: 'pointer'
  },
  tdUnSelect: {
    '-webkit-user-select': 'none',
    '-moz-user-select': 'none',
    '-ms-user-select': 'none',
    'user-select': 'none'
  },
  rowExpand: {
    whiteSpace: 'pre-line',
    wordBreak: 'break-word'
  },
  rowDisabled: {
    color: theme.palette.text.disabled,
    backgroundColor: theme.palette.action.disabledBackground
  },
  rowEditing: {
    color: theme.palette.primaryColor,
    fontStyle: 'italic'
  }
});

class CIMSTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      page: 0,
      rowsPerPage: this.props.options.rowsPerPage || 5,
      rowsPerPageOptions: this.props.options.rowsPerPageOptions || [5, 10, 25],
      selected: [],
      hoverRow: -1,
      showProgress: false,
      clickCount: 0,
      // bodyMouseDown: false,
      startPosition: -1,
      scroll: 0,
      isSplit: false,
      shift: false,
      originalSelected: [],
      expandRow: ''
    };

    this.comId = this.props.id || 'CIMSTable';

    //is split rows
    const { options, rows } = this.props;
    const initSplitRows = this.filterSplitRows(rows, options);
    const isSplit = initSplitRows && initSplitRows.length > 0;
    this.state.isSplit = isSplit;
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (
      nextProps.selected &&
      prevState.selected.toString() !== nextProps.selected.toString()
    ) {
      return {
        selected: nextProps.selected
      };
    }
    return null;
  }

  componentDidMount() {
    // split row when expand should align height
    const { options } = this.props;
    const { isSplit } = this.state;

    //count the scroll position and resize the table head
    const tbContainer = document.getElementById(this.comId + '_tableContainer');
    const tbSplitGrid1 = document.getElementById(this.comId + '_splitGrid1');
    const tbSplitGrid2 = document.getElementById(this.comId + '_splitGrid2');

    tbSplitGrid2.onscroll = (e) => {
      if (this.state.scroll !== e.target.scrollTop) {
        this.setState({ scroll: e.target.scrollTop });
        if (tbSplitGrid1) {
          tbSplitGrid1.scrollTop = e.target.scrollTop;
        }
      }
    };

    if (isSplit && options && options.rowExpand) {
      let observer = new MutationObserver((mutations, instance) => {
        const mutationFilter = mutations.filter(
          (item) =>
            item.type === 'attributes' &&
            _.toUpper(item.target.tagName) === 'TR'
        );
        if (mutationFilter && mutationFilter.length > 0) {
          const tr1 = mutationFilter.filter(
            (item) => item.target.getAttribute('tablenum') === '1'
          );
          const tr2 = mutationFilter.filter(
            (item) => item.target.getAttribute('tablenum') === '2'
          );
          tr1.forEach((item) => {
            const tr2Dom = tr2.find(
              (i) => i.target.rowIndex === item.target.rowIndex
            );
            this.syncRowHeight(item, tr2Dom);
          });
        }
      });

      observer.observe(tbContainer, {
        attributes: true,
        subtree: true,
        attributeOldValue: true,
        attributeFilter: ['class']
      });
    }
    // add a Listener to listen the keypress down
    window.addEventListener('keydown', this.windowListenKeyDown);
    // add a Listener to listen the keypress up
    window.addEventListener('keyup', this.windowListenKeyUp);
  }

  componentWillUnmount() {
    // this.setState({ showProgress: false, selected: [] });
    this.setState = (state, callback) => {
      return;
    };
  }

  syncRowHeight = (tr1Dom, tr2Dom) => {
    if (
      tr1Dom.target.getAttribute('expanded') &&
      tr2Dom.target.getAttribute('expanded')
    ) {
      if (tr1Dom.target.clientHeight !== tr2Dom.target.clientHeight) {
        const height = Math.max(
          tr1Dom.target.clientHeight,
          tr2Dom.target.clientHeight
        );
        //define height
        tr1Dom.target.style.height = height + 'px';
        tr2Dom.target.style.height = height + 'px';
      }
    } else {
      tr1Dom.target.style.height = null;
      tr2Dom.target.style.height = null;
    }
  };

  setSelected = (rowId) => {
    this.setState({
      selected: [_.toString(rowId)],
      expandRow: _.toString(rowId)
    });
  };

  clearSelected = () => {
    this.setState({ selected: [], expandRow: '' });
  };

  updatePage = (newPage) => {
    if (newPage > -1) {
      this.setState({ page: newPage });
    }
  };

  updateRowsPerPage = (rowNum) => {
    if (rowNum) {
      this.setState({ rowsPerPage: rowNum });
    }
  };

  showLoadingProgress = () => {
    this.setState({ showProgress: true }, () => {
      setTimeout(() => {
        this.setState({ showProgress: false });
      }, 500);
    });
  };

  handleChangePage(event, newPage) {
    if (event) {
      if (this.props.remote) {
        this.showLoadingProgress();
      }
      this.setState({ page: newPage }, () => {
        if (this.props.onChangePage) {
          this.props.onChangePage(event, newPage, this.state.rowsPerPage);
        }
      });
    }
  }

  handleChangeRowsPerPage(event) {
    if (event) {
      if (this.props.remote) {
        if (this.props.data && this.props.data.length > 0) {
          let newRowsPerPage = parseInt(event.target.value, 10);
          let { page, rowsPerPage } = this.state;
          if (rowsPerPage !== newRowsPerPage) {
            if (this.props.totalCount < (page + 1) * newRowsPerPage) {
              page = Math.ceil(this.props.totalCount / newRowsPerPage) - 1;
            }
            this.showLoadingProgress();
            this.setState({ rowsPerPage: newRowsPerPage, page: page }, () => {
              if (this.props.onChangeRowsPerPage) {
                this.props.onChangeRowsPerPage(
                  event,
                  this.state.page,
                  this.state.rowsPerPage
                );
              }
            });
          }
        }
      } else {
        this.setState({ rowsPerPage: parseInt(event.target.value, 10) }, () => {
          if (this.props.onChangeRowsPerPage) {
            this.props.onChangeRowsPerPage(
              event,
              this.state.page,
              this.state.rowsPerPage
            );
          }
        });
      }
    }
  }

  handleClick = (event, data, rowNo, isRowDisabled, isRowEditing) => {
    if (isRowEditing) return;
    const { options } = this.props;
    const tbr1 = document.getElementById(this.comId + '_table1Row_' + rowNo);
    const tbr2 = document.getElementById(this.comId + '_table2Row_' + rowNo);
    if (tbr1) {
      tbr1.style.boxShadow = '0 0 5px #4e4e4e inset';
    }
    if (tbr2) {
      tbr2.style.boxShadow = '0 0 5px #4e4e4e inset';
    }
    setTimeout(() => {
      if (tbr1) {
        tbr1.style.boxShadow = '';
      }
      if (tbr2) {
        tbr2.style.boxShadow = '';
      }
    }, 150);
    if (this.state.shift) return;
    this.setState({ clickCount: this.state.clickCount + 1 }, () => {
      setTimeout(() => {
        const { clickCount } = this.state;
        if (clickCount !== 0) {
          this.setState({ clickCount: 0 }, () => {
            if (clickCount === 1) {
              if (options.onSelectedRow && options.onSelectIdName) {
                this.handleSelectRow(
                  event,
                  _.toString(data[options.onSelectIdName])
                );
              } else {
                this.handleClickRow(event, data, rowNo);
              }
            } else if (clickCount === 2) {
              this.handleDoubleClickRow(event, data);
            }
          });
        }
      }, 200);
    });
  };

  handleSelectRow = (event, rowId) => {
    const { options } = this.props;
    if (options && options.rowExpand) {
      if (this.state.expandRow === rowId) {
        this.setState({ expandRow: '' });
      } else {
        this.setState({ expandRow: rowId });
      }
    }
    if (options && options.onSelectedRow && rowId) {
      const { selected } = this.state;
      if (options.onMultiSelect) {
        if (selected !== undefined && selected !== null) {
          const selectedIndex = selected.indexOf(rowId);
          let newSelected = selected || [];
          if (selectedIndex === -1) {
            newSelected.push(rowId);
          } else {
            newSelected.splice(selectedIndex, 1);
          }
          if (options.onSelectedRow) {
            const rowData = this.props.data.find(
              (item) => item[options.onSelectIdName] == rowId
            );
            const selectedData = this.props.data.filter((dataItem) => {
              return (
                newSelected.indexOf(
                  _.toString(dataItem[options.onSelectIdName])
                ) > -1
              );
            });
            options.onSelectedRow(rowId, rowData, selectedData);
          }
          this.setState({ selected: newSelected });
        }
      } else {
        let newSelected = [];
        const selectedIndex = (selected || []).indexOf(rowId);
        if (selectedIndex === -1) {
          newSelected.push(rowId);
        }
        if (options.onSelectedRow) {
          const rowData = this.props.data.find(
            (item) => item[options.onSelectIdName] == rowId
          );
          const selectedData = this.props.data.filter((dataItem) => {
            return (
              newSelected.indexOf(
                _.toString(dataItem[options.onSelectIdName])
              ) > -1
            );
          });
          options.onSelectedRow(rowId, rowData, selectedData);
        }
        this.setState({ selected: newSelected });
      }
    }
  };

  handleClickRow = (e, data, rowNo) => {
    if (this.props.options && this.props.options.rowExpand) {
      if (this.state.expandRow === rowNo) {
        this.setState({ expandRow: '' });
      } else {
        this.setState({ expandRow: rowNo });
      }
    }
    if (this.props.options && this.props.options.onRowClick) {
      this.props.options.onRowClick(data);
    }
  };

  handleDoubleClickRow = (e, data) => {
    if (this.props.options && this.props.options.onRowDoubleClick) {
      this.props.options.onRowDoubleClick(data);
    }
  };

  handleRowBtnClick = (e, name, data) => {
    if (this.props.options && this.props.options.actions) {
      let clickAction = this.props.options.actions.find(
        (item) => item.name === name
      );
      if (clickAction && clickAction.onClick) {
        clickAction.onClick(data);
      }
    }
  };

  isSelected = (rowId) => this.state.selected.indexOf(rowId) !== -1;

  emptyRowsFunc = () => {
    const { remote, data } = this.props;
    const { rowsPerPage, page } = this.state;
    let emptyRows = 0;
    if (!data) return 0;
    if (remote) {
      emptyRows =
        data.length % rowsPerPage === 0
          ? 0
          : rowsPerPage - (data.length % rowsPerPage);
    } else {
      emptyRows =
        rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);
    }
    return emptyRows;
  };

  transFormMultiRows = (rows) => {
    if (rows && rows.length > 0) {
      let nRows = [];
      for (let i = 0; i < rows.length; i++) {
        if (rows[i]['child'] && rows[i]['child'].length > 0) {
          nRows = nRows.concat(this.transFormMultiRows(rows[i]['child']));
        } else {
          nRows.push(rows[i]);
        }
      }
      return nRows;
    }
    return [];
  };

  filterRows = memoize((rows, options) => {
    if (rows && rows.findIndex((item) => item.split) > -1) {
      rows = rows.filter((item) => !item.split);
    }
    return options.multiHead ? this.transFormMultiRows(rows) : rows;
  });

  filterSplitRows = memoize((rows, options) => {
    if (rows && rows.findIndex((item) => item.split) > -1) {
      rows = rows.filter((item) => item.split);
    } else {
      return [];
    }
    return options.multiHead ? this.transFormMultiRows(rows) : rows;
  });

  initOptions = memoize((options) => {
    return Object.assign(
      {},
      {
        rowHover: true
      },
      options
    );
  });

  getEmptyRowElement = (number) => {
    let list = [];
    for (let i = 0; i < number; i++) {
      list.push(<TableRow key={i} style={{ height: 'auto' }}></TableRow>);
    }
    return list;
  };

  handleOnMouseOver = (e, index) => {
    this.setState({ hoverRow: index });
  };

  handleOnMouseLeave = () => {
    this.setState({ hoverRow: -1 });
  };

  windowListenKeyDown = (e) => {
    if (e.keyCode === 16 && !this.state.shift) {
      this.setState({
        shift: true,
        originalSelected: _.cloneDeep(this.state.selected)
      });
    }
  };

  windowListenKeyUp = (e) => {
    if (e.keyCode === 16) {
      this.setState({ shift: false, originalSelected: [], startPosition: -1 });
    }
  };

  onBodyMouseClick = (e, data) => {
    const { shift, originalSelected } = this.state;
    const { options } = this.props;
    if (options && options.onMultiSelect) {
      const curSelected = Number(e.target.getAttribute('rowid'));
      let endPosition = curSelected;
      if (!shift) {
        this.setState({ startPosition: curSelected });
        return;
      }
      if (this.state.startPosition === -1) return;
      if (this.state.startPosition !== endPosition) {
        let start = Math.min(this.state.startPosition, endPosition);
        let end = Math.max(this.state.startPosition, endPosition);
        if (this.state.startPosition < endPosition) {
          start += 1;
          end += 1;
        }
        let newSelected = _.cloneDeep(originalSelected);
        this.setState({ selected: newSelected }, () => {
          for (let i = start; i < end; i++) {
            this.handleSelectRow(
              e,
              _.toString(data[i][options.onSelectIdName])
            );
          }
        });
      }
    }
  };

  // onBodyMouseDown = (e) => {
  //     const { options } = this.props;
  //     const curSelected = e.target.getAttribute('rowid');
  //     if (options && options.onMultiSelect && options.onSelectIdName) {
  //         this.setState({ bodyMouseDown: true, startPosition: curSelected });
  //     }
  // }

  // onBodyMouseUp = (e, data) => {
  //     if (this.state.bodyMouseDown) {
  //         const { options } = this.props;
  //         const curSelected = e.target.getAttribute('rowid');
  //         if (this.state.startPosition !== curSelected) {
  //             let start = Math.min(parseInt(this.state.startPosition), parseInt(curSelected));
  //             let end = Math.max(parseInt(this.state.startPosition), parseInt(curSelected));
  //             for (let i = start; i <= end; i++) {
  //                 this.handleSelectRow(e, data[i][options.onSelectIdName]);
  //             }
  //         }
  //         this.setState({ bodyMouseDown: false, startPosition: -1 });
  //     }
  // }

  handleDividerOnMouseDown = () => {
    const backdrop = document.getElementById(this.comId + '_backDrop');
    if (backdrop) backdrop.style.display = 'block';
    document.onmousemove = (ev) => {
      const g1 = document.getElementById(this.comId + '_splitGrid1');
      const g2 = document.getElementById(this.comId + '_splitGrid2');
      const x2 = ev.clientX;
      const x3 = g1.getBoundingClientRect().left;
      const x4 = g2.offsetWidth + g2.getBoundingClientRect().left;
      const w1 = x2 - x3;
      const w2 = x4 - x2;
      let scale = (w1 / (w2 + w1)) * 100;
      if (scale > 80) {
        scale = 80;
      }
      if (scale < 20) {
        scale = 20;
      }
      g1.style.maxWidth = scale + '%';
      g1.style.flexBasis = scale + '%';
      //set idleTimeOutDialog onmousemove event
      window.lastMove = new Date().getTime();
    };

    document.onmouseup = () => {
      const backdrop2 = document.getElementById(this.comId + '_backDrop');
      if (backdrop2) backdrop2.style.display = 'none';
      //set idleTimeOutDialog onmousemove event
      document.onmousemove = (ev) => {
        window.lastMove = new Date().getTime();
      };
    };
  };

  handleDividerOnMouseUp = () => {
    document.onmouseup = () => {
      const backdrop = document.getElementById(this.comId + '_backDrop');
      if (backdrop) backdrop.style.display = 'none';
      //set idleTimeOutDialog onmousemove event
      document.onmousemove = (ev) => {
        window.lastMove = new Date().getTime();
      };
    };
  };

  setDividerScale = (scale) => {
    if (this.state.isSplit && scale) {
      const g1 = document.getElementById(this.comId + '_splitGrid1');
      g1.style.maxWidth = scale + '%';
      g1.style.flexBasis = scale + '%';
    }
  };

  getDividerScale = () => {
    const g1 = document
      .getElementById(this.comId + '_splitGrid1')
      .getBoundingClientRect();
    const c1 = document
      .getElementById(this.comId + '_tableContainer')
      .getBoundingClientRect();
    return (g1.width / c1.width) * 100;
  };

  getPage = () => {
    return this.state.page;
  };

  getPageSize = () => {
    return this.state.rowsPerPage;
  };

  genCellStyle = (options, rowItem) => {
    let cellStyle = null;
    if (options.bodyCellStyle) {
      cellStyle = options.bodyCellStyle;
    }

    if (options.customBodyCellStyle) {
      cellStyle = options.customBodyCellStyle(rowItem);
    }

    return cellStyle;
  };

  render() {
    const {
      classes,
      rows,
      data,
      tableStyles,
      nodataMessage,
      remote,
      totalCount,
      orderDirection,
      orderBy,
      onRequestSort,
      splitGridStyles
    } = this.props;
    const { isSplit } = this.state;
    const sysRatio = CommonUtilities.getSystemRatio();
    const unit = CommonUtilities.getResizeUnit(sysRatio);
    let customTableStyles = {
      height: 600 * unit,
      ...tableStyles
    };
    // If applying the hieght of table to the footer, it will have laylout issue in Chrome > 92
    // In order to solve this issue, clone the object without height for the footer
    let customTableStylesForFooter = _.omit(customTableStyles, 'height');
    const options = this.initOptions(this.props.options);
    const { page, rowsPerPage, rowsPerPageOptions } = this.state;
    let isAction = options.actions && options.actions.length > 0;
    let isNoData = !data || data.length < 1;
    let bodyData = remote
      ? data
      : data
      ? stableSort(data, getSorting(orderDirection, orderBy)).slice(
          page * rowsPerPage,
          page * rowsPerPage + rowsPerPage
        )
      : null;
    let emptyRows = this.emptyRowsFunc();
    const initRows = this.filterRows(rows, options);
    const splitRows = this.filterSplitRows(rows, options);
    let customSplitGrid1Styles = {
      maxHeight: 620 * unit,
      overflowX: 'scroll',
      overflowY: 'hidden',
      ...splitGridStyles
    };
    let customSplitGrid2Styles = {
      maxHeight: 620 * unit,
      overflowX: 'scroll',
      overflowY: 'auto',
      ...splitGridStyles
    };
    return (
      <Paper className={classes.root} id={this.comId + '_tableRoot'}>
        <Grid
            container
            className={classes.tableWrapper}
            id={this.comId + '_tableContainer'}
        >
          {isSplit ? (
            <Grid
                item
                xs={4}
                style={customSplitGrid1Styles}
                id={this.comId + '_splitGrid1'}
            >
              <Table style={customTableStyles} id={this.comId + '_splitTable'}>
                <TableHeadActions
                    orderDirection={orderDirection}
                    orderBy={orderBy}
                    onRequestSort={onRequestSort}
                    id={this.comId + '_splitTableHead'}
                    headStyle={options.headRowStyle ? options.headRowStyle : null}
                    cellStyle={
                    options.headCellStyle ? options.headCellStyle : null
                  }
                    headRows={rows && rows.filter((item) => item.split)}
                    isMultiHead={options.multiHead}
                    scroll={this.state.scroll}
                />
                <TableBody
                    id={this.comId + '_splitTableBody'}
                  // onMouseDown={this.onBodyMouseDown}
                  // onMouseUp={(e) => this.onBodyMouseUp(e, bodyData)}
                    onClick={(e) => this.onBodyMouseClick(e, bodyData)}
                >
                  {bodyData && bodyData.length > 0 ? (
                    <>
                      {bodyData.map((n, i) => {
                        const isSelected = options.onSelectIdName
                          ? this.isSelected(
                              _.toString(n[options.onSelectIdName])
                            )
                          : false;
                        const rowStyle = options.customRowStyle
                          ? options.customRowStyle(n)
                          : null;
                        const isRowExpand =
                          options.onSelectIdName && options.onSelectedRow
                            ? this.state.expandRow ===
                              _.toString(n[options.onSelectIdName])
                            : this.state.expandRow === i;
                        const isRowDisabled = options.isRowDisabled
                          ? options.isRowDisabled(n)
                          : false;
                        const isRowEditing = options.isRowEditing
                          ? options.isRowEditing(n)
                          : false;
                        const rowId = _.toString(n[options.onSelectIdName]);

                        return (
                          <TableRow
                              onClick={(e) =>
                              this.handleClick(
                                e,
                                n,
                                i,
                                isRowDisabled,
                                isRowEditing
                              )
                            }
                              tabIndex={-1}
                              key={i}
                              selected={isSelected}
                              hover={options.rowHover && !isSplit}
                              onMouseOver={(e) => this.handleOnMouseOver(e, i)}
                              onMouseLeave={this.handleOnMouseLeave}
                              className={classNames({
                              [rowStyle]: true,
                              [classes.rowHover]:
                                isSplit &&
                                options.rowHover &&
                                this.state.hoverRow === i,
                              [classes.rowCursor]:
                                options.onRowClick ||
                                options.onSelectedRow ||
                                options.onRowDoubleClick,
                              [classes.tdUnSelect]: this.state.shift,
                              [classes.rowExpand]: isRowExpand
                            })}
                              id={this.comId + '_table1Row_' + i}
                              tablenum={1}
                              expanded={isRowExpand ? 'expanded' : ''}
                          >
                            {splitRows.map((rowItem, index) => {
                              const cellStyle = this.genCellStyle(options, n);
                              const cellContent = rowItem.customBodyRender
                                ? rowItem.customBodyRender(n[rowItem.name], n)
                                : n[rowItem.name];
                              return (
                                <CIMSTableCell
                                    key={index}
                                    variant="body"
                                    align={rowItem.align || 'left'}
                                    style={{
                                    maxWidth: rowItem.width,
                                    minWidth: rowItem.width
                                  }}
                                    className={classNames({
                                    [cellStyle]: true,
                                    [classes.rowExpand]: isRowExpand,
                                    [classes.rowDisabled]:
                                      this.state.selected.indexOf(rowId) ===
                                        -1 && isRowDisabled,
                                    [classes.rowEditing]:
                                      this.state.selected.indexOf(rowId) > -1 &&
                                      isRowEditing
                                  })}
                                    rowid={i}
                                >
                                  {cellContent}
                                </CIMSTableCell>
                              );
                            })}
                          </TableRow>
                        );
                      })}
                      {this.getEmptyRowElement(emptyRows)}
                    </>
                  ) : (
                    <TableRow style={{ height: 'auto' }}>
                      <TableCell
                          colSpan={splitRows.length}
                          style={{ textAlign: 'center' }}
                      >
                        <Typography variant="h6">
                          {nodataMessage ? nodataMessage : 'There is no data!'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Grid>
          ) : null}
          {isSplit ? (
            <Grid
                id={this.comId + '_splitDivider'}
                className={classes.divider}
                onMouseDown={this.handleDividerOnMouseDown}
                onMouseUp={this.handleDividerOnMouseUp}
            ></Grid>
          ) : null}
          <Grid className={classes.backdrop} id={this.comId + '_backDrop'} />
          <Grid
              item
              container
              xs
              style={customSplitGrid2Styles}
              alignContent="flex-start"
              id={this.comId + '_splitGrid2'}
          >
            <Table style={customTableStyles} id={this.comId}>
              <TableHeadActions
                  orderDirection={orderDirection}
                  orderBy={orderBy}
                  onRequestSort={onRequestSort}
                  id={this.comId + '_tableHead'}
                  headStyle={options.headRowStyle ? options.headRowStyle : null}
                  cellStyle={options.headCellStyle ? options.headCellStyle : null}
                  headRows={rows && rows.filter((item) => !item.split)}
                  isAction={isAction}
                  isNoData={isNoData}
                  isMultiHead={options.multiHead}
                  scroll={this.state.scroll}
              />
              <TableBody
                  id={this.comId + '_tableBody'}
                // onMouseDown={this.onBodyMouseDown}
                // onMouseUp={(e) => this.onBodyMouseUp(e, bodyData)}
                  onClick={(e) => this.onBodyMouseClick(e, bodyData)}
              >
                {bodyData && bodyData.length > 0 ? (
                  <>
                    {bodyData.map((n, i) => {
                      const isSelected = options.onSelectIdName
                        ? this.isSelected(_.toString(n[options.onSelectIdName]))
                        : false;
                      const rowStyle = options.customRowStyle
                        ? options.customRowStyle(n)
                        : null;
                      const isRowExpand =
                        options.onSelectIdName && options.onSelectedRow
                          ? this.state.expandRow ===
                            _.toString(n[options.onSelectIdName])
                          : this.state.expandRow === i;
                      const isRowDisabled = options.isRowDisabled
                        ? options.isRowDisabled(n)
                        : false;
                      const isRowEditing = options.isRowEditing
                        ? options.isRowEditing(n)
                        : false;
                      const rowId = _.toString(n[options.onSelectIdName]);
                      return (
                        <TableRow
                            onClick={(e) =>
                            this.handleClick(
                              e,
                              n,
                              i,
                              isRowDisabled,
                              isRowEditing
                            )
                          }
                            tabIndex={-1}
                            key={i}
                            selected={isSelected}
                            hover={options.rowHover && !isSplit}
                            onMouseOver={(e) => this.handleOnMouseOver(e, i)}
                            onMouseLeave={this.handleOnMouseLeave}
                            className={classNames({
                            [rowStyle]: true,
                            [classes.rowHover]:
                              isSplit &&
                              options.rowHover &&
                              this.state.hoverRow === i,
                            [classes.rowCursor]:
                              options.onRowClick ||
                              options.onSelectedRow ||
                              options.onRowDoubleClick,
                            [classes.tdUnSelect]: this.state.shift,
                            [classes.rowExpand]: isRowExpand
                          })}
                            id={this.comId + '_table2Row_' + i}
                            tablenum={2}
                            expanded={isRowExpand ? 'expanded' : ''}
                        >
                          {initRows &&
                            initRows.map((rowItem, index) => {
                              const cellStyle = this.genCellStyle(options, n);
                              const cellContent = rowItem.customBodyRender
                                ? rowItem.customBodyRender(n[rowItem.name], n)
                                : n[rowItem.name];
                              return (
                                <CIMSTableCell
                                    key={index}
                                    variant="body"
                                    align={rowItem.align || 'left'}
                                    style={{
                                    maxWidth: rowItem.width,
                                    minWidth: rowItem.width
                                  }}
                                    className={classNames({
                                    [cellStyle]: true,
                                    [classes.rowExpand]: isRowExpand,
                                    [classes.rowDisabled]:
                                      this.state.selected.indexOf(rowId) ===
                                        -1 && isRowDisabled,
                                    [classes.rowEditing]:
                                      this.state.selected.indexOf(rowId) > -1 &&
                                      isRowEditing
                                  })}
                                    rowid={i}
                                >
                                  {cellContent}
                                </CIMSTableCell>
                              );
                            })}
                          {options.actions && options.actions.length > 0 ? (
                            <CIMSTableCell
                                style={{
                                width:
                                  options.actions[i] &&
                                  options.actions[i].width
                              }}
                                variant="body"
                                align="center"
                            >
                              {options.actions.map((item) => {
                                return item.onShow &&
                                  item.onShow(n) === false ? null : (
                                  <Tooltip title={item.name} key={item.name}>
                                    <IconButton
                                        id={
                                        this.comId +
                                        '_tableRow_' +
                                        i +
                                        '_actions_' +
                                        item.name
                                      }
                                        color="primary"
                                        className={classes.actionBtnRoot}
                                        onClick={(e) =>
                                        this.handleRowBtnClick(e, item.name, n)
                                      }
                                    >
                                      {item.icon}
                                    </IconButton>
                                  </Tooltip>
                                );
                              })}
                            </CIMSTableCell>
                          ) : null}
                        </TableRow>
                      );
                    })}
                    {this.getEmptyRowElement(emptyRows)}
                  </>
                ) : (
                  <TableRow style={{ height: 'auto' }}>
                    <TableCell
                        colSpan={initRows.length}
                        style={{ textAlign: 'center' }}
                    >
                      <Typography variant="h6">
                        {nodataMessage ? nodataMessage : 'There is no data!'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Grid>
          <Typography
              component="div"
              className={classes.progressBarRoot}
              style={{ display: this.state.showProgress ? '' : 'none' }}
          >
            <CircularProgress className={classes.progressBar} />
          </Typography>
        </Grid>
        {options.hideFooter ? null : (
          <Grid container>
            <Table
                className={classes.table}
                style={customTableStylesForFooter}
                id={this.comId + '_tableFooter'}
            >
              <TableFooter>
                <TableRow>
                  <TablePagination
                      classes={{
                      toolbar: classes.paginationToolbar
                    }}
                      id={this.comId + 'tablePagination'}
                      rowsPerPageOptions={rowsPerPageOptions}
                      colSpan={
                      isAction && !isNoData
                        ? initRows.length + 1
                        : initRows.length
                    }
                      count={remote ? totalCount || 0 : data ? data.length : 0}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onChangePage={(...args) => this.handleChangePage(...args)}
                      onChangeRowsPerPage={(...args) =>
                      this.handleChangeRowsPerPage(...args)
                    }
                      ActionsComponent={TablePaginationActions}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </Grid>
        )}
      </Paper>
    );
  }
}

CIMSTable.propTypes = {
  rows: PropTypes.array.isRequired
};

CIMSTable.defaultProps = {
  options: {}
};

export default withStyles(useStyles2)(CIMSTable);
