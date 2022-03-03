import React from 'react';
import { Grid } from '@material-ui/core';
import SelectFieldValidator from '../../../components/FormValidator/SelectFieldValidator';
import ValidatorEnum from '../../../enums/validatorEnum';
import CommonMessage from '../../../constants/commonMessage';

const ServiceClinicGroup = React.forwardRef((props, ref) => {
    const { id, serviceAndClinicGp, svcCd, siteId, updateServiceClinic } = props;

    const getSiteList = (siteList, serviceCd) => {
        if(!serviceCd) return [];
        return siteList.filter(item => item.svcCd === serviceCd);
    };

    const _serviceList = (serviceAndClinicGp && serviceAndClinicGp.clientServiceList) || [];
    const _siteList = getSiteList((serviceAndClinicGp && serviceAndClinicGp.clientSiteList) || [], svcCd);

    const handleServiceClinicChange = (name, value) => {
        if (name === 'svcCd') {
            let sites = getSiteList((serviceAndClinicGp && serviceAndClinicGp.clientSiteList) || [], value);
            if (sites && sites.length > 0){

                updateServiceClinic({ siteId: sites[0].siteId });
            } else {
                updateServiceClinic({ siteId: null });
            }
        }
        updateServiceClinic({ [name]: value });
    };

    return (
        <Grid container spacing={2}>
            <Grid item container xs={6}>
                <SelectFieldValidator
                    id={`${id}_service_select`}
                    TextFieldProps={{
                        variant: 'outlined',
                        label: <>Service</>
                    }}
                    value={svcCd}
                    options={_serviceList.map(item => ({ value: item.svcCd, label: item.svcName }))}
                    onChange={(e) => handleServiceClinicChange('svcCd', e.value)}
                    sortBy="label"
                    validators={[ValidatorEnum.required]}
                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                />
            </Grid>
            <Grid item container xs={6}>
                <SelectFieldValidator
                    id={`${id}_site_select`}
                    TextFieldProps={{
                        variant: 'outlined',
                        label: <>Site</>
                    }}
                    value={siteId}
                    options={_siteList.map(item => ({ value: item.siteId, label: item.siteName }))}
                    onChange={(e) => handleServiceClinicChange('siteId', e.value)}
                    sortBy="label"
                    validators={[ValidatorEnum.required]}
                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                />
            </Grid>
        </Grid>
    );
});

export default ServiceClinicGroup;