sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/odata/v2/ODataModel",
    
    
], function (Controller, MessageToast, Filter,FilterOperator,ODataModel) {
    "use strict";
    

    return Controller.extend("project1.controller.AdminAppliedLoans", {
        
        onInit: function() {
            this._selectedFile = null; 

        console.log("AdminAppliedLoans onInit called"); // Debug
        this._pageSize = 10;
        this._currentPage = 1;
        sap.ui.core.BusyIndicator.show(0);
        
        // Create and set a JSONModel for paged data with initial values
        this._pagedModel = new sap.ui.model.json.JSONModel({
            pagedCustomer: [],
            currentPage: 1,
            totalPages: 1,
            totalRecords: 0,
            isPreviousEnabled: false,
            isNextEnabled: false
        });
        this.getView().setModel(this._pagedModel, "pagedModel");
        
        var that = this;
        function tryLoad() {
            var oModel = that.getView().getModel("mainModel");
            if (oModel) {
                oModel.metadataLoaded().then(function() {
                    that._loadPage(that._currentPage);
                    sap.ui.core.BusyIndicator.hide();
                });
            } else {
                setTimeout(tryLoad, 200);
            }
        }
        tryLoad();
    },
       
        onViewDetails: function (oEvent) {
            sap.ui.core.BusyIndicator.show(0);
            var oRowContext = oEvent.getSource().getBindingContext("pagedModel");
            var oDialog = this.byId("customerDetailsDialog");
            oDialog.setBindingContext(oRowContext, "pagedModel");
            oDialog.open();
            sap.ui.core.BusyIndicator.hide();
        },

        onCloseDialog: function () {
            this.byId("customerDetailsDialog").close();
        },

        onApproveLoan: function () {
            sap.ui.core.BusyIndicator.show(0);
        
            var oDialog = this.byId("customerDetailsDialog");
            var oContext = oDialog.getBindingContext("pagedModel");
            var oModel = this.getView().getModel("mainModel");
            var oData = oContext.getObject();
            var that = this;
        
            oModel.callFunction("/approveLoan", {
                method: "POST", 
                urlParameters: { Id : oData.Id},
                success: function () {
                    sap.ui.core.BusyIndicator.hide(); 
                    oModel.refresh();
                    // Refresh the current page data
                    that._loadPage(that._currentPage);
                    MessageToast.show("Loan Approved");
                    oDialog.close();
                },
                error: function () {
                    sap.ui.core.BusyIndicator.hide(); 
                    MessageToast.show("Error Approving Loan");
                },
            });
        },
             

        onRejectLoan: function () {
            sap.ui.core.BusyIndicator.show(0);
        
            var oDialog = this.byId("customerDetailsDialog");
            var oContext = oDialog.getBindingContext("pagedModel");
            var oModel = this.getView().getModel("mainModel");
            var oData = oContext.getObject();
            var that = this;
        
            oModel.callFunction("/rejectLoan", {
                method: "POST", 
                urlParameters: { Id : oData.Id},
                success: function () {
                    sap.ui.core.BusyIndicator.hide(); 
                    oModel.refresh();
                    // Refresh the current page data
                    that._loadPage(that._currentPage);
                    MessageToast.show("Loan Rejected");
                    oDialog.close();
                },
                error: function () {
                    sap.ui.core.BusyIndicator.hide(); 
                    MessageToast.show("Error Rejecting Loan");
                },
            });
        },
        onLogout: function () {
            // Clear session storage
            sessionStorage.removeItem("loggedInUser");
            
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteView1");
            MessageToast.show("Logged out!");
        },
        onHome: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("dashboard");
            MessageToast.show("Returned Home");

        },
       
        onSearch: function (oEvent) 
        {
          // Note: With server-side pagination, search should ideally be handled by the server
          // For now, this applies client-side filtering to the current page data
          var sQuery = oEvent.getSource().getValue();
          var oTable = this.byId("loanList");
          var oBinding = oTable.getBinding("rows");
          
          if (sQuery) {
            var filterConditions = [
              new Filter("applicantName", FilterOperator.Contains, sQuery),
              new Filter("applicantEmail", FilterOperator.Contains, sQuery),
              new Filter("applicantPHno", FilterOperator.Contains, sQuery),
              new Filter("applicantAadhar", FilterOperator.Contains, sQuery)
            ];
            var combinedFilters = new Filter({
              filters: filterConditions,
              and: false
            });
            oBinding.filter(combinedFilters);
          } else {
            oBinding.filter([]);
          }
        },
      
        onReset: function(){
          // Reset filters and search
          var oTable = this.byId("loanList");
          var oBinding = oTable.getBinding("rows");
          oBinding.filter([]);
          oBinding.sort([]);
          this.getView().byId("querySearch").setValue("");
          this.getView().byId("statusComboBox").setSelectedKey("All");
          
          // Reload the first page to reset pagination
          this._currentPage = 1;
          this._loadPage(this._currentPage);
        },      
        
onSort: function () {
         var oTable = this.byId("loanList");
         var oBinding = oTable.getBinding("rows");    
     this._bSortAscending = !this._bSortAscending;
         var oSorter = new sap.ui.model.Sorter("applicantName", !this._bSortAscending);
         oBinding.sort(oSorter);
    },    
    onGroup: function () {
        var oTable = this.byId("loanList");
        var oBinding = oTable.getBinding("rows");
        // Group by loanStatus with a custom group header
        var oSorter = new sap.ui.model.Sorter("loanStatus", false, function (oContext) {
            var status = oContext.getProperty("loanStatus");
            return {
                key: status,
                text: "LOAN STATUS : " + status
            };
        });
    
        oBinding.sort(oSorter);
    },  
    onDefaultActionAccept: function () {
        sap.m.MessageToast.show("Default export action triggered.");
        // You can call your default export logic here, e.g., export to PDF
    },
    onBeforeMenuOpen: function (oEvent) {
        console.log("Menu is about to open.");
        // Optional: Modify menu items dynamically here
    },
    onExportAsPDF: async function () {
        try {
            const jsPDFLib = window.jspdf || window.jspdf?.default;
            if (!jsPDFLib || !jsPDFLib.jsPDF) {
                sap.m.MessageToast.show("jsPDF library not loaded.");
                return;
            }
            const { jsPDF } = jsPDFLib;
   
            const oModel = this.getView().getModel("mainModel");
   
            oModel.read("/customer", {
                success: function (oData) {
                    const aResults = oData.results;
                    if (!aResults.length) {
                        sap.m.MessageToast.show("No customer data found.");
                        return;
                    }
   
                    const doc = new jsPDF();
                    doc.setFontSize(14);
                    doc.text("Customer Loan Details", 20, 20);
   
                    let y = 30;
                    let index = 1;
   
                    aResults.forEach((oData) => {
                        doc.setFontSize(12);
                        doc.text(`CUSTOMER ${index++}`, 20, y);
                        y += 10;
   
                        doc.setFontSize(10);
                        doc.text("ID: " + oData.Id, 20, y);
                        doc.text("Name: " + oData.applicantName, 20, y += 10);
                        doc.text("Email: " + oData.applicantEmail, 20, y += 10);
                        doc.text("Mobile: " + oData.applicantPHno, 20, y += 10);
                        doc.text("Aadhar No.: " + oData.applicantAadhar, 20, y += 10);
                        doc.text("PAN No.: " + oData.applicantPAN, 20, y += 10);
                        doc.text("Salary: " + oData.applicantSalary, 20, y += 10);
                        doc.text("Tenure: " + oData.loanRepaymentMonths + " Months", 20, y += 10);
                        doc.text("Principal: " + oData.loanAmount, 20, y += 10);
                        doc.text("Loan Status: " + oData.loanStatus, 20, y += 10);
                        doc.text("Address: " + oData.applicantAddress, 20, y += 10);
   
                        y += 20;
   
                        if (y > 270) {
                            doc.addPage();
                            y = 20;
                        }
                    });
   
                    doc.save("AllCustomerLoanDetails.pdf");
                },
                error: function (oError) {
                    console.error("Error fetching customer data:", oError);
                    sap.m.MessageToast.show("Failed to export customer data.");
                }
            });
        } catch (err) {
            console.error("Unexpected error:", err);
            sap.m.MessageToast.show("Failed to export customer data.");
        }
    },
   
    onExportToExcel: function () {
        try {
            const oModel = this.getView().getModel("mainModel");
   
            oModel.read("/customer", {
                success: function (oData) {
                    const aResults = oData.results;
                    if (!aResults.length) {
                        sap.m.MessageToast.show("No customer data found.");
                        return;
                    }
   
                    const worksheetData = [[
                        "ID", "Name", "Email", "Mobile", "Aadhar No.", "PAN No.",
                        "Salary", "Tenure", "Principal", "Loan Status", "Address"
                    ]];
   
                    aResults.forEach((oData) => {
                        worksheetData.push([
                            oData.Id,
                            oData.applicantName,
                            oData.applicantEmail,
                            oData.applicantPHno,
                            oData.applicantAadhar,
                            oData.applicantPAN,
                            oData.applicantSalary,
                            oData.loanRepaymentMonths,
                            oData.loanAmount,
                            oData.loanStatus,
                            oData.applicantAddress
                        ]);
                    });
   
                    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
                    const workbook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(workbook, worksheet, "Loan Details");
   
                    XLSX.writeFile(workbook, "CustomerLoanDetails.xlsx");
                },
                error: function (oError) {
                    console.error("Error exporting Excel:", oError);
                    sap.m.MessageToast.show("Failed to export Excel file.");
                }
            });
        } catch (err) {
            console.error("Unexpected error:", err);
            sap.m.MessageToast.show("Failed to export Excel file.");
        }
    },
    onMenuAction: function (oEvent) {
        var selectedItem = oEvent.getParameter("item");
        if (!selectedItem) return;
    
        var selectedText = selectedItem.getText();
    
        switch (selectedText) {
            case "Export as PDF":
                this.onExportAsPDF();
                break;
            case "Export to Excel":
                this.onExportToExcel();
                break;
            default:
                sap.m.MessageToast.show("Unknown export option selected.");
        }
    },        
    onAfterRendering: function () {
        var oComboBox = this.byId("statusComboBox");
        oComboBox.setSelectedKey("Pending");
    
        // Manually trigger the change handler to apply the filter
        this.onStatusChange({ getSource: () => oComboBox });
    }
,    
    onStatusChange: function (oEvent) {
        var sSelectedKey = oEvent.getSource().getSelectedKey();
        var oTable = this.byId("loanList"); // Make sure this ID matches your XML
        var oBinding = oTable.getBinding("rows"); // Use "rows" for sap.ui.table.Table
        var aFilters = [];
    
        if (sSelectedKey !== "All") {
            aFilters.push(new sap.ui.model.Filter("loanStatus", sap.ui.model.FilterOperator.EQ, sSelectedKey));
        }
    
        if (oBinding) {
            oBinding.filter(aFilters);
        } else {
            console.warn("Table binding not ready yet.");
        }
    }    
,                
                   
isPending: function (status) {
         return status === "Pending";
    },

    _loadPage: function(page) {
        console.log("_loadPage called with page:", page); // Debug
        this._currentPage = page;
        var oModel = this.getView().getModel("mainModel");
        var that = this;
        oModel.callFunction("/getPagedCustomers", {
            method: "GET",
            urlParameters: {
                page: page,
                pageSize: this._pageSize
            },
            success: function(oData) {
                console.log("Data loaded for page:>>>>", page, oData); // Debug
                
                // Handle the response structure - check if it's nested under getPagedCustomers
                const res = oData.getPagedCustomers || oData;
                const results = res.results || res || [];
                const totalCount = res.totalCount || (results.length > 0 ? results.length : 0);
                
                that._pagedModel.setProperty("/pagedCustomer", results);
                var totalRecords = totalCount;
                var totalPages = totalRecords > 0 ? Math.ceil(totalRecords / that._pageSize) : 1;
                
                console.log("Total Records:", totalRecords, "Total Pages:", totalPages); // Debug
                that._pagedModel.setProperty("/currentPage", page);
                that._pagedModel.setProperty("/totalPages", totalPages);
                that._pagedModel.setProperty("/totalRecords", totalRecords);
                that._pagedModel.setProperty("/isPreviousEnabled", page > 1);
                that._pagedModel.setProperty("/isNextEnabled", page < totalPages);
            },
            error: function() {
                sap.m.MessageToast.show("Failed to load data for page " + page);
            }
        });
    },

    onPreviousPage: function() {
        if (this._currentPage > 1) {
            this._currentPage--;
            this._loadPage(this._currentPage);
        }
    },

    onNextPage: function() {
        var totalPages = this._pagedModel.getProperty("/totalPages");
        if (this._currentPage < totalPages) {
            this._currentPage++;
            this._loadPage(this._currentPage);
        }
    },

    onFirstPage: function() {
        this._currentPage = 1;
        this._loadPage(this._currentPage);
    },

    onLastPage: function() {
        var totalPages = this._pagedModel.getProperty("/totalPages");
        this._currentPage = totalPages;
        this._loadPage(this._currentPage);
    },
    //importing Excel data
    
    onFileSelected: function (oEvent) {
         this._selectedFile = oEvent.getParameter("files")[0];
        },
    
    onUploadExcel: function (oEvent) {
        
        if (!this._selectedFile) {
             MessageToast.show("Please select a file first.");
             return;
             }
    
        const file = this._selectedFile;
        const reader = new FileReader();
    
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet);
    
            // Send to backend
            //this._sendDataToCAPM(jsonData);
            console.log("jsonData",jsonData);//
        };
    
        reader.readAsArrayBuffer(file);
    }
    
                       
    });
})