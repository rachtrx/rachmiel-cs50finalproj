import * as model from '../models/model.js';
import * as deviceModel from '../models/deviceModel.js';
import * as userModel from '../models/userModel.js';
import * as eventModel from '../models/eventModel.js';
import * as excelModel from '../models/excelModel.js';
import * as pdfFormModel from '../models/pdfFormModel.js'
import { transparentEl, opaqueEl } from '../../utilities/helpers.js';
import { ASSET_HOMEPAGE_URL } from '../../utilities/config.js';

import registerDevice from '../forms/registerDeviceView.js'
import registerModel from '../forms/registerModelView.js';
import createUser from '../forms/createUserView.js';
import removeUser from '../forms/removeUserView.js';
import loanDevice from '../forms/loanDeviceView.js';
import returnedDevice from '../forms/returnedDeviceView.js';
import condemnedDevice from '../forms/condemnedDeviceView.js';

import onboardView from '../forms/onboardView.js';

const controlExportExcel = async function() {
    try {
        await excelModel.exportExcel()
    } catch(err) {
        throw err;
    }
}

const controlNormal = function(viewObject) {

    model.state.rawFormInputs = [];
    model.state.excel = false;
    viewObject.renderNormal();
}

// RENDERING EXCEL FOR REGISTERING, CONDEMN DEVICE, NEW USER, REMOVE USER
const controlExcel = function(viewObject) {
        model.state.excel = true;
        model.state.rawFormInputs = [];
        viewObject.renderExcel();
}

// FOR PDF AFTER SUBMIT, FOR EXCEL BEFORE SUBMIT
export const controlFileLoaded = function(viewObject, file) {
    try {

        model.state.fileLoaded = true;
        viewObject.renderFileName(model.state.fileLoaded, file.name)

        // PDF types
        if(model.state.page === 'loan device' || model.state.page === 'returned device') {
            model.state.pdfFile = file;
        } else{
            console.log('hello');
            model.state.excelFile = file
        }

    } catch(err) {
        console.log(err);
        model.state.fileLoaded = false;
        viewObject.renderFileName(model.state.fileLoaded, file.name)
    }
}

export const controlRemoveFile = function(viewObject) {
    if (model.state.excel) {
        model.state.excelFile = {}
        model.state.fileLoaded = false;
        viewObject.renderFileName(model.state.fileLoaded)
    } else {
        // hide file name for PDF, but do not reset rawFormInputs
        viewObject.renderFileName(false)
        model.state.pdfFile = {}
    }
}

const controlConfirmation = async function() {

    try {
        if(model.state.fileLoaded !== true || !model.state.excelFile.name) throw Error('No file selected')

        const excelData = await excelModel.readExcel(model.state.excelFile)
        console.log(excelData);

        console.log(onboardView);
    
        // form inputs immediately
        const clientData = onboardView.getFileData(excelData)
        if(!clientData) {
            onboardView.renderError('Something went wrong when submitting data, please check you did not amend the headers')
            return
        }

        model.state.formInputs = clientData[0]

        onboardView.renderSpinner()
        const serverData = await excelModel.getOnboardConfirmation(clientData.flat())
        
        console.log(serverData);
    

        onboardView.renderConfirmationPage(model.state.formInputs, serverData)
    } catch(err) {
        console.log(err);
        onboardView.renderError(err.message)
    }
}

export const controlSubmit = async function(viewObject) {
    // let data;
    try {
        if (model.state.page === 'onboard') {
            viewObject.renderSpinner()
            console.log(model.state.formInputs);
            await model.uploadData();
            return;
        }

        model.state.rawFormInputs = []
        // const type = viewObject.type
        let data;

        if(model.state.excel === true) {


            if(!model.state.excelFile.name) throw Error('No file selected')
        
            const excelData = await excelModel.readExcel(model.state.excelFile)
            console.log(excelData);

            // raw form inputs is still needed for PDF forms
            model.state.rawFormInputs = await viewObject.getFileData(excelData)
            if(!model.state.rawFormInputs) return;
            
            
            data = [...model.state.rawFormInputs];
            if (!data) return;
            data.unshift(true);

        } else {
            console.log('not using excel');
            // need to also save raw form inputs from non excel submissions
            model.state.rawFormInputs = viewObject.getData();
            if(!model.state.rawFormInputs) return;
            
            // loan device and returned device will never use excel, but returned device can make use of this switch to remove the previous file
            if (model.state.page !== 'loan device' && model.state.page !== 'returned device') {
                data = [...model.state.rawFormInputs];
                data.unshift(false)
            // loan and return will be deconstructed in pdfFormModel
            } else if (model.state.page === 'returned device') {
                model.state.rawFormInputs.unshift(viewObject._eventId)
            }
        }

        model.state.formInputs = data;
        
        // upload data
        if (model.state.page !== 'loan device' && model.state.page !== 'returned device') {
            
            viewObject.renderSpinner();
            await model.uploadData();
        } else {
            console.log('rendering pdf form');
            viewObject.renderPDFForm(model.state.page)
            model.state.object = viewObject.getFormDetails()
        }
        
    } catch(err) {
        viewObject.renderError(err)
        console.log(err);
    }
}

