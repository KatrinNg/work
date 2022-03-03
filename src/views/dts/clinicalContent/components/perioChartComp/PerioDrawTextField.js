import React, { Component } from 'react';

class PerioDrawTextField extends Component {

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
    const {border, scale, isImplant, isSupp} = this.props;
    const style_disable = {
      backgroundColor: '#ff8080'
    };
    const implant_s = {
      backgroundColor: '#ff8080'
    };
    const supp_s = {
      backgroundColor: '#ffff66'
    };
    let panel;

    if (isImplant && isSupp) {
      panel = <table align="center" border={border} width={90 * scale} height={22 * scale}><tr style={implant_s}><td align="center">Implant</td></tr><tr style={supp_s}><td align="center">Supp</td></tr></table>;
    } else if (isImplant) {
      panel = <table align="center" style={implant_s} border={border} width={90 * scale} height={22 * scale}><td align="center">Implant</td></table>;
    } else if (isSupp) {
      panel = <table align="center" style={supp_s} border={border} width={90 * scale} height={22 * scale}><td align="center">Supp</td></table>;
    } else {
      panel = <table border={border} width={80 * scale} height={22 * scale}><td></td></table>;
    }

    // if (isImplant) {
    //   panel = <table style={style_disable} border={border} width={90 * scale} height={22 * scale}><td>Implant</td></table>;
    // } else {
    //   panel = <table border={border} width={90 * scale} height={22 * scale}><td></td></table>;
    // }
    return (
      <div>
        {panel}
      </div>
    );
  }
}

export default (PerioDrawTextField);