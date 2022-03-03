import React, { Component } from "react";
import PropTypes from "prop-types";

const QrCode = ({base64})=>(
    <img alt="qr-code" src={"data:;base64," + base64} />
)
QrCode.propTypes = {
    base64:PropTypes.string
}
export default QrCode;
