import React, {useCallback, useEffect, useRef, useState} from "react";
import { useHistory, useLocation } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import Radio from "@material-ui/core/Radio";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import haLogo from "../../assets/img/ha_logo.gif";
import hospWardList from "../../assets/files/hospital.json";
import { FormService } from "../../services/FormService.js";
import { Typography } from "@material-ui/core";

import 'core-js/features/url-search-params';


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
		paddingRight: theme.spacing(6)
	},
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
	},
	menuItem: {
		whiteSpace: "normal"
	}
}));

const ITEM_HEIGHT = 50;
const ITEM_PADDING_TOP = 8;
const SelectProps = {
	MenuProps: {
		PaperProps: {
			style: {
				maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
				width: 250
			}
		}
	}
};

function VisitInfoFormPublic(props) {
	hospWardList.sort((a, b) => a.seqNo - b.seqNo);

	let query = new URLSearchParams(useLocation().search);

	const classes = useStyles();
	const history = useHistory();

	const [patSurname, setPatSurname] = React.useState("");
	const [patGivenName, setPatGivenName] = React.useState("");
	const [patHosp, setPatHosp] = React.useState(-1);
	const [patWard, setPatWard] = React.useState(-1);
	const [patBedNo, setPatBedNo] = React.useState("");

	const [visrSurname, setVisrSurname] = React.useState("");
	const [visrGivenName, setVisrGivenName] = React.useState("");
	const [visrContactNo, setVisrContactNo] = React.useState("");
	const [visrRelationship, setVisrRelationship] = React.useState(-1);
	const [visrRelationshipOther, setVisrRelationshipOther] = React.useState("");

	const [opt1Value, setOpt1Value] = React.useState("");
	const [opt2Value, setOpt2Value] = React.useState("");
	const [opt3Value, setOpt3Value] = React.useState("");
	const [opt5Value, setOpt5Value] = React.useState("");
	const [declareChecked, setDeclareChecked] = React.useState(false);

	const [errorMsg, setErrorMsg] = React.useState([]);
	const [openError, setOpenError] = React.useState(false);
	const [showOther, setShowOther] = React.useState(false);

	const [dialogErrorMsg, setDialogErrorMsg] = useState("")

	const refList = {
		patSurname: useRef(),
		patGivenName: useRef(),
		patHosp: useRef(),
		patWard: useRef(),
		patBedNo: useRef(),
		visrSurname: useRef(),
		visrGivenName: useRef(),
		visrContactNo: useRef(),
		visrRelationship: useRef(),
		visrRelationshipOther: useRef(),
		optChecked: useRef(),
	}

	const handleChangePatSurname = (event) => {
		setPatSurname(event.target.value);
	};

	const handleChangePatGivenName = (event) => {
		setPatGivenName(event.target.value);
	};

	const handleChangePatHosp = (event) => {
		setPatWard(-1);
		setPatHosp(event.target.value);
	};

	const handleChangePatWard = (event) => {
		setPatWard(event.target.value);
	};

	const handleChangePatBedNo = (event) => {
		setPatBedNo(event.target.value);
	};

	const handleChangeVisrSurname = (event) => {
		setVisrSurname(event.target.value);
	};

	const handleChangeVisrGivenName = (event) => {
		setVisrGivenName(event.target.value);
	};

	const handleChangeVisrContractNo = (event) => {
		setVisrContactNo(event.target.value);
	};

	const handleChangeVisrRelationship = (event) => {
		setVisrRelationship(event.target.value);
		if (event.target.value == 4) {
			setShowOther(true);
		} else {
			setShowOther(false);
			setVisrRelationshipOther("");
		}
	};

	const handleChangeVisrRelationshipOther = (event) => {
		setVisrRelationshipOther(event.target.value);
	};

	const handleChangeOpt1 = (event) => {
		setOpt1Value(event.target.value);
	};

	const handleChangeOpt2 = (event) => {
		setOpt2Value(event.target.value);
	};

	const handleChangeOpt3 = (event) => {
		setOpt3Value(event.target.value);
	};

	const handleChangeOpt5 = (event) => {
		setOpt5Value(event.target.value);
	};

	const handleChangeDeclare = (event) => {
		setDeclareChecked(event.target.checked);
	};

	const handleModify = () => {
		setOpenError(false);
	};

	const handleBackToHome = () => {
		window.location.reload();
		window.scrollTo(0, 0);
	};


	const scrollToEle = (name)=>{
		// const eleRefToScroll= refList.current.find(it=> it.name === name )
		const eleRefToScroll = refList[name]
		//console.log("eleRefToScroll",eleRefToScroll)
		//console.log("refList",refList)
		//console.log("scroll to",eleRefToScroll?.current?.offsetTop)
		window.scrollTo(0, eleRefToScroll?.current?.offsetTop - 100)
		// document.querySelector("#content").scrollTo(0, eleRefToScroll?.current?.offsetTop-100)
	}

	const validate = () => {
		let errorMsgList = [];
		let error = false;
		let eleToScroll = "";
		// validate form
		//console.log("Validate form");
		if (!patSurname.trim()) {
			errorMsgList.patSurname = "required 必需填寫";
			error = true;
			eleToScroll = "patSurname";
		}

		if (patHosp === -1) {
			errorMsgList.patHosp = "required 必需填寫";
			error = true;
			eleToScroll = eleToScroll || "patHosp"
		}

		if (patWard === -1) {
			errorMsgList.patWard = "required 必需填寫";
			error = true;
			eleToScroll = eleToScroll || "patWard"
		}

		if (visrSurname === "") {
			errorMsgList.visrSurname = "required 必需填寫";
			error = true;
			eleToScroll = eleToScroll || "visrSurname"

		}

		if (visrGivenName === "") {
			errorMsgList.visrGivenName = "required 必需填寫";
			error = true;
			eleToScroll = eleToScroll || "visrGivenName"

		}

		if (visrContactNo === "") {
			errorMsgList.visrContactNo = "required 必需填寫";
			error = true;
			eleToScroll = eleToScroll || "visrContactNo"
		}
		if (!/^[0-9]*$/.test(visrContactNo) || (visrContactNo.length < 8) ){
			errorMsgList.visrContactNo =
				"Please enter correct phone number (at least 8 digits). 請填寫正確電話號碼 (最少8個數字) ";
			error = true;
			eleToScroll = eleToScroll || "visrContactNo"

		}

		if (visrRelationship === -1) {
			errorMsgList.visrRelationship = "required 必需填寫";
			error = true;
			eleToScroll = eleToScroll || "visrRelationship"

		}

		if (
			opt1Value === "" ||
			opt2Value === "" ||
			opt3Value === "" ||
			// opt4Value === "" ||
			opt5Value === ""
		) {
			errorMsgList.optValue = "required 必需填寫";
			error = true;
			eleToScroll = eleToScroll || "optChecked"

		} else if (
			opt1Value === "Y" ||
			opt2Value === "Y" ||
			opt3Value === "Y" ||
			// opt4Value === "Y" ||
			opt5Value === "Y"
		) {
			// errorMsgList.optValue = "Cannot attend Hospital Visit! 不符合探訪條件!";
			setOpenError(true);
			return false;
		}

		// if (!declareChecked) {
		//     errorMsgList.declareChecked = "required 必需填寫";
		//     error = true;
		//
		// }

		if (error) {
			//console.log("Validate fail!",eleToScroll);
			setErrorMsg(errorMsgList);
			scrollToEle(eleToScroll);
			return false;

		} else {
			//console.log("Validate success!");
			setErrorMsg([]);
			return true;
		}
	};

	const handleSubmit = async (event) => {
		//console.log("submit called",event)
		event.preventDefault();

		const form = {
			patSurname: patSurname,
			patGivenName: patGivenName,
			patHosp: patHosp,
			patWard: patWard,
			patBedNo: patBedNo,
			visrSurname: visrSurname,
			visrGivenName: visrGivenName,
			visrContactNo: visrContactNo,
			visrRelationship: visrRelationship,
			visrRelationshipOther: visrRelationshipOther
		};
		//console.log("form", form);

		if (validate()) {
			const res = await FormService.postFormData(form);
			if (res.status === 200 && res?.data && res.data instanceof ArrayBuffer){
				const base64 = Buffer.from(res.data, 'base64').toString('base64')
				const email = query.get("email");
				history.push("/public/resultQRCode", {
					generatedQrCode_base64: base64,
					form,
					email
				});				
			} else {
				setOpenError(true)
				//console.log(res)
				setDialogErrorMsg(res.data?.error || "Server Error.")
			}

		}
	};

	useEffect(() => {
		// get query string and set to fields
		const visrSurname = query.get("surname");
		const visrGivenName = query.get("givenName");
		const visrContractNo = query.get("contactNo");

		if (visrSurname) {
			setVisrSurname(visrSurname);
		}
		if (visrGivenName) {
			setVisrGivenName(visrGivenName);
		}
		if (visrContractNo) {
			setVisrContactNo(visrContractNo);
		}
	}, []);

	return (
		<div id="visitInfoForm">
			{/* Hospital Visit */}
			<div className="page-top-heading">
				<img className="ha-logo" src={haLogo} alt="logo" />
				<span className="page-title">
                    Hospital Visit
                    <br />
                    醫院探訪
                </span>
			</div>
			<div
				style={{ marginLeft: "20px", marginRight: "20px", marginTop: "20px" }}
			>
				<div style={{ margin: "10px" }}>
					<Typography>
						This is health declaration form. The information is needed for
						prevention and contact tracing of infectious diseases.{" "}
						<b>(<span className="star">*</span>mandatory)</b>
						<br />
						請填寫以下健康申報表，資料只會用於預防和追踪傳染病。
						<b>(<span className="star">*</span>必須填寫)</b>
					</Typography>
				</div>

				{/* Form */}
				{/*<form id="visitInfoForm" name="visitInfoForm" onSubmit={handleSubmit}>*/}
				<form id="visitInfoForm" name="visitInfoForm" >
					<Grid container spacing={2}>
						{/* 1 - Patient Information */}
						<Grid item xs={12}>
							<Paper elevation={5} className={classes.paper}>
								<div className="page-subtitle">
									Patient Information 病人資料
								</div>
								<Grid  xs container spacing={2}>
									<Grid item xs={12}  >
										<Grid item xs>
                                            <span>
                                                <span className="star">*</span>Surname 姓
                                            </span>
										</Grid>
										<Grid item xs>
											<div ref={refList.patSurname} name="patSurname" key={"patSurname"} />
											<TextField
												id="patSurname"
												name="patSurname"
												value={patSurname}
												onChange={handleChangePatSurname}
												error={!!errorMsg.patSurname}
												helperText={
													errorMsg.patSurname ? errorMsg.patSurname : ""
												}

												variant="outlined"
												size="small"
												className={classes.textField}
												inputProps={{ maxLength: 40 }}
											/>

										</Grid>
									</Grid>
									<Grid item xs={12}>
										<Grid item xs>
											<span>Given name 名</span>
										</Grid>
										<Grid item xs>
											<div ref={refList.patGivenName} name="patGivenName" key={"patGivenName"} />

											<TextField
												id="patGivenName"
												name="patGivenName"
												value={patGivenName}
												onChange={handleChangePatGivenName}
												error={!!errorMsg.patGivenName}

												helperText={
													errorMsg.patGivenName ? errorMsg.patGivenName : ""
												}
												variant="outlined"
												size="small"
												className={classes.textField}
												inputProps={{ maxLength: 40 }}
											/>

										</Grid>
									</Grid>
									<Grid item xs={12}>

										<Grid item xs>
                                            <span>
                                                <span className="star">*</span>Hospital 醫院
                                            </span>
										</Grid>
										<Grid item xs>
											<div ref={refList.patHosp} name="patHosp" key={"patHosp"} />

											<TextField
												select
												id="patHosp"
												name="patHosp"
												value={patHosp}
												onChange={handleChangePatHosp}
												error={!!errorMsg.patHosp}
												helperText={errorMsg.patHosp ? errorMsg.patHosp : ""}
												variant="outlined"
												size="small"
												className={classes.textField}
												SelectProps={SelectProps}

											>
												<MenuItem key={0} value={-1} className={classes.menuItem}>
													Select 請選擇
												</MenuItem>
												{hospWardList.map((option) => (
													<MenuItem key={option.id} value={option.id} className={classes.menuItem}>
														{option.labelEN}
														<br />
														{option.labelTC}
													</MenuItem>
												))}
											</TextField>

										</Grid>
									</Grid>
									<Grid  xs={12} item >

										<Grid item xs>
                                            <span>
                                                <span className="star">*</span>Ward 病房
                                            </span>
										</Grid>
										<Grid item xs>
											<div ref={refList.patWard} name="patWard" key={"patWard"} />

											<TextField
												select
												id="patWard"
												name="patWard"
												value={patWard}
												onChange={handleChangePatWard}
												error={!!errorMsg.patWard}
												helperText={errorMsg.patWard ? errorMsg.patWard : ""}
												variant="outlined"
												size="small"
												className={classes.textField}
												SelectProps={SelectProps}
											>
												<MenuItem key={0} value={-1} className={classes.menuItem}>
													Select 請選擇
												</MenuItem>
												{hospWardList
													.filter((hosp) => hosp.id == patHosp)
													.map((filteredHosp) =>
														filteredHosp.ward.map((item) =>
															item.labelEN === item.labelTC ? (
																<MenuItem key={item.value} value={item.value} className={classes.menuItem}>
																	{item.labelEN}
																</MenuItem>
															) : (
																<MenuItem key={item.value} value={item.value} className={classes.menuItem}>
																	{item.labelEN}
																	<br />
																	{item.labelTC}
																</MenuItem>
															)
														)
													)}
											</TextField>

										</Grid>
									</Grid>
									<Grid  xs={12} item>
										<Grid item xs>
											<span>Bed number 床號</span>
										</Grid>
										<Grid item xs>
											<div ref={refList.patBedNo} name="patBedNo" key={"patBedNo"}/>

											<TextField
												id="patBedNo"
												name="patBedNo"
												value={patBedNo}
												onChange={handleChangePatBedNo}
												error={!!errorMsg.patBedNo}
												helperText={errorMsg.patBedNo ? errorMsg.patBedNo : ""}
												variant="outlined"
												size="small"
												className={classes.textField}
												inputProps={{ maxLength: 10 }}

											/>

										</Grid>
									</Grid>
								</Grid>
							</Paper>
						</Grid>

						{/* 2 - Visitor Information */}
						<Grid item xs={12}>
							<Paper elevation={5} className={classes.paper}>
								<div className="page-subtitle">
									Visitor Information 訪客資料
								</div>
								<Grid  xs container spacing={2}>
									<Grid item xs={12}  direction="column">
										<Grid item xs>
                                            <span>
                                                Your full name (same as HKID card/Passport)
                                                <br />
                                                姓名 (與香港身份證/護照相同)
                                            </span>
										</Grid>
									</Grid>
									<Grid item xs={12}  direction="column">
										<Grid item xs>
                                            <span>
                                                <span className="star">*</span>Surname 姓
                                            </span>
										</Grid>
										<Grid item xs>
											<div ref={refList.visrSurname} name="visrSurname" key={"visrSurname"}/>

											<TextField
												id="visrSurname"
												name="visrSurname"
												value={visrSurname}
												onChange={handleChangeVisrSurname}
												error={errorMsg.visrSurname ? true : false}
												helperText={
													errorMsg.visrSurname ? errorMsg.visrSurname : ""
												}
												variant="outlined"
												size="small"
												className={classes.textField}
												inputProps={{ maxLength: 40 }}

											/>

										</Grid>
									</Grid>
									<Grid item xs={12}  direction="column">
										<Grid item xs>
                                            <span>
                                                <span className="star">*</span>Given name 名
                                            </span>
										</Grid>
										<Grid item xs>
											<div ref={refList.visrGivenName} name="visrGivenName"  key={"visrGivenName"}/>
											<TextField
												id="visrGivenName"
												name="visrGivenName"
												value={visrGivenName}
												onChange={handleChangeVisrGivenName}
												error={errorMsg.visrGivenName ? true : false}
												helperText={
													errorMsg.visrGivenName ? errorMsg.visrGivenName : ""
												}
												variant="outlined"
												size="small"
												className={classes.textField}
												inputProps={{ maxLength: 40 }}
											/>

										</Grid>
									</Grid>
									<Grid item xs={12} >
                                        <span>
                                            <span className="star">*</span>Contact phone number
                                            聯絡電話/手提電話
                                        </span>
										<div ref={refList.visrContactNo} name="visrContactNo" key={"visrContactNo"}/>
										<TextField
											id="visrContactNo"
											name="visrContactNo"
											type="tel"
											min="0"
											value={visrContactNo}
											onChange={handleChangeVisrContractNo}
											error={errorMsg.visrContactNo ? true : false}
											helperText={
												errorMsg.visrContactNo ? errorMsg.visrContactNo : ""
											}
											variant="outlined"
											size="small"
											className={classes.textField}
											inputProps={{ maxLength: 20 }}
										/>

									</Grid>
									<Grid item xs={12} >
                                        <span>
                                            <span className="star">*</span>Relationship 與病人關係
                                        </span>
										<div ref={refList.visrRelationship} name="visrRelationship" key={"visrRelationship"} />
										<TextField
											select
											id="visrRelationship"
											name="visrRelationship"
											value={visrRelationship}
											onChange={handleChangeVisrRelationship}
											error={!!errorMsg.visrRelationship}
											helperText={
												errorMsg.visrRelationship
													? errorMsg.visrRelationship
													: ""
											}
											variant="outlined"
											size="small"
											className={classes.textField}

										>
											<MenuItem key={0} value={-1}>
												Select 請選擇
											</MenuItem>
											<MenuItem key={1} value={1}>
												Family member 家人
											</MenuItem>
											<MenuItem key={2} value={2}>
												Relative 親屬
											</MenuItem>
											<MenuItem key={3} value={3}>
												Friend 朋友
											</MenuItem>
											<MenuItem key={4} value={4}>
												Others 其他
											</MenuItem>
										</TextField>

									</Grid>
									{showOther ? (
										<Grid item xs={12} >
											<span>Other relationship 其他關係</span>
											<div ref={refList.visrRelationshipOther} name="visrRelationshipOther" key={"visrRelationshipOther"}/>

											<TextField
												id="visrRelationshipOther"
												name="visrRelationshipOther"
												value={visrRelationshipOther}
												onChange={handleChangeVisrRelationshipOther}
												error={errorMsg.visrRelationshipOther ? true : false}
												helperText={
													errorMsg.visrRelationshipOther
														? errorMsg.visrRelationshipOther
														: ""
												}
												variant="outlined"
												size="small"
												className={classes.textField}
												inputProps={{ maxLength: 20 }}

											/>

										</Grid>
									) : (
										""
									)}
								</Grid>
							</Paper>
						</Grid>

						{/* 3 - FTOCC */}
						<Grid item xs={12}>
							{errorMsg.optValue ? (
								<div className="error-msg">{errorMsg.optValue}</div>
							) : (
								""
							)}
							<div ref={refList.optChecked} key={"optChecked"} name={"optChecked"} />
							<table id="healthForm">
								<thead>
								<tr>
									<th colSpan="2" className="th-item">
										Assessment Items
										<br />
										評估項目
									</th>
									<th className="th-yes">
										Yes
										<br />是
									</th>
									<th className="th-no">
										No
										<br />否
									</th>
								</tr>
								</thead>
								<tbody>
								<tr>
									<td rowSpan="2">
										Symptoms
										<br />
										症狀
									</td>
									<td>
										<Typography>
											Fever
											<br />
											發燒
										</Typography>
									</td>
									<td className="rd-yes">
										<Radio
											id="rd-opt1Y"
											name="rdOpt1"
											checked={opt1Value === "Y"}
											onChange={handleChangeOpt1}
											value="Y"
											color="primary"
										/>
									</td>
									<td className="rd-no">
										<Radio
											id="rd-opt1N"
											name="rdOpt1"
											checked={opt1Value === "N"}
											onChange={handleChangeOpt1}
											value="N"
											color="primary"
										/>
									</td>
								</tr>
								<tr>
									<td style={{ fontWeight: "normal" }}>
										<Typography>
											Cough / Sore Throat / New loss of taste or smell / Runny
											nose / Diarrhoea
											<br />
											咳嗽 / 咽喉痛 / 近期失去味覺或嗅覺 / 流鼻水 / 腹瀉
										</Typography>
									</td>
									<td className="rd-yes">
										<Radio
											id="rd-opt2Y"
											name="rdOpt2"
											checked={opt2Value === "Y"}
											onChange={handleChangeOpt2}
											value="Y"
											color="primary"
										/>
									</td>
									<td className="rd-no">
										<Radio
											id="rd-opt2N"
											name="rdOpt2"
											checked={opt2Value === "N"}
											onChange={handleChangeOpt2}
											value="N"
											color="primary"
										/>
									</td>
								</tr>
								<tr>
									<td>
										Travel history
										<br />
										外遊史
									</td>
									<td>
										<Typography>
											Travel history outside Hong Kong within 14 days
											<br />
											過去14日內有外遊記錄
										</Typography>
									</td>
									<td className="rd-yes">
										<Radio
											id="rd-opt3Y"
											name="rdOpt3"
											checked={opt3Value === "Y"}
											onChange={handleChangeOpt3}
											value="Y"
											color="primary"
										/>
									</td>
									<td className="rd-no">
										<Radio
											id="rd-opt3N"
											name="rdOpt3"
											checked={opt3Value === "N"}
											onChange={handleChangeOpt3}
											value="N"
											color="primary"
										/>
									</td>
								</tr>
								<tr>
									<td>
										Contact /
										<br />
										Clustering
										<br />
										接觸 / 群聚
									</td>
									<td>
										<Typography>
											Contact with confirmed case of COVID-19 within 28 days /
											currently under medical surveillance
											<br />
											過去28日內曾與確診為 COVID-19 的病例有接觸 /
											正進行醫學監察
										</Typography>
									</td>
									<td className="rd-yes">
										<Radio
											id="rd-opt5Y"
											name="rdOpt5"
											checked={opt5Value === "Y"}
											onChange={handleChangeOpt5}
											value="Y"
											color="primary"
										/>
									</td>
									<td className="rd-no">
										<Radio
											id="rd-opt5N"
											name="rdOpt5"
											checked={opt5Value === "N"}
											onChange={handleChangeOpt5}
											value="N"
											color="primary"
										/>
									</td>
								</tr>
								</tbody>
							</table>
						</Grid>
					</Grid>

					<Grid
						container
						wrap={"nowrap"}
						alignItems={"flex-start"}
						style={{ paddingTop: 15 }}
					>
						<Checkbox
							id="cb-declare"
							name="cbDeclare"
							checked={declareChecked}
							onChange={handleChangeDeclare}
							color="primary"
							style={{ paddingTop: 0 }}
						/>
						<div name={"declareChecked"} key={"declareChecked"} ref={refList.declareChecked}/>
						<Typography className="cb-declare-text">
							<span className="star">*</span>I hereby declare that the information provided is true and
							correct.
							<br />
							我特此聲明所提供的資料屬實。
							<br />
							{errorMsg.declareChecked ? (
								<span className="error-msg">{errorMsg.declareChecked}</span>
							) : (
								""
							)}
						</Typography>
					</Grid>

					<div style={{ margin: "10px" }}>
						<Typography>
							The above information will be kept for a month for the purpose of
							contact tracing if necessary. Children under 12 and pregnant women are
							NOT permitted for hospital visit.
							<br />
							上述資料只會保存一個月並在需要時用於傳染病追踪。未滿12歲兒童及孕婦不得進行探訪。
						</Typography>
					</div>
					<br />

					<div style={{ textAlign: "center" }}>
						<Button
							id="submitBtn"
							name="submitBtn"
							// type="submit"
							disabled={!declareChecked}
							variant="contained"
							color="primary"
							className={classes.submitButton}
							onClick={handleSubmit}
						>
							Confirm
							<br />
							確定
						</Button>
					</div>
				</form>

				<Dialog open={openError}>
					<DialogContent>
						<DialogContentText
							id="alert-dialog-description"
							style={{ fontSize: "24px", color: "red", padding: "0 10px" }}
						>
							{dialogErrorMsg || <p>Visit criteria not fulfilled.
								<br/>
								Hospital visit not allowed.
								<br />
								不符合健康申報要求!
								<br />
								不可探訪！</p>}
						</DialogContentText>
					</DialogContent>
					<DialogActions>
						<Button
							color="primary"
							onClick={handleBackToHome}
							className={classes.dialogButton}
						>
							Leave
							<br />
							離開
						</Button>
						<Button
							color="primary"
							onClick={handleModify}
							autoFocus
							className={classes.dialogButton}
						>
							Modify
							<br />
							Information
							<br />
							修改資料
						</Button>
					</DialogActions>
				</Dialog>

				<br />
				<br />
				<br />
				<br />
				<br />
			</div>
		</div>
	);
}

export default VisitInfoFormPublic;
