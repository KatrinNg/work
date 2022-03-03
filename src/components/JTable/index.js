import React from 'react';
import { MuiThemeProvider, createMuiTheme, withStyles } from '@material-ui/core/styles';
import MaterialTable from 'material-table';
import TableHeader from './TableHeader';
import { TablePagination } from '@material-ui/core';
import TablePaginationActions from '../../components/Table/TablePaginationActions';
import {getState} from '../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

const standardFont = {
  fontSize: font.fontSize,
  fontFamily: font.fontFamily
};

const customStyle = {
  root: (props) => {
    const { options = {} } = props;
    if (options.maxBodyHeight == undefined) {
      return {
        '& div': {
          overflow: 'unset!important'
        }
      };
    } else {
      return null;
    }
  }
};

class MyTable extends React.Component {
  constructor(props) {
    super(props);
    const { options = {}, selected = [] } = props;
    this.state = {
      selected: selected,
      page: this.props.page || 0,
      rowsPerPage: this.props.page || 10,
      rowsPerPageOptions: this.props.rowsPerPageOptions || [10, 20, 50],
      selectionKey: typeof options.selection == 'string' ? options.selection : undefined
    };
  }



  componentWillReceiveProps(props) {
    const { selected = [] } = props;
    // if (!JSON.stringify(selected.sort()) == JSON.stringify(this.state.selected.sort())) {
    if (selected) {
      this.setState({
        selected: selected
      });
    }
  }

  customTheme = (theme) =>
    createMuiTheme({
      ...theme,
      palette: {
        primary: {
          main: '#7BC1D9'
        },
        secondary: {
          main: '#0579c8'
        }
      },
      overrides: {
        MuiPaper: {
          root: {
            backgroundColor: color.cimsBackgroundColor,
            color: color.cimsTextColor
          }
        },
        MuiSelect: {
          selectMenu: {
            color: color.cimsTextColor
          }
        },
        MuiTableBody: {
          root: {
            color: color.cimsTextColor,
            backgroundColor: color.cimsBackgroundColor
          }
        },
        MuiTableCell: {
          body: {
            color: color.cimsTextColor
          },
          root: {
            padding: '8px',
            color: color.cimsTextColor,
            ...standardFont
          }
        },
        MuiInputBase: {
          inputSelect: {
            ...standardFont
          },
          input: {
            ...standardFont,
            color:color.cimsTextColor
          }
        },
        MuiMenuItem: {
          root: {
            ...standardFont
          }
        },
        MuiTablePagination: {
          height: 45,
          minHeight: 45
        }
      }
    });

  defaultOptions = {
    headerStyle: {
      backgroundColor: '#7BC1D9',
      color: '#ffffff'
    },
    toolbar: false,
    paging: false,
    sorting: false,
    rowStyle: (rowData) => ({
      color: color.cimsTextColor,
      backgroundColor: this.state.selected && this.state.selected.find((item) => JSON.stringify(item) == JSON.stringify(rowData)) ? '#eee' : color.cimsBackgroundColor
    })
  };

  defaultComponents = {
    Header: (props) => {
      return <TableHeader {...props} />;
    }
  };

  handleChangePage = (event, newPage) => {
    const { handleChangePageCallBack } = this.props;
    handleChangePageCallBack && handleChangePageCallBack(newPage);
    this.setState({ page: newPage });
  };

  handleChangeRowsPerPage = (event) => {
    const { handleChangeRowsPerPageCallBack } = this.props;
    let newRowsPerPage = parseInt(event.target.value, 10);
    handleChangeRowsPerPageCallBack && handleChangeRowsPerPageCallBack(newRowsPerPage);
    this.setState({ rowsPerPage: newRowsPerPage });
  };

  handleRowClick = (e, rowData) => {
    const { onSelectionChange, onRowClick, editFlag } = this.props;
    const { selectionKey } = this.state;
    let dataIndex = null;
    let arr;
    if(editFlag == undefined || (editFlag && !rowData[editFlag])) {
      onRowClick && onRowClick(e, rowData);
      if (selectionKey) {
        if (
          this.state.selected.find((item, index) => {
            dataIndex = index;
            return item[selectionKey] === rowData[selectionKey];
          })
        ) {
          this.state.selected.splice(dataIndex, 1);
        } else {
          this.state.selected.push(rowData);
        }
        arr = [...this.state.selected];
      } else {
        if (this.state.selected && JSON.stringify(rowData) == JSON.stringify(this.state.selected[0])) {
          arr = [];
        } else {
          arr = [rowData];
        }
      }
      if (onSelectionChange) {
        onSelectionChange(arr);
      }
      this.setState({ selected: arr });
    }
  };

  render() {
    const { options = {}, classes, count, isPagination, components, id = '', ...others } = this.props;
    const { headerStyle = {} } = options;
    const rowSelection = typeof options.selection == 'string';
    options.selection = rowSelection ? false : options.selection;
    const { page, rowsPerPage, rowsPerPageOptions } = this.state;
    return (
      <MuiThemeProvider theme={this.customTheme}>
        <div id={id} className={classes.root}>
          <MaterialTable
              id={id + 'Table'}
              {...others}
              options={{
                ...this.defaultOptions,
                ...options,
                headerStyle: {
                  ...this.defaultOptions.headerStyle,
                  ...headerStyle
                }
              }}
              components={{ ...this.defaultComponents, ...components }}
              onRowClick={this.handleRowClick}
              key={id + 'Table'}
          />
          {isPagination ? (
            <TablePagination
                rowsPerPageOptions={rowsPerPageOptions}
                component="div"
                count={count}
                rowsPerPage={rowsPerPage}
                page={page}
                ActionsComponent={TablePaginationActions}
                onChangePage={this.handleChangePage}
                onChangeRowsPerPage={this.handleChangeRowsPerPage}
            />
          ) : null}
        </div>
      </MuiThemeProvider>
    );
  }
}

export default withStyles(customStyle)(MyTable);
