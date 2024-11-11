sap.ui.define([
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/ui/core/HTML"
], function(MessageToast, JSONModel, Dialog, Button, HTML) {
    'use strict';

    return {
        printForm: function(oBindingContext, aSelectedContexts) {
            console.log(aSelectedContexts);
            let mParameters = {
                contexts: aSelectedContexts[0],
                label: 'Confirm',
                invocationGrouping: true    
            };
            this.editFlow.invokeAction('InspectionService.printForm', mParameters)
                .then(function(result) {
                    let base64XML = result.getObject().value;  
                    console.log(base64XML);
                    const xmlData = atob(base64XML);  // Decode the base64 XML data

                    // Display the XML in the dialog
                    const oHtml = new HTML({
                        content: `<pre style="white-space: pre-wrap; word-wrap: break-word;">${xmlData}</pre>`
                    });

                    let oDialog = new Dialog({
                        title: 'Generated XML',
                        contentWidth: "600px",
                        contentHeight: "500px",
                        verticalScrolling: true,
                        content: oHtml,
                        buttons: [
                            new Button({
                                text: 'Download',
                                press: function () {
                                    const link = document.createElement('a');
                                    const blob = new Blob([xmlData], { type: 'application/xml' });
                                    const url = URL.createObjectURL(blob);
                                    link.href = url;
                                    link.download = 'generated_xml.xml'; 
                                    link.click();  
                                }
                            }),
                            new Button({
                                text: 'Close',
                                press: function () {
                                    oDialog.close();
                                }
                            })
                        ],
                        afterClose: function() {
                            oDialog.destroy();
                        }
                    });

                    oDialog.open();
                    
                })
        }
    };
});
