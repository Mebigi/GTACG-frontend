alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXY'.split('');

function customHeader(column){
	var result = "";
	if(column.getField().indexOf(".c1") > -1) result = "Most Isolated SubTree";
	else if(column.getField().indexOf(".c2") > -1) result = "Percentage of the Most Isolated SubTree";
	else if(column.getField().indexOf(".c3") > -1) result = "Number of sequences in this group";
	else if(column.getField().indexOf(".c4") > -1) result = "Percentage sequences in this group (#Seqs divided by #Genomes)";
	else if(column.getField().indexOf(".c5") > -1) result = "Number of different genomes in this group";
	else if(column.getField().indexOf(".c6") > -1) result = "Percentage different genomes in this group (#Genomes divided by total of different genomes in the cluster)";
	else if(column.getField().indexOf(".c7") > -1) result = "Percentage different genomes in this group (#Genomes divided by total of genomes of this group)";
	else if(column.getField().indexOf(".c8") > -1) result = "Dissimilarity - How many bases this group have that does not appear in the others groups (percentage)";
	return result + " -- field: " + column.getField();
}

function numFilter(headerValue, rowValue, rowData, filterParams){
	var conds = [-1];
	for(var i = 0; i < headerValue.length; i++)
		if(headerValue[i] == '&' || headerValue[i] == '|')
			conds.push(i);
	var result = null;
	for(var i = 0; i < conds.length; i++) {
		var header = headerValue.substring(conds[i]+1, conds[i+1]);
		var localResult = false;
		if(header.length == 0)
			localResult = true;
		var op = header.charAt(0);
		if("<>!=".indexOf(op) < 0)
			localResult = rowValue == headerValue;
		else {
			/*if(header.charAt(1) == '=')
				op = op + '=';
			var value = header.replace(op,'');
			if(value == "")
				localResult = true;
			value = Number(value);
			if(value == NaN)
				localResult = true;
			else if(op == '<') localResult = rowValue < value;
			else if(op == '>') localResult = rowValue > value;
			else if(op == '<=') localResult = rowValue <= value;
			else if(op == '>=') localResult = rowValue >= value;
			else if(op == '!' || op == '!=') localResult = rowValue != value;
			else if(op == '=' || op == '==') localResult = rowValue == value;*/
			if(header.charAt(0) == '=' && header.charAt(1) != '=')
				header = '=' + header;
			var exps = header.match(/\$([^$]+)\$/g);
			if(exps != null) {
				for (let k = 0; k < exps.length; k++) {
					header = header.replace(exps[k], rowData[exps[k].replace(/\$/g, '')]);
				}
			}
			try {
				localResult = eval(rowValue + header);
			} catch (error) {
				
			}
			
		}
		if(i == 0)
			result = localResult;
		else {
			var cond = headerValue[conds[i]];
			if(cond == '|')
				result = result || localResult;
			else
				result = result && localResult;
		}
	}
	return result;

	/*if(headerValue.length == 0)
		return true;
	var op = headerValue.charAt(0);
	if("<>!=".indexOf(op) < 0)
		return rowValue == headerValue;
	if(headerValue.charAt(1) == '=')
		op = op + '=';
	var value = headerValue.replace(op,'');
	if(value == "")
		return true;
	value = Number(value);
	if(value == NaN)
		return true;
	if(op == '<') return rowValue < value;
	else if(op == '>') return rowValue > value;
	else if(op == '<=') return rowValue <= value;
	else if(op == '>=') return rowValue >= value;
	else if(op == '!' || op == '!=') return rowValue != value;
	else if(op == '=' || op == '==') return rowValue == value;
	return true;*/
}

function alphFilter(headerValue, rowValue, rowData, filterParams){
	var conds = [-1];
	for(var i = 0; i < headerValue.length; i++)
		if(headerValue[i-1] != "\\" && (headerValue[i] == '&' || headerValue[i] == '|'))
			conds.push(i);
	var result = null;
	for(var i = 0; i < conds.length; i++) {
		var header = headerValue.substring(conds[i]+1, conds[i+1]).replace("\\|","|").replace("\\&","&");
		var localResult;
		if(header.length == 0)
			localResult = true;
		else {
			var op = header.charAt(0);
			if("!=".indexOf(op) < 0)
				localResult = rowValue.toUpperCase().indexOf(header.toUpperCase()) > -1;
			else {
				if(header.charAt(1) == '=')
					op = op + '=';
				var value = header.replace(op,'');
				if(value == "")
					localResult = true;
				else if(value == NaN)
					localResult = true;
				else if(op == '!' || op == '!=') localResult = rowValue.toUpperCase() != value.toUpperCase();
				else if(op == '=' || op == '==') localResult = rowValue.toUpperCase() == value.toUpperCase();
				else localResult = rowValue.toUpperCase().indexOf(value.toUpperCase()) > -1;
			}
		}
		if(i == 0)
			result = localResult;
		else {
			var cond = headerValue[conds[i]];
			if(cond == '|')
				result = result || localResult;
			else
				result = result && localResult;
		}
	}
	return result;

	/*if(headerValue.length == 0)
		return true;
	var op = headerValue.charAt(0);
	if("!=".indexOf(op) < 0)
		return rowValue.toUpperCase().indexOf(headerValue.toUpperCase()) > -1;
	if(headerValue.charAt(1) == '=')
		op = op + '=';
	var value = headerValue.replace(op,'');
	if(value == "")
		return true;
	if(value == NaN)
		return true;
	if(op == '!' || op == '!=') return rowValue.toUpperCase() != value.toUpperCase();
	else if(op == '=' || op == '==') return rowValue.toUpperCase() == value.toUpperCase();
	return rowValue.toUpperCase().indexOf(value.toUpperCase()) > -1;*/
}

function linkFilter(headerValue, rowValue, rowData, filterParams){
	var conds = [-1];
	for(var i = 0; i < headerValue.length; i++)
		if(headerValue[i] == '&' || headerValue[i] == '|')
			conds.push(i);
	var result = null;
	for(var i = 0; i < conds.length; i++) {
		var header = headerValue.substring(conds[i]+1, conds[i+1]);
		var localResult;
		if(header.length == 0)
			return true;
		var op = header.charAt(0);
		if("<>!=".indexOf(op) < 0)
			localResult = rowValue == headerValue;
		if(header.charAt(1) == '=')
			op = op + '=';
		var value = header.replace(op,'');
		if(value == "")
			localResult = true;
		value = Number(value);
		if(value == NaN)
			localResult = true;
		var newRowValue = 0;
		if(rowValue != undefined) 
			newRowValue = rowValue.split("</a>").length-1;
		if(op == '<') localResult = newRowValue < value;
		else if(op == '>') localResult = newRowValue > value;
		else if(op == '<=') localResult = newRowValue <= value;
		else if(op == '>=') localResult = newRowValue >= value;
		else if(op == '!' || op == '!=') localResult = newRowValue != value;
		else if(op == '=' || op == '==') localResult = newRowValue == value;
		else localResult = true;
		if(i == 0)
			result = localResult;
		else {
			var cond = headerValue[conds[i]];
			if(cond == '|')
				result = result || localResult;
			else
				result = result && localResult;
		}
	}
	return result;

	/*if(headerValue.length == 0)
		return true;
	var op = headerValue.charAt(0);
	if("<>!=".indexOf(op) < 0)
		return rowValue == headerValue;
	if(headerValue.charAt(1) == '=')
		op = op + '=';
	var value = headerValue.replace(op,'');
	if(value == "")
		return true;
	value = Number(value);
	if(value == NaN)
		return true;
	var newRowValue = 0;
	if(rowValue != undefined) 
		newRowValue = rowValue.split("</a>").length-1;
	if(op == '<') return newRowValue < value;
	else if(op == '>') return newRowValue > value;
	else if(op == '<=') return newRowValue <= value;
	else if(op == '>=') return newRowValue >= value;
	else if(op == '!' || op == '!=') return newRowValue != value;
	else if(op == '=' || op == '==') return newRowValue == value;
	return true;*/
}

/*var lineFormatter = function(cell, formatterParams){
	setTimeout(function(){
		cell.getElement().sparkline(cell.getValue(), {width:"100%", type:"line", lineColor:"black", fillColor:"grey", chartRangeMin:0});
	}, 10);
};*/

var lineFormatter = function(cell, formatterParams, onRendered){
    onRendered(function(){
        $(cell.getElement()).sparkline(cell.getValue(), {width:"100%", type:"line", disableTooltips:true});
    });
};