const controlCreatePDF = function() {
    pdfFormModel.generatePDF()
}

export const controlDownloadPDF = async function(eventId) {
    try {
        await pdfFormModel.downloadPDF(eventId)
    } catch(err) {
        console.log(err);
    }
}

const controlPDFSubmit = async function(viewObject, bypass = false) {

    try {

        if(!model.state.rawFormInputs) {
            viewObject.renderError('Something went wrong!')
            return;
        }

        console.log(model.state.rawFormInputs);

        viewObject.renderSpinner()
        const assetId = await pdfFormModel.submitPDF(bypass)

        viewObject.renderResubmit(assetId, model.state.page, window.location.href, ASSET_HOMEPAGE_URL)

    } catch(err) {
        viewObject.renderError(err)
        console.log(err);
    }
}

export const controlPreviewResults = async function(viewObject, dataType) {
    try {
        const query = viewObject.getPreviewQuery();

        // query is blank: hide preview
        if(!query) {
            transparentEl(viewObject._previewWindowEl);
        // query returns either true or false
        } else {
            opaqueEl(viewObject._previewWindowEl);
            console.log(query, dataType);
            const results = await model.loadPreviewResults(query, dataType);
            viewObject.renderPreviewResults(results);
        }
        
    } catch(err) {
        console.log(err);
    }
}

// renderPreview is different for devices
export const controlSelectPreview = function(viewObject, clickedEl) {
    if (model.state.page !== 'devices' && model.state.page !== 'history')
    viewObject.renderPreview(clickedEl)
    else viewObject.renderBasicPreview(clickedEl)
}

export const controlClosePreview = function(viewObject) {
    model.state.object = {}; // to find out why... i forgot
    viewObject.closePreview()
}

const controlGenerateUserPreview = async function(assetId) {
    const user = await model.getPreviewUser(assetId)
    returnedDevice.renderUser(user)
}

// SET THE FORMS WHEN ID IN URL CHANGES
const controlGetIds = async function(action) {

    let assetId = '', userId = '', params = [];

    var queryParams = new URLSearchParams(window.location.search);
    if(queryParams.has('asset-tag')) {
        assetId = queryParams.get('asset-tag')
    };

    if(queryParams.has('user-name')) {
        userId = queryParams.get('user-name')
    };

    params.push(assetId, userId);

    if(assetId !== '') {
        await deviceModel.getDevice(assetId);
        
        switch(action) {

            case 'loan':
                loanDevice.renderAutoDevicePreview(model.state.object.details)
                console.log('rendering');
                break;
    
            case 'returned':
                returnedDevice.renderAutoDevicePreview(model.state.object.details)
                break;
    
            case 'condemned':
                condemnedDevice.renderAutoDevicePreview(model.state.object.details)
                console.log('rendering');
                break;

            default:
                break;
        }
    }

    if(userId !== '') {
        console.log(userId);
        await userModel.getUser(userId);

        switch(action) {            
            case 'loan':
                loanDevice.renderAutoUserPreview(model.state.object.details)
                break;

            case 'remove':
                console.log(model.state.object);
                removeUser.renderAutoUserPreview(model.state.object.details)
                break;
        }
    }

    if(assetId === '' && userId === '') {
        switch(action) {

            case 'loan':
                loanDevice.removePreviews();
                loanDevice.showInputPreviews();
                break;
    
            case 'returned':
                returnedDevice.removePreviews();
                returnedDevice.showInputPreviews();
                break;
    
            case 'condemned':
                condemnedDevice.removePreviews();
                condemnedDevice.showInputPreviews();
                break;

            default:
                break;
        }
    }
}

const init = function() {
    ['hashchange', 'load', 'popstate'].forEach(ev => window.addEventListener(ev, () => initializePage(ev)));
}

const initializePage = async function(ev) {
    // debugger;

    const previewHandlers = [controlPreviewResults, controlSelectPreview, controlClosePreview]


    switch(window.location.pathname) {

        case `/asset/forms/onboard`:
            console.log('hello');
            model.state.excel = true;
            model.state.page = 'onboard'
            onboardView.initialize()
            onboardView.addHandlerFileTemplate(controlExportExcel)
            onboardView.addHandlerUploadFile()
            onboardView.addHandlerFileLoaded(controlFileLoaded)
            onboardView.addHandlerRemoveFile(controlRemoveFile)
            onboardView.addHandlerConfirm(controlConfirmation)
            onboardView.addHandlerSubmit(controlSubmit)
            break;

            // CREATE DEVICE
        case `/asset/forms/register_model`:
            // user creates device
            console.log('hello');
            model.state.page = 'register model'
            registerModel.initialize();
            registerModel.addHandlerSubmit(controlSubmit);
            break;

            // REGISTER DEVICE
        case `/asset/forms/register_device`:
            model.state.page = 'register device';
            console.log(registerDevice._overlayEl);
            registerDevice.initialize(previewHandlers);

            // user wants to use excel or normal
            registerDevice.addHandlerExcelOption(controlExcel);
            registerDevice.addHandlerFileTemplate(controlExportExcel)
            registerDevice.addHandlerUploadFile()
            registerDevice.addHandlerFileLoaded(controlFileLoaded)
            registerDevice.addHandlerRemoveFile(controlRemoveFile)
            registerDevice.addHandlerNormalOption(controlNormal);
            registerDevice.addHandlerSubmit(controlSubmit);
            break;

            // LOAN DEVICE
        case `/asset/forms/loan_device`:
            if(ev === 'load') {
                model.state.page = 'loan device'
                loanDevice.initialize(previewHandlers);

                loanDevice.addHandlerSubmit(controlSubmit);
                loanDevice.addHandlerFileTemplate(controlCreatePDF)
                loanDevice.addHandlerUploadFile()
                // file loaded will not be checked, just display the file name
                loanDevice.addHandlerFileLoaded(controlFileLoaded)
                loanDevice.addHandlerRemoveFile(controlRemoveFile)
                loanDevice.addHandlerSubmitPDF(controlPDFSubmit)
            }
            console.log('hii');
            await controlGetIds('loan');
            break;

            // RETURN DEVICE
        case `/asset/forms/returned_device`:
            if(ev === 'load') {
                model.state.page = 'returned device'
                returnedDevice.initialize(previewHandlers);
                returnedDevice.addHandlerGetUser(controlGenerateUserPreview);
                returnedDevice.addHandlerSubmit(controlSubmit);
                loanDevice.addHandlerFileTemplate(controlCreatePDF)
                returnedDevice.addHandlerDownloadFile(controlDownloadPDF)
                returnedDevice.addHandlerUploadFile()
                returnedDevice.addHandlerFileLoaded(controlFileLoaded)
                returnedDevice.addHandlerRemoveFile(controlRemoveFile)
                returnedDevice.addHandlerSubmitPDF(controlPDFSubmit)
            }

            await controlGetIds('returned'); 
            break;

            // CONDEMN DEVICE
        case `/asset/forms/condemned_device`:

            if(ev === 'load') {
                model.state.page = 'condemned device'
                condemnedDevice.initialize(previewHandlers);

                // user wants to use excel or normal
                condemnedDevice.addHandlerExcelOption(controlExcel);
                condemnedDevice.addHandlerFileTemplate(controlExportExcel)
                condemnedDevice.addHandlerUploadFile()
                condemnedDevice.addHandlerFileLoaded(controlFileLoaded)
                condemnedDevice.addHandlerRemoveFile(controlRemoveFile)
                condemnedDevice.addHandlerNormalOption(controlNormal);
                // user condemns device TODO
                condemnedDevice.addHandlerSubmit(controlSubmit);
            }

            await controlGetIds('condemned');
            console.log('hello');
            break;

            // CREATE USER
        case `/asset/forms/create_user`:
            model.state.page = 'create user'
            createUser.initialize();
            createUser.addHandlerExcelOption(controlExcel);
            createUser.addHandlerFileTemplate(controlExportExcel)
            createUser.addHandlerUploadFile()
            createUser.addHandlerFileLoaded(controlFileLoaded);
            createUser.addHandlerRemoveFile(controlRemoveFile);
            createUser.addHandlerNormalOption(controlNormal);
            createUser.addHandlerSubmit(controlSubmit);
            break;

        case `/asset/forms/remove_user`:
            if(ev === 'load') {
                model.state.page = 'remove user'
                removeUser.initialize(previewHandlers);

                removeUser.addHandlerExcelOption(controlExcel);
                removeUser.addHandlerFileTemplate(controlExportExcel)
                removeUser.addHandlerUploadFile();
                removeUser.addHandlerFileLoaded(controlFileLoaded)
                removeUser.addHandlerRemoveFile(controlRemoveFile);
                removeUser.addHandlerNormalOption(controlNormal);
                removeUser.addHandlerSubmit(controlSubmit)
            }
            controlGetIds('remove');
            break;
    }
}

init();