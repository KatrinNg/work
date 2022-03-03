import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { changeEditMode } from '../../store/actions/mainFrame/mainFrameAction';

class EditModeMiddleware extends React.Component {

    componentDidMount() {
        this.props.changeEditMode({
            name: this.props.componentName,
            isEdit: this.props.when,
            // saveFunction: this.props.saveFunction,
            // saveParamter: this.props.saveParamter,
            doCloseFunc:this.props.doClose,
            canCloseTab:this.props.canCloseTab
        });
    }

    componentDidUpdate(prevProps) {
        if (this.props.when !== prevProps.when||this.props.canCloseTab!=prevProps.canCloseTab) {
            this.props.changeEditMode({
                name: this.props.componentName,
                isEdit: this.props.when,
                // saveFunction: this.props.saveFunction,
                // saveParamter: this.props.saveParamter,
                doCloseFunc:this.props.doClose,
                canCloseTab:this.props.canCloseTab
            });
        }
    }


    componentWillUnmount() {
        this.props.changeEditMode({
            name: this.props.componentName,
            isEdit: false,
            // saveFunction: null,
            // saveParamter: null,
            doCloseFunc:null,
            canCloseTab:true
        });
    }

    render() {
        return (
            null
        );
    }
}

//eslint-disable-next-line
function mapStateToProps(state) {
    return {
    };
}

const dispatchProps = {
    changeEditMode
};

EditModeMiddleware.propTypes = {
    componentName: PropTypes.string.isRequired,
    when: PropTypes.bool.isRequired
};

export default connect(mapStateToProps, dispatchProps)(EditModeMiddleware);