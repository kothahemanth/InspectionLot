const cds = require('@sap/cds');
const { create } = require('xmlbuilder2');
const axios = require('axios');

module.exports = cds.service.impl(async function () {
    const inspectionapi = await cds.connect.to('API_INSPECTIONLOT_SRV');

    this.on('READ', 'InspectionLot', async (req) => {
        return await inspectionapi.run(req.query);
    });

    this.on('READ', 'InspectionCharacteristic', async (req) => {
        return await inspectionapi.run(req.query);
    });

    this.on('READ', 'InspectionOperation', async (req) => {
        return await inspectionapi.run(req.query);
    });

    this.on('READ', 'InspectionResult', async (req) => {
        return await inspectionapi.run(req.query);
    });

    this.on('READ', 'InspectionResultValue', async (req) => {
        return await inspectionapi.run(req.query);
    });

    const { Label } = this.entities;
    
    this.on('printForm', 'InspectionLot', async (req) => {
        const { InspectionLot, InspectionCharacteristic, InspectionOperation, InspectionResult, InspectionResultValue } = this.entities;

        const inspectionLotId = req.data.InspectionLot;
        
        const inspectionLotData = await inspectionapi.run(SELECT.from(InspectionLot).where({ InspectionLot: inspectionLotId }));
        const inspectionCharData = await inspectionapi.run(SELECT.from(InspectionCharacteristic).where({ InspectionLot: inspectionLotId }));
        const inspectionOpData = await inspectionapi.run(SELECT.from(InspectionOperation).where({ InspectionLot: inspectionLotId }));
        const inspectionResData = await inspectionapi.run(SELECT.from(InspectionResult).where({ InspectionLot: inspectionLotId }));
        const inspectionResValueData = await inspectionapi.run(SELECT.from(InspectionResultValue).where({ InspectionLot: inspectionLotId }));

        const structuredData = {
            InspectionLotNode: {
                ...inspectionLotData[0],
                InspectionCharacteristics: inspectionCharData.map(item => ({
                    ...item,
                    InspectionOperations: inspectionOpData.filter(op => op.InspPlanOperationInternalID === item.InspPlanOperationInternalID),
                    InspectionResults: inspectionResData.filter(res => res.InspPlanOperationInternalID === item.InspPlanOperationInternalID),
                    InspectionResultValues: inspectionResValueData.filter(val => val.InspPlanOperationInternalID === item.InspPlanOperationInternalID)
                }))
            }
        };

        function ensureEmptyTags(obj) {
            if (Array.isArray(obj)) {
                return obj.length === 0 ? {} : obj.map(ensureEmptyTags);
            } else if (typeof obj === 'object' && obj !== null) {
                return Object.fromEntries(
                    Object.entries(obj).map(([key, value]) => [key, ensureEmptyTags(value)])
                );
            }
            return obj;
        }

        const labelName = req.data.labelname;
        const updatedJsonData = ensureEmptyTags(structuredData);
        const xml = create(updatedJsonData).end({ prettyPrint: true });
        console.log("Generated XML:", xml);

        const base64Xml = Buffer.from(xml).toString('base64');

        try {
            const authResponse = await axios.get('https://chembonddev.authentication.us10.hana.ondemand.com/oauth/token', {
                params: { grant_type: 'client_credentials' },
                auth: {
                    username: 'sb-ffaa3ab1-4f00-428b-be0a-1ec55011116b!b142994|ads-xsappname!b65488',
                    password: 'e44adb92-4284-4c5f-8d41-66f8c1125bc5$F4bN1ypCgWzc8CsnjwOfT157HCu5WL0JVwHuiuwHcSc='
                }
            });
            const accessToken = authResponse.data.access_token;

            const pdfResponse = await axios.post('https://adsrestapi-formsprocessing.cfapps.us10.hana.ondemand.com/v1/adsRender/pdf?templateSource=storageName', {
                xdpTemplate: labelName,
                xmlData: base64Xml,
                formType: "print",
                formLocale: "",
                taggedPdf: 1,
                embedFont: 0
            }, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            const fileContent = pdfResponse.data.fileContent;
            return fileContent;

        } catch (error) {
            console.error("Error occurred:", error);
            return req.error(500, "An error occurred while processing your request.");
        }
    });

    this.on('READ', Label, async (req) => {
        const labels = [
            { "Label": "hemanth/Default" },
            { "Label": "sumanth/Default" },
            { "Label": "annapurna/Default" },
        ];
        labels.$count = labels.length;
        return labels;
    });
});
