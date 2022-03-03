import React, { Component } from 'react';
import PerioDrawPanel from './PerioDrawPanel';

class PerioDraw extends Component {

  constructor(props){
    super(props);
    this.state = {
    };
  }

  componentWillMount() {
  }

  componentDidMount() {
  }

  componentDidUpdate(prevProps) {
  }

  componentWillUnmount() {
  }

  render(){
    const {pdState, handleClick, border, scale, isDisable} = this.props;
    let defBorder = '1px solid';
    if (isDisable) {
      defBorder = 'none';
    }
    const style_disable = {
      border: defBorder,
      backgroundColor: '#bfbfbf',
      padding: '0 0 0 0'
    };
    const div_style = {
      border: defBorder,
      borderCollapse: 'collapse',
      padding: '0 0 0 0'
    };
    let panel;
    if (isDisable) {
      panel = <td align="center" style={style_disable} width={90 * scale} height={60 * scale}></td>;
    } else {
      panel = <PerioDrawPanel pdState={pdState} handleClick={handleClick} border={border} scale={scale} />;
    }
    return (
      <div style={div_style}>
        {panel}
      </div>
    );
  }
}

export default (PerioDraw);