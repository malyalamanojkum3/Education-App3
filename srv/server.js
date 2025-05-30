const cds = require("@sap/cds");
const cov2ap = require("@cap-js-community/odata-v2-adapter");
//cds.on("bootstrap", (app) => app.use(cov2ap()));
const express = require('express');
const bodyParser = require('body-parser');
cds.on("bootstrap", (app) => {
    app.use(cov2ap());
    // Set the limit to 1GB or adjust as needed
    app.use(express.json({ limit: '1gb' }));
    app.use(express.urlencoded({ limit: '1gb', extended: true }));
  });

module.exports = cds.server;