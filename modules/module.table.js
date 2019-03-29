class Table {
    constructor(div, page, create) {
		this.div = div;
		$('.ui.link.dropdown').dropdown({action: 'hide'});
		$('#sidebarGenomes').sidebar({dimPage: false,exclusive:true,transition: 'overlay', context: $('#pusherTable')}).sidebar('attach events', '#menuSidebarGenomes');
		$('#sidebarGenomes').sidebar({dimPage: false,exclusive:true,transition: 'overlay', context: $('#pusherTable')}).sidebar('attach events', '#menuSidebarGenomesAlt');
		$('#sidebarColumns').sidebar({dimPage: false,exclusive:true,transition: 'overlay', context: $('#pusherTable')}).sidebar('attach events', '#menuSidebarColumns');
		$('#sidebarColumns').sidebar({dimPage: false,exclusive:true,transition: 'overlay', context: $('#pusherTable')}).sidebar('attach events', '#menuSidebarColumnsAlt');

        this.subPages = new SubPages(
            this.div,
            document.getElementById('menuSubPageTable'),
            this,
            document.querySelector('#menuPageTable > i > .ui.floating.label')
		);

				
		this.created = false;
        if(create != false)
			this.createPage();
	}

	createPage() {
		this.created = true;
		for (let i = 0; i < dataHomo.length; i++) {
			dataHomo[i].dataset = 'h';
			dataHomo[i].datasetOrtho = false;
			if(dataHomo[i].orthos != undefined)
				dataHomo[i].datasetOrthos = true;
			if(dataHomo[i].doms != undefined)
				dataHomo[i].datasetDoms = true;
		}
		for (let i = 0; i < dataDoms.length; i++) {
			dataDoms[i].dataset = 'd';
		}
		for (let i = 0; i < dataOrthos.length; i++) {
			dataOrthos[i].dataset = 'o';
		}
		this.data = dataHomo.concat(dataOrthos.concat(dataDoms));

		let totalGenomesRg = [];
		for(let i = 0; i < gs.length; i++) {
			totalGenomesRg.push(Array(gs[i].childs.length).fill(0));
			for(let j = 0; j < genomes.length; j++) {
				totalGenomesRg[i][genomes[j].rg[i]]++;
			}
		}
		
		let codIgnore = false;
		let columns = getIndexBaseColumns("h");
		for(var i = 0; i < gs.length; i++) {
			var sub = [];
			for(var j = 0; j < gs[i].childs.length; j++) {
				var field = "rg" + i + ".g" + j;
				sub.push({title:gs[i].childs[j].name, field:field, visible:false, columns:[
					{title:"MIST", field:field + ".mist", visible:false, columns:[
						{title:"#", field:field + ".c1", sorter:"number", headerFilter:true, headerFilterFunc:numFilter, width:70, headerTooltip:customHeader, visible:false},
						{title:"%", field:field + ".c2", sorter:"number", headerFilter:true, headerFilterFunc:numFilter, width:70, headerTooltip:customHeader, align:"right", formatter:"money", formatterParams:{precision:2,symbol:"%",symbolAfter:true}, visible:false}
					]},
					{title:"Sequences", field:field + ".seqs", visible:false, columns:[
						{title:"#", field:field + ".c3", sorter:"number", headerFilter:true, headerFilterFunc:numFilter, width:70, headerTooltip:customHeader, visible:false},
						{title:"%", field:field + ".c4", sorter:"number", headerFilter:true, headerFilterFunc:numFilter, width:70, headerTooltip:customHeader, align:"right", formatter:"money", formatterParams:{precision:2,symbol:"%",symbolAfter:true}, mutator:function(value, data, type, params, component){if(data["rg"+params[0]] == undefined || data["rg"+params[0]]["g"+params[1]] == undefined) return undefined; return 100*(data["rg"+params[0]]["g"+params[1]].c3/data.seqs);}, mutatorParams:[i,j], visible:false}
					]},
					{title:"Genomes", field:field + ".gens", visible:false, columns:[
						{title:"#", field:field + ".c5", sorter:"number", headerFilter:true, headerFilterFunc:numFilter, width:70, headerTooltip:customHeader, visible:false},
						{title:"A%", field:field + ".c6", sorter:"number", headerFilter:true, headerFilterFunc:numFilter, width:70, headerTooltip:customHeader, align:"right", formatter:"money", formatterParams:{precision:2,symbol:"%",symbolAfter:true}, mutator:function(value, data, type, params, component){if(data["rg"+params[0]] == undefined || data["rg"+params[0]]["g"+params[1]] == undefined) return undefined; return 100*(data["rg"+params[0]]["g"+params[1]].c5/data.gens);}, mutatorParams:[i,j], visible:false},
						{title:"B%", field:field + ".c7", sorter:"number", headerFilter:true, headerFilterFunc:numFilter, width:70, headerTooltip:customHeader, align:"right", formatter:"money", formatterParams:{precision:2,symbol:"%",symbolAfter:true}, mutator:function(value, data, type, params, component){if(data["rg"+params[0]] == undefined || data["rg"+params[0]]["g"+params[1]] == undefined) return undefined; if(totalGenomesRg[params[0]][params[1]] == 0) return 0; return 100*(data["rg"+params[0]]["g"+params[1]].c5/totalGenomesRg[params[0]][params[1]]);}, mutatorParams:[i,j], visible:false},
					]},
					{title:"Dissimilarity", field:field + ".c8", headerFilter:true, headerFilterFunc:numFilter, headerTooltip:customHeader, width:120, formatter:"money", formatterParams:{precision:10}, visible:!codIgnore, visible:false},
				]});
			}
			columns.push({title:gs[i].name, field:"rg" + i, visible:false, columns:sub});
		}

		this.table = new Tabulator(this.div.querySelector("#example-table"), {
			progressiveRender:       true,
			progressiveRenderSize:   100,
			progressiveRenderMargin: 100,
			virtualDomBuffer:100,
			columnVertAlign:"bottom",
			resizableRows:false,
			movableRows: false,
			resizableColumns:false,
			tooltipsHeader:true,
			columns: columns,
			groupToggleElement:"header",
			dataSorted:(sorters, rows) => {this.updateSorter()},
			dataFiltered:(filters, rows) => {this.updateFilter()},
			cellClick:(e, cell) => {
                if(cell.getColumn().getField() == "key" && e.path[0].tagName == "A") {
                    session.changePage('family', cell.getData().key);
                }
            },
            groupHeader:function(value, count, data, group){
				/*if(group.group.field == "phylo") {
					if(value == undefined)
						return "<span style='color:#d00; margin-left:10px;width:100px;display:inline-block;'>(" + count + " item)</span><span style='color:#d00;margin-left: 0px;'>N/A</span>";
					var newValue = value.split(",");
		
					for(var i = 0; i < newValue.length; i++) {
						var v = newValue[i].replace(/\(/g,"").replace(/\)/g,"");
						if(!isNaN(parseInt(v)))
							newValue[i] = newValue[i].replace(v, genomes[parseInt(v)].abbrev);
					}
					newValue = newValue.join(",");

					return "<span style='color:#d00; margin-left:10px;width:100px;display:inline-block;'>(" + count + " item)</span>" + newValue;
				}
				else */if(group.getKey() == "cod") {
					if(value.indexOf("0") == -1) {
						return "<span style='color:#d00; margin-left:10px;width:100px;display:inline-block;'>(" + count + " item)</span><span style='color:#d00;margin-left: 0px;'>Core-genome</span>";
					}
					var newValue = "";
					for(var i = 0; i < value.length; i++)
						if(value.charAt(i)=="1")
							newValue += ", " + genomes[i].abbrev;
					return "<span style='color:#d00; margin-left:10px;width:100px;display:inline-block;'>(" + count + " item)</span>" + newValue.substring(2);
				}
				return "<span style='color:#d00; margin-left:10px;width:100px;display:inline-block;'>(" + count + " item)</span>" + value;
			},
		});
		this.table.setData(this.data);
		this.table.setGroupStartOpen(false);

        this.tableHolder = this.div.querySelector(".tabulator-tableHolder");
        this.div.onscroll = () => {
            this.subPages.activeSubPage.scrollLeft = this.tableHolder.scrollLeft;
            this.subPages.activeSubPage.scrollTop = this.tableHolder.scrollTop;
		};
		
		this.div.querySelector("#download-csv").onclick = () =>  {this.table.download("csv", "data.csv");};
		this.div.querySelector("#download-json").onclick = () => {this.table.download("json", "data.json");};
		this.div.querySelector("#download-xlsx").onclick = () => {this.table.download("xlsx", "data.xlsx", {sheetName:"MyData"});};

		this.div.querySelector("#downloadAbMatrixGenome").onclick = () => {this.downloadAbMatrix(false);};
		if(gs.length > 0) {
			let menu = this.div.querySelector("#menuAbMatrix");
			let divider = document.createElement("div");
			divider.classList.add("divider");
			menu.appendChild(divider);

			let header = document.createElement("div");
			header.classList.add("header");

			let icon = document.createElement("i");
			icon.classList.add("folder");
			icon.classList.add("icon");
			header.appendChild(icon);
			//header.innerText = " Groups";
			
			let text = document.createElement("span");
			text.innerText =" Groups";
			header.appendChild(text);
			
			menu.appendChild(header);
			for (let i = 0; i < gs.length; i++) {
				const group = gs[i];

				var downloadAbMatrixGroup = document.createElement("div");
				downloadAbMatrixGroup.classList.add("item");
				downloadAbMatrixGroup.innerText = group.name;
				downloadAbMatrixGroup.onclick = () => {
					let index = i;
					this.downloadAbMatrix(false, index);
				}
				menu.appendChild(downloadAbMatrixGroup);
			}
		}

		this.div.querySelector("#downloadDistanceMatrixEuclidian").onclick = () => {this.downloadDistanceMatrix(true);};
		this.div.querySelector("#downloadDistanceMatrixManhattan").onclick = () => {this.downloadDistanceMatrix(false);};

		this.div.querySelector("#downloadCharMatrix").onclick = () => {this.downloadCharMatrix();};

		this.div.querySelector("#downloadRoary").onclick = () => {this.downloadRoary();};

		this.div.querySelector("#clearFilters").onclick = () => {this.table.clearFilter();this.setBaseFilter()};
		this.div.querySelector("#clearHeaderFilters").onclick = () => {this.table.clearHeaderFilter();};
		
		this.div.querySelector("#groupTableClear").onclick = () => {this.groupTable(null);};
		this.div.querySelector("#groupTableKey").onclick = () => {this.groupTable('key');};
		this.div.querySelector("#groupTableFunc").onclick = () => {this.groupTable('func');};
		this.div.querySelector("#groupTableNumFunc").onclick = () => {this.groupTable('numFunc');};
		this.div.querySelector("#groupTableSeqs").onclick = () => {this.groupTable('seqs');};
		this.div.querySelector("#groupTableGens").onclick = () => {this.groupTable('gens');};
		this.div.querySelector("#groupTableParas").onclick = () => {this.groupTable('paras');};
		this.div.querySelector("#groupTablePhylo").onclick = () => {this.groupTable('phylo');};
		this.div.querySelector("#groupTableCod").onclick = () => {this.groupTable('cod');};
					
		this.columnList = this.makeTree(this.div.querySelector("#sidebarColumnsList"), this.table.getColumnDefinitions(), true);
		this.genomeList = this.createSidebarGenomeList();
		this.div.querySelector("#filterSidebarGenomesList1").onclick = () => {this.filterSidebarGenomeList();};
		this.div.querySelector("#filterSidebarGenomesList2").onclick = () => {this.filterSidebarGenomeList();};
		this.loadPage();
	}

    getClearPage() {
		let cod = '';
		for (let i = 0; i < genomes.length; i++) {
			cod += '?';
		}
		
		let gs = [];
		for (let i = 0; i < gs.length; i++) {
			gs.push(false);
		}

		let dataset = "h";

        return {
			title: '',
			global: {
				cod: cod,
				gs: gs,
				dataset: "h",
				all: true,
				vertical: false,
			},
			invisibleColumns: [],
			cod: cod,
            scrollTop: 0,
            scrollLeft: 0,
			sorters: [],
			headFilters: [],
			groupColumn: '',
        };
	}

    loadPage(args) {
        if(!this.created)
            this.createPage();

		if(args != undefined) {
			this.subPages.activeSubPage.global = args;
			this.subPages.activeSubPage.cod = args.cod;
			this.subPages.activeSubPage.invisibleColumns = [];
			for (let i = 0; i < gs.length; i++) {
				if(!args.gs[i]) {
					for (let j = 0; j < gs[i].childs.length; j++) {
						this.subPages.activeSubPage.invisibleColumns.push("rg" + i + ".g" + j + ".c1");
						this.subPages.activeSubPage.invisibleColumns.push("rg" + i + ".g" + j + ".c2");
						this.subPages.activeSubPage.invisibleColumns.push("rg" + i + ".g" + j + ".c3");
						this.subPages.activeSubPage.invisibleColumns.push("rg" + i + ".g" + j + ".c4");
						this.subPages.activeSubPage.invisibleColumns.push("rg" + i + ".g" + j + ".c5");
						this.subPages.activeSubPage.invisibleColumns.push("rg" + i + ".g" + j + ".c6");
						this.subPages.activeSubPage.invisibleColumns.push("rg" + i + ".g" + j + ".c7");
						this.subPages.activeSubPage.invisibleColumns.push("rg" + i + ".g" + j + ".c8");

					}
				}

			}
		}
		let page = JSON.parse(JSON.stringify(this.subPages.activeSubPage));
		
		this.table.clearFilter();
		this.setBaseFilter();
		
		this.columnList.forEach(column => {
			if(page.invisibleColumns.includes(column.field) == $(column.checkbox).checkbox("is checked")) {
				$(column.checkbox).checkbox("toggle");
			}
		});

		for (let i = 0; i < genomes.length; i++) {
			if(page.global.cod[i] != '?') {
				$(this.genomeList[i].dropdown).dropdown('set selected', page.global.cod[i]);
				this.genomeList[i].dropdown.classList.add('disabled');
			}
			else {
				this.genomeList[i].dropdown.classList.remove('disabled');
				if(page.cod[i] != '?')
					$(this.genomeList[i].dropdown).dropdown('set selected', page.cod[i]);
				else 
					$(this.genomeList[i].dropdown).dropdown('clear');
			}
		}

		this.table.clearHeaderFilter();
		page.headFilters.forEach(el => {
			this.table.setHeaderFilterValue(el.column, el.value);
		});
		this.table.setSort(page.sorters);
        this.table.setGroupBy(page.groupColumn);

        this.tableHolder.scrollLeft = this.subPages.activeSubPage.scrollLeft;
		this.tableHolder.scrollTop = this.subPages.activeSubPage.scrollTop;
		
		setURL('page=table');
		this.changeURL();
	}
	
	setBaseFilter() {
		if(this.subPages.activeSubPage.global.dataset == 'h')
			this.table.setFilter('dataset', '=', 'h');
		else if(this.subPages.activeSubPage.global.dataset == 'o') {
			if(this.subPages.activeSubPage.global.all) {
				this.table.setFilter('dataset', 'in', ['h','o']);
				this.table.addFilter('datasetOrthos', '!=', true);
			}
			else
				this.table.setFilter('dataset', '=', 'o');
		}
		else if(this.subPages.activeSubPage.global.dataset == 'd') {
			if(this.subPages.activeSubPage.global.all) {
				this.table.setFilter('dataset', 'in', ['h','d']);
				this.table.addFilter('datasetDoms', '!=', true);
			}
			else
				this.table.setFilter('dataset', '=', 'd');
		}
		else if(this.subPages.activeSubPage.global.dataset == 'e') {
			if(this.subPages.activeSubPage.global.all) {
				this.table.setFilter('dataset', '=', 'h');
				this.table.addFilter('gens', '=', 1);
			}
		}

		let totalFilter = [];
		for(var i = 0; i < this.subPages.activeSubPage.cod.length; i++)
			if(this.subPages.activeSubPage.cod[i] != '?' && 
				this.subPages.activeSubPage.cod[i] != '1' && 
				this.subPages.activeSubPage.cod[i] != '0' && 
				this.subPages.activeSubPage.cod[i] != '*')
				totalFilter[this.subPages.activeSubPage.cod[i]] = 0;

		let cod = this.subPages.activeSubPage.cod;
		let phylo = this.subPages.activeSubPage.phylo;
		this.table.addFilter((data, filterParams) => {
			let count = 0;
			for(let i = 0; i < cod.length; i++) {
				if(cod[i] == '?') {
					if(data.cod[i] == '1')
						count++;
				}
				else if(cod[i] == '1') {
					if(data.cod[i] != '1')
						return false;
					count++;
					
				}
				else if(cod[i] == '0') {
					if(data.cod[i] != '0')
						return false;
				}
				else if(cod[i] == '0') {
					if(data.cod[i] != '0')
						return false;
				}
				else if(cod[i] == '*') {
					if(item.cod[i] == '1') {
						item.gens -= 1;
						item.seqs -= item.fam[i].length;
						item.paras = item.seqs - item.gens;
						for(let j = 0; j < requestGs.length; j++) {
							if(requestGs[j]) {
								let type = item["rg"+j]["g" + genomes[i].rg[j]];
								type.c3 -= item.fam[i].length;
								type.c4 = type.c3/item.seqs;
								type.c5 -= 1;
							}
						}
					}
				}
				else {
					if(data.cod[i] == '1')
						totalFilter[cod[i]]++;
				}
			}
			
			if(count == 0)
				return false;
			for(var key in totalFilter)
				if(totalFilter[key] == 0)
					return false;
			if(phylo != null && item.phylo != phylo)
				return false;
			return true;
		});
	}

    clearPage() {
        this.table.setGroupBy('');
        this.table.clearSort();
        this.table.clearFilter();
		this.table.clearHeaderFilter();
		
		this.setBaseFilter();
    }

    updateSorter() {
        if(this.table != undefined && this.table != null) {
            this.subPages.activeSubPage.sorters = [];
            this.table.getSorters().forEach(el => {
                this.subPages.activeSubPage.sorters.push({column: el.field, dir: el.dir});
			});
			this.changeURL();
        }
    }

    updateFilter() {
        if(this.table != undefined && this.table != null) {
			this.subPages.activeSubPage.headFilters = [];
            this.table.getHeaderFilters().forEach(el => {
                this.subPages.activeSubPage.headFilters.push({column: el.field, value: el.value});
            });
			this.changeURL();
		}
	}
	
	downloadAbMatrix(showFunction, group) {
		let download = '"Genes"';
		if(showFunction)
			download += ',"Function"';
		if(group == null) {
			for(var i = 0; i < genomes.length; i++) {
				//if(cod[i] != '*')
					download += ',"' + genomes[i].name + '"';
			}
		}
		else {
			for(var i = 0; i < gs[group].childs.length; i++) {
				download += ',"' + gs[group].childs[i].name + '"';
			}
			
		}
		download += '\n';

		let page = this.subPages.activeSubPage;
		let rows = this.table.getRows(true);
		rows.forEach(function(row){
			if(showFunction)
				download += '"' + row.getData().key + '","' + row.getData().func + '"';
			else
				download += '"' + row.getData().key + '"';
			if (group == null) {
				for(let i = 0; i < genomes.length; i++)
					if(page.cod[i] != '*')
						download += ',' + row.getData().cod[i];
				download += '\n';
			}
			else {
				let sum = [];
				for(var i = 0; i < gs[group].childs.length; i++)
					sum.push(0);
				for(var i = 0; i < genomes.length; i++)
					if(page.cod[i] != '*' && row.getData().cod[i] == '1')
						sum[genomes[i].rg[group]] = 1;
				for(var i = 0; i < gs[group].childs.length; i++)
					download += ',' + sum[i];
				download += '\n';
			}
		});
		downloadFile("abMatrix.csv", download);
	}

	downloadCharMatrix() {
		var download = '';//'"Genes"';
		var matrix = [];
		for(var i = 0; i < genomes.length; i++)
			matrix.push('');

		var rows = this.table.getRows(true);
		rows.forEach(function(row){
			for(var i = 0; i < genomes.length; i++)
				matrix[i] += row.getData().cod[i];
		});
		for(var i = 0; i < genomes.length; i++) 
			if(this.subPages.activeSubPage.cod[i] != '0' && this.subPages.activeSubPage.cod[i] != '*')
				download += '"' + genomes[i].name + '"\t' + matrix[i] + '\n';
		downloadFile("charMatrix.txt", download);
	}


	downloadDistanceMatrix(euclidean) {
		let matrix = [];
		for(var i = 0; i < genomes.length; i++) {
			var vet = [];
			for(var j = 0; j < genomes.length; j++) {
				vet.push(0);
			}
			matrix.push(vet);
		}

		let rows = this.table.getRows(true);
		rows.forEach(function(row){
			var vet = row.getData().cod.split('');
			for(var i = 0; i < genomes.length; i++) {
				for(var j = i+1; j < genomes.length; j++) {
					if(vet[i] != vet[j])
						matrix[i][j] += 1;
				}
			}
		});

		var download = '';
		for(var i = 0; i < genomes.length; i++) {
			if(this.subPages.activeSubPage.cod[i] != '*')
				download += ',"' + genomes[i].name + '"';
		}
		download += '\n'; 
		
		for(var i = 0; i < genomes.length; i++) {
			if(this.subPages.activeSubPage.cod[i] != '*') {
				download += '"' + genomes[i].name + '"';
				for(var j = 0; j < genomes.length; j++) {
					if(this.subPages.activeSubPage.cod[j] != '*' ) {
						if(euclidean)
							download += ',' + Math.sqrt(matrix[i][j] + matrix[j][i]);
						else
							download += ',' + (matrix[i][j] + matrix[j][i]);
					}
				}
				download += '\n';
			}
		}
		downloadFile("distMatrix.csv", download);
	}

	roaryOutputs() {
		let result = {
			numConservGene: "",
			numPanGene: "",
			numUniqueGene: "",
			numNewGene: ""
		};
		let numGenOuts = 0;
		for(var i = 0; i < genomes.length; i++) {
			if(this.subPages.activeSubPage.cod[i] == '0')
				numGenOuts++;
		}
		for(let rep = 0; rep < 10; rep++) {
			for(let i = 1; i <= genomes.length-numGenOuts; i++) {
				let set = [];
				for(let j = 0; j < genomes.length; j++) {
					set.push(false);
				}
				let last = 0;
				for(let j = 0; j < i; j++) {
					let x = Math.floor(Math.random() * genomes.length);
					if(set[x] == false && this.subPages.activeSubPage.cod[x] != "0") {
						set[x] = true;
						last = x;
					}
					else
						j--;
				}
				let localCod = "";
				for(let j = 0; j < genomes.length; j++) {
					localCod += (set[j]?"1":"?");
				}
				var rows = this.table.getRows(true);
				var sumNumConservGene = 0;
				var sumNumPanGene = 0;
				var sumNumUniqueGene = 0;
				var sumNumNewGene = 0;
				for(var j = 0; j < rows.length; j++) {
					var okNumConservGene = true;
					var okNumPanGene = false;
					var okNumUniqueGene = 0;
					for(var k = 0; k < genomes.length; k++) {
						if(localCod[k] != "?" && localCod[k] != rows[j].getData().cod[k])
							okNumConservGene = false;
						if(localCod[k] == rows[j].getData().cod[k])
							okNumPanGene = true;
						if(localCod[k] == rows[j].getData().cod[k])
							okNumUniqueGene++;
					}
					if(okNumConservGene)
						sumNumConservGene++;
					if(okNumPanGene)
						sumNumPanGene++;
					if(okNumUniqueGene == 1){
						sumNumUniqueGene++;
						if(rows[j].getData().cod[last] == "1")
							sumNumNewGene++;
					}
				}
				result.numConservGene += sumNumConservGene + "\t";
				result.numPanGene += sumNumPanGene + "\t";
				result.numUniqueGene += sumNumUniqueGene + "\t";
				result.numNewGene += sumNumNewGene + "\t";
			}
			result.numConservGene += "\n";
			result.numPanGene += "\n";
			result.numUniqueGene += "\n";
			result.numNewGene += "\n";
		}
		result.numConservGene = result.numConservGene.replace(/\t\n/g, '\n');
		result.numPanGene = result.numPanGene.replace(/\t\n/g, '\n');
		result.numUniqueGene = result.numUniqueGene.replace(/\t\n/g, '\n');
		result.numNewGene = result.numNewGene.replace(/\t\n/g, '\n');
		return result;
	}

	arrayAvg(array) {
		let sum = 0;
		for(let i = 0; i < array.length; i++)
			sum += array[i];
		return sum/array.length;
	}

	roaryAbGenes() {
		let result = '"Gene","Non-unique Gene name","Annotation","No. isolates","No. sequences","Avg sequences per isolate","Genome Fragment","Order within Fragment","Accessory Fragment","Accessory Order with Fragment","QC","Min group size nuc","Max group size nuc","Avg group size nuc"';
		for(var i = 0; i < genomes.length; i++)
			result += ',"' + genomes[i].abbrev + '"';
		result += '\n';
		let rows = this.table.getRows(true);
		for(var i = 0; i < rows.length; i++) {
			let data = rows[i].getData();
			result += '"' + data.key + '","","' + data.func + '","' + data.gens + '","' + data.seqs + '","' + (data.seqs/data.gens).toFixed(2) + '","1","1","1","1","","' + data.lens[0] + '","' + data.lens[data.lens.length-1] + '","' + this.arrayAvg(data.lens) + '"';
			for(var j = 0; j < genomes.length; j++) {
				result += ',"';
				for(var k = 0; k < data.fam[j].length; k++) {
					if(k > 0)
						result += '\t';
					result += data.fam[j][k];
				}
				result += '"';
			}
			result += '\n';
		}
		return result;
	}

	arrayAvg(array) {
		var sum = 0;
		for(var i = 0; i < array.length; i++)
			sum += array[i];
		return sum/array.length;
	}


	downloadRoary() {
		var result = this.roaryOutputs();
		var zip = new JSZip();
		zip.file("number_of_conserved_genes.Rtab", result.numConservGene);
		zip.file("number_of_genes_in_pan_genome.Rtab", result.numPanGene);
		zip.file("number_of_new_genes.Rtab", result.numUniqueGene);
		zip.file("number_of_unique_genes.Rtab", result.numNewGene);
		zip.file("gene_presence_absence.csv", this.roaryAbGenes());
		zip.generateAsync({type:"blob"}).then(
			function (blob) {
				saveAs(blob, "roary_output.zip");
			}, 
			function (err) {
			}
		);
	}

	createSidebarGenomeList() {
		let result = [];

		let divList = this.div.querySelector("#sidebarGenomesList");
		for (let i = 0; i < genomes.length; i++) {
			const genome = genomes[i];

			let line = document.createElement("div");
			line.classList.add("line");

			let span = document.createElement("span");
			span.innerText = genome.abbrev;
			line.appendChild(span);

			let dropdown = document.createElement("div");
			dropdown.classList.add("ui");
			dropdown.classList.add("inverted");
			dropdown.classList.add("selection");
			dropdown.classList.add("fluid");
			dropdown.classList.add("dropdown");
			dropdown.classList.add("clearable");
			dropdown.classList.add("obj");
			dropdown.innerHTML = '<input type="hidden">'+
				'<i class="dropdown icon"></i>'+
				'<div class="default text"><i class="x icon"></i> Not filter</div>'+
				'<div class="menu">'+
				'	<div class="item" data-value="*"><i class="info icon"></i> Ignore</div>'+
				'	<div class="item" data-value="0"><i class="thumbs down icon"></i> Must not have</div>'+
				'	<div class="item" data-value="1"><i class="thumbs up icon"></i> Must have</div>'+
				'</div>';
			line.appendChild(dropdown);
			divList.appendChild(line);

			result.push({genome: i, dropdown:dropdown});
		}

		$('.ui.dropdown.clearable').dropdown({clearable: true});
		$(this.div.querySelector("#sidebarGenomesFilterAll")).dropdown('setting', 'onChange', (value) => {
			if(value == '') {
				result.forEach(item => {
					if(!item.dropdown.classList.contains('disabled')) {
						$(item.dropdown).dropdown("clear");
					}
				});
			}
			else {
				result.forEach(item => {
					if(!item.dropdown.classList.contains('disabled')) {
						$(item.dropdown).dropdown("set selected", value);
					}
				});
			}
		});
		return result;
	}

	fixedSidebarGenomeList() {
		for (let i = 0; i < genomes.length; i++) {
			let value = this.subPages.activeSubPage.global.cod[i];
			if(value != "?") {
				$(this.genomeList[i].dropdown).dropdown('set selected', value);
				this.genomeList[i].dropdown.classList.add('disabled');
			}
			else
				this.genomeList[i].dropdown.classList.remove('disabled');
		}
	}

	filterSidebarGenomeList() {
		let cod = '';
		for (let i = 0; i < genomes.length; i++) {
			let value = $(this.genomeList[i].dropdown).dropdown('get value');
			if(this.subPages.global.cod[i] != '?')
				value = this.subPages.global.cod[i];
			else if(value == '')
				value += '?';
			cod += value;
		}

		this.subPages.activeSubPage.cod = cod;
		this.setBaseFilter();
		this.changeURL();
	}
	
	makeTree(root, columns, isRoot) {
		if(columns == null || columns.length == 0)
			return null;

		let vet = [];
		
		let list = root;
		if(!isRoot) {
			list = document.createElement("div");
			list.classList.add("list");
			root.appendChild(list);
		}
		for(var i = 0; i < columns.length; i++) {
			if(columns[i].title != "") {
				let item = document.createElement("div");
				item.classList.add("item");
				
				let checkbox = document.createElement("div");
				checkbox.classList.add("ui");
				if(isRoot)
					checkbox.classList.add("root");
				else
					checkbox.classList.add("child");
				checkbox.classList.add("inverted");
				checkbox.classList.add("checkbox");
				let field = columns[i].field;
				if(columns[i].columns != undefined)
					checkbox.onChangeVibility = null;
				else
					checkbox.onChangeVibility = () => {
						let column = field;
						let component = this.table.getColumn(column);
						this.subPages.activeSubPage.invisibleColumns = 
						this.subPages.activeSubPage.invisibleColumns.remove(
							this.subPages.activeSubPage.invisibleColumns.indexOf(column)
						);
						console.log(this.subPages.activeSubPage.invisibleColumns.indexOf(column));
						if($(checkbox).checkbox('is checked')) {
							console.log('+' + column);
							component.show();
						}
						else {
							console.log('-' + column);
							component.hide();
							this.subPages.activeSubPage.invisibleColumns.push(column);
						}
					}
					
				let input = document.createElement("input");
				input.setAttribute('type', 'checkbox');
				this.subPages.activeSubPage.invisibleColumns.remove(this.subPages.activeSubPage.invisibleColumns.indexOf(field));
				if(columns[i].visible == undefined || columns[i].visible == null || columns[i].visible == true) {
					input.checked = true;
				}
				else if(columns[i].columns == undefined)
					this.subPages.activeSubPage.invisibleColumns.push(field);
				
				let label = document.createElement("label");
				label.innerText = columns[i].title;
				
				checkbox.appendChild(input);
				checkbox.appendChild(label);
				item.appendChild(checkbox);
				list.appendChild(item);
				
				if(columns[i].columns == undefined)
					vet.push({field: field, checkbox: checkbox});
				else {
					let result = this.makeTree(item, columns[i].columns, false);
					if(result != null)
					vet = vet.concat(result);
				}
			}
		}

		if(isRoot){
			window.lockColumnListUp = false;
			window.lockColumnListDown = false;

			$('.list .root.checkbox').checkbox({
				onChecked: function() {
					window.lockColumnList = true;
					var $childCheckbox  = $(this).closest('.checkbox').siblings('.list').find('.checkbox');
					$childCheckbox.checkbox('check');
					window.lockColumnList = false;
					console.log(this.parentNode);
					window.testeObj = this.parentNode;
					if(this.parentNode.onChangeVibility != null)
						this.parentNode.onChangeVibility();
				}, 
				onUnchecked: function() {
					this.lockColumnList = true;
					var	$childCheckbox  = $(this).closest('.checkbox').siblings('.list').find('.checkbox');
					$childCheckbox.checkbox('uncheck');
					window.lockColumnList = false;
					console.log(this.parentNode);
					window.testeObj = this.parentNode;
					if(this.parentNode.onChangeVibility != null)
						this.parentNode.onChangeVibility();
				},
			});
		
			$('.list .child.checkbox').checkbox({
				fireOnInit : false,
				onChange   : function() {
					let owner = false;
					if(!window.lockColumnListUp && !window.lockColumnListDown) {
						window.lockColumnListDown = true;
						owner = true;
					}
					
					if(!window.lockColumnListUp) {
						let $listGroup      = $(this).closest('.list');
						let $parentCheckbox = $listGroup.closest('.item').children('.checkbox');
						let $checkbox       = $listGroup.find('.checkbox');
						let allChecked      = true;
						let allUnchecked    = true;
						
						$checkbox.each(function() {
							if($(this).checkbox('is checked')) {
								allUnchecked = false;
							}
							else {
								allChecked = false;
							}
						});
						if(allChecked) {
							$parentCheckbox.checkbox('set checked');
						}
						else if(allUnchecked) {
							$parentCheckbox.checkbox('set unchecked');
						}
						else {
							$parentCheckbox.checkbox('set indeterminate');
						}
					}
	
					window.testeObj = this.parentNode;
					if(owner) {
						window.lockColumnListDown = false;
						window.lockColumnListUp = true;
					}
					if(!window.lockColumnListDown) {
						var $childCheckbox  = $(this).closest('.checkbox').siblings('.list').find('.checkbox');
						if($(this.parentNode).checkbox('is checked'))
							$childCheckbox.checkbox('set checked');
						else if($(this.parentNode).checkbox('is unchecked'))
							$childCheckbox.checkbox('set unchecked');
					}

					if(this.parentNode.onChangeVibility != null)
						this.parentNode.onChangeVibility();
	
					if(owner) {
						window.lockColumnListUp = false;
					}
					return true;
				}
			});
		}
		return vet;

	};

	groupTable(field) {
        let groupBy=field;
        if(field == null)
            this.table.setGroupBy('');
        else {
            this.table.setGroupBy(field);
            this.table.setSort([{column:'sortGroupColumn', dir:'asc'}]);
		}
		this.subPages.activeSubPage.groupColumn = field;
		this.changeURL();
	}

	save() {
		return this.subPages;
	}

	changeURL() {
        let url = "page=table";
        let page = this.subPages.activeSubPage;
        if(page.headFilters.length > 0)
            url += '&headFilters=' + JSON.stringify(page.headFilters);
        if(page.groupColumn.length > 0)
            url += '&groupColumn=' + JSON.stringify(page.groupColumn);
        if(page.sorters.length > 0)
			url += '&sorters=' + JSON.stringify(page.sorters);
		url += '&global=' + JSON.stringify(page.global);
        changeURL(url, {guid: page.guid});
    }
}