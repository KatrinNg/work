import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TableHeadActions from './TableHeadActions';
import Tooltip from '@material-ui/core/Tooltip';
import CIMSTableCell from '../../../../../components/TableCell/CIMSTableCell';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Checkbox } from '@material-ui/core';
import { Check } from '@material-ui/icons';
import { isEqual, split } from 'lodash';
import { getState } from '../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};


const customTheme = (theme) => createMuiTheme({
  ...theme,
  overrides: {
    ...theme.overrides,
    MuiTableRow: {
      root: {
        // height: 35,
        backgroundColor: color.cimsBackgroundColor,
        '&$selected': {
          backgroundColor: 'cornflowerblue'
        }
      }
    }
  }
});

const useStyles2 = () => ({
  root: {
    width: '100%'
  },
  table: {
    tableLayout: 'fixed'
    //minWidth: 700
  },
  actionBtnRoot: {
    padding: 2
  },
  progressBarRoot: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'red',
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
  labelRoot: {
    fontSize: 'inherit',
    fontWeight: 'inherit',
    lineHeight: 'inherit',
    fontFamily: 'inherit',
    color: 'inherit',
    marginTop: 5,
    // whiteSpace:'normal'
    whiteSpace: 'pre',
    textOverflow: 'ellipsis',
    overflow:'hidden'
  }
});

const HtmlTooltip = withStyles(theme => ({
  tooltip: {
    marginTop: -10,
    backgroundColor: color.cimsBackgroundColor,
    color: 'rgba(0, 0, 0, 1)',
    maxWidth: '100%',
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9'
  },
  popper: {
    opacity: 1
  }
}))(Tooltip);