var columnTablePhylo1	= {title:"", width:40, field:"phylo", visible: false};
var columnTablePhylo	= {title:"", field:"sortGroupColumn", frozen:true, width:30, headerSort:false, sorter:customSorterGroup, align:"center", formatter:function(cell, formatterParams){return "<i class='filter icon'></i>";},cellClick:phyloClick, headerTooltip:"Filter table by phylogeny"};
var columnTableKey	= {title:"Key", field:"key", width:160, bottomCalc:"count", frozen:true, headerFilter:true, headerFilterFunc:alphFilter, formatter:"link", formatterParams:{/*labelField:"key", urlPrefix:"family.htm?file="*/url:"#"}, headerSort:true, headerTooltip:"Key from fasta file of the sequence", headerFilterPlaceholder:"Alphabetical Filter"};
var columnTableFunc	= {title:"Function", field:"func", formatter:"html", headerFilter:true, headerFilterFunc:alphFilter, headerTooltip:"Function annotated in the fasta file", frozen:false, width:600, headerFilterPlaceholder:"Alphabetical Filter"};
var columnTableNumFunc	= {title:"#", field:"numFunc", formatter:"html", headerFilter:true, headerFilterFunc:numFilter, headerTooltip:"Number of functions annotated", width:5, headerFilterPlaceholder:"Numerical Filter"};
var columnTableDoms	= {title:"Domains", field:"doms", width:160,formatter:"html", sorter:function(a, b, aRow, bRow, column, dir, sorterParams){return a.length - b.length;}, headerFilter:true, headerFilterFunc:linkFilter, headerFilterPlaceholder:"Numerical Filter"};
var columnTableOrthos	= {title:"Orthologs", field:"orthos", width:160,formatter:"html", sorter:function(a, b, aRow, bRow, column, dir, sorterParams){return a.length - b.length;}, headerFilter:true, headerFilterFunc:linkFilter, headerFilterPlaceholder:"Numerical Filter"};
var columnTableDivers   = {title:"Diversity", field:"divers", topCalcParams:{precision:10}, sorter:"number", formatter:"money", formatterParams:{precision:10}, headerFilter:true, headerFilterFunc:numFilter, width:110, headerTooltip:"Diversity of bases in the alignment", headerFilterPlaceholder:"Numerical Filter"};
var columnTableCluster	= {title:"Cluster Coeff.", field:"coef", bottomCalc:"avg", topCalcParams:{precision:10}, sorter:"number", formatter:"money", formatterParams:{precision:4}, headerFilter:true, headerFilterFunc:numFilter, width:120, headerTooltip:"Clustering coefficient", headerFilterPlaceholder:"Numerical Filter"};
var columnTableNumSeqs	= {title:"# Seqs", field:"seqs", bottomCalc:"sum", sorter:"number", headerFilter:true, headerFilterFunc:numFilter, width:80, headerTooltip:"Number of sequences", headerFilterPlaceholder:"Numerical Filter"};
var columnTableNumGens	= {title:"# Genomes", field:"gens", bottomCalc:"sum", sorter:"number", headerFilter:true, headerFilterFunc:numFilter, width:110, headerTooltip:"Number of different genomes", headerFilterPlaceholder:"Numerical Filter"};
var columnTableNumParas	= {title:"# Paralogs", field:"paras", bottomCalc:"sum", sorter:"number", headerFilter:true, headerFilterFunc:numFilter, width:110, headerTooltip:"Maximum number of possible paralogs", headerFilterPlaceholder:"Numerical Filter"};
var columnTableTNodes	= {title:"Tree Nodes", field:"tnodes", sorter:"number", headerFilter:true, headerFilterFunc:numFilter, width:110, headerTooltip:"", headerFilterPlaceholder:"Numerical Filter"};
var columnTableTDist	= {title:"Tree Distance", field:"tdist", sorter:"number", headerFilter:true, headerFilterFunc:numFilter, width:120, headerTooltip:"", headerFilterPlaceholder:"Numerical Filter"};
var columnTableMast	= {title:"MAST", field:"mast", sorter:"number", headerFilter:true, headerFilterFunc:numFilter, width:80, headerTooltip:"", headerFilterPlaceholder:"Numerical Filter"};
var columnTableEMast	= {title:"eMAST", field:"emast", sorter:"number", headerFilter:true, headerFilterFunc:numFilter, width:80, headerTooltip:"", headerFilterPlaceholder:"Numerical Filter"};
var columnTableExcl	= {title:"Genome", field:"excl", headerFilter:true, headerFilterFunc:alphFilter, width:120, headerTooltip:"", headerFilterPlaceholder:"Numerical Filter"};
var columnTableFasta	= {title:"Fasta", field:"key", width:160, formatter:"link", formatterParams:{label:"FASTA", url:links,urlPrefix:"aligns/"},width:80, headerSort:false, headerTooltip:"Fasta file"};
var columnTableAlin	= {title:"Alignment", field:"key", width:160, formatter:"link", formatterParams:{label:"ALIGNMENT", url:links,urlPrefix:"aligns/"},width:100, headerSort:false, headerTooltip:"Aligment file (in fasta format)"};
var columnTableTree	= {title:"Tree", field:"key", width:160, formatter:"link", formatterParams:{label:"TREE", url:links,urlPrefix:"aligns/"},width:80, headerSort:false, headerTooltip:"Tree file (in newick format)"};
var columnTableLens	= {title:"Lengths", field:"lens", width:100, formatter:lineFormatter, sorter:customSorterLens};

function customSorterGroup(a, b, aRow, bRow, column, dir, sorterParams){
	return bRow.getGroup().getRows().length - aRow.getGroup().getRows().length;
}

function customSorterLens(a, b, aRow, bRow, column, dir, sorterParams){
	var areaA = a.length*a[0];
	var areaB = b.length*b[0];

	var totalA = 0;
	for(var i = 0; i < a.length; i++)
		totalA += a[i];

	var totalB = 0;
	for(var i = 0; i < b.length; i++)
		totalB += b[i];

	return ((totalA - areaA)/areaA) - ((totalB - areaB)/areaB);
}

function phyloClick(e, cell){
	var array = table.getFilters();
	var filter = true;
	for(var i = 0; i < array.length; i++)
		if(array[i].field == "phylo")
			filter = false;
	if(filter) {
		table.setFilter("phylo", "=", cell.getRow().getCells()[2].getValue());
	}
	else {
		table.removeFilter("phylo", "=", cell.getRow().getCells()[2].getValue());
	}
}

function links(data) {
if(data.cell.column.definition.title == "Fasta")
	return data.cell.value + ".fasta";
else if(data.cell.column.definition.title == "Alignment")
	return data.cell.value + ".align";
else if(data.cell.column.definition.title == "Tree")
	return data.cell.value + ".tree";
}

function getIndexBaseColumns(dataset) {
	var array = [
		columnTablePhylo,
		columnTableKey,
		columnTablePhylo1,
		columnTableFunc,
		columnTableNumFunc];
		
	if(dataset != "e") {
		array.push(columnTableDoms);
		array.push(columnTableOrthos);
	}
	if(dataset == "d") {
		columnTableDoms.frozen = true;
		array = [
			columnTableKey,	
			columnTableDoms,
			columnTableFunc,
			columnTableNumFunc
		];
	}
	else if(dataset == "o") {
		columnTableOrthos.frozen = true;
		array = [
			columnTableKey,
			columnTableOrthos,
			columnTableFunc,
			columnTableNumFunc,
			columnTableDoms,
		];
	}
	if(dataset == "e")
		array.push(columnTableExcl);
	//if(dataset == "h" || dataset == "e")
	if(dataset != "e")
		array.push(columnTableCluster);
	array = array.concat([
                columnTableDivers,
		columnTableNumSeqs]);
	if(dataset != "e")
		array = array.concat([
			columnTableLens,
			columnTableNumGens,
		        columnTableNumParas,
			columnTableTNodes,
			columnTableTDist,
			columnTableMast,
			columnTableEMast]);
	/*array = array.concat([
		{title:"Files", field:"files", columns:[
			columnTableFasta,
			columnTableAlin,
			columnTableTree
		]}]);*/
	//array.push(columnTablePhylo1);
	return array;
}

function getIndexBaseColumnsVertical(dataset) {
	return getIndexBaseColumns(dataset).concat([
		{title:"Group", field:"gt", width:160, headerSort:true, headerFilter:true, headerFilterFunc:alphFilter, headerTooltip:"Key from fasta file of the sequence"},
		{title:"Type", field:"t", width:160, headerSort:true, headerFilter:true, headerFilterFunc:alphFilter, headerTooltip:"Key from fasta file of the sequence"},
		{title:"MIST", columns:[{title:"#", field:"g.c1", sorter:"number", headerFilter:true, headerFilterFunc:numFilter, width:70, headerTooltip:customHeader},{title:"%", field:"g.c2", sorter:"number", headerFilter:true, headerFilterFunc:numFilter, width:70, headerTooltip:customHeader, align:"right", formatter:"money", formatterParams:{precision:2,symbol:"%",symbolAfter:true}}]},
		{title:"Sequences", columns:[{title:"#", field:"g.c3", sorter:"number", headerFilter:true, headerFilterFunc:numFilter, width:70, headerTooltip:customHeader},{title:"%", field:"g.c4", sorter:"number", headerFilter:true, headerFilterFunc:numFilter, width:70, headerTooltip:customHeader, align:"right", formatter:"money", formatterParams:{precision:2,symbol:"%",symbolAfter:true}}]},
		{title:"Genomes", columns:[{title:"#", field:"g.c5", sorter:"number", headerFilter:true, headerFilterFunc:numFilter, width:70, headerTooltip:customHeader},{title:"A%", field:"g.c6", sorter:"number", headerFilter:true, headerFilterFunc:numFilter, width:70, headerTooltip:customHeader, align:"right", formatter:"money", formatterParams:{precision:2,symbol:"%",symbolAfter:true}},{title:"B%", field:"g.c7", sorter:"number", headerFilter:true, headerFilterFunc:numFilter, width:70, headerTooltip:customHeader, align:"right", formatter:"money", formatterParams:{precision:2,symbol:"%",symbolAfter:true}}]},
		{title:"Dissimilarity", field:"g.c8", headerFilter:true, headerFilterFunc:numFilter, headerTooltip:customHeader, width:80, formatter:"money", formatterParams:{precision:10}},
	]);
}

var diffCalcs = function(values, data, calcParams){
	values.sort();
	var total = 1;
	for(var i = 1; i < values.length; i++) 
		if(values[i-1] != values[i])
			total++;
	return total;
}

var columnsGs = [
	{title:"TYPE", field:"g", headerFilter:true, bottomCalc:diffCalcs},
	{title:"MIST", columns:[
		{title:"#", field:"c1", sorter:"number", bottomCalc:"sum"},
		{title:"%", field:"c2", sorter:"number", bottomCalc:"sum", bottomCalcFormatter:"money", bottomCalcFormatterParams:{precision:2,symbol:"%",symbolAfter:true}, formatter:"money", formatterParams:{precision:2,symbol:"%",symbolAfter:true}, align:"right"},
	]},
	{title:"SEQUENCES", columns:[
		{title:"#", field:"c3", sorter:"number", bottomCalc:"sum"},
		{title:"%", field:"c4", sorter:"number", bottomCalc:"sum", bottomCalcFormatter:"money", bottomCalcFormatterParams:{precision:2,symbol:"%",symbolAfter:true}, formatter:"money", formatterParams:{precision:2,symbol:"%",symbolAfter:true}, align:"right"},
	]},
	{title:"GENOME", columns:[
		{title:"#", field:"c5", sorter:"number", bottomCalc:"sum"},
		{title:"A%", field:"c6", sorter:"number", bottomCalc:"sum", bottomCalcFormatter:"money", bottomCalcFormatterParams:{precision:2,symbol:"%",symbolAfter:true}, formatter:"money", formatterParams:{precision:2,symbol:"%",symbolAfter:true}, align:"right"},
		{title:"B%", field:"c7", sorter:"number", bottomCalc:"sum", bottomCalcFormatter:"money", bottomCalcFormatterParams:{precision:2,symbol:"%",symbolAfter:true}, formatter:"money", formatterParams:{precision:2,symbol:"%",symbolAfter:true}, align:"right"},
	]},
	{title:"DISSIMILARITY", field:"c8", formatter:"money", formatterParams:{precision:10}},
	{title:"COLOR", field:"color", formatter:"color", bottomCalc:"sum"},
];

function mkLinkId(id) {
	return "<a href=\"family.htm?file=" + id + "\">" + id + "</a>";
}

function mkLinkFasta(id) {
	return "<a href=\"alins/" + id.replace("|", "") + ".fasta\">FASTA</a>";
}

function mkLinkAlign(id) {
	return "<a href=\"alins/" + id.replace("|", "") + ".alin\">ALIGNMENT</a>";
}

function mkLinkTree(id) {
	return "<a href=\"alins/" + id.replace("|", "") + ".tree\">TREE</a>";
}

function getIndexJsTreeData(dataset, frozen) {
	var array = [
		{"text":"Key", "id":"key", "state" : { "selected" : true, "disabled": true }},
		{"text":"Function", "id":"func", "state" : { "selected" : true, "disabled": (frozen!=null&&frozen.indexOf("func")>-1) }},
		{"text":"# Functions", "id":"numFunc", "state" : { "selected" : true, "disabled": (frozen!=null&&frozen.indexOf("func")>-1) }},
		{"text":"Domains", "id":"doms", "state" : { "selected" : true, "disabled": (frozen!=null&&frozen.indexOf("doms")>-1) }},
		{"text":"Orthologs", "id":"orthos", "state" : { "selected" : true, "disabled": (frozen!=null&&frozen.indexOf("orthos")>-1) }}
	];
	if(dataset == "d")
		array = [
			{"text":"Key", "id":"key", "state" : { "selected" : true, "disabled": true }},
			{"text":"Domain", "id":"doms", "state" : { "selected" : true, "disabled": true }},
			{"text":"Function", "id":"func", "state" : { "selected" : true, "disabled": (frozen!=null&&frozen.indexOf("func")>-1) }},
		];
	else if(dataset == "o")
		array = [
			{"text":"Key", "id":"key", "state" : { "selected" : true, "disabled": true }},
			{"text":"Function", "id":"func", "state" : { "selected" : true, "disabled": (frozen!=null&&frozen.indexOf("func")>-1) }},
		];

	if(dataset == "h" || dataset == "e")
		array = array.concat([{"text":"Cluster Coeff.", "id":"coef", "state" : { "selected" : true, "disabled": (frozen!=null&&frozen.indexOf("coef")>-1) }}]);
	array = array.concat([
		{"text":"Diversity", "id":"divers", "state" : { "selected" : true, "disabled": (frozen!=null&&frozen.indexOf("divers")>-1) }},
		{"text":"# Seqs", "id":"seqs", "state" : { "selected" : true, "disabled": (frozen!=null&&frozen.indexOf("seqs")>-1) }},
		{"text":"# Genomes", "id":"gens", "state" : { "selected" : true, "disabled": (frozen!=null&&frozen.indexOf("gens")>-1) }},
		{"text":"# Paralogs", "id":"paras", "state" : { "selected" : true, "disabled": (frozen!=null&&frozen.indexOf("paras")>-1) }},
		/*{"text":"Files", "id":"files", "state" : { "selected" : true }, "children":[
			{"text":"Fasta", "id":"fasta", "state": { "disabled": (frozen!=null&&frozen.indexOf("fasta")>-1) }},
			{"text":"Alignment", "id":"alin", "state": { "disabled": (frozen!=null&&frozen.indexOf("alin")>-1) }},
			{"text":"Tree", "id":"tree", "state": { "disabled": (frozen!=null&&frozen.indexOf("tree")>-1) }},
		]}*/]);
	return array;
}

function getIndexJsTreeDataVertical(dataset) {
	return getIndexJsTreeData(dataset).concat([
		{"text":"Group", "id":"gt", "state" : { "selected" : true }},
		{"text":"Type", "id":"t", "state" : { "selected" : true }},
		{"text":"MIST", "id":"g.niche", "state" : { "selected" : true }, "children":[
			{"text":"#", "id":"g.c1", "state" : { "selected" : true }},
			{"text":"%", "id":"g.c2", "state" : { "selected" : true }},
		]},
		{"text":"Sequences", "id":"g.seqs", "state" : { "selected" : true }, "children":[
			{"text":"#", "id":"g.c3", "state" : { "selected" : true }},
			{"text":"%", "id":"g.c4", "state" : { "selected" : true }},
		]},
		{"text":"Genomes", "id":"g.gens", "state" : { "selected" : true }, "children":[
			{"text":"#", "id":"g.c5", "state" : { "selected" : true }},
			{"text":"A%", "id":"g.c6", "state" : { "selected" : true }},
			{"text":"B%", "id":"g.c7", "state" : { "selected" : true }},
		]},
		{"text":"Dissimilarity", "id":"g.c8", "state" : { "selected" : true }},
	]);
}

var mapVertical = [
{key:"files",values:["fasta", "alin", "tree"]},
{key:"g.niche",values:["g.c1","g.c2"]},
{key:"g.seqs",values:["g.c3","g.c4"]},
{key:"g.niche",values:["g.c5","g.c6", "g7.c8"]},
];

var optionsArchaeopteryx = {
	alignPhylogram: true,
	phylogram: true,
	searchIsCaseSensitive: false,
	searchIsPartial: true,
	searchUsesRegex: false,
	showNodeName: true,
	showSequence: true,
	showSequenceAccession: true,
	showSequenceGeneSymbol: true,
	showSequenceName: true,
	showSequenceSymbol: true
};

var settingsArchaeopteryx = {
	displayHeight: 800,
	displayWidth: 1000,
	enableDownloads: true,
	enableCollapseByBranchLenghts: true,
	enableCollapseByFeature: true,
	enableNodeVisualizations: true,
	enableBranchVisualizations: true,
	nhExportReplaceIllegalChars: false,
	nhExportWriteConfidences: true,
	reCenterAfterCollapse: false,
	rootOffset: 180,
	showDynahideButton: true,
	controlsFontSize: 10
};

var settingsSigma = {
	defaultNodeColor: '#5652D7',
	defaultEdgeColor:'#777',
	edgeColor: 'default',
	defaultEdgeHoverColor: '#ff0000',
	labelHoverBGColor: '#00ff00',
	defaultHoverLabelBGColor: '#00ff00',
	defaultLabelHoverColor: '#00ff00',
	drawEdgeLabels: false,

	labelAlignment: 'inside',
	maxNodeLabelLineLength: 20,
	drawLabels: true,
	labelSize: 'proportional',
	labelSizeRatio: 0.15,
	labelThreshold: -1,
	autoRescale: false,
	fontStyle: 'bold',
	enableEdgeHovering: true,
	edgeHoverSizeRatio: 4,
	edgeHoverExtremities: true,
	edgeHoverColor: 'default',
	minEdgeSize: 0.5,
	maxEdgeSize: 4,

	defaultEdgeLabelColor:'#fff',
	defaultEdgeLabelSize: 18,
	defaultEdgeHoverLabelBGColor: '#f00',
	edgeLabelHoverShadow:'edge',
	edgeLabelHoverShadowColor: '#000',
	edgeHoverPrecision: 2,

	zoomMin: 0.0001,

};

function getSettingsSigmaTooltip(gs) {
	var template =
		'<div class="arrow"></div>' +
		'<div style="padding: 5px;" class="sigma-tooltip-header">{{data.key}}</div>' +
		'<div style="padding: 5px;" class="sigma-tooltip-body">' +
		'  <table>' +
		'    <tr><th style="padding-right: 5px;">Organism</th> <td>{{data.org}}</td></tr>' +
		'    <tr><th style="padding-right: 5px;">Length</th> <td>{{data.len}}</td></tr>';
	for(var i = 0; i < gs.length; i++)
		template += '      <tr><th style="padding-right: 5px;">' + gs[i].name + '</th> <td>{{data.rg' + i + '.name}}</td></tr>';
	template +=
		'  </table>' +
		'</div>' +
		'<div class="sigma-tooltip-footer"></div>' +
		'<div style="padding: 5px;" class="sigma-tooltip-body">' +
		'  <table>' +
		'    <tr><th style="padding-right: 5px;"># neighbours</th> <td>{{degree}}</td></tr>' +
		'    <tr><th style="padding-right: 5px;">Cluster Coeff.</th> <td>{{data.coef}}</td></tr>' +
		'  </table>' +
		'</div>'; 

	return config = {
		node: [{
		show: 'clickNode',
		hide: 'outNode',
		cssClass: 'sigma-tooltip',
		position: 'right',
		autoadjust: true,
		template:template,
		renderer: function(node, template) {
			node.degree = this.degree(node.id);
			return Mustache.render(template, node);
		}
	}],
	edge: [{
		show: 'clickEdge',
		hide: 'hovers',
		cssClass: 'sigma-tooltip',
		position: 'right',
		autoadjust: true,
		template:
			'<div class="arrow"></div>' +
			'<div style="padding: 5px;" class="sigma-tooltip-header">{{data.source}}<br>{{data.target}}</div>' +
			'<div style="padding: 5px;" class="sigma-tooltip-body">' +
			'  <table>' +
			'    <tr><th>Identity</th> <td>{{data.i}}</td></tr>' +
			'    <tr><th>E-value</th> <td>{{data.e}}</td></tr>' +
			'    <tr><th>Length</th> <td>{{data.l}} ({{data.lp}}%)</td></tr>' +
			'    <tr><th>Mismatch</th> <td>{{data.m}}%</td></tr>' +
			'    <tr><th style="padding-right: 5px;">Gap Opening</th> <td>{{data.g}}</td></tr>' +
			'    <tr><th>Bitscore</th> <td>{{data.b}}</td></tr>' +
			'  </table>' +
			'</div>' +
			//' </div>' +
			'</div>',
		renderer: function(edge, template) {
			edge.data.source = this.nodes(edge.source).data.key;
			edge.data.target = this.nodes(edge.target).data.key;
			return Mustache.render(template, edge);
		}
	}],
	stage: {
		template:
			'<div class="arrow"></div>' +
			'<div class="sigma-tooltip-header"> Menu </div>'
	}};
}

function processNodesAndEdges(nodes, edges) {
	for(i = 0; i < nodes.length; i++) {
		nodes[i].label = nodes[i].data.key;
		nodes[i].borderColor = '#000'
		nodes[i].size = 80;
		nodes[i].type = 'circle2';
		nodes[i].x = Math.random();
		nodes[i].y = Math.random();
	}
	for(i = 0; i < edges.length; i++) {
		edges[i].id = i;
		edges[i].target = edges[i].t;
		edges[i].source = edges[i].s;
		delete edges[i].t;
		delete edges[i].s;
		edges[i].label = '' + edges[i].data.e;
	}
}

function loadTree(fileName, gs, divId) {
	var options = optionsArchaeopteryx;
	options.treeName = fileName;
	var nodeVisualizations = {};
	for(var i = 0; i < gs.length; i++)
		nodeVisualizations[gs[i].name] = {label: gs[i].name,cladeRef: 'ird:' + gs[i].name,colors: 'category20'};
	var loc = fileName + '.xml';
	jQuery.get(loc, function (data) {archaeopteryx.launchArchaeopteryx(divId,loc,data,options,settingsArchaeopteryx,true,false,nodeVisualizations)},'text');
}

var colorScale = [
	//'#1f77b4',
	'#AEC7E8',
	'#ff7f0e',
	'#ffbb78',
	'#2ca02c',
	'#98df8a',
	'#d62728',
	'#ff9896',
	'#9467bd',
	'#c5b0d5',
	'#8c564b',
	'#c49c94',
	'#e377c2',
	'#f7b6d2',
	'#7f7f7f',
	'#c7c7c7',
	'#bcbd22',
	'#dbdb8d',
	'#17becf',
	'#9edae5',
	'#004466',
	'#990030',
	'#ff6696', 
	'#669900' 
];


save_image = function(type, container) {
  var prefix = {
    xmlns: "http://www.w3.org/2000/xmlns/",
    xlink: "http://www.w3.org/1999/xlink",
    svg: "http://www.w3.org/2000/svg"
  };

  function get_styles(doc) {
    function process_stylesheet(ss) {
      try {
        if (ss.cssRules) {
          for (var i = 0; i < ss.cssRules.length; i++) {
            var rule = ss.cssRules[i];
            if (rule.type === 3) {
              // Import Rule
              process_stylesheet(rule.styleSheet);
            } else {
              // hack for illustrator crashing on descendent selectors
              if (rule.selectorText) {
                if (rule.selectorText.indexOf(">") === -1) {
                  styles += "\n" + rule.cssText;
                }
              }
            }
          }
        }
      } catch (e) {
        //console.log("Could not process stylesheet : " + ss);
      }
    }

    var styles = "",
      styleSheets = doc.styleSheets;

    if (styleSheets) {
      for (var i = 0; i < styleSheets.length; i++) {
        process_stylesheet(styleSheets[i]);
      }
    }

    return styles;
  }

  var svg = $(container).find("svg")[0];
  if (!svg) {
    svg = $(container)[0];
  }

  var styles = get_styles(window.document);

  svg.setAttribute("version", "1.1");

  var defsEl = document.createElement("defs");
  svg.insertBefore(defsEl, svg.firstChild);

  var styleEl = document.createElement("style");
  defsEl.appendChild(styleEl);
  styleEl.setAttribute("type", "text/css");

  // removing attributes so they aren't doubled up
  svg.removeAttribute("xmlns");
  svg.removeAttribute("xlink");

  // These are needed for the svg
  if (!svg.hasAttributeNS(prefix.xmlns, "xmlns")) {
    svg.setAttributeNS(prefix.xmlns, "xmlns", prefix.svg);
  }

  if (!svg.hasAttributeNS(prefix.xmlns, "xmlns:xlink")) {
    svg.setAttributeNS(prefix.xmlns, "xmlns:xlink", prefix.xlink);
  }

  var source = new XMLSerializer()
    .serializeToString(svg)
    .replace("</style>", "<![CDATA[" + styles + "]]></style>");
  var doctype =
    '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
  var to_download = [doctype + source];
  var image_string =
    "data:image/svg+xml;base66," + encodeURIComponent(to_download);

  if (type == "png") {
    b64toBlob(
      image_string,
      function(blob) {
        var url = window.URL.createObjectURL(blob);
        var pom = document.createElement("a");
        pom.setAttribute("download", "image.png");
        pom.setAttribute("href", url);
        $("body").append(pom);
        pom.click();
        pom.remove();
      },
      function(error) {
        // handle error
      }
    );
  } else {
    var pom = document.createElement("a");
    pom.setAttribute("download", "image.svg");
    pom.setAttribute("href", image_string);
    $("body").append(pom);
    pom.click();
    pom.remove();
  }
};

function b64toBlob(b64, onsuccess, onerror) {

  var img = new Image();

  img.onerror = onerror;

  img.onload = function onload() {
    var canvas = document.getElementById("hyphy-chart-canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(onsuccess);
  };

  img.src = b64;
}

function getTotais() {
	var totais = [];
	for(var i = 0; i < gs.length; i++) {
		totais.push([]);
		for(var j = 0; j < gs[i].childs.length; j++)
			totais[i].push(0);
	}
	return totais;
}

function sumTotais(totaisA, totaisB) {
	var totais = getTotais();
	for(var i = 0; i < gs.length; i++) {
		for(var j = 0; j < gs[i].childs.length; j++)
			totais[i][j] = totaisA[i][j] + totaisB[i][j];
	}
	return totais;
}

function uniqueTotais(vet) {
	var index = -1;
	for(var i = 0; i < vet.length; i++)
		if(vet[i] > 0) {
			if(index == -1)
				index = i;
			else if(index >= 0)
				index = -2;
		}
	return index;
}

function subTotais(totaisA, totaisB) {
	var totais = getTotais();
	for(var i = 0; i < gs.length; i++) {
		for(var j = 0; j < gs[i].childs.length; j++)
			totais[i][j] = totaisA[i][j] - totaisB[i][j];
	}
	return totais;
}

function downloadFile(filename, text) {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}

function copyToClipboard(str) {
	el = document.createElement('textarea');
	el.value = str;
	el.setAttribute('readonly', '');
	el.style.position = 'absolute';
	el.style.left = '-9999px';
	document.body.appendChild(el);
	el.select();
	document.execCommand('copy');
	document.body.removeChild(el);
};

Array.prototype.unique = function() {
	var a = this.concat();
	for(var i=0; i<a.length; ++i) {
		for(var j=i+1; j<a.length; ++j) {
			if(a[i] === a[j])
				a.splice(j--, 1);
		}
	}
	return a;
};

Array.prototype.remove = function(i) {
	if(i>=0 && i < this.length)
		return this.slice(0,i).concat(this.slice(i+1,this.length));
	else
		return this.slice(0);
};


Array.prototype.diff = function(a) {
	var vet = a.slice(0);
	var result = [];
	for(var i = 0; i < this.length; i++)
		if(vet.indexOf(this[i]) < 0) {
			result.push(this[i]);
		}
		else {
			vet = vet.remove(vet.indexOf(this[i]));
		}
	return result;
};

var timer = function(name) {
    var start = new Date();
    return {
        stop: function() {
            var end  = new Date();
            var time = end.getTime() - start.getTime();
            console.log('Timer:', name, 'finished in', time, 'ms');
        }
    }
};

function scrollsnap() {
	$(document).scrollsnap({
		snaps: '.section, .sectionStart, .sectionAlt',
		proximity: 75,
		offset: -5,
		duration: 0,
	});
}

class EventTimer {
	constructor(func, totalTime) {
		this.func = func;
		this.totalTime = totalTime;
		this.timer = null;
	}
	trigger() {
		clearTimeout(this.timer);
		this.timer = setTimeout(() => {
			this.func();
		}, this.totalTime);
	}
}

function isDOM(obj) {
	if(obj == undefined || obj == null)
		return false;
	var tag = obj.tagName;
	try {
			obj.tagName = '';  // Read-only for DOM, should throw exception
			obj.tagName = tag; // Restore for normal objects
			return false;
		} catch (e) {
			return true;
		}
	}

	function setURL(value, object) {
	if (history.pushState) {
		window.history.pushState(object,'','?' + value);
	}
}

function changeURL(value, object) {
	if (history.replaceState) {
		window.history.replaceState(object, '', '?' + value);
	}
}

function guid() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	}
	return "ss-s-s-s-sss".replace(/s/g, s4);
}

HTMLElement.prototype.empty = function() {
	var that = this;
	while (that.hasChildNodes()) {
		that.removeChild(that.lastChild);
	}
};
