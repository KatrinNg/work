import React from 'react';
import Paper from '@material-ui/core/Paper';
import Draggable from 'react-draggable';

function getCurrentDate() {
  const separator = '/';
  const newDate = new Date();
  const date = newDate.getDate();
  const month = newDate.getMonth() + 1;
  const year = newDate.getFullYear();

  return `${date}${separator}${
    month < 10 ? `0${month}` : `${month}`
  }${separator}${year}`;
}

function PaperComponent(props) {
  return (
    <Draggable
        handle="#draggable-dialog-title"
        cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} />
    </Draggable>
  );
}

const abbreviations =
  [{ 'abb' : 'Abn','desc' : 'Abnormal'},
  { 'abb' : 'AP','desc' : 'Angina Pectoris'},
  { 'abb' : 'ASA','desc' : 'Anti-Smoking Advice'},
  { 'abb' : 'BPE','desc' : 'Basic Periodontal Examination'},
  { 'abb' : 'CHX','desc' : 'Chlorhexidine'},
  { 'abb' : 'Chemo','desc' : 'Chemotherapy'},
  { 'abb' : 'c/o F/ M/ S','desc' : 'care of Father/ Mother/ Spouse'},
  { 'abb' : 'CRHD','desc' : 'Chronic Rheumatic Heart Disease'},
  { 'abb' : 'DA dv','desc' : 'Dietary Advice'},
  { 'abb' : 'DI','desc' : 'Disease Information'},
  { 'abb' : 'DM','desc' : 'Diabetes Mellitus'},
  { 'abb' : 'DMFT','desc' : 'Decayed Missing Filled Permanent Teeth Due to Caries'},
  { 'abb' : 'F','desc' : 'Fluoride or Filling'},
  { 'abb' : 'FLS','desc' : 'Floss'},
  { 'abb' : 'FS','desc' : 'Fissure Sealant'},
  { 'abb' : 'Hx','desc' : 'History'},
  { 'abb' : 'ID','desc' : 'Inter-dental'},
  { 'abb' : 'ID B','desc' : 'Inter-dental Brush'},
  { 'abb' : 'IE','desc' : 'Infective Endocarditis'},
  { 'abb' : 'IHD','desc' : 'Ischemic Heart Disease'},
  { 'abb' : 'MI','desc' : 'Myocardial Infarction'},
  { 'abb' : 'NC','desc' : 'New Consultation'},
  { 'abb' : 'Pros HV','desc' : 'Prosthetic Heart Valve'},
  { 'abb' : 'RT','desc' : 'Radiotherapy'},
  { 'abb' : 'STD','desc' : 'Sexually Transmitted Disease'},
  { 'abb' : 'TB','desc' : 'Tuberculosis'},
  { 'abb' : 'Tx','desc' : 'Treatment'}];

export {  getCurrentDate, abbreviations, PaperComponent };
