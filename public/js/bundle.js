(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const TableModel = require('./table-model');
const TableView = require('./table-view');

const model = new TableModel();
const tableview = new TableView(model);
tableview.init();
},{"./table-model":4,"./table-view":5}],2:[function(require,module,exports){
const getRange = function(fromNum, toNum){
	return Array.from({length: toNum-fromNum+1}, (unused,i) => i+fromNum);
};
const getLetterRange = function(firstLetter='A', numLetters=4){
	const rangeStart = firstLetter.charCodeAt(0);
	const rangeEnd = rangeStart + numLetters - 1;
	return getRange(rangeStart,rangeEnd)
		.map(charCode => String.fromCharCode(charCode));
};
module.exports = {
	getRange : getRange,
	getLetterRange : getLetterRange
};
},{}],3:[function(require,module,exports){
const removeChildren = function(parentEl){
	while(parentEl.firstChild){
		parentEl.removeChild(parentEl.firstChild);
	}
};
const createEl = function(tagName){
	return function(text){
		const el = document.createElement(tagName);
		if(text){
			el.textContent = text;
		}
		return el;
	};
};

const createTR = createEl('TR');
const createTH = createEl('TH');
const createTD = createEl('TD');

module.exports = {
	createTR: createTR,
	createTH: createTH,
	createTD: createTD,
	removeChildren: removeChildren
};
},{}],4:[function(require,module,exports){
class TableModel{
	constructor(numCols=5,numRows=7){
		this.numCols = numCols;
		this.numRows = numRows;
		this.data = {};
	}
	_getCellId(location){
		return `${location.col}:${location.row}`;
	}
	getValue(location){
		return this.data[this._getCellId(location)];
	}
	setValue(location,value){
		this.data[this._getCellId(location)] = value;
	}
}
module.exports = TableModel;
},{}],5:[function(require,module,exports){
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
		//this.RowHeaderEl = document.querySelector('TBODY TR TH');
	}
	initCurrentCell(){
		this.currentCellLocation = {col:0,row:0};
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
		for(let row=0;row<this.model.numRows;row++){
			const tr = createTR();
			tr.appendChild(createTH(row+1));
			for(let col=0;col<this.model.numCols;col++){
				const position = {col:col,row:row};
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
		return row+1===this.model.numRows;
	}
	attachEventHandlers(){
		this.sheetbodyEl.addEventListener('click',this.handleSheetClick.bind(this));
		this.formulabarEl.addEventListener('keyup',this.handleFormulaBarChange.bind(this));
		this.row.addEventListener('click',this.addRow.bind(this));
		this.column.addEventListener('click',this.addColumn.bind(this));
		this.headerRowEl.addEventListener('click',this.highlightColumn.bind(this));
		//this.RowHeaderEl.addEventListener('click',this.highlightRow.bind(this));
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
		var colTarget = e.target.cellIndex;
		var rowTarget = e.target.parentElement.rowIndex;
		const fragment = document.createDocumentFragment();
		for(let row=0;row<this.model.numRows;row++){
			const tr = createTR();
			tr.appendChild(createTH(row+1));
			if(!this.checkLastRow(row)){
				this.currentCellLocation = {col:colTarget-1,row:row};
			}
			for(let col=0;col<this.model.numCols;col++){
				const position = {col:col,row:row};
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
		var colTarget = colTarget;
		var rowTarget = rowTarget;
		const fragment = document.createDocumentFragment();
		for(let row=0;row<this.model.numRows;row++){
			const tr = createTR();
			tr.appendChild(createTH(row+1));
			for(let col=0;col<this.model.numCols;col++){
				this.currentCellLocation = {col:col,row:rowTarget-1};
				const position = {col:col,row:row};
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
		var value  = this.model.getValue(currentCellLocation);
		var sum = 0;
		for(let row=0;row<this.model.numRows-1;row++){
			var position = {col:currentCellLocation.col,row:row};
			var value = this.model.getValue(position);
			if(!Number.isNaN(parseInt(value))){
				sum += parseInt(value);
			}
		}
		var sumLocation = {col:currentCellLocation.col,row:this.model.numRows-1};
		//console.log(sumLocation);console.log(sum);
		this.model.setValue(sumLocation,sum);
	}
	handleSheetClick(e){
		var col = e.target.cellIndex;
		var row = e.target.parentElement.rowIndex;
		if(e.target.nodeName=='TD'){
			if(!this.isColumnHeaderRow(row) || !this.isRowHeaderColumn(col)){
				row = row-1; col = col-1;
				this.currentCellLocation = {col:col,row:row};
				this.renderTableBody();
			}
			this.renderFormulaBar();
		}else{
			this.highlightRow(col,row);
		}
	}
}
module.exports = TableView;

},{"./array-util":2,"./dom-util":3}]},{},[1]);
