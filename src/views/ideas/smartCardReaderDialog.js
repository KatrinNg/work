import React, { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import CIMSButton from '../../components/Buttons/CIMSButton';
import { getSmartCardToken, getSmartCardTokenV2, getCardType, reset } from '../../store/actions/ideas/ideasAction';
import { openCommonCircularDialog, closeCommonCircularDialog } from '../../store/actions/common/commonAction';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { openCommonMessage } from '../../store/actions/message/messageAction';
import { auditAction } from '../../store/actions/als/logAction';

const SmartCardReaderDialog = (props) => {
    const {
        openSmartCardReaderDialog,
        handleCloseDialog,
        openCommonCircularDialog,
        closeCommonCircularDialog,
        getSmartCardToken,
        getSmartCardTokenV2,
        getCardType,
        reset,
        classes,
        detectCardResult,
        handleSmartCardReaderDialogOnReturn,
        isDummy = false,
        openCommonMessage,
        auditAction
    } = props;

    const [detectCardMessage, setDetectCardMessage] = useState('');
    const [manualMode, setManualMode] = useState(false);

    const [detectCardTimer, setDetectCardTimer] = useState(null);

    const WINDOW_IDEAS_WINDOW_KEY = 'IDEAS_WINDOW';

    const closeActiveIDEASPopupWindow = (forceStop = false) => {
        const isIDEASPopupWindowActive = () => window[WINDOW_IDEAS_WINDOW_KEY] !== undefined;
        const getActiveIDEASPopupWindow = () => window[WINDOW_IDEAS_WINDOW_KEY];

        if (isIDEASPopupWindowActive()) {
            // eslint-disable-next-line no-use-before-define
            window.removeEventListener('message', handleMessage, false);
            getActiveIDEASPopupWindow().close();
            window[WINDOW_IDEAS_WINDOW_KEY] = undefined;
            if (forceStop) {
                openCommonMessage({
                    msgCode: '130300',
                    params: [
                        { name: 'HEADER', value: 'Read Card Error' },
                        { name: 'MESSAGE', value: 'The connection has been terminated due to connection timeout after 2 mins! Please retry later!' }
                    ]
                });
            }
        }
    };

    const handleMessage = (messageEvent) => {
        const origin = window.location.protocol + '//' + window.location.host;
        if (messageEvent?.origin !== origin) {
            console.log('origin not same!');
            console.log('messageEvent.origin: ', messageEvent?.origin);
            console.log('origin: ', origin);
            return;
        }
        // console.log('messageEvent: ', messageEvent);
        if (messageEvent && messageEvent?.data) {
            // console.log('messageEvent.data.message: ', messageEvent.data.message);
            if (messageEvent.data.message === 'readcard_success') {
                // eslint-disable-next-line no-alert
                //alert('hkid: ' + messageEvent.data.card_data.hkid);
                auditAction('IDEAS - Read Card Success', null, null, false);
                handleSmartCardReaderDialogOnReturn(messageEvent.data.card_data);
                closeActiveIDEASPopupWindow();
            }
            if (messageEvent.data.message === 'readcard_failure') {
                auditAction('IDEAS - Read Card Failure', null, null, false);
                openCommonMessage({
                    msgCode: '130300',
                    params: [
                        { name: 'HEADER', value: 'Error Message' },
                        { name: 'MESSAGE', value: messageEvent.data.error_message }
                    ],
                    showSnackbar: true
                });
                closeActiveIDEASPopupWindow();
            }
        }
    };

    const openIDEASPopupWindow = (url, closingWindow) => {
        openCommonCircularDialog();
        closeActiveIDEASPopupWindow();
        const w = 800;
        const h = 600;
        const left = screen.width / 2 - w / 2;
        const top = screen.height / 2 - h / 2;

        let newIDEASPopupWindow = window.open(
            url,
            '',
            'toolbar=no,location=no' +
                'directories=no,status=no,menubar=no,scrollbars=yes,' +
                'resizable=yes,width=' +
                w +
                ',height=' +
                h +
                ', top=' +
                top +
                ', left=' +
                left
        );
        if (newIDEASPopupWindow) {
            let timer = setInterval(() => {
                if (newIDEASPopupWindow.closed) {
                    clearInterval(timer);
                    closingWindow();
                    window[WINDOW_IDEAS_WINDOW_KEY] = undefined;
                }
            }, 500);

            window[WINDOW_IDEAS_WINDOW_KEY] = newIDEASPopupWindow;

            // window.postMessage = (result) => {
            //     if (callback) {
            //         callback({
            //             result
            //         });
            //     }
            //     closeActiveIDEASPopupWindow();
            // };

            window.addEventListener('message', handleMessage, false);

            setTimeout(() => {
                closeActiveIDEASPopupWindow(true);
            }, 120000);
        }
    };

    const end = () => {
        auditAction('IDEAS - End', null, null, false);
        clearInterval(detectCardTimer);
        setDetectCardMessage('');
        setManualMode(false);
        closeActiveIDEASPopupWindow();
        reset();
        handleCloseDialog();
    };

    const getTokenCallback = (tokenUrl) => {
        openIDEASPopupWindow(tokenUrl, () => {
            closeCommonCircularDialog();
            end();
        });
    };

    const getTokenErrorCallback = (version) => {
        openCommonMessage({
            msgCode: '130300',
            params: [
                { name: 'HEADER', value: 'Error' },
                { name: 'MESSAGE', value: `ERROR! Cannot retrieve Ideas V${version} Token. Please contact CIMS support.` }
            ],
            btnActions: {
                btn1Click: () => {
                    end();
                }
            }
        });
    };

    const startV1 = () => {
        clearInterval(detectCardTimer);
        getSmartCardToken(
            (tokenUrl) => {
                getTokenCallback(tokenUrl);
            },
            (version) => {
                getTokenErrorCallback(version);
            }
        );
    };

    const startV2 = () => {
        clearInterval(detectCardTimer);
        getSmartCardTokenV2(
            (tokenUrl) => {
                getTokenCallback(tokenUrl);
            },
            (version) => {
                getTokenErrorCallback(version);
            }
        );
    };

    const startDummy = () => {
        getTokenCallback('/#/ideasDummy');
    };

    useEffect(() => {
        if (detectCardResult) {
            switch (detectCardResult) {
                case '1':
                    // Old ID card
                    setDetectCardMessage('Old ID Card detected');
                    // clearInterval(detectCardTimer);
                    auditAction('IDEAS - Old ID Card detected', null, null, false);
                    startV1();
                    break;
                case '2':
                    // New ID Card
                    setDetectCardMessage('New ID Card detected');
                    auditAction('IDEAS - New ID Card detected', null, null, false);
                    // clearInterval(detectCardTimer);
                    startV2();
                    break;
                case '4':
                    // Error: No card reader detected
                    setDetectCardMessage('ERROR! Cannot detect the card reader! Please check your USB connection.');
                    auditAction('IDEAS - ERROR! Cannot detect the card reader! Please check your USB connection.', null, null, false);
                    break;
                case '5':
                    // No card detected
                    setDetectCardMessage('Please INSERT patient\'s HKID Card into the card reader...');
                    auditAction('IDEAS - Please INSERT patient\'s HKID Card into the card reader...', null, null, false);
                    setManualMode(false);
                    break;
                case '8':
                    // Invalid card detected
                    setDetectCardMessage('Invalid HKID card or it has not inserted correctly. \n' + 'Please insert a valid card or position and try again.');
                    auditAction('IDEAS - Invalid HKID card or it has not inserted correctly. \n' + 'Please insert a valid card or position and try again.', null, null, false);
                    setManualMode(true);
                    break;
                default:
                    setDetectCardMessage('ERROR! Cannot detect Smart Card Version. \n' + 'Please manually select card type or contact CIMS support.');
                    auditAction('IDEAS - ERROR! Cannot detect Smart Card Version. \n' + 'Please manually select card type or contact CIMS support.', null, null, false);
                    clearInterval(detectCardTimer);
                    setManualMode(true);
                    break;
            }
        }
    }, [detectCardResult]);

    useEffect(() => {
        if (!isDummy) {
            auditAction('IDEAS - Start', null, null, false);
            setDetectCardMessage('Detecting ID Card...');
            setDetectCardTimer(
                setInterval(() => {
                    getCardType();
                }, 1000)
            );
        } else {
            setDetectCardMessage('Dummy Request...');
            startDummy();
        }
    }, []);

    return (
        <Dialog open={openSmartCardReaderDialog} fullWidth maxWidth="sm" onEscapeKeyDown={end} onClose={end} disableBackdropClick disableEnforceFocus>
            <DialogTitle>
                Smart Card Reader
                <IconButton aria-label="close" className={classes.closeButton} onClick={end}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2} direction="column" style={{ width: '100%', margin: 0 }}>
                    <Grid item xs={12} style={{ textAlign: 'center' }}>
                        <p style={{ whiteSpace: 'pre-line' }}>{detectCardMessage}</p>
                    </Grid>
                    {manualMode ? (
                        <Grid container item xs={12} style={{ width: '100%', margin: 0 }}>
                            <Grid item xs={6} style={{ textAlign: 'center' }}>
                                <CIMSButton style={{ margin: 0 }} size="small" onClick={startV1}>
                                    Old Smart Card
                                </CIMSButton>
                            </Grid>
                            <Grid item xs={6} style={{ textAlign: 'center' }}>
                                <CIMSButton style={{ margin: 0 }} size="small" onClick={startV2}>
                                    New Smart Card
                                </CIMSButton>
                            </Grid>
                        </Grid>
                    ) : null}
                </Grid>
            </DialogContent>
            <DialogActions></DialogActions>
        </Dialog>
    );
};

const styles = (theme) => ({
    closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500]
    }
});

const mapStateToProps = (state) => ({
    detectCardResult: state.ideas.detectCardResult
});

const mapDispatchToProps = {
    openCommonCircularDialog,
    closeCommonCircularDialog,
    getSmartCardToken,
    getSmartCardTokenV2,
    getCardType,
    reset,
    openCommonMessage,
    auditAction
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(SmartCardReaderDialog));
