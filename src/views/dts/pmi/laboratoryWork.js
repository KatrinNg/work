import React, { Component } from 'react';
import { connect } from 'react-redux';

class LaboratoryWork extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <html>This is dummy page for Laboratory Work, to be developed later</html>;
    }
}

const mapStateToProps = state => {
    return {};
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(LaboratoryWork);
