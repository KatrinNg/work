import React from 'react';
import CIMSPromptDialog from '../../components/Dialog/CIMSPromptDialog';
import CIMSFormLabel from '../../components/InputLabel/CIMSFormLabel';
import { makeStyles } from '@material-ui/core/styles';
import { Checkbox, FormControlLabel, Grid } from '@material-ui/core';
import CIMSButton from '../../components/Buttons/CIMSButton';

const useStyles = makeStyles(theme => ({
    dialogPaper: {
        width: '65%'
    },
    generateBtn: {
        marginLeft: 0,
        marginTop: 30,
        marginBottom: 10
    },
    label: {
        color: 'rgb(132, 132, 132)',
        marginTop: 10
    }
}));

const DialogContent = (props) => {
    const { id, handlePrintSPPGumLabel } = props;
    const classes = useStyles();
    const categoryList = [
        {
            label: 'Chinese Name',
            value: 'isPrintChiName'
        },
        {
            label: 'Team',
            value: 'isPrintTeam'
        },
        {
            label: 'PMI Barcode',
            value: 'isPrintPmiBar'
        }
    ];
    const [selectedCategory, setSelectedCategory] = React.useState({ 'isPrintChiName': true, 'isPrintTeam': true, 'isPrintPmiBar': true });
    const handleGenSmallGumLabel = () => {
        handlePrintSPPGumLabel(null);
    };
    const handleGenGumLabelWithCategory = () => {
        handlePrintSPPGumLabel(selectedCategory);
    };
    return (
        <>
            <CIMSFormLabel >
                <Grid container><Grid item xs={4} className={classes.label}>Gum Label (Small)</Grid></Grid>
                <Grid container>
                    <Grid item xs={4} >
                        <CIMSButton
                            id={id + '_small_generateBtn'}
                            classes={{ sizeSmall: classes.generateBtn }}
                            onClick={handleGenSmallGumLabel}
                        >
                            Generate
                        </CIMSButton>
                    </Grid>
                </Grid>
            </CIMSFormLabel>
            <CIMSFormLabel style={{ marginTop: 15 }}>
                <Grid container><Grid item xs={4} className={classes.label}>Gum Label (2.5cm × 5cm)</Grid></Grid>
                {categoryList && categoryList.map((obj, index) =>
                    <Grid>
                        <FormControlLabel
                            id={`${id}_${obj.label}_checkboxLabel`}
                            key={index}
                            control={
                                <Checkbox
                                    id={`${id}_${obj.label}_checkbox`}
                                    value={obj.value}
                                    checked={!!selectedCategory[obj.value]}
                                    color={'primary'}
                                    onChange={(e) => {
                                        let { value, checked } = e.target;
                                        let category = { ...selectedCategory };
                                        category[value] = checked;
                                        setSelectedCategory(category);
                                    }}
                                />
                            }
                            label={obj.label}
                        />
                    </Grid>
                )}
                <Grid container>
                    <Grid item xs={4} >
                        <CIMSButton
                            id={id + '_generateBtn'}
                            classes={{ sizeSmall: classes.generateBtn }}
                            onClick={handleGenGumLabelWithCategory}
                        >
                            Generate
                        </CIMSButton>
                    </Grid>
                </Grid>
            </CIMSFormLabel>
        </>
    );
};

const SPPPrintGumLabelDialog = (props) => {
    const { id, openPrintGumLabelDialog, closePrintGumLabelDialog, handlePrintSPPGumLabel } = props;
    const classes = useStyles();
    return (
        <CIMSPromptDialog
            open={openPrintGumLabelDialog}
            dialogTitle={'Print Gum Label'}
            classes={{
                paper: classes.dialogPaper
            }}
            dialogContentText={
                <DialogContent id={id} handlePrintSPPGumLabel={handlePrintSPPGumLabel} />
            }
            buttonConfig={
                [
                    {
                        id: `${id}_close`,
                        name: 'CLOSE',
                        onClick: () => {
                            closePrintGumLabelDialog();
                        }
                    }
                ]
            }
        />
    );
};

export default SPPPrintGumLabelDialog;