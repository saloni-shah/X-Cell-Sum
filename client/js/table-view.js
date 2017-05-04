const { getLetterRange } = require('./array-util');
const { createTR, createTH, createTD, removeChildren } = require('./dom-util');
class TableView{
  constructor(model){
    this.model = model;
  }
  init(){
    this.initDomReferences();
    this.initCurrentCell();
    this.renderTable();
    this.attachEventHandlers();
  }
  initDomReferences(){
    this.headerRowEl = document.querySelector('THEAD TR');
    this.sheetbodyEl = document.querySelector('TBODY');
    this.formulabarEl = document.querySelector('#formulabar');
    this.row = document.querySelector('#row');
    this.column = document.querySelector('#column');
  }
  initCurrentCell(){
    this.currentCellLocation = {col: 0, row: 0};
    this.renderFormulaBar();
  }
  normalizeValueForRendering(value){
    return value || '';
  }
  renderFormulaBar(){
    const currentCellValue = this.model.getValue(this.currentCellLocation);
    this.formulabarEl.value = this.normalizeValueForRendering(currentCellValue);
    this.formulabarEl.focus();
  }
  renderTable(){
    this.renderTableHeader();
    this.renderTableBody();
  }
  renderTableHeader(){
    removeChildren(this.headerRowEl);
    this.headerRowEl.appendChild(createTH());
    getLetterRange('A',this.model.numCols)
    .map(colLabel => createTH(colLabel))
    .forEach(th => this.headerRowEl.appendChild(th));
  }
  isCurrentCell(col,row){
    return this.currentCellLocation.col === col 
    && this.currentCellLocation.row === row;
  }
  renderTableBody(){
    const fragment = document.createDocumentFragment();
    for(let row = 0; row < this.model.numRows; row++){
      const tr = createTR();
      tr.appendChild(createTH(row+1));
      for(let col = 0; col < this.model.numCols; col++){
        const position = {col: col, row: row};
        const value = this.model.getValue(position);
        const td = createTD(value);
        if(this.isCurrentCell(col,row) && !this.checkLastRow(row)){
          td.className = 'current-cell';
        }

        tr.appendChild(td);
      }
      fragment.appendChild(tr);
      if (this.checkLastRow(row)){
        tr.className = 'last-row';
      }
    }
    removeChildren(this.sheetbodyEl);
    this.sheetbodyEl.appendChild(fragment);
  }
  checkLastRow(row){
    return row + 1 === this.model.numRows;
  }
  attachEventHandlers(){
    this.sheetbodyEl.addEventListener('click',this.handleSheetClick.bind(this));
    this.formulabarEl.addEventListener('keyup',this.handleFormulaBarChange.bind(this));
    this.row.addEventListener('click',this.addRow.bind(this));
    this.column.addEventListener('click',this.addColumn.bind(this));
    this.headerRowEl.addEventListener('click',this.highlightColumn.bind(this));
  }
  isColumnHeaderRow(row){
    return row < 1;
  }
  isRowHeaderColumn(col){
    return col < 1;
  }
  addRow(){
    this.model.numRows++;
    this.renderTableBody();
  }
  addColumn(){
    this.model.numCols++;
    this.renderTable();
  }
  highlightColumn(e){
    let colTarget = e.target.cellIndex;
    let rowTarget = e.target.parentElement.rowIndex;
    const fragment = document.createDocumentFragment();
    for(let row = 0; row < this.model.numRows; row++){
      const tr = createTR();
      tr.appendChild(createTH(row + 1));
      if(!this.checkLastRow(row)){
        this.currentCellLocation = {col: colTarget-1, row: row};
      }
      for(let col = 0; col < this.model.numCols; col++){
        const position = {col: col, row: row};
        const value = this.model.getValue(position);
        const td = createTD(value);
        if(this.isCurrentCell(col,row) && !this.checkLastRow(row)){
          td.className = 'highlighted';
        }

        tr.appendChild(td);
      }
      fragment.appendChild(tr);
      if (this.checkLastRow(row)){
        tr.className = 'last-row';
      }
    }
    removeChildren(this.sheetbodyEl);
    this.sheetbodyEl.appendChild(fragment);
  }
  highlightRow(colTarget,rowTarget){
    let colTargetVal = colTarget;
    let rowTargetVal = rowTarget;
    const fragment = document.createDocumentFragment();
    for(let row = 0; row < this.model.numRows; row++){
      const tr = createTR();
      tr.appendChild(createTH(row + 1));
      for(let col = 0; col < this.model.numCols; col++){
        this.currentCellLocation = {col: col, row: rowTargetVal-1};
        const position = {col: col, row: row};
        const value = this.model.getValue(position);
        const td = createTD(value);
        if(this.isCurrentCell(col,row) && !this.checkLastRow(row)){
          td.className = 'highlighted';
        }

        tr.appendChild(td);
      }
      fragment.appendChild(tr);
      if (this.checkLastRow(row)){
        tr.className = 'last-row';
      }
    }
    removeChildren(this.sheetbodyEl);
    this.sheetbodyEl.appendChild(fragment);
  }
  handleFormulaBarChange(e){
    const value = this.formulabarEl.value;
    this.model.setValue(this.currentCellLocation,value);
    this.findSum(this.currentCellLocation);
    this.renderTableBody();
  }
  findSum(currentCellLocation){
    let value;
    let sum = 0;
    for(let row = 0; row < this.model.numRows-1; row++){
      const position = {col: currentCellLocation.col, row: row};
      value = this.model.getValue(position);
      if(!Number.isNaN(parseInt(value))){
        sum += parseInt(value);
      }
    }
    const sumLocation = {col: currentCellLocation.col, row: this.model.numRows-1};
    this.model.setValue(sumLocation,sum);
  }
  handleSheetClick(e){
    let col = e.target.cellIndex;
    let row = e.target.parentElement.rowIndex;
    if(e.target.nodeName=='TD'){
      if(!this.isColumnHeaderRow(row) || !this.isRowHeaderColumn(col)){
        row = row-1; col = col-1;
        this.currentCellLocation = {col: col, row: row};
        this.renderTableBody();
      }
      this.renderFormulaBar();
    } else {
      this.highlightRow(col,row);
    }
  }
}
module.exports = TableView;
