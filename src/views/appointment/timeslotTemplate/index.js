import React from 'react';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import CIMSDrawer from '../../../components/Drawer/CIMSDrawer';
import TemplateList from './component/templateList';
import TemplateDetails from './component/templateDetails';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import { initPage, updateState } from '../../../store/actions/appointment/timeslotTemplate';
import { openCommonMessage } from '../../../store/actions/message/messageAction';
import { updateCurTab } from '../../../store/actions/mainFrame/mainFrameAction';
import BatchCreate from './component/batchCreate';

const TimeslotTemplate = (props) => {
    const { classes, isOpenBatchCreate } = props;
    const [drawerOpen, setDrawerOpen] = React.useState(true);
    let templateDetailRef = React.createRef(null);
    let batchCreateRef = React.createRef(null);


    React.useEffect(() => {
        props.initPage();
    }, []);

    return (
        <Grid
            container
            alignItems="flex-start"
            className={classes.container}
            wrap="nowrap"
            spacing={4}
        >
            <Grid item xs>
                <CIMSDrawer
                    id="timeSlotTemplate_templateList"
                    title="Template List"
                    open={drawerOpen}
                    onClick={() => { setDrawerOpen(!drawerOpen); }}
                    drawerWidth={'35vw'}
                >
                    <TemplateList />
                </CIMSDrawer>
            </Grid>
            <Grid item container>
                <ValidatorForm
                    ref={templateDetailRef}
                    className={classes.form}
                >
                    <TemplateDetails
                        formRef={templateDetailRef}
                        onSubmit={() => { return templateDetailRef.current.isFormValid(false); }}
                    />
                </ValidatorForm>
            </Grid>
            <ValidatorForm ref={batchCreateRef}>
                {isOpenBatchCreate ? <BatchCreate onSubmit={() => { return batchCreateRef.current.isFormValid(false); }} /> : null}
            </ValidatorForm>
        </Grid>
    );
};

const styles = theme => ({
    container: {
        height: '100%',
        padding: theme.spacing(1) / 2,
        overflowX: 'hidden',
        overflowY: 'auto'
    },
    form: {
        width: '100%'
    }
});

const mapState = state => ({
    status: state.timeslotTemplate.status,
    isOpenBatchCreate: state.timeslotTemplate.isOpenBatchCreate
});

const mapDispatch = {
    initPage,
    openCommonMessage,
    updateCurTab,
    updateState
};

export default connect(mapState, mapDispatch)(withStyles(styles)(TimeslotTemplate));