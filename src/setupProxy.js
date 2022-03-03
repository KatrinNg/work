const proxy = require('http-proxy-middleware');
const pkg = require('../package.json');
const targetUrl = process.env.REACT_APP_PROXY || pkg.proxy;
const deptFavTarget = pkg.dptFavProxy;
const drugMaintenanceTarget = pkg.drugMainProxy;
const immunisationsTarget = pkg.immunisationProxy;
const moeTarget = pkg.moeProxy;
const saamTarget = pkg.saamTarget;
const prscrbDspnsEnquiryTarget = pkg.prscrbDspnsEnquiryProxy;
const eSTarget = pkg.eSproxy;
const consultationTarget = pkg.consultationProxy;
const paymentTarget = pkg.paymentProxy;
const clinicalphotoTarget = pkg.clinicalphotoProxy;
const sochsClinicalnoteTarget = pkg.sochsClinicalnoteProxy;
const sppConsultationTarget = pkg.sppConsultationProxy;
const cgsConsultationTarget = pkg.cgsConsultationProxy;
const healthAssessmentTarget = pkg.healthAssessmentProxy;
const ehsAppTarget = pkg.ehsAppProxy;
const ehsSvcTarget = pkg.ehsSvcProxy;
const questionnaireTarget = pkg.questionnaireProxy;


let proxyOpts = {
    target: targetUrl,
    pathRewrite: {},
    router: {},
    onProxyReq: function onProxyReq(proxyReq, req, res) {
        // Log outbound request to remote target

    },
    onError: function onError(err, req, res) {
        console.error(err);
        res.status(500);
        res.json({ error: 'Error when connecting to remote server.' });
    },
    logLevel: 'debug',
    changeOrigin: true,
    secure: false
};

// let dptFavProxyOpts = {
//     target: deptFavTarget,
//     pathRewrite: {
//         '^.*?/spa-deptfavor-maint/(.*)': '/$1'
//     },
//     router: {},
//     onProxyReq: function onProxyReq(proxyReq, req, res) {
//         // Log outbound request to remote target

//     },
//     onError: function onError(err, req, res) {
//         console.error(err);
//         res.status(500);
//         res.json({ error: 'Error when connecting to remote server.' });
//     },
//     logLevel: 'debug',
//     changeOrigin: true,
//     secure: false
// };

let drugMainProxyOpts = {
    target: drugMaintenanceTarget,
    pathRewrite: {
        '^.*?/spa-drugmaintenance/(.*)': '/$1'
    },
    router: {},
    onProxyReq: function onProxyReq(proxyReq, req, res) {
        // Log outbound request to remote target

    },
    onError: function onError(err, req, res) {
        console.error(err);
        res.status(500);
        res.json({ error: 'Error when connecting to remote server.' });
    },
    logLevel: 'debug',
    changeOrigin: true,
    secure: false
};

let immunisationProxyOpts = {
    target: immunisationsTarget,
    pathRewrite: {
        '^.*?/spa-immu-portal/(.*)': '/$1'
    },
    router: {},
    onProxyReq: function onProxyReq(proxyReq, req, res) {
        // Log outbound request to remote target

    },
    onError: function onError(err, req, res) {
        console.error(err);
        res.status(500);
        res.json({ error: 'Error when connecting to remote server.' });
    },
    logLevel: 'debug',
    changeOrigin: true,
    secure: false
};

let dptFavProxyOpts = {
    target: deptFavTarget,
    pathRewrite: {
        '^.*?/spa-favMaint-portal/(.*)': '/$1'
    },
    router: {},
    onProxyReq: function onProxyReq(proxyReq, req, res) {
        // Log outbound request to remote target

    },
    onError: function onError(err, req, res) {
        console.error(err);
        res.status(500);
        res.json({ error: 'Error when connecting to remote server.' });
    },
    logLevel: 'debug',
    changeOrigin: true,
    secure: false
};

let moeProxyOpts = {
    target: moeTarget,
    pathRewrite: {
        '^.*?/spa-moe/(.*)': '/$1'
    },
    router: {},
    onProxyReq: function onProxyReq(proxyReq, req, res) {
        // Log outbound request to remote target

    },
    onError: function onError(err, req, res) {
        console.error(err);
        res.status(500);
        res.json({ error: 'Error when connecting to remote server.' });
    },
    logLevel: 'debug',
    changeOrigin: true,
    secure: false
};

let saamProxyOpts = {
    target: saamTarget,
    pathRewrite: {
        '^.*?/spa-saam/(.*)': '/$1'
    },
    router: {},
    onProxyReq: function onProxyReq(proxyReq, req, res) {
        // Log outbound request to remote target

    },
    onError: function onError(err, req, res) {
        console.error(err);
        res.status(500);
        res.json({ error: 'Error when connecting to remote server.' });
    },
    logLevel: 'debug',
    changeOrigin: true,
    secure: false
};

let prscbDspnsEnquiryProxyOpts = {
    target: prscrbDspnsEnquiryTarget,
    pathRewrite: {
        '^.*?/spa-prscrb-dspns-enquiry/(.*)': '/$1'
    },
    router: {},
    onProxyReq: function onProxyReq(proxyReq, req, res) {
        // Log outbound request to remote target

    },
    onError: function onError(err, req, res) {
        console.error(err);
        res.status(500);
        res.json({ error: 'Error when connecting to remote server.' });
    },
    logLevel: 'debug',
    changeOrigin: true,
    secure: false
};

let eSOpts = {
    target: eSTarget,
    pathRewrite: {
        '^.*?/spa-encountersummary/(.*)': '/$1'
    },
    router: {},
    onProxyReq: function onProxyReq(proxyReq, req, res) {
        // Log outbound request to remote target

    },
    onError: function onError(err, req, res) {
        console.error(err);
        res.status(500);
        res.json({ error: 'Error when connecting to remote server.' });
    },
    logLevel: 'debug',
    changeOrigin: true,
    secure: false
};

let saamSaamProxyOpts = {
    target: targetUrl,
    pathRewrite: {
        '^/saam/saam/': '/saam/'
    },
    router: {},
    onProxyReq: function onProxyReq(proxyReq, req, res) {
        // Log outbound request to remote target

    },
    onError: function onError(err, req, res) {
        console.error(err);
        res.status(500);
        res.json({ error: 'Error when connecting to remote server.' });
    },
    logLevel: 'debug',
    changeOrigin: true,
    secure: false
};

let consultationProxyOpts = {
    target: consultationTarget,
    pathRewrite: {
        '^.*?/spa-consultation/(.*)': '/$1'
    },
    router: {},
    onProxyReq: function onProxyReq(proxyReq, req, res) {
        // Log outbound request to remote target

    },
    onError: function onError(err, req, res) {
        console.error(err);
        res.status(500);
        res.json({ error: 'Error when connecting to remote server.' });
    },
    logLevel: 'debug',
    changeOrigin: true,
    secure: false
};

let paymentOpts = {
    target: paymentTarget,
    pathRewrite: {
        '^.*?/spa-rcp/(.*)': '/$1'
    },
    router: {},
    onProxyReq: function onProxyReq(proxyReq, req, res) {
        // Log outbound request to remote target
    },
    onError: function onError(err, req, res) {
        console.error(err);
        res.status(500);
        res.json({ error: 'Error when connecting to remote server.' });
    },
    logLevel: 'debug',
    changeOrigin: true,
    secure: false
};

let clinicalphotoProxyOpts = {
    target: clinicalphotoTarget,
    pathRewrite: {
        '^.*?/spa-clinicalphoto/(.*)': '/$1'
    },
    router: {},
    onProxyReq: function onProxyReq(proxyReq, req, res) {
        // Log outbound request to remote target

    },
    onError: function onError(err, req, res) {
        console.error(err);
        res.status(500);
        res.json({ error: 'Error when connecting to remote server.' });
    },
    logLevel: 'debug',
    changeOrigin: true,
    secure: false
};

let sochsClinicalnoteProxyOpts = {
    target: sochsClinicalnoteTarget,
    pathRewrite: {
        '^.*?/spa-sochs-clinicalnote/(.*)': '/$1'
    },
    router: {},
    onProxyReq: function onProxyReq(proxyReq, req, res) {
        // Log outbound request to remote target

    },
    onError: function onError(err, req, res) {
        console.error(err);
        res.status(500);
        res.json({ error: 'Error when connecting to remote server.' });
    },
    logLevel: 'debug',
    changeOrigin: true,
    secure: false
};


let sppConsultationProxyOpts = {
    target: sppConsultationTarget,
    pathRewrite: {
        '^.*?/spa-spp-consultation/(.*)': '/$1'
	},
    router: {},
    onProxyReq: function onProxyReq(proxyReq, req, res) {
        // Log outbound request to remote target

    },
    onError: function onError(err, req, res) {
        console.error(err);
        res.status(500);
        res.json({ error: 'Error when connecting to remote server.' });
    },
    logLevel: 'debug',
    changeOrigin: true,
    secure: false
};


let questionnaireProxyOpts = {
    target: questionnaireTarget,
    pathRewrite: {
        '^.*?/spa-questionnaire/(.*)': '/$1'
    },
    router: {},
    onProxyReq: function onProxyReq(proxyReq, req, res) {
        // Log outbound request to remote target

    },
    onError: function onError(err, req, res) {
        console.error(err);
        res.status(500);
        res.json({ error: 'Error when connecting to remote server.' });
    },
    logLevel: 'debug',
    changeOrigin: true,
    secure: false
};

let cgsConsultationProxyOpts = {
    target: cgsConsultationTarget,
    pathRewrite: {
        '^.*?/spa-cgs-consultation/(.*)': '/$1'
    },
    router: {},
    onProxyReq: function onProxyReq(proxyReq, req, res) {
        // Log outbound request to remote target

    },
    onError: function onError(err, req, res) {
        console.error(err);
        res.status(500);
        res.json({ error: 'Error when connecting to remote server.' });
    },
    logLevel: 'debug',
    changeOrigin: true,
    secure: false
};


let healthAssessmentProxyOpts = {
    target: healthAssessmentTarget,
    pathRewrite: {
        '^.*?/spa-health-assessment/(.*)': '/$1'
    },
    router: {},
    onProxyReq: function onProxyReq(proxyReq, req, res) {
        // Log outbound request to remote target
    },
    onError: function onError(err, req, res) {
        console.error(err);
        res.status(500);
        res.json({ error: 'Error when connecting to remote server.' });
    },
    logLevel: 'debug',
    changeOrigin: true,
    secure: false
};

let ehsAppProxyOpts = {
    target: ehsAppTarget,
    pathRewrite: {
        '^.*?/spa-ehs/(.*)': '/$1'
    },
    router: {},
    onProxyReq: function onProxyReq(proxyReq, req, res) {
        // Log outbound request to remote target
    },
    onError: function onError(err, req, res) {
        console.error(err);
        res.status(500);
        res.json({ error: 'Error when connecting to remote server.' });
    },
    logLevel: 'debug',
    changeOrigin: true,
    secure: false
};

let ehsSvcProxyOpts = {
    target: ehsSvcTarget,
    pathRewrite: {
        '^.*?/ehs/(.*)': '/$1'
    },
    router: {},
    onProxyReq: function onProxyReq(proxyReq, req, res) {
        // Log outbound request to remote target
    },
    onError: function onError(err, req, res) {
        console.error(err);
        res.status(500);
        res.json({ error: 'Error when connecting to remote server.' });
    },
    logLevel: 'debug',
    changeOrigin: true,
    secure: false
};


let cimsProxy = proxy(proxyOpts);
let deptFavProxy = proxy(dptFavProxyOpts);
let drugMainProxy = proxy(drugMainProxyOpts);
let immunisationProxy = proxy(immunisationProxyOpts);
let moeProxy = proxy(moeProxyOpts);
let saamProxy = proxy(saamProxyOpts);
let prscbDspnsEnquiryProxy = proxy(prscbDspnsEnquiryProxyOpts);
let esProxy = proxy(eSOpts);
let consultationProxy = proxy(consultationProxyOpts);
let paymentProxy = proxy(paymentOpts);
let clinicalPhotoProxy = proxy(clinicalphotoProxyOpts);
let sochsClinicalnoteProxy = proxy(sochsClinicalnoteProxyOpts);
let sppConsultationProxy = proxy(sppConsultationProxyOpts);
let questionnaireProxy = proxy(questionnaireProxyOpts);
let cgsConsultationProxy = proxy(cgsConsultationProxyOpts);
let healthAssessmentProxy = proxy(healthAssessmentProxyOpts);
let ehsAppProxy = proxy(ehsAppProxyOpts);
let ehsSvcProxy = proxy(ehsSvcProxyOpts);

let saamSaamProxy = cimsProxy;
if (process.argv[2] === 'asl') {
    saamSaamProxy = proxy(saamSaamProxyOpts);
}

module.exports = function (app) {
    app.use('/common', cimsProxy);
    app.use('/user', cimsProxy);
    app.use('/appointment', cimsProxy);
    app.use('/patient', cimsProxy);
    app.use('/message', cimsProxy);
    app.use('/assessment', cimsProxy);
    app.use('/medical-summary', cimsProxy);
    app.use('/diagnosis', cimsProxy);
    app.use('/clinical-note', cimsProxy);
    app.use('*/spa-moe', moeProxy);
    app.use('*/spa-drugmaintenance', drugMainProxy);
    app.use('*/spa-favMaint-portal', deptFavProxy);
    app.use('*/spa-immu-portal', immunisationProxy);
    app.use('*/spa-saam', saamProxy);
    app.use('*/spa-prscrb-dspns-enquiry', prscbDspnsEnquiryProxy);
    app.use('*/spa-encountersummary', esProxy);
    app.use('/clinical-doc', cimsProxy);
    app.use('/ana', cimsProxy);
    app.use('/cmn', cimsProxy);
    app.use('/dts-ana', cimsProxy);
    app.use('/dental', cimsProxy);
    app.use('/saam/saam', saamSaamProxy);
    app.use('/saam', cimsProxy);
    app.use('/dts-cc', cimsProxy);
    app.use('/ehr-viewer', cimsProxy);
    app.use('/ehr-epmi-svc', cimsProxy);
    app.use('/report', cimsProxy);
    app.use('/reportJob', cimsProxy);
    app.use('/doc-upload', cimsProxy);
    app.use('/dts-doc', cimsProxy);
    app.use('/fhs-consultation', cimsProxy);
    app.use('*/spa-consultation', consultationProxy);
    app.use('*/spa-rcp', paymentProxy);
    app.use('*/spa-clinicalphoto', clinicalPhotoProxy);
    app.use('*/spa-sochs-clinicalnote', sochsClinicalnoteProxy);
    app.use('*/spa-spp-consultation', sppConsultationProxy);
    app.use('*/spa-questionnaire', questionnaireProxy);
    app.use('*/spa-cgs-consultation', cgsConsultationProxy);
    app.use('*/spa-health-assessment', healthAssessmentProxy);
    app.use('*/spa-ehs', ehsAppProxy);
    app.use('/ehs', cimsProxy);
};
