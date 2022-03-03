// ******************************************************
//  Copyright (C) 2020 Li Cheuk Wai, Tony <tony.li@mongodb.com>
//
//  This file is part of HA Consulting
//
//  HA Consulting can not be copied and/or distributed without the express
//  permission of Li Cheuk Wai, Tony
//  *******************************************************
//
// this file aims to provide the container for handling drawing ui container

import { connect } from 'react-redux';
import DrawingUI from '../components/DrawingUI';


const mapStateToProps= state => {
  return {
  };
};

const mapDispatchToProps= dispatch=>({
});

export default connect(mapStateToProps, mapDispatchToProps)(DrawingUI);
