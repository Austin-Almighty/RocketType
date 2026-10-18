/* eslint-disable @typescript-eslint/no-require-imports */
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const { onCall } = require('firebase-functions/v2/https');
const { onUserDeleted } = require('firebase-functions/v2/identity');
const { createService } = require('./service');
initializeApp();
const service = createService({ db: getFirestore(), auth: getAuth(), Timestamp });
const options = { region: 'us-central1', maxInstances: 5, minInstances: 0, timeoutSeconds: 120 };
exports.createTest = onCall(options, service.createTest);
exports.beginTest = onCall(options, service.beginTest);
exports.submitResult = onCall(options, service.submitResult);
exports.importLegacyResult = onCall(options, service.importLegacyResult);
exports.resetResults = onCall({ ...options, timeoutSeconds: 540 }, service.resetResults);
exports.deleteAccountData = onUserDeleted({ region: options.region, maxInstances: 2, retry: true, timeoutSeconds: 540 }, (event) => service.deleteAccountData(event.data.uid));
