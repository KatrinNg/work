import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import SelectFieldValidator from '../../../components/FormValidator/SelectFieldValidator';
import DateFieldValidator from '../../../components/FormValidator/DateFieldValidator';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import CommonMessage from '../../../constants/commonMessage';
import ValidatorEnum from '../../../enums/validatorEnum';
import RequiredIcon from '../../../components/InputLabel/RequiredIcon';
import CIMSList from '../../../components/List/CIMSList';
import CIMSDrawer from '../../../components/Drawer/CIMSDrawer';
import { readySiteOptLbl, filterContentSvc } from '../../../utilities/commonUtilities';

const useStyles = makeStyles(theme => ({
    formContainer: {
        padding: theme.spacing(2)
    },
    list: {
        height: '50vh',
        width: '100%',
        overflowY: 'auto'
    },
    listItem: {
        borderTop: `1px solid ${theme.palette.grey[300]}`,
        display: 'flex',
        flexDirection: 'column'
    }
}));

const HistoryList = React.forwardRef(function HistoryList(props, ref) {
    const historyForm = React.useRef();
    React.useImperativeHandle(ref, () => ({
        isFormValid: () => {
            return historyForm.current.isFormValid(false);
        }
    }));

    const classes = useStyles();
    const {
        id,
        serviceCd,
        dateFrom,
        dateTo,
        serviceList,
        clinicList,
        onChange,
        onBlur,
        onListItemClick,
        open,
        disabled,
        selectedIndex,
        data,
        renderChild,
        siteId,
        disableSvc
    } = props;
    let comId = `${id}_attendanceCert_historyList`;

    const handleOnChange = (value, name) => {
        onChange && onChange(value, name);
    };

    const handleOnBlur = (value, name) => {
        onBlur && onBlur(value, name);
    };

    const handleListItemClick = (value, rowData) => {
        onListItemClick && onListItemClick(value, rowData);
    };

    const hasClinic = typeof clinicList !== 'undefined';
    const hasDateFrom = typeof dateFrom !== 'undefined';
    const hasDateTo = typeof dateTo !== 'undefined';

    return (
        <CIMSDrawer
            id={comId}
            open={open}
            title="History"
            onClick={() => handleOnChange(!open, 'open')}
            drawerWidth={480}
        >
            <ValidatorForm ref={historyForm}>
                <Grid container spacing={2} className={classes.formContainer}>
                    <Grid item container xs={hasClinic ? 8 : 12}>
                        <SelectFieldValidator
                            id={`${comId}_serviceCd`}
                            // addAllOption={serviceList.length > 1}
                            addAllOption
                            value={serviceCd}
                            options={serviceList.map((item) => (
                                { value: item.serviceCd, label: item.serviceName }
                            ))}
                            onChange={e => handleOnChange(e.value, 'serviceCd')}
                            validators={[ValidatorEnum.required]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            TextFieldProps={{
                                label: <>Service<RequiredIcon /></>,
                                variant: 'outlined'
                            }}
                            isDisabled={disableSvc ? true : disabled}
                            withRequiredValidator
                            sortBy="label"
                        />
                    </Grid>
                    {hasClinic ?
                        <Grid item container xs={4}>
                            <SelectFieldValidator
                                id={`${comId}_clinicCd`}
                                addAllOption
                                value={siteId}
                                options={clinicList.map((item) => (
                                    { value: item.siteId, label: readySiteOptLbl(item) }
                                ))}
                                onChange={e => handleOnChange(e.value, 'selectedSite')}
                                validators={[ValidatorEnum.required]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                TextFieldProps={{
                                    label: <>Clinic<RequiredIcon /></>,
                                    variant: 'outlined'
                                }}
                                isDisabled={clinicList.length === 1 ? true : disabled}
                                withRequiredValidator
                                sortBy="label"
                            />
                        </Grid>
                        : null}

                    {hasDateFrom ?
                        <Grid item xs={6}>
                            <DateFieldValidator
                                id={`${comId}_dateFrom`}
                                label={<>Date From<RequiredIcon /></>}
                                disabled={disabled}
                                onChange={e => handleOnChange(e, 'dateFrom')}
                                onBlur={e => handleOnBlur(e, 'dateFrom')}
                                onAccept={e => handleOnBlur(e, 'dateFrom')}
                                value={dateFrom}
                                isRequired
                                validByBlur
                                withRequiredValidator
                                inputVariant="outlined"
                            />
                        </Grid>
                        : null}
                    {hasDateTo ?
                        <Grid item xs={6}>
                            <DateFieldValidator
                                id={`${comId}_dateTo`}
                                label={<>Date To<RequiredIcon /></>}
                                disabled={disabled}
                                onChange={e => handleOnChange(e, 'dateTo')}
                                onBlur={e => handleOnBlur(e, 'dateTo')}
                                onAccept={e => handleOnBlur(e, 'dateTo')}
                                value={dateTo}
                                isRequired
                                validByBlur
                                withRequiredValidator
                                inputVariant="outlined"
                            />
                        </Grid> : null}
                    <Grid item container>
                        <CIMSList
                            id={`${comId}_list`}
                            data={data}
                            ListItemProps={{
                                button: true
                            }}
                            classes={{
                                list: classes.list,
                                listItem: classes.listItem
                            }}
                            selectedIndex={selectedIndex}
                            onListItemClick={(event, index) => handleListItemClick(index, data[index])}
                            renderChild={renderChild}
                            disabled={disabled}
                        />
                    </Grid>
                </Grid>
            </ValidatorForm>
        </CIMSDrawer>
    );
});

export default HistoryList;