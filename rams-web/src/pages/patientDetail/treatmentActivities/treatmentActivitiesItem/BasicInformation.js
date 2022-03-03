import React, { useState, useContext, useEffect } from "react";
import Grid from '@material-ui/core/Grid';
import GridItem from "./GridItem";
import { useStyles } from './style';
import { useSelector } from "react-redux";
import { IndexContextState } from '../../index'

export default function BasicInformation(props) {
    const classes = useStyles(); 
    const { forceErrorDisplay, setIsValidValue } = useContext(IndexContextState);
    const {
        treatment_category,
        treatment_name,
        treatment_doc,
    } = props.treatmentActivities;
    const {
        categoryList,
        
    } = props.treatmentActivitiesLists;
    const getCategoryList = (treatment_name) => {
        const newArr = JSON.parse(JSON.stringify(categoryList))
        if (!treatment_name) { 
            const t = {};
            return newArr.filter(item => {
                if (!t[item.treatment_category]) {
                    t[item.treatment_category] = true;
                    return true;
                }
            })
        }
        if (treatment_name) {
            return newArr.filter(item => {
                return item.treatment_name === treatment_name
            })
        }
        return newArr;
    }

    const getTreatmentList = (category) => {
        const newArr = JSON.parse(JSON.stringify(categoryList))
        if (!category) {
            const t = {};
            return newArr.filter(item => {
                if (!t[item.treatment_name]) {
                    t[item.treatment_name] = true;
                    return true;
                }
            })
        }
        if (category) {
            return newArr.filter(item => {
                return item.treatment_category === category
            })
        }
        return newArr;
    }
    const [categoryLists, setCateGoryList] = useState([]);
    const [treatmentList, setTreatmentList] = useState([]);

    useEffect(() => {
        setCateGoryList(getCategoryList(treatment_name))
    }, [treatment_name,categoryList.length])
    useEffect(() => {
        setTreatmentList(getTreatmentList(treatment_category))
    }, [treatment_category,categoryList.length])
   
    const { g_patientDetailsType } = useSelector(
        state => ({
            g_patientDetailsType: state.patientDetail?.patientDetailsType,
           
        })
    );
    const onChange = (val, filed) => {
        const newArr = JSON.parse(JSON.stringify(categoryList))
        if (!val) {
            setTreatmentList(getTreatmentList(val))
        } else {
            const temp = []
            newArr.forEach((item) => {
                if (item.treatment_category === val) {
                    temp.push(item)
                }
            })
            setTreatmentList(temp);
        }
        props.handleChangeState(filed, val);
    }
    const onTreatmentChange = (val, filed) => {
        let doc = ''
        const newArr = JSON.parse(JSON.stringify(categoryList))
        if (!val) {
            setCateGoryList(getCategoryList(val))
        } else {
            const temp = []
            newArr.forEach((item) => {
                if (item.treatment_name === val) {
                    !doc && (doc = item.treatment_doc);
                    temp.push(item)
                }
            })
            setCateGoryList(temp);
        }
        
        props.handleChangeState([filed, 'treatment_doc'], [val, doc])
        // props.handleChangeState('treatment_doc', doc)
    }
    
    console.log(categoryLists, categoryList, treatment_name, treatment_category, '')
    return (
        <>
            <Grid direction="row" container item xs={6}>
                <GridItem
                    direction={'row'} label={'Category'}
                    items={categoryLists} value={treatment_category} valueFiled='treatment_category' labelFiled="treatment_category" placeholder="- category -" onChange={(v) => onChange(v, 'treatment_category')}
                    validators={['isRequired']} isClear={true}
                    isValidValue={(isValid) => setIsValidValue(isValid)}
                    forceErrorDisplay={forceErrorDisplay}
                    />
            </Grid>
            <Grid direction="row" container item spacing={2}>
                <Grid container item xs={6}>
                    <GridItem
                        direction={'row'} label={g_patientDetailsType === 'PT' ? 'Treatment' : 'Activity'} items={treatmentList} value={treatment_name} valueFiled='treatment_name' labelFiled="treatment_name" placeholder="- Treatment -" onChange={(v) => onTreatmentChange(v, 'treatment_name')} validators={['isRequired']} isClear={true}
                        isValidValue={(isValid) => setIsValidValue(isValid)}
                        forceErrorDisplay={forceErrorDisplay}
                        showMsg = {`This ${g_patientDetailsType === 'PT' ? 'Treatment' : 'Activity'} does not exist in selected room.`}
                    />
                </Grid>
                <Grid container item xs={6}>
                    <GridItem label={'Documentation'}>
                        <Grid container className={classes.documentationItem}>{treatment_doc}</Grid>
                    </GridItem>
                </Grid>
            </Grid>
        </>
    )
}