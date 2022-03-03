import React from 'react';
import { connect } from 'react-redux';
import RegFieldName from '../../../enums/registration/regFieldName';
import {
    FormControl,
    Grid
} from '@material-ui/core';
import RegFieldLength from '../../../enums/registration/regFieldLength';
// import FormInputLabel from '../../compontent/label/formInputLabel';
import TextFieldValidator from '../../../components/FormValidator/TextFieldValidator';
import {
    findCharByCcCode
} from '../../../store/actions/registration/registrationAction';
import _ from 'lodash';

class RegChCodeField extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            backspaceOrEnterPre: -1,
            ccCode1: this.props.ccCode1,
            ccCode2: this.props.ccCode2,
            ccCode3: this.props.ccCode3,
            ccCode4: this.props.ccCode4,
            ccCode5: this.props.ccCode5,
            ccCode6: this.props.ccCode6,
            isCalling: false,
            isCleanAfter: false,
            isCleanChiChar: false
        };
        this.cmps = [];
    }

    getSnapshotBeforeUpdate(prevProps, prevState) {
        if (prevProps.ccCode1 !== this.props.ccCode1) {
            this.setState({ ccCode1: this.props.ccCode1 });
        }
        if (prevProps.ccCode2 !== this.props.ccCode2) {
            this.setState({ ccCode2: this.props.ccCode2 });
        }
        if (prevProps.ccCode3 !== this.props.ccCode3) {
            this.setState({ ccCode3: this.props.ccCode3 });
        }
        if (prevProps.ccCode4 !== this.props.ccCode4) {
            this.setState({ ccCode4: this.props.ccCode4 });
        }
        if (prevProps.ccCode5 !== this.props.ccCode5) {
            this.setState({ ccCode5: this.props.ccCode5 });
        }
        if (prevProps.ccCode6 !== this.props.ccCode6) {
            this.setState({ ccCode6: this.props.ccCode6 });
        }
        if (document.activeElement.id.indexOf(this.props.id) > -1) {
            if (this.state.backspaceOrEnterPre >= 0) {
                //focus is changed cause by backspace Or Enter
                const focusIndex = this.state.backspaceOrEnterPre;
                this.setState({ backspaceOrEnterPre: -1 });
                return focusIndex;
            } else if (this.state.backspaceOrEnterPre < 0 && prevState.backspaceOrEnterPre < 0) {
                //When the data changes, the focus stays at the stop position
                const activeIndex = this.cmps.findIndex(x => x.id === document.activeElement.id);
                if (activeIndex > -1 && (this.state[`ccCode${activeIndex + 1}`] || '').length === RegFieldLength.CHINESE_CODE_MAX && !this.state.isCleanChiChar && !prevState.isCleanChiChar) {
                    this.setState({ backspaceOrEnterPre: -1 });
                    return activeIndex + 1;
                }
            }
        }
        return null;
    }

    componentDidUpdate(prevProps, prevState, index) {
        if(index !== null) {
            if(index > 5) {
                this.cmps[5].blur();
            } else {
                this.cmps[index].focus();
            }
        }
    }

    handleOnChange = (e, index) => {
        this.props.resetChineseNameFieldValid && this.props.resetChineseNameFieldValid();//clear Chinese name validation
        let value = e.target.value;
        if(!this.state.isCalling) {
            this.setState({ [`ccCode${index + 1}`]: value });
            if (index !== 5 && value !== this.props[`ccCode${index + 1}`]) {
                for (let i = index + 1; i <= 5; i++) {
                    this.setState({ [`ccCode${i + 1}`]: '' });
                }
                this.setState({ isCleanAfter: true });
            }
            if(!value && this.props[`ccCode${index + 1}`]) {
                let ccCodeList = [{ index: index, code: value }];
                this.setState({ isCleanChiChar: true }, () => {
                    this.props.updateChiChar(index, '', ccCodeList);
                });
            } else {
                this.setState({ isCleanChiChar: false });
            }
        }
    }

    onKeyDown = (e, index) => {
        if (e.keyCode === 13) {
            if (index < 5) {
                this.setState({ backspaceOrEnterPre: index + 1 });
            } else {
                this.cmps[index].blur();
            }
        } else if (e.keyCode === 8 && index > 0 && !this.state['ccCode' + (index + 1)]) {
            this.setState({ backspaceOrEnterPre: index - 1 });
        }
    }

    onBlur = (e, index) => {
        let value = e.target.value;
        if (value && value !== this.props[`ccCode${index + 1}`]
            || value && value === this.props[`ccCode${index + 1}`] && this.state.isCleanAfter) {
            value = `${_.pad('', RegFieldLength.CHINESE_CODE_MAX, '0')}${value}`.slice(-RegFieldLength.CHINESE_CODE_MAX);
            this.setState({ [`ccCode${index + 1}`]: value, isCleanAfter: false }, () => {
                let ccCodeList = [{ index: index, code: value }];
                this.setState({ isCalling: true });
                this.props.findCharByCcCode({
                    ccCode: value,
                    charIndex: index,
                    updateChiChar: this.props.updateChiChar,
                    ccCodeList: ccCodeList,
                    resetCalling: () => {
                        const ccList = [
                            this.props.ccCode1,
                            this.props.ccCode2,
                            this.props.ccCode3,
                            this.props.ccCode4,
                            this.props.ccCode5,
                            this.props.ccCode6
                        ];
                        const lastNullInd = ccList.findIndex(x => !x);
                        this.setState({
                            isCalling: false,
                            ccCode1: this.props.ccCode1,
                            ccCode2: this.props.ccCode2,
                            ccCode3: this.props.ccCode3,
                            ccCode4: this.props.ccCode4,
                            ccCode5: this.props.ccCode5,
                            ccCode6: this.props.ccCode6,
                            backspaceOrEnterPre: lastNullInd > -1 ? lastNullInd : -1
                        });
                    }
                });
            });
        }
    }

    render() {
        const { comDisabled, id } = this.props;
        const textFieldProps = [
            {
                name: RegFieldName.CHINESE_CODE1,
                value: this.state.ccCode1
            },
            {
                name: RegFieldName.CHINESE_CODE2,
                value: this.state.ccCode2
            },
            {
                name: RegFieldName.CHINESE_CODE3,
                value: this.state.ccCode3
            },
            {
                name: RegFieldName.CHINESE_CODE4,
                value: this.state.ccCode4
            },
            {
                name: RegFieldName.CHINESE_CODE5,
                value: this.state.ccCode5
            },
            {
                name: RegFieldName.CHINESE_CODE6,
                value: this.state.ccCode6
            }
        ];
        return (
            <FormControl fullWidth>
                <Grid container item justify="space-between" spacing={1}>
                    {
                        textFieldProps.map((item, index) => (
                            <Grid item xs={2} key={index}>
                                <TextFieldValidator
                                    id={id + '_' + item.name}
                                    type="number"
                                    inputProps={{
                                        ref: e => this.cmps[index] = e,
                                        maxLength: RegFieldLength.CHINESE_CODE_MAX
                                    }}
                                    variant="outlined"
                                    label={'中文電碼' + (index + 1)}
                                    disabled={comDisabled || (index > 0 && !textFieldProps[index - 1].value)}
                                    value={item.value || ''}
                                    name={item.name}
                                    onChange={e => this.handleOnChange(e, index)}
                                    onKeyDown={e => this.onKeyDown(e, index)}
                                    onBlur={e => this.onBlur(e, index)}
                                />
                            </Grid>
                        ))
                    }
                </Grid>
            </FormControl>
        );
    }
}

const mapStateToProps = state => {
    return {
    };
};

const mapDispatchToProps = {
    findCharByCcCode
};

export default connect(mapStateToProps, mapDispatchToProps)(RegChCodeField);