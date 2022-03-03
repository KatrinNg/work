import React from 'react';
import Form from './Form';
import QrCode from './QrCode';



class HvisApp extends React.Component {
	state = { base64: '' };

	doSomething = (base64) => {
		this.setState({ base64: base64 });
	};

	render() {
		if (this.state.base64.length !== 0) {
			return (
				<div>
					<QrCode base64={this.state.base64} />
				</div>
			);
		} else {
			return (
				<div>
					<Form onSubmit={this.doSomething} />
				</div>
			);
		}
	}
}

export default HvisApp;
