import React from 'react';
import moment from 'moment';
import { withRouter } from 'react-router-dom';

class ADIWebClientForm extends React.Component {
    componentDidMount(){
        this.refs.form.submit();
    }

    render()
    {
        let {
            lang = 'en_US',
            callbackURL = '',
            loginId = 'adi',
            userRight = 'A',
            loginName = 'adiapplication',
            hospitalCode = 'DH',
            systemPassword = 'ehr-apps-eadi@)!@',
            unit = '',
            floor = '',
            block = '',
            building = '',
            estate = '',
            streetNo = '',
            streetName = '',
            freetextaddress = ''
        } = JSON.parse(decodeURIComponent(this.props.match.params.json));
        let currentTime = moment().format('YYYYMMDDHHmmss');
        let user = JSON.stringify({
            loginId,
            userRight,
            loginName,
            hospitalCode,
            systemPassword,
            currentTime
        });
        return (
            <form ref="form" method="post" action={decodeURIComponent(this.props.match.params.url)}>
                <input type="hidden" value={encodeURIComponent(lang)} name="lang"></input>
                {/* <input type="hidden" value={user} name="user"></input> */}
                <input type="hidden" value={encodeURIComponent(callbackURL)} name="callbackURL"></input>
                {/* <input type="hidden" value={encodeURIComponent(unit)} name="unit"></input>
                <input type="hidden" value={encodeURIComponent(floor)} name="floor"></input>
                <input type="hidden" value={encodeURIComponent(block)} name="block"></input>
                <input type="hidden" value={encodeURIComponent(building)} name="building"></input> */}
                {/* <input type="hidden" value={encodeURIComponent(estate)} name="estate"></input> */}
                {/* <input type="hidden" value={encodeURIComponent(streetNo)} name="streetno"></input>
                <input type="hidden" value={encodeURIComponent(streetName)} name="streetname"></input>
                <input type="hidden" value={encodeURIComponent(freetextaddress)} name="freetextaddress"></input> */}
            </form>
        );

    }
}

export default withRouter(ADIWebClientForm);