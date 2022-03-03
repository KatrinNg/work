import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import RemoveCircle from '@material-ui/icons/RemoveCircle';
import AddCircle from '@material-ui/icons/AddCircle';

class AddRemoveButtons extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            id,
            hideAdd = false,
            hideRemove = false,
            AddButtonProps = {},
            RemoveButtonProps = {}
        } = this.props;
        return (
            <Grid item container justify="center">
                <IconButton
                    id={`${id}_removeBtn`}
                    title="Remove"
                    color="secondary"
                    style={{ padding: 8, display: hideRemove ? 'none' : '' }}
                    {...RemoveButtonProps}
                >
                    <RemoveCircle />
                </IconButton>
                <IconButton
                    id={`${id}_addBtn`}
                    title="Add"
                    color="primary"
                    style={{ padding: 8, display: hideAdd ? 'none' : '' }}
                    {...AddButtonProps}
                >
                    <AddCircle />
                </IconButton>
            </Grid>
        );
    }
}

export default AddRemoveButtons;