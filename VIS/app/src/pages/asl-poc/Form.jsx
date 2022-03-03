import React from "react";
import axios from "axios";
import "./Form.css";
import QrReader from "react-qr-reader";
class Form extends React.Component {
  state = { inputValue: "", qrCodeValue: null, isShowScanner: false };

  handleScan = (data) => {
    if (data) {
      this.setState({
        qrCodeValue: data,
        isShowScanner: false
      });
    }
  };
  handleError = (err) => {
    console.error(err);
  };

  onClickSubmit = async (event) => {
    event.preventDefault();
    axios
      .get("/vis/generateQrCode", {
        params: {
          data: this.state.inputValue
        },
        responseType: "arraybuffer"
      })
      .then((response) => {
        const base64 = btoa(
          new Uint8Array(response.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );
        this.props.onSubmit(base64);
        this.setState({ inputValue: "" });
        //this.setState({ source: "data:;base64," + base64 });
      });
  };

  onClickScan = async (event) => {
    event.preventDefault();
    this.setState({ isShowScanner: true });
  };

  render() {
	const previewStyle = {
	   width: 640,
       height: 480,
       position: "absolute",
	   margin: "auto",
	   left: 0,
	   right: 0
//	   top: 0
//	   bottom: 0
    };
    if (this.state.isShowScanner) {
      return (
        <QrReader
          delay={300}
		  style={previewStyle}
          onError={this.handleError}
          onScan={this.handleScan}
        />
      );
    } else {
      return (
        <form className="vis-form">
          <span className="formtext">Generate QR Code</span>
          <br />
          <input
            type="text"
            value={this.state.inputValue}
            onChange={(event) =>
              this.setState({ inputValue: event.target.value })
            }
            placeholder="Data"
            required
          />
          <p>QR Code data: {this.state.qrCodeValue}</p>
          <input type="button" value="Scan" onClick={this.onClickScan} />
          <input type="button" value="Generate" onClick={this.onClickSubmit} />
        </form>
      );
    }
  }
}

export default Form;
