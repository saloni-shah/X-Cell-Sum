const TableModel = require('./table-model');
const TableView = require('./table-view');

const model = new TableModel();
const tableview = new TableView(model);
tableview.init();