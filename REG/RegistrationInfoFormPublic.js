import React, { useRef, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import haLogo from "../../assets/img/ha_logo.gif";
import { FormService } from "../../services/FormService.js";
import {
  Grid,
  Paper,
  TextField,
  Radio,
  Button,
  Typography,
  RadioGroup,
  FormControlLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText
} from "@material-ui/core";

const BlueRadio = withStyles({
  root: {
    "&$checked": {
      color: "#3f51b5"
    }
  },
  checked: {}
})((props) => <Radio color="default" {...props} />);

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1
  },
  paper: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    color: theme.palette.text.primary,
    borderRadius: "25px"
  },
  textField: {
    width: "100%"
  },
  submitButton: {
    fontSize: "18px",
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(6),
    paddingRight: theme.spacing(6),
    textTransform: "capitalize",
    marginBottom: theme.spacing(6)
  },
  dialogContent: {
    minWidth: "400px",
    minHeight: "80px"
  },
  /* dialogButton: {
    textTransform: 'capitalize',
    '&:hover': {
      color: '#fff',
      backgroundColor: '#303F9F'
    },
    boxShadow: '1.5px 1.5px #b9b9b9'
  }, */
  dialogButton: {
    fontSize: "18px",
    textTransform: "none",
    border: "1px solid",
    marginBottom: theme.spacing(2),
    width: "140px",
    height: "110px",
    [theme.breakpoints.down("sm")]: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1)
    },
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(4),
      marginRight: theme.spacing(4)
    }
  }
}));

function RegistrationInfoFormPublic(props) {
  const classes = useStyles();
  const history = useHistory();

  const [errorMsg, setErrorMsg] = React.useState([]);
  const [formInfo, setFormInfo] = React.useState({});
  const [openMessage, setOpenMessage] = React.useState({
    open: false,
    text: ""
  });


  // Runs once the form is submitted. 
  const onRecaptcha = (e) => { 
    console.log('onRecaptcha')
    e.preventDefault(); 
    const { grecaptcha } = window; 
    grecaptcha.execute(); 
    }; 

    // Real submit function. 
   /* const  onSubmit = (token) => { 
    // I'm not sure what token could be if recaptcha fails. 
    // In my case it seems successful and returns a long string. 
    console.log(token); 

    // Your real action goes below... 
    };  */

    const onLoad =() => { 
      console.log('onLoad')
    // Now we define our reCAPTCHA 
    if (window.grecaptcha) { 
     const { grecaptcha } = window; 
     const refToMyWidget= grecaptcha.render('recaptchaBox', { // div#recaptcha 
     sitekey : '6Ldja8EdAAAAAMqlr_sBWlRjvHGNNBWEsF6NUQiZ', 
     size  : 'invisible', 
     callback : handleFormSubmit
     }); 
     console.log(refToMyWidget)
    }
    }; 

  const refList = {
    userName: useRef(),
    phoneNumber: useRef(),
    email: useRef(),
    question1: useRef(),
    question2: useRef(),
    question3: useRef(),
    question4: useRef()
  };

  const handleMessageClose = () => {
    setOpenMessage({
      ...openMessage,
      open: false,
      text: ""
    });
  };

  const scrollToEle = (name) => {
    const eleRefToScroll = refList[name];
    window.scrollTo(0, eleRefToScroll?.current?.offsetTop - 100);
  };

  const handleBackToHome = () => {
    window.location.reload();
    window.scrollTo(0, 0);
  };

  const validate = () => {
    let errorMsgList = [];
    let error = false;
    let eleToScroll = "";
    const emailValidator = new RegExp(
      "^\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*$"
    );
    const phoneNumberValidator = new RegExp("^(\\(\\d+\\))?\\d+$");
    if (!formInfo.userName) {
      errorMsgList.userName = "required";
      error = true;
      eleToScroll = eleToScroll || "userName";
    }
    if (!formInfo.phoneNumber) {
      errorMsgList.phoneNumber = "required";
      error = true;
      eleToScroll = eleToScroll || "phoneNumber";
    }
    if (!formInfo.email) {
      errorMsgList.email = "required";
      error = true;
      eleToScroll = eleToScroll || "email";
    }

    if (formInfo.email && !emailValidator.test(formInfo.email)) {
      errorMsgList.email = "Please enter correct email.";
      error = true;
      eleToScroll = eleToScroll || "email";
    }

    if (
      formInfo.phoneNumber &&
      !phoneNumberValidator.test(formInfo.phoneNumber)
    ) {
      errorMsgList.phoneNumber = "Please enter correct phone number.";
      error = true;
      eleToScroll = eleToScroll || "phoneNumber";
    }
    if (!formInfo.question1) {
      errorMsgList.question1 = "required";
      error = true;
      eleToScroll = eleToScroll || "question1";
    }
    if (!formInfo.question2) {
      errorMsgList.question2 = "required";
      error = true;
      eleToScroll = eleToScroll || "question2";
    }
    if (!formInfo.question3) {
      errorMsgList.question3 = "required";
      error = true;
      eleToScroll = eleToScroll || "question3";
    }
    if (!formInfo.question4) {
      errorMsgList.question4 = "required";
      error = true;
      eleToScroll = eleToScroll || "question4";
    }

    if (error) {
      setErrorMsg(errorMsgList);
      scrollToEle(eleToScroll);
      return false;
    } else {
      setErrorMsg([]);
      return true;
    }
  };

  const handleFormSubmit = async (token) => {
    console.log('handleFormSubmit')
    console.log(formInfo)
    console.log(token)
    if (validate()) {
      const data = { token, ...formInfo };
      console.log(data)
      const res = await FormService.postFormData(data);
      console.log(res);
      if (res.status === 200 && res?.data) {
        switch (res.data.responseCode) {
          case 200:
            history.replace("/public/result");
            break;
          case 201:
            setOpenMessage({
              ...openMessage,
              open: true,
              text: "This record has exist."
            });
            break;
          case 202:
          case 203:
            setOpenMessage({
              ...openMessage,
              open: true,
              text: res.data.errorMessage
            });
            break;
          default:
            break;
        }
      } else {
        setOpenMessage({
          ...openMessage,
          open: true,
          text: "Server Error."
        });
      }
    }
  };

  // useEffect(() => {
  // 	// get query string and set to fields
  // 	const regrSurname = query.get("surname");
  // 	const regrGivenName = query.get("givenName");
  // 	const regrContractNo = query.get("contactNo");

  // 	if (regrSurname) {
  // 		setRegrSurname(regrSurname);
  // 	}
  // 	if (regrGivenName) {
  // 		setRegrGivenName(regrGivenName);
  // 	}
  // 	if (regrContractNo) {
  // 		setRegrContactNo(regrContractNo);
  // 	}
  // }, []);

  useEffect(()=>{
    const script = document.createElement('script'); 
    script.text = ` 
     var onloadCallback = function() { 
     console.log('grecaptcha is ready'); 
     }; 
    `; 
    document.body.appendChild(script);
    window.addEventListener('load',onLoad)
  },[])

  const handleValueChange = (e, type) => {
    setFormInfo({
      ...formInfo,
      [e.currentTarget.name]:
        type === "number" ? parseInt(e.target.value) : e.target.value
    });
  };

  return (
    <div id="regInfoFormPage">
      <div className="page-top-heading">
        <img className="ha-logo" src={haLogo} alt="logo" />
        <span className="page-title" style={{ marginTop: "15px" }}>
          Enquiry Portal for Non-
          <br />
          locally Trained Doctors
        </span>
      </div>
      <div
        style={{ marginLeft: "20px", marginRight: "20px", marginTop: "20px" }}
      >
        <div style={{ margin: "10px" }}>
          <Typography>
            If you are interested to know more about the opportunities for
            non-locally trained doctors in HA, please get in touch with us{" "}
            <a
              href="http://www.ha.org.hk/goto/limited_registration"
              target="_blank"
              rel="noreferrer"
            >
              here
            </a>
            .
          </Typography>
        </div>
        {/* Form */}
        <form id="regInfoForm" name="regInfoForm">
          <Grid container spacing={2}>
            {/* 1 - Personal Information */}
            <Grid item xs={12}>
              <Paper elevation={5} className={classes.paper}>
                <div className="page-subtitle">Personal Information</div>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Grid item xs>
                      <span>Full Name</span>
                    </Grid>
                    <Grid item xs>
                      <div
                        ref={refList.userName}
                        name="userName"
                        key={"userName"}
                      />
                      <TextField
                        id="userName"
                        name="userName"
                        value={formInfo?.userName || ""}
                        onChange={(e) => handleValueChange(e)}
                        error={!!errorMsg.userName}
                        helperText={errorMsg.userName ? errorMsg.userName : ""}
                        variant="outlined"
                        size="small"
                        className={classes.textField}
                        inputProps={{ maxLength: 255 }}
                      />
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid item xs>
                      <span>Contact Email</span>
                    </Grid>
                    <Grid item xs>
                      <div ref={refList.email} name="email" key={"email"} />

                      <TextField
                        id="email"
                        name="email"
                        value={formInfo?.email || ""}
                        onChange={(e) => handleValueChange(e)}
                        error={!!errorMsg.email}
                        helperText={errorMsg.email ? errorMsg.email : ""}
                        variant="outlined"
                        size="small"
                        className={classes.textField}
                        inputProps={{ maxLength: 255 }}
                      />
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid item xs>
                      <span>Contact Phone Number</span>
                    </Grid>
                    <Grid item xs>
                      <div
                        ref={refList.phoneNumber}
                        name="phoneNumber"
                        key={"phoneNumber"}
                      />

                      <TextField
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formInfo?.phoneNumber || ""}
                        onChange={(e) => handleValueChange(e)}
                        error={!!errorMsg.phoneNumber}
                        helperText={
                          errorMsg.phoneNumber ? errorMsg.phoneNumber : ""
                        }
                        variant="outlined"
                        size="small"
                        className={classes.textField}
                        inputProps={{ maxLength: 50 }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* 2 - Question */}
            <Grid item xs={12}>
              <Paper elevation={5} className={classes.paper}>
                <div key={"optRadio"} name={"optRadio"} />
                <div className="page-subtitle">
                  Training And Medical Qualification Status
                </div>
                <table id="healthForm">
                  <tbody>
                    <tr>
                      <td className="td-question">
                        <Typography>
                          Are you Hong Kong permanent resident?
                          <span className="radio-msg">
                            {errorMsg.question1}
                          </span>
                        </Typography>
                      </td>
                    </tr>
                    <tr>
                      <td
                        className="td-answer"
                        ref={refList.question1}
                        name="question1"
                      >
                        <RadioGroup
                          id={0}
                          name="question1"
                          value={formInfo?.question1 || null}
                          onChange={(e) => {
                            handleValueChange(e);
                          }}
                        >
                          <FormControlLabel
                            value={"Yes"}
                            control={<BlueRadio />}
                            label={"Yes"}
                          />
                          <FormControlLabel
                            value={"No"}
                            control={<BlueRadio />}
                            label={"No"}
                          />
                        </RadioGroup>
                      </td>
                    </tr>
                    <tr>
                      <td className="td-question">
                        <Typography>
                          Do you have
                          <a
                            href="https://www.mchk.org.hk"
                            target="_blank"
                            rel="noreferrer"
                          >
                            recognized Medical Qualification
                          </a>{" "}
                          as determined by the Special Registration Committee
                          under the Medical Council of Hong Kong?
                          <span className="radio-msg">
                            {errorMsg.question2}
                          </span>
                        </Typography>
                      </td>
                    </tr>
                    <tr>
                      <td
                        className="td-answer"
                        ref={refList.question2}
                        name="question2"
                      >
                        <RadioGroup
                          id={1}
                          name="question2"
                          value={formInfo?.question2 || null}
                          onChange={(e) => {
                            handleValueChange(e);
                          }}
                        >
                          <FormControlLabel
                            value={"Yes"}
                            control={<BlueRadio />}
                            label={"Yes"}
                          />
                          <FormControlLabel
                            value={"No"}
                            control={<BlueRadio />}
                            label={"No"}
                          />
                        </RadioGroup>
                      </td>
                    </tr>
                    <tr>
                      <td className="td-question">
                        <Typography>
                          What is your level of postgraduate medical training?
                          <span className="radio-msg">
                            {errorMsg.question3}
                          </span>
                        </Typography>
                      </td>
                    </tr>
                    <tr>
                      <td
                        className="td-answer"
                        ref={refList.question3}
                        name="question3"
                      >
                        <RadioGroup
                          id={2}
                          name="question3"
                          value={formInfo?.question3 || null}
                          onChange={(e) => {
                            handleValueChange(e);
                          }}
                        >
                          <FormControlLabel
                            value={
                              "Graduated from medical degree but have not yet completed internship training"
                            }
                            control={<BlueRadio />}
                            label={
                              "Graduated from medical degree but have not yet completed internship training"
                            }
                          />
                          <FormControlLabel
                            value={
                              "Graduated from medical degree and completed internship training"
                            }
                            control={<BlueRadio />}
                            label={
                              "Graduated from medical degree and completed internship training"
                            }
                          />
                          <FormControlLabel
                            value={
                              "Attained a qualification comparable to the Intermediate (or Pre-intermediate*) examination of the Hong Kong Academy of Medicine (examples)"
                            }
                            control={<BlueRadio />}
                            label={
                              <span>
                                Attained a qualification comparable to the
                                Intermediate (or Pre-intermediate*) examination
                                of the Hong Kong Academy of Medicine (
                                <a
                                  href="https://www.ha.org.hk/haho/ho/hrd_jv/LRExamplesofQualifications202021a.pdf"
                                  target={"_blank"}
                                  rel="noreferrer"
                                >
                                  examples
                                </a>
                                )
                              </span>
                            }
                          />
                          <FormControlLabel
                            value={
                              "Certified or registered as a specialist or equivalent, in relevant specialty in the country of practising Medicine"
                            }
                            control={<BlueRadio />}
                            label={
                              "Certified or registered as a specialist or equivalent, in relevant specialty in the country of practising Medicine"
                            }
                          />
                          <FormControlLabel
                            value={
                              "Attained specialist qualification awarded or recognized by the Hong Kong Academy of Medicine"
                            }
                            control={<BlueRadio />}
                            label={
                              "Attained specialist qualification awarded or recognized by the Hong Kong Academy of Medicine"
                            }
                          />
                        </RadioGroup>
                        <Typography style={{ margin: "10px 0px" }}>
                          * For Emergency Medicine, Family Medicine, Internal
                          Medicine and Paediatrics, applicants with
                          pre-intermediate level qualifications would be
                          considered.
                        </Typography>
                      </td>
                    </tr>
                    <tr>
                      <td className="td-question">
                        <Typography>
                          Which specialty are you interested in?
                          <span className="radio-msg">
                            {errorMsg.question4}
                          </span>
                        </Typography>
                      </td>
                    </tr>
                    <tr>
                      <td
                        className="td-answer"
                        ref={refList.question4}
                        name="question4"
                      >
                        <RadioGroup
                          id={3}
                          name="question4"
                          value={formInfo?.question4 || null}
                          onChange={(e) => {
                            handleValueChange(e);
                          }}
                        >
                          <FormControlLabel
                            value={"Anaesthesiology"}
                            control={<BlueRadio />}
                            label={"Anaesthesiology"}
                          />
                          <FormControlLabel
                            value={"Clinical Oncology"}
                            control={<BlueRadio />}
                            label={"Clinical Oncology"}
                          />
                          <FormControlLabel
                            value={"Emergency Medicine"}
                            control={<BlueRadio />}
                            label={"Emergency Medicine"}
                          />
                          <FormControlLabel
                            value={"Family Medicine"}
                            control={<BlueRadio />}
                            label={"Family Medicine"}
                          />
                          <FormControlLabel
                            value={"Intensive Care"}
                            control={<BlueRadio />}
                            label={"Intensive Care"}
                          />
                          <FormControlLabel
                            value={"Internal Medicine"}
                            control={<BlueRadio />}
                            label={"Internal Medicine"}
                          />
                          <FormControlLabel
                            value={"Obstetrics & Gynaecology"}
                            control={<BlueRadio />}
                            label={"Obstetrics & Gynaecology"}
                          />
                          <FormControlLabel
                            value={"Ophthalmology"}
                            control={<BlueRadio />}
                            label={"Ophthalmology"}
                          />
                          <FormControlLabel
                            value={"Orthpaedics & Traumatology"}
                            control={<BlueRadio />}
                            label={"Orthpaedics & Traumatology"}
                          />
                          <FormControlLabel
                            value={"Otorhinolaryngology"}
                            control={<BlueRadio />}
                            label={"Otorhinolaryngology"}
                          />
                          <FormControlLabel
                            value={"Paediatrics"}
                            control={<BlueRadio />}
                            label={"Paediatrics"}
                          />
                          <FormControlLabel
                            value={"Pathology"}
                            control={<BlueRadio />}
                            label={"Pathology"}
                          />
                          <FormControlLabel
                            value={"Psychiatry"}
                            control={<BlueRadio />}
                            label={"Psychiatry"}
                          />
                          <FormControlLabel
                            value={"Radiology"}
                            control={<BlueRadio />}
                            label={"Radiology"}
                          />
                          <FormControlLabel
                            value={"Nuclear Medicine"}
                            control={<BlueRadio />}
                            label={"Nuclear Medicine"}
                          />
                          <FormControlLabel
                            value={"General Surgery"}
                            control={<BlueRadio />}
                            label={"General Surgery"}
                          />
                          <FormControlLabel
                            value={"Cardiothoracic Surgery"}
                            control={<BlueRadio />}
                            label={"Cardiothoracic Surgery"}
                          />
                          <FormControlLabel
                            value={"Neurosurgery"}
                            control={<BlueRadio />}
                            label={"Neurosurgery"}
                          />
                          <FormControlLabel
                            value={"Plastic Surgery"}
                            control={<BlueRadio />}
                            label={"Plastic Surgery"}
                          />
                        </RadioGroup>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Paper>
            </Grid>
          </Grid>

          <div style={{ textAlign: "center", marginTop: "50px" }}>
            <Button
              id="submitBtn"
              name="submitBtn"
              variant="contained"
              color="primary"
              className={classes.submitButton}
              onClick={(e)=>onRecaptcha(e)}
              //className="g-recaptcha"
            >
              Submit
            </Button>
          </div>
        </form>
        {/* 
        <Snackbar
          open={openMessage.open}
          autoHideDuration={2000}
          onClose={handleMessageClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          <Alert onClose={handleMessageClose} severity="info">
            {openMessage.text}
          </Alert>
        </Snackbar> */}
        {/* <Dialog open={openMessage.open} onClose={handleMessageClose}
        >
          <DialogTitle>Submit failed</DialogTitle>
          <DialogContent dividers 
            className={classes.dialogContent}>
            <DialogContentText style={{color:'#565656'}}>{openMessage.text}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleMessageClose}
              variant="outlined"
              color="primary"
              className={classes.dialogButton}
            >
              Ok
            </Button>
          </DialogActions>
        </Dialog> */}
        <Dialog open={openMessage.open}>
          <DialogContent>
            <DialogContentText
              id="alert-dialog-description"
              style={{ fontSize: "20px", color: "red", padding: "0 10px" }}
            >
              {openMessage.text}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              color="primary"
              onClick={handleBackToHome}
              className={classes.dialogButton}
            >
              Leave
            </Button>
            <Button
              color="primary"
              onClick={handleMessageClose}
              autoFocus
              className={classes.dialogButton}
            >
              Modify
              <br />
              Information
            </Button>
          </DialogActions>
        </Dialog>
        <div id='recaptchaBox'/* className="g-recaptcha" data-sitekey='6Ldja8EdAAAAAMqlr_sBWlRjvHGNNBWEsF6NUQiZ' data-callback='handle' */></div>
      </div>
    </div>
  );
}

export default RegistrationInfoFormPublic;