class JOSTableNoPagination extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 0,
      rowsPerPage: this.props.options.rowsPerPage || 5,
      selected: [],
      showProgress: false,
      confirmHide: 'none',
      showPage: false
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!isEqual(this.state.selected, nextProps.selected)) {
      this.setState({
        selected: nextProps.selected
      });
    }
  }


  handleClickRow = (e, data) => {
    const sequence = this.props.options.onSelectIdName;
    this.setState({
      sequence: data[sequence]
    });
    this.props.getSelectRow(data);
  }

  emptyRowsFunc = () => {
    const { remote, data } = this.props;
    const { rowsPerPage, page } = this.state;
    let emptyRows = 0;
    if (!data) return 0;
    if (remote) {
      emptyRows = data.length % rowsPerPage === 0 ? 0 : rowsPerPage - data.length % rowsPerPage;
    } else {
      emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);
    }
    return emptyRows;
  }

  handleSelectAllClick = event => {
    const { data } = this.props;
    if (event.target.checked) {
      this.setState({ selected: data.map(n => n.ioeRequestId) });
      this.props.getSelectRow(data.map(n => n.ioeRequestId));
      return;
    }
    this.setState({ selected: [] });
    this.props.getSelectRow([]);
  };

  handleClick = (event, id) => {
    const { selected } = this.state;
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    this.setState({ selected: newSelected });
    this.props.getSelectRow(newSelected);
  };

  isSelected = id => this.state.selected.indexOf(id) !== -1;

  render() {
    const { classes, rows, data, tableStyles, nodataMessage, tableRowStyle } = this.props;
    const { selected } = this.state;
    const options = this.props.options || {};
    const { tipsListName } = options;
    let isNoData = !data || data.length < 1;
    let bodyData = data;
    let initRows = rows;  //表头
    const id = this.props.id || 'CIMSTable';
    return (
      <MuiThemeProvider theme={customTheme}>
        <Paper className={classes.root} >
          <Typography className={classes.tableWrapper}
              component="div"
          >
            <Table className={classes.table}
                id={id}
                style={tableStyles}
            >
              <TableHeadActions
                  bodyData={bodyData}
                  cellStyle={options.headCellStyle ? options.headCellStyle : null}
                  headRows={rows}
                  headStyle={options.headRowStyle ? options.headRowStyle : null}
                  id={id + '_tableHead'}
                  isNoData={isNoData}
                  numSelected={selected.length}
                  onSelectAllClick={this.handleSelectAllClick}
                  rowCount={data.length}
              />
              <TableBody>

                {
                  bodyData && bodyData.length > 0 ?
                    (
                      <>
                        {
                          bodyData.map((n, i) => {
                            const isSelected = this.isSelected(n.ioeRequestId);
                            // const isSelected = this.props.selectRow === n[onSelectIdName] ? true : false;
                            // const isSelected =  false;
                            const cellStyle = options.bodyCellStyle ? options.bodyCellStyle : null;
                            return (
                              <TableRow
                                  hover={options.rowHover}
                                  id={id + '_tableRow_' + i}
                                  key={i}
                                  onClick={
                                  event => this.handleClick(event, n.ioeRequestId)
                                }
                                // selected={isSelected}
                                // style={{ cursor: options.onRowClick || options.onSelectedRow ? 'pointer' : 'default' }}
                                  style={tableRowStyle}
                              >
                                <CIMSTableCell
                                    align="center"
                                    className={cellStyle}
                                    variant="body"
                                    style={{ padding: 0, width: 52 }}
                                >
                                  <Checkbox checked={isSelected}
                                      color="primary"
                                      id={'checkBox_' + i}
                                  />
                                </CIMSTableCell>
                                {
                                  initRows && initRows.map((rowItem, index) => {
                                    return index === 2 || index === 3 ?
                                      (
                                        n[rowItem.name] == null ? (
                                          <CIMSTableCell align="left"
                                              className={cellStyle}
                                              key={index}
                                              variant="body"
                                          ></CIMSTableCell>
                                        ) :
                                        (<HtmlTooltip key={index}
                                            placement="bottom-start"
                                            title={
                                            <React.Fragment >
                                              <div style={{ maxWidth: 1000 }}>
                                                {

                                                  split(n[rowItem.name] === undefined ? '' : n[rowItem.name], '-|-', 100).map((teststr, index) => {
                                                    return (
                                                      <Typography className={classes.labelRoot}
                                                          component="div"
                                                          key={index}
                                                      >{teststr === '' ? '' : '- ' + teststr}</Typography>
                                                    );
                                                  })
                                                }
                                              </div>
                                            </React.Fragment>
                                          }
                                         >
                                          <CIMSTableCell align="left"
                                              className={cellStyle}
                                              key={index}
                                              variant="body"
                                          >
                                            {
                                              rowItem.customBodyRender ? rowItem.customBodyRender(n[rowItem.name], n) : (rowItem.name === 'test' || rowItem.name === 'specimen' ? (
                                                split(n[rowItem.name] === undefined ? '' : n[rowItem.name], '-|-', 100).map((teststr, index) => {
                                                  if (index < 3) {
                                                    if (index === 2 && (split(n[rowItem.name], '-|-', 100)).length > 3) {
                                                      return (
                                                        <Typography className={classes.labelRoot}
                                                            component="div"
                                                            key={index}
                                                        >- {teststr}...</Typography>
                                                        // <span> - {teststr}</span>
                                                      );
                                                    }
                                                    else {
                                                      return (
                                                        <Typography className={classes.labelRoot}
                                                            component="div"
                                                            key={index}
                                                        >{teststr === '' ? '' : '- ' + teststr}</Typography>
                                                        // <span> - {teststr}</span>
                                                      );
                                                    }
                                                  }
                                                  else {
                                                    return;
                                                  }
                                                })
                                              )
                                                : (rowItem.name === 'outputFormPrinted' && n[rowItem.name] !== undefined && n[rowItem.name] === 1 ?
                                                  (
                                                    <Check color="primary" />
                                                  )
                                                  : n[rowItem.name]))
                                            }
                                          </CIMSTableCell>
                                        </HtmlTooltip>)) :

                                      index === 5 ? (
                                        <CIMSTableCell align="left"
                                            className={cellStyle}
                                            key={index}
                                            variant="body"
                                        >
                                          {
                                            rowItem.customBodyRender ? rowItem.customBodyRender(n[rowItem.name], n) : (rowItem.name === 'test' || rowItem.name === 'specimen' ? (
                                              split(n[rowItem.name] === undefined ? '' : n[rowItem.name], '-|-', 100).map((teststr, index) => {
                                                if (index < 3) {
                                                  if (index === 2 && (split(n[rowItem.name], '-|-', 100)).length > 3) {
                                                    return (
                                                      <Typography className={classes.labelRoot}
                                                          component="div"
                                                          key={index}
                                                      >- {teststr}...
                                                      </Typography>
                                                    );

                                                  }
                                                  else {
                                                    return (
                                                      <Typography className={classes.labelRoot}
                                                          component="div"
                                                          key={index}
                                                      >
                                                        {teststr === '' ? '' : '- ' + teststr}
                                                      </Typography>
                                                    );
                                                  }
                                                }
                                                else {
                                                  return;
                                                }
                                              })
                                            )
                                              : (rowItem.name === 'outputFormPrinted' && n[rowItem.name] !== undefined && n[rowItem.name] === 1 ?
                                                (
                                                  <Check color="primary" />
                                                )
                                                : (n[rowItem.name] === 0 ? '' : n[rowItem.name])))
                                          }
                                        </CIMSTableCell>
                                      ) :
                                        (
                                          <HtmlTooltip key={index}
                                              placement="bottom-start"
                                              title={
                                              <React.Fragment >
                                                <div style={{ maxWidth: 500, whiteSpace: 'pre', wordBreak: 'break-word' }}>
                                                  {
                                                    <Typography className={classes.labelRoot} component="div" key={index}>
                                                      {
                                                        n[rowItem.name] === 1 ? '' : (rowItem.customBodyRender ? rowItem.customBodyRender(n[rowItem.name], n) : n[rowItem.name])
                                                      }
                                                    </Typography>
                                                  }
                                                </div>
                                              </React.Fragment>
                                            }
                                          >
                                            <CIMSTableCell align="left"
                                                className={cellStyle}
                                                key={index}
                                                variant="body"
                                            >
                                              {
                                                rowItem.customBodyRender ? rowItem.customBodyRender(n[rowItem.name], n) : (rowItem.name === 'test' || rowItem.name === 'specimen' ? (
                                                  split(n[rowItem.name] === undefined ? '' : n[rowItem.name], '-|-', 100).map((teststr, index) => {
                                                    if (index < 3) {
                                                      if (index === 2 && (split(n[rowItem.name], '-|-', 100)).length > 3) {
                                                        return (
                                                          <Typography className={classes.labelRoot}
                                                              component="div"
                                                              key={index}
                                                          >- {teststr}...</Typography>
                                                          // <span> - {teststr}</span>
                                                        );

                                                      }
                                                      else {
                                                        return (
                                                          <Typography className={classes.labelRoot}
                                                              component="div"
                                                              key={index}
                                                          >
                                                            {teststr === '' ? '' : '- ' + teststr}
                                                          </Typography>
                                                          //  <span> - {teststr}</span>
                                                        );
                                                      }
                                                    }
                                                    else {
                                                      return;
                                                    }

                                                  })
                                                )
                                                  : (rowItem.name === 'outputFormPrinted' && n[rowItem.name] !== undefined && n[rowItem.name] === 1 ?
                                                    (
                                                      <Check color="primary" />
                                                    )
                                                    : (n[rowItem.name] === 0 ? '' : n[rowItem.name])))
                                              }
                                            </CIMSTableCell>
                                          </HtmlTooltip>);
                                  })
                                }
                              </TableRow>
                            );
                          })
                        }
                      </>
                    )
                    :
                    (
                      <TableRow style={{ height: 'auto' }}>
                        <TableCell colSpan={initRows.length + 1}
                            style={{ textAlign: 'center', padding: 10 }}
                        >
                          <Typography style={{ fontFamily: font.fontFamily }}>{nodataMessage ? nodataMessage : 'There is no data.'}</Typography>
                        </TableCell>
                      </TableRow>
                    )
                }
              </TableBody>
            </Table>
            <Typography className={classes.progressBarRoot}
                component="div"
                style={{ display: this.state.showProgress ? '' : 'none' }}
            ><CircularProgress className={classes.progressBar} /></Typography>
          </Typography>
        </Paper>
      </MuiThemeProvider>
    );
  }
}

JOSTableNoPagination.propTypes = {
  rows: PropTypes.array.isRequired
};

export default withStyles(useStyles2)(JOSTableNoPagination);