import React from 'react';
import { connect } from 'react-redux';
import {
    DialogContent,
    DialogActions,
    Typography
} from '@material-ui/core';
import CIMSDialog from '../../../../components/Dialog/CIMSDialog';
import CIMSButton from '../../../../components/Buttons/CIMSButton';


class SimpleDialog extends React.Component {
    render() {
        const { id, open, title, content, firstBtnContent, secondBtnContent, firstBtnAction, secondBtnAction, ...rest } = this.props;

        return (
            <CIMSDialog
                id={id + '_CIMSDialog'}
                open={open}
                dialogTitle={title}
                {...rest}
            >
                <DialogContent>
                    <Typography component={'div'}>
                        {content()}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <CIMSButton id={id + '_firstCIMSButton'} onClick={firstBtnAction}>
                        {firstBtnContent}
                    </CIMSButton>
                    <CIMSButton id={id + '_secondCIMSButton'} onClick={secondBtnAction}>
                        {secondBtnContent}
                    </CIMSButton>
                </DialogActions>
            </CIMSDialog>
        );

    }
}

const mapStateToProps = () => {
    return {

    };
};
const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(SimpleDialog);