import React from 'react';
import {
  withRouter
} from 'react-router-dom';
import queryString from 'query-string';

class ADICallback extends React.Component {
  componentDidMount() {
    if (window.opener && !window.opener.closed && window.opener.setADIAddress) {
      let url = this.props.location.search;
      let params = queryString.parse(url);
      window.opener.setADIAddress(
        params.status,
        params.unit,
        params.floor,
        params.block,
        params.building,
        params.estate,
        params.streetno,
        params.streetname,
        params.subdistrict,
        params.district,
        params.region,
        params.buildingcsuid,
        params.northing,
        params.easting,
        params.latitude,
        params.longitude
      );
    }
    window.close();
  }

  render() {
    return (
      <div></div>
    );
  }
}

export default withRouter(ADICallback);