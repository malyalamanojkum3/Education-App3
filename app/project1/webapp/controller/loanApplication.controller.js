sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], (Controller, MessageBox,MessageToast, JSONModel) => {
    "use strict";

    return Controller.extend("project1.controller.loanApplication", {
      
    onAfterRendering: function () {
      const aInputs = [
          "enterApplicantName",
          "enterApplicantAddress",
          "enterApplicantMobileNo",
          "enterEmailId",
          "enterAadhaarNo",
          "enterPanNo",
          "enterSalary",
          "enterloanamount",
          "enterloanrepaymentmonths"
      ];
  
      aInputs.forEach((sId, index) => {
          const oInput = this.byId(sId);
          if (oInput) {
              oInput.attachBrowserEvent("keydown", (oEvent) => {
                  if (oEvent.key === "Enter") {
                      oEvent.preventDefault();
                      const nextInputId = aInputs[index + 1];
                      if (nextInputId) {
                          const oNextInput = this.byId(nextInputId);
                          if (oNextInput) {
                              oNextInput.focus();
                          }
                      }
                  }
              });
          }
      });
  },  
  
        onSubmit() {
          sap.ui.core.BusyIndicator.show(0);
          //capturing the data in var
          var ApplicantName = this.getView().byId("enterApplicantName").getValue();
          var ApplicantAddress = this.getView().byId("enterApplicantAddress").getValue();
          var ApplicantMobileNo = this.getView().byId("enterApplicantMobileNo").getValue();
          var ApplicantEmailId = this.getView().byId("enterEmailId").getValue();
          var ApplicantAadhaarNo = this.getView().byId("enterAadhaarNo").getValue();
          var ApplicantPANNo = this.getView().byId("enterPanNo").getValue();
          var ApplicantSalary = this.getView().byId("enterSalary").getValue();
          var ApplicantLoanAmount = this.getView().byId("enterloanamount").getValue();
          var ApplicantRepaymentMonths = this.getView().byId("enterloanrepaymentmonths").getValue();

          //validation formats
          var nameFormat = /^[a-zA-Z\s]+$/;
          var mobileFormat = /^[0-9]{10}$/;
          var emailFormat =  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          var aadhaarFormat = /^[0-9]{12}$/;
          var panFormat = /[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
          var salaryFormat = /^[0-9]*$/;
          var loanamtFormat = /^[0-9]*$/;
          var repayFormat = /^[0-9]{1,2}$/;

          //checking for wrong format
          let formatErrors = [];
          if(!ApplicantName.match(nameFormat)) formatErrors.push("Applicant name (only alphabets are allowed)");
          if(!ApplicantMobileNo.match(mobileFormat)) formatErrors.push("Applicant Mobile No (Must be 10 digits");
          if(!ApplicantEmailId.match(emailFormat)) formatErrors.push("Applicant Email Id (Invalid email format)");
          if(!ApplicantAadhaarNo.match(aadhaarFormat)) formatErrors.push("Applicant Aadhaar No (Must be 12 digits)");
          if(!ApplicantPANNo.match(panFormat)) formatErrors.push("Applicant PAN No (Invalid Pan No format)");
          if(!ApplicantSalary.match(salaryFormat)) formatErrors.push("Applicant Salary (only numbers allowed)");
          if(!ApplicantLoanAmount.match(loanamtFormat)) formatErrors.push("Applicant LoanAmount (only Numbers are allowed)");
          if(!ApplicantRepaymentMonths.match(repayFormat)) formatErrors.push("Applicant Repaymonths (upto 2 digits)");

          if(formatErrors.length > 0){
            sap.m.MessageBox.error("Please correct the following fields:\n" + formatErrors.join("\n"),{
              onClose: () => {
                sap.ui.core.BusyIndicator.hide(0);
              }
            });
            return;
          }

          //missing fields
          let missingFields = [];
          if(!ApplicantName) missingFields.push("Applicant Name");
          if(!ApplicantAddress) missingFields.push("Applicant Address");
          if(!ApplicantMobileNo) missingFields.push("Applicant Moblie No");
          if(!ApplicantAadhaarNo) missingFields.push("Applicant Aadhaar No");
          if(!ApplicantEmailId) missingFields.push("Applicant Email Id");
          if(!ApplicantPANNo) missingFields.push("PAN No");
          if(!ApplicantSalary) missingFields.push("Applicant Salary");
          if(!ApplicantLoanAmount) missingFields.push("Loan Amount");
          if(!ApplicantRepaymentMonths) missingFields.push("Loan Repayment Months");

          if(missingFields.length>0){
            sap.m.MessageBox.error("Please fill the required fields:\n" + missingFields.join("\n") ,{
              onClose: () => {
                sap.ui.core.BusyIndicator.hide(0);
              }
            });
            return;
            
          }
          //creating new object
          var NewUser = {
            applicantName: ApplicantName,
            applicantAddress: ApplicantAddress,
            applicantPHno: ApplicantMobileNo,
            applicantEmail: ApplicantEmailId,
            applicantAadhar: ApplicantAadhaarNo,
            applicantPAN: ApplicantPANNo,
            applicantSalary: ApplicantSalary,
            loanAmount: ApplicantLoanAmount,
            loanRepaymentMonths: ApplicantRepaymentMonths,
            documentUrl: this.documentUrl 
          };
          //posting data
          var oModel=this.getView().getModel("mainModel");
          oModel.callFunction("/submitLoanApplication",{
            method: "POST",
            urlParameters: NewUser,
            success: (data) => {
              sap.ui.core.BusyIndicator.hide(0);
              MessageBox.success("You have applied for loan successfully\nYour loan id:"+ data.submitLoanApplication.Id, {
                onClose: () => {
                  this.byId("enterApplicantName").setValue("");
                  this.byId("enterApplicantAddress").setValue("");
                  this.byId("enterApplicantMobileNo").setValue("");
                  this.byId("enterEmailId").setValue("");
                  this.byId("enterAadhaarNo").setValue("");
                  this.byId("enterPanNo").setValue("");
                  this.byId("enterSalary").setValue("");
                  this.byId("enterloanamount").setValue("");
                  this.byId("enterloanrepaymentmonths").setValue("");
                  //navigate
                  var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                  oRouter.navTo("dashboard");
                  }
                  });
                  },
            error: (error) => {
              MessageToast.show("Error submitting: " + error.responseText);
            }
          });
        },

        onCancel() {
            sap.m.MessageToast.show("Loan application cancelled"); 
        },
        
        onChooseFile: function () {
            var oFileUploader = document.createElement('input');
            oFileUploader.type = 'file';
            oFileUploader.onchange = function (event) {
              var file = event.target.files[0];
              this._file = file; 
              var oFilePathInput = this.byId("filePath");
              oFilePathInput.setValue(file.name);

            }.bind(this);
            oFileUploader.click();
            

                },
                onUpload: function () {
                  var file = this._file;
                  if (!file) {
                    sap.m.MessageToast.show("Please choose a file first.");
                    return;
                  }
                
                  var filename = file.name;
                  var filesize = file.size;
                  var extension = filename.substr(filename.lastIndexOf('.') + 1).toLowerCase();
                
                  if (!["pdf", "jpeg", "png", "jpg"].includes(extension)) {
                    sap.m.MessageToast.show("Kindly upload only JPG, JPEG, PDF, and PNG files");
                    return;
                  } else if (filesize > 2000000) {
                    sap.m.MessageToast.show("File size should not be more than 2MB.");
                    return;
                  }
                
                  var reader = new FileReader();
                  reader.onload = function (e) {
                    var fileupArray = new Uint8Array(e.target.result);
                
                    // Compress the file data using pako
                    var compressedData = pako.deflate(fileupArray);
                
                    // Convert compressed data to a binary string
                    var binaryString = Array.from(compressedData, byte => String.fromCharCode(byte)).join('');
                
                    // Convert binary string to Base64
                    var base64Stringfile = btoa(binaryString);
                    this.filebase64String = base64Stringfile;
                
                    // Call CAP function to upload the document
                    var oModel = this.getView().getModel("mainModel"); // default model
                    
if (!oModel) {
    sap.m.MessageBox.error("OData model 'mainModel' not found.");
    return;
  }  
                    oModel.callFunction("/uploadDocument", {
                      method: "POST",
                      urlParameters: {
                        fileName: file.name,
                        fileContent: this.filebase64String
                      },
                      success: function (data) {
                        this.documentUrl = data.fileUrl; // Save the returned file URL
                        sap.m.MessageToast.show("File uploaded successfully.");
                      }.bind(this),
                      error: function (err) {
                        console.error("Upload failed", err);
                        sap.m.MessageBox.error("File upload failed. Please try again.");
                      }
                    });
                
                  }.bind(this);
                
                  reader.readAsArrayBuffer(file);
                }
, 
                
        onClear: function(){
            this.byId("enterApplicantName").setValue("");
            this.byId("enterApplicantAddress").setValue("");
            this.byId("enterApplicantMobileNo").setValue("");
            this.byId("enterEmailId").setValue("");
            this.byId("enterAadhaarNo").setValue("");
            this.byId("enterPanNo").setValue("");
            this.byId("enterSalary").setValue("");
            this.byId("enterloanamount").setValue("");
            this.byId("enterloanrepaymentmonths").setValue("");
            this.byId("selectDocumentType").setSelectedKey(null);
        },
        nameValidation: function(oEvent) {
            var fieldValue = oEvent.getSource().getValue();
            var fieldName = oEvent.getSource();
            var format = (/^[a-zA-Z\s]+$/);
            var blen = fieldValue.length;
          
            if (blen == 50) {
              fieldName.setValueState(sap.ui.core.ValueState.Error);
              fieldName.setValueStateText("More Than 50 Characters Not Accepted");
            } else if (!fieldValue.match(format)) {
              fieldName.setValueState(sap.ui.core.ValueState.Error);
              fieldName.setValueStateText("Only Alphabets can Accepted");
            } else {
              fieldName.setValueState(sap.ui.core.ValueState.None);
            }
          },
          numValidation: function(oEvent) {
            var fieldValue = oEvent.getSource().getValue();
            var fieldName = oEvent.getSource();
            var format = (/^[0-9]{10}$/);
            var blen = fieldValue.length;
          
            if (blen !== 10) {
              fieldName.setValueState(sap.ui.core.ValueState.Error);
              fieldName.setValueStateText("Mobile number must be 10 digits");
            } else if (!fieldValue.match(format)) {
              fieldName.setValueState(sap.ui.core.ValueState.Error);
              fieldName.setValueStateText("Only Numbers can Accepted");
            } else {
              fieldName.setValueState(sap.ui.core.ValueState.None);
            }
          },
          emailValidation: function(oEvent) {
            var validTLDs = ["com", "org", "net", "edu", "gov", "in", "co", "io", "ai", "info", "biz", "me"]; // extend as needed
 
            var fieldValue = oEvent.getSource().getValue().trim();
            var fieldName = oEvent.getSource();
            var format = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; ///^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 
            var domainParts = fieldValue.split(".");
            var tld = domainParts.length > 1 ? domainParts[domainParts.length - 1].toLowerCase() : "";
 
            if (!format.test(fieldValue) || !validTLDs.includes(tld)) {
            //if (!fieldValue.match(format)) {
              fieldName.setValueState(sap.ui.core.ValueState.Error);
              fieldName.setValueStateText("Invalid email address");
             
            } else {
              fieldName.setValueState(sap.ui.core.ValueState.None);
            }
          },
          aadhaarValidation: function(oEvent) {
            var fieldValue = oEvent.getSource().getValue();
            var fieldName = oEvent.getSource();
            var format = (/^[0-9]{12}$/);
            var blen = fieldValue.length;
          
            if (blen !== 12) {
              fieldName.setValueState(sap.ui.core.ValueState.Error);
              fieldName.setValueStateText("Aadhaar number must be 12 digits");
            } else if (!fieldValue.match(format)) {
              fieldName.setValueState(sap.ui.core.ValueState.Error);
              fieldName.setValueStateText("Only Numbers can Accepted");
            } else {
              fieldName.setValueState(sap.ui.core.ValueState.None);
            }

          },
          panValidation: function(oEvent) {
            var fieldValue = oEvent.getSource().getValue().toUpperCase(); // Convert to uppercase
            oEvent.getSource().setValue(fieldValue); // Update the input field with uppercase value
            
  
  
            var fieldValue = oEvent.getSource().getValue();
            var fieldName = oEvent.getSource();
            var format = /[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
            var blen = fieldValue.length;
          
            if (blen !== 10) {
              fieldName.setValueState(sap.ui.core.ValueState.Error);
              fieldName.setValueStateText("Pan number must be 10 digits");
            } else if (!fieldValue.match(format)) {
              fieldName.setValueState(sap.ui.core.ValueState.Error);
              fieldName.setValueStateText("Invalid Pan number");
            } else {
              fieldName.setValueState(sap.ui.core.ValueState.None);
            }
          },
          repayValidation: function(oEvent) {
            var fieldValue = oEvent.getSource().getValue();
            var fieldName = oEvent.getSource();
            var format = (/^[0-9]{1,2}$/);
            var blen = fieldValue.length;
          
            if (blen === 0 || blen > 2) {
              fieldName.setValueState(sap.ui.core.ValueState.Error);
              fieldName.setValueStateText("Repayment months allowed upto 2 digits");
            } else if (!fieldValue.match(format)) {
              fieldName.setValueState(sap.ui.core.ValueState.Error);
              fieldName.setValueStateText("Only Numbers can Accepted");
            } else {
              fieldName.setValueState(sap.ui.core.ValueState.None);
            }
          },
          salaryValidation: function (oEvent) {
            var fieldValue = oEvent.getSource().getValue();
            var fieldName = oEvent.getSource();
            var format = (/^[0-9]*$/);
            var blen = fieldValue.length;

            if(blen === 0) {
              fieldName.setValueState(sap.ui.core.ValueState.Error);
              fieldName.setValueStateText("Salary cannot be empty");
            } else if (!fieldValue.match(format)) {
              fieldName.setValueState(sap.ui.core.ValueState.Error);
              fieldName.setValueStateText("Only Numbers can Accepted");
            } else {
              fieldName.setValueState(sap.ui.core.ValueState.None);
            }
          },
          loanamountValidation: function (oEvent) {
            var fieldValue = oEvent.getSource().getValue();
            var fieldName = oEvent.getSource();
            var format = (/^[0-9]*$/);
            var blen = fieldValue.length;

            if(blen === 0) {
              fieldName.setValueState(sap.ui.core.ValueState.Error);
              fieldName.setValueStateText("Loan Amount cannot be empty");
            } else if (!fieldValue.match(format)) {
              fieldName.setValueState(sap.ui.core.ValueState.Error);
              fieldName.setValueStateText("Only Numbers can Accepted");
            } else {
              fieldName.setValueState(sap.ui.core.ValueState.None);
            }
          },
          onLogout: function () {
        
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteView1");
            MessageToast.show("Logged out!");
          },
          onHome: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("dashboard");
            MessageToast.show("Returned Home");
          }

    });
});