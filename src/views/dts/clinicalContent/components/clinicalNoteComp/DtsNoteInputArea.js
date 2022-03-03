import { Grid, TextField, withStyles } from '@material-ui/core';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { styles } from './DtsNoteInputAreaStyle';


const theme = createMuiTheme({
  overrides: {
    PrivateNotchedOutline: {
      root: {
        border: 0
      }
    },
    MuiOutlinedInput: {
      notchedOutline: {
        border: 0
      }
    },
    MuiInputBase: {
      input: {
        '&::-webkit-input-placeholder': {
          color: '#a7a7a7',
          opacity: 1
        }
      }
    }
  }
});

class DtsNoteInputArea extends Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
    this.inputContainerRef = React.createRef();
    const { value } = props;
    this.state = {
      editMode: false,
      displayMode: 'view',
      contentVal: value
    };
  }


  componentDidMount() {
    let { editMode } = this.props;
    if (editMode) {
      this.setState({
        displayMode: 'edit'
      });
    }
  }

  handleTextChange = e => {
    const { encounterId, noteId, onChange } = this.props;
    let value = e.target.value;
    this.setState({ contentVal: value });
    onChange && onChange(value, noteId, encounterId);
  }

  resetState = () => {
    this.setState({
      displayMode: 'view',
      contentVal: ''
    });
  }

  render() {
    const { currentEditFlag, noteTypeId } = this.props;
    let { displayMode, contentVal } = this.state;

    return (
      <div style={{ width: '100%', height: '100%' }}>
        {displayMode === 'view' ? (
          <MuiThemeProvider theme={theme}>
            {currentEditFlag && currentEditFlag !== 'N' ? null : (
              <TextField
                  style={{ width: '100%' }}
                  variant="outlined"
                  inputProps={{
                  style: {
                    height: 19,
                    padding: '0 3px'
                  }
                }}
                  value={contentVal}
                  id={'current_encounter_' + noteTypeId}
              />
            )}

          </MuiThemeProvider>
        ) :
          (
            <Grid container ref={this.inputContainerRef}>
              <Grid item xs={12}>
                <TextField
                    inputRef={this.inputRef}
                    style={{ width: '100%' }}
                    variant="outlined"
                    autoFocus={this.props.autoFocus}
                    multiline
                    // rows={5}
                    rowsMax={9999}
                    value={contentVal}
                    onChange={this.handleTextChange}
                />
              </Grid>
            </Grid>
          )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    loginInfo: {
      ...state.login.loginInfo,
      service: state.login.service,
      clinic: state.login.clinic
    }
  };
}

export default connect(mapStateToProps)(withStyles(styles)(DtsNoteInputArea));
