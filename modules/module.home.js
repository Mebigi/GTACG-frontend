class Home {
    constructor() {
		this.div = document.getElementById('pageHome');
		$(this.div.querySelector("#view")).dropdown("set selected","h");
		$(this.div.querySelector("#dataset")).dropdown("set selected","h");
		$(this.div.querySelector("#datasetAll")).css("display", "none");
		$(this.div.querySelector("#datasetAll")).checkbox("set checked")

		
		this.createGenomeFilter();
		this.createRgFilter();
		this.updateTotalFamiliesGenomeTrigger = true;
		this.updateTotalFamiliesGenome();

		this.div.querySelector("#makeCustomRg").onclick = () => {
			this.createCustomRgFilter();
		}

		this.div.querySelector("#dataset").onchange = () => {this.changeDataset();};
		this.div.querySelector("#datasetAll").onchange = () => {this.changeDataset();};

		this.div.querySelector("#linkTable").onclick = () => {this.linkToTable(false,null);};
		this.div.querySelector("#linkFamilyList").onclick = () => {session.changePage('familyList');};
		this.div.querySelector("#linkBlast").onclick = () => {session.changePage('blast');};

		this.div.querySelector("#linkTableFilter").onclick = () => {
			if($(this.div.querySelector('#tabsGenomes')).hasClass('active')) 
				this.linkToTable(true); 
			else if($(this.div.querySelector('#tabSegRgCustom')).hasClass('active')) 
				this.linkToTableRg(-1);
			else {
				for(var i = 0; i < gs.length; i++) 
					if($(this.div.querySelector('#tabSegRg'+i)).hasClass('active')) 
						this.linkToTableRg(i);
			}
		}

		this.div.querySelector("#treeType").onchange = () => {this.createTree();};
		this.createTree();
	}

	changeDataset() {
		let dataset = $(this.div.querySelector("#dataset")).dropdown("get value");
		if(dataset == "o" || dataset == "d")
			this.div.querySelector("#datasetAll").style.display = "block";
		else
			this.div.querySelector("#datasetAll").style.display = "none";

		var data = null;
		if(dataset == "h")
			data = statRg.homo;
		else if(dataset == "d")
			data = statRg.doms;
		else if(dataset == "o")
			data = statRg.orthos;

		for (let i = 0; i < gs.length; i++) {
			this.tabsRg[i].clearData();
			this.tabsRg[i].setData(data[i]);
			this.tabsRg[i].clearFilter();
			if (this.div.querySelector("#datasetAll").style.display == "none" || !$(this.div.querySelector("#datasetAll")).checkbox("is checked"))
				this.tabsRg[i].setFilter("all", "=", "f");
		}
		this.updateTotalFamiliesGenome();
	}


	createGenomeFilter() {
        let tabGenomeColumns = [
			{title:"Filter Genomes", field:"select", width:180,formatter:this.dropdownFilter, formatterParams:{module: this}, titleFormatter: this.dropdownFilterHeader, titleFormatterParams:{module: this}, align:"center", headerSort:false, columnVertAlign:"bottom",cssClass:"overflowInitial"},
			{title:"Genome Name", field:"name", headerFilter:true, headerFilterFunc:alphFilter, headerFilterPlaceholder:"Alphabetical Filter", bottomCalc:diffCalcs},
			{title:"Abbreviation", field:"abbrev", headerFilter:true, headerFilterFunc:alphFilter, headerFilterPlaceholder:"Alphabetical Filter", bottomCalc:diffCalcs},
		];
		for (let j = 0; j < gs.length; j++) { 
			tabGenomeColumns.push({
				title:gs[j].name, columns: [
					{title:"Type", field:"rg"+j, headerFilter:true, headerFilterFunc:alphFilter, headerFilterPlaceholder:"Alphabetical Filter", bottomCalc:diffCalcs},
					{field:"rg"+j+"color", headerFilter:false, sorter: false, formatter:this.colorPicker, formatterParams:{gsId: j,module: this}, width:75, cssClass:"overflowInitial"},
				]});
        }
        this.setTimeoutTabFiltered = null;
		this.tabGenomes = new Tabulator(this.div.querySelector("#tabGenomes"), {
			movableRows: false,
			virtualDom:false,
			layout:"fitDataFill",
			columns: tabGenomeColumns,
			selectable: true,
            rowSelected:(row) => {
                let vet = [];
                this.tabGenomes.getSelectedRows().forEach(function(row) {
                    vet.push(row.getData().abbrev);
				});
                this.updateSelection(vet, 0);
            },
            rowDeselected:(row) => {
                let vet = [];
                this.tabGenomes.getSelectedRows().forEach(function(row) {
                    vet.push(row.getData().abbrev);
                });
                this.updateSelection(vet, 0);
            },
			dataFiltered:(filters, rows) => {
				this.updateTotalFamiliesGenome();
			},
        });
        
        this.tabGenomesData = [];
		this.tabGenomesFilters = [];
		for (let i = 0; i < genomes.length; i++) {
			let genome = {name:genomes[i].name, abbrev:genomes[i].abbrev, id:i};
			//genome.select = genomeSelection.replace(/###/g, i);
			genome.select = '';
			this.tabGenomesFilters.push("");
			for (var j = 0; j < gs.length; j++) {
				genome["rg" + j] = gs[j].childs[genomes[i].rg[j]].name;
				genome["rg" + j + "color"] = gs[j].childs[genomes[i].rg[j]].color;
			}
			this.tabGenomesData.push(genome);
		}
		this.tabGenomes.setData(this.tabGenomesData);
	}

	dropdownFilter(cell, formatterParams, onRendered) {
		onRendered(function(){
			let genomeSelection = 
				'	<input type="hidden">' +
				'	<i class="dropdown icon"></i>' +
				'	<div class="default text"><i class="x icon"></i> Not filter</div>' +
				'	<div class="menu">' +
				'		<div class="item" data-value="*"><i class="info icon"></i> Ignore</div>' +
				'		<div class="item" data-value="0"><i class="thumbs down icon"></i> Must not have</div>' +
				'		<div class="item" data-value="1"><i class="thumbs up icon"></i> Must have</div>' +
				'	</div>';

			let div = cell.getElement().querySelector('.ui.dropdown');
			if(div == null) {
				div = document.createElement("div");
				div.style.overflow = 'initial';
				div.classList.add('ui');
				div.classList.add('fluid');
				div.classList.add('dropdown');
				div.classList.add('selection');
				div.classList.add('clearable');
				div.innerHTML = genomeSelection;
				
				cell.getElement().appendChild(div);
				$(div).dropdown({clearable: true});
			}
			$(div).dropdown("set selected", cell.getValue());
			div.onchange = () => {
				cell.getData().select = $(div).dropdown("get value");
				formatterParams.module.updateTotalFamiliesGenome();
			}
		});
	}

	dropdownFilterHeader(cell, formatterParams, onRendered) {
		cell.getElement().innerHTML = 'Filter Genomes<br>';

		let iconX = document.createElement("i");
		iconX.classList.add('x');
		iconX.classList.add('icon');
		iconX.onclick = () => {formatterParams.module.updateTotalFamiliesGenome('')};

		let iconI = document.createElement("i");
		iconI.onclick = () => {formatterParams.module.updateTotalFamiliesGenome('*')};
		iconI.classList.add('info');
		iconI.classList.add('icon');
		iconI.style.margin = '0.5em';

		let icon0 = document.createElement("i");
		icon0.onclick = () => {formatterParams.module.updateTotalFamiliesGenome('0')};
		icon0.classList.add('thumbs');
		icon0.classList.add('down');
		icon0.classList.add('icon');
		icon0.style.margin = '0.5em';
		
		let icon1 = document.createElement("i");
		icon1.onclick = () => {formatterParams.module.updateTotalFamiliesGenome('1')};
		icon1.classList.add('thumbs');
		icon1.classList.add('up');
		icon1.classList.add('icon');
		icon1.style.margin = '0.5em';
		
		//cell.getElement().appendChild(span);
		cell.getElement().appendChild(iconX);
		cell.getElement().appendChild(iconI);
		cell.getElement().appendChild(icon0);
		cell.getElement().appendChild(icon1);
	}

	colorPicker(cell, formatterParams, onRendered) {
		onRendered(function(){
			let input = cell.getElement().querySelector('input');
			if(input == null) {
				input = document.createElement("input");
				input.classList.add('jscolor');
				input.value = cell.getValue();
				input.style.width = '65px';
				cell.getElement().appendChild(input, {notation: 'hex'});

				var hue = new Huebee(input);
				hue.on('change', (color, hue, sat, lum) => {
					let genomeId = cell.getData().id;
					let gsId = formatterParams.gsId;

					gs[gsId].childs[genomes[genomeId].rg[gsId]].color = color;
					formatterParams.module.tabGenomes.getRows().forEach(row => {
						if(genomes[row.getData().id].rg[gsId] == genomes[genomeId].rg[gsId]) {
							row.getCell('rg' + gsId + 'color').setValue(color);
							row.reformat();
						}
					});
					session.pageHome.divPhylogeny.style();
					session.pageHome.divPhylogeny.showMetadata();
				});

				/*var pickr = Pickr.create({
					el: input,
				
					components: {
				
						// Main components
						preview: true,
						opacity: true,
						hue: true,
				
						// Input / output Options
						interaction: {
							hex: true,
							rgba: true,
							hsla: true,
							hsva: true,
							cmyk: true,
							input: true,
							clear: true,
							save: true
						}
					}
				});*/
				
				//new jscolor(input);
			}
			/*$(div).dropdown("set selected", cell.getValue());
			div.onchange = () => {
				cell.getData().select = $(div).dropdown("get value");
				formatterParams.module.updateTotalFamiliesGenome();
			}*/
		});
	}
	

	setAllFilters(rgI, value) {
		if(rgI == -1) {
			let columns = this.tableCustom.getColumnDefinitions();
			for(let i = 1; i < columns.length; i++)
				tableCustom.setHeaderFilterValue(columns[i].field, value);
		}
		else {
			let columns = this.tabsRg[rgI].getColumnDefinitions();
			for(let i = 1; i < columns.length; i++)
				this.tabsRg[rgI].setHeaderFilterValue(columns[i].field, value);
		}
	}


	updateTotalFamiliesGenome(change) {
		if(change != undefined) {
			let func = (selected) => {
				this.updateTotalFamiliesGenomeTrigger = false;
				let rows = this.tabGenomes.getRows(false);
				for (let i = 0; i < genomes.length; i++) {
					rows[i].getData().select = change;
					if(!selected || rows[i].isSelected()) {
						if(change == "") {
							$(rows[i].getCell('select').getElement().querySelector('.ui.dropdown')).dropdown("clear", change);
						}
						else {
							$(rows[i].getCell('select').getElement().querySelector('.ui.dropdown')).dropdown("set selected", change);
						}
					}
				}
				this.updateTotalFamiliesGenomeTrigger = true;
			}


			
			if(this.tabGenomes.getSelectedRows().length > 0) {
				$('#filterGenomesModal').modal({
					closable  : false,
					onDeny    : function(){
						func(false);
					},
					onApprove : function() {
						func(true);
					}
				}).modal('show');
			}
			else 
				func(false);

		}
		if(!this.updateTotalFamiliesGenomeTrigger)
			return;

		if($(this.div.querySelector("#dataset")).dropdown("get value") == "h")
			name = "families";
		else if($(this.div.querySelector("#dataset")).dropdown("get value") == "d")
			name = "domains";
		else if($(this.div.querySelector("#dataset")).dropdown("get value") == "o")
			name = "orthologs";
		if(name != "")
		this.div.querySelector("#totalFamiliesGenome").innerText = this.totalGenomes(this.getGenomeCod(), $(this.div.querySelector("#dataset")).dropdown("get value")) + " " + name;
		else
		this.div.querySelector("#totalFamiliesGenome").innerText = '';
	}

	getGenomeCod() {
		let cod = "";
		let rows = this.tabGenomes.getRows(false);
		for (let i = 0; i < genomes.length; i++) {
			if(rows[i].getElement().parentNode == null)
				cod += '0';
			else {
				let val = rows[i].getData().select;
				if(val == "")
					val = '?';
				cod = cod + val;
			}
		}
		return cod;
	}

	totalGenomes(cod, dataset) {
		let dataGenome = null;
		if(dataset == "h")
			dataGenome = statGenome.homo;
		else if(dataset == "d")
			dataGenome = statGenome.doms;
		else if(dataset == "o")
			dataGenome = statGenome.orthos;
		
		if(dataGenome == null)
			return;

		let total = 0;
		for(let i = 0; i < dataGenome.length; i++) {
			if (($(this.div.querySelector("#datasetAll")).checkbox("is checked")) || (dataGenome[i].all == 'f')) {
				let ok = true;
				let count = 0;
				for(var j = 0; j < cod.length; j++) {
					if(cod[j] != "*") {
						if(cod[j] != "?") {
							if(cod[j] != dataGenome[i].cod[j])
								ok = false;
							else if(dataGenome[i].cod[j] == '1')
								count++;
						}
						else if(dataGenome[i].cod[j] == '1')
							count++;
					}
				}
				if(ok == true && count > 0)
					total += dataGenome[i].total;
			}
		}
		return total;
	}

	linkToTable(filter, phylo) {
		let gsArray = [];
		for (let i = 0; i < gs.length; i++)
			gsArray.push(($(this.div.querySelector("#groups")).dropdown("get value").indexOf(""+i) >= 0));
		let columns = "col=[";
		for (i = 0; i < $(this.div.querySelector("#freeze")).dropdown("get value").length; i++)
			columns += "'" + $(this.div.querySelector("#freeze")).dropdown("get value")[i] + "',";
		columns += "]";
		let cod = "";
		let rows = this.tabGenomes.getRows(false);
		for (let i = 0; i < genomes.length; i++) {
			if(!filter)
				cod = cod + "?";
			else if (rows[i].getCell('select').getElement().parentNode == null)
				cod = cod + '0';
			else {
				let val = rows[i].getData().select;
				if (val == "")
					val = "?";
				cod = cod + val;
			}
		}
		session.changePage('table', {
			cod: cod,
			gs: gsArray,
			dataset: $(this.div.querySelector("#dataset")).dropdown("get value"),
			all: $(this.div.querySelector("#datasetAll")).checkbox("is checked"),
			vertical: $(this.div.querySelector("#view")).dropdown("get value"),
		});
	}

	linkToTableRg(i) {
		let filters = null;
		if(i == -1)
			filters = this.tableCustom.getHeaderFilters();
		else
			filters = this.tabsRg[i].getHeaderFilters();

		let longFilters = {};
		let letter = 0;
		for (let j = 0; j < filters.length; j++) {
			if ("YES".indexOf(filters[j].value.toUpperCase()) >= 0) {
				longFilters[filters[j].field] = alphabet[letter];
				letter++;
			} else if ("YES(CORE)".indexOf(filters[j].value.toUpperCase()) >= 0)
				longFilters[filters[j].field] = '1';
			else if ("NO".indexOf(filters[j].value.toUpperCase()) >= 0)
				longFilters[filters[j].field] = '0';
		}

		let cod = "";
		if(i == -1) {
			let array = $('#textGroupCustom').val().split('\n');
			let groups = array.filter(function(item, pos) {
				if(item == '')
					return false;
				return array.indexOf(item) == pos;
			});

			index = [];
			for(let i = 0; i < genomes.length; i++) {
				if($("#customGroupGen" + i).dropdown("get value") == "")
					index.push(-1);
				else
					index.push(parseInt($("#customGroupGen" + i).dropdown("get value")));
			}
			for (let j = 0; j < g.length; j++) {
				if(index[j] == -1)
					cod += '*';
				else {
					var value = longFilters["c" + index[j]];
					if(value == undefined)
						cod += "?";
					else
						cod += value;
				}
			}
		}
		else {
			for (let j = 0; j < genomes.length; j++) {
				var value = longFilters["c" + genomes[j].rg[i]];
				if(value == undefined)
					cod += "?";
				else
					cod += value;
			}
		}

		let gsArray = [];
		for (i = 0; i < gs.length; i++)
			gsArray.push(($("#groups").dropdown("get value").indexOf(""+i) >= 0))
		let columns = "col=[";
		for (i = 0; i < $("#freeze").dropdown("get value").length; i++)
			columns += "'" + $("#freeze").dropdown("get value")[i] + "',";
		columns += "]";

		session.changePage('table', {
			cod: cod,
			gs: gsArray,
			dataset: $("#dataset").dropdown("get value"),
			all: $("#datasetAll").checkbox("is checked"),
			vertical: $("#view").dropdown("get value"),
		});
	}

	
	createRgFilter() {
		this.tabsRg = [];
		for (let i = 0; i < gs.length; i++) {
			let columns = [
				{title: "# Families", field: "total", width: 100, bottomCalc: "sum", frozen: true, sorter: "number", headerFilter: true, headerFilterFunc: numFilter},
				{title: "All filter", field: "all", visible: false},
			];
			for (let j = 0; j < gs[i].childs.length; j++) {
				columns.push({
					title: gs[i].childs[j].name,
					field: "c" + j,
					editor: "string",
					sorter: "string",
					headerFilter:"select",
					headerFilterParams:{"":"Nothing", "No":"No", "Yes":"Yes", "Yes(Core)":"Yes(Core)"},
					headerFilterFunc:"like",
					columnVertAlign:"bottom",
					minWidth:100,
				});
			}
			this.tabsRg.push(new Tabulator(this.div.querySelector("#tabRg" + i), {
				movableRows: false,
				resizableColumns: false,
				progressiveRender: true,
				progressiveRenderSize: 100,
				progressiveRenderMargin: 100,
				virtualDomBuffer:100,
				layout:"fitDataFill",
				tooltipsHeader: true,
				columns: columns,
			}));

			let data = null;
			if($(this.div.querySelector("#dataset")).dropdown("get value") == "h")
				data = statRg.homo[i];
			else if($(this.div.querySelector("#dataset")).dropdown("get value") == "d")
				data = statRg.doms[i];
			else if($(this.div.querySelector("#dataset")).dropdown("get value") == "o")
				data = statRg.orthos[i];
			this.tabsRg[i].setData(data);
			//$(this.div.querySelector("#tabSegRg" + i)).removeClass("active");
		}
		//$("#tabsRg").removeClass("active");

		$('.item').tab({'onVisible':function(){
			$(".ui.tab").each(function( index ) {
				if($(this).hasClass("active"))
					$(this).css("display", "grid");
				else
					$(this).css("display", "none");
			});
		}});
		$(".ui.tab").each(function( index ) {
			if($(this).hasClass("active"))
				$(this).css("display", "grid");
			else
				$(this).css("display", "none");
		});


	}

	createCustomRgFilter() {
		this.div.querySelector('#divTextCustom').style.display = 'none';
		this.div.querySelector('#divTabCustom').style.display = 'block';
		makeTableGroupCustom();

		if(this.tabCustomRg != undefined && this.tabCustomRg != null)
			this.tabCustomRg.destroy();

		let array = this.div.querySelector('#textGroupCustom').value.split('\n');
		let groups = array.filter(function(item, pos) {
			if(item == '')
				return false;
			return array.indexOf(item) == pos;
		});

		this.customGs = groups;

		this.tabCustomRg = new Tabulator(this.div.querySelector("#divTabCustom"), {
			movableRows: false,
			virtualDom:false,
			layout:"fitDataFill",
			columns: [
				{title:"Group", field:"select", width:150,formatter:this.dropdownCustonGroups, formatterParams:{module: this, groups:groups}, align:"center", headerSort:false, columnVertAlign:"bottom",cssClass:"overflowInitial"},
				{title:"Genome Name", field:"name", headerFilter:true, headerFilterFunc:alphFilter, headerFilterPlaceholder:"Alphabetical Filter", bottomCalc:diffCalcs},
			],
		});
		
		let customData = [];
		for(let i = 0; i < genomes.length; i++)
			customData.push({name: genomes[i].name});
		this.tabCustomRg.setData(customData);

		
	}

	calcTableGroupCustom() {
		this.div.querySelector('#divTabCustom').style.display = 'none';
		this.div.querySelector('#tabRgCustom').style.display = 'block';

		let data = null;
		let dataset = $(this.div.querySelector("#dataset")).dropdown("get value");
		if(dataset == "h")
			data = statGenome.homo;
		else if(dataset == "d")
			data = statGenome.doms;
		else if(dataset == "o")
			data = statGenome.orthos;
		
		let all = $(this.div.querySelector("#datasetAll")).checkbox("is checked");

		let index = Array(Math.pow(3, this.customGs.length)).fill(0);
		this.customGsGenomes = [];
		let totalGroups = Array(this.customGs.length).fill(0);
		let rows = this.tabCustomRg.getRows(false);
		for (let i = 0; i < genomes.length; i++) {
			this.customGsGenomes.push(rows[i].getData().select);
			if(rows[i].getData().select != undefined) {
				totalGroups[parseInt(rows[i].getData().select)]++;
				console.log(parseInt(rows[i].getData().select));

			}
		}

		data.forEach((reg) => {
			let resultGroups = Array(this.customGs.length).fill(0);
			var ok = false;
			for(let i = 0; i < reg.cod.length; i++) {
				if(reg.cod[i] == '1' && this.customGsGenomes[i] != undefined) {
					resultGroups[this.customGsGenomes[i]]++;
					ok = true;
				}
			}
			if(ok) {
				let key = 0;
				for(let i = 0; i < resultGroups.length; i++) {
					let value = 0;
					if(resultGroups[i] == 0)
						value = 0;
					else if(resultGroups[i] < totalGroups[i])
						value = 1;
					else
						value = 2;
					key += value * Math.pow(3, i);
				}
				index[key] ++;
			}
		});
		let dataTable = [];
		for (let i = 1; i < index.length; i++) {
			const total = index[i];
			let number = i;
			let mult = 3;

			let obj = {total: total};
			for (let j = 0; j < this.customGs.length; j++) {
				let rest = number%3;
				if(rest == 0)
					obj['c' + j] = 'No';
				else if(rest == 1)
					obj['c' + j] = 'Yes';
				else
					obj['c' + j] = 'Yes(Core)';
				number -= rest;
				number /= 3;
				
			}
			dataTable.push(obj);
			console.log(obj);
		}

		let columns = [
			{
				title: "# Families",
				field: "total",
				width: 100,
				bottomCalc: "sum",
				frozen: true,
				sorter: "number",
				headerFilter: true,
				headerFilterFunc: numFilter
			},
			{
				title: "All filter",
				field: "all",
				visible: false
			}];
		for (let i = 0; i < this.customGs.length; i++) {
			columns.push({
				title: this.customGs[i],
				field: "c" + i,
				editor: "string",
				sorter: "string",
				headerFilter:"select",
				headerFilterParams:{"":"Nothing", "No":"No", "Yes":"Yes", "Yes(Core)":"Yes(Core)"},
				headerFilterFunc:"like",
				columnVertAlign:"bottom",
				minWidth:100,
			});
		}

		this.tableCustom = new Tabulator("#tabRgCustom", {
			movableRows: false,
			resizableColumns: false,
			progressiveRender: true,
			progressiveRenderSize: 100,
			progressiveRenderMargin: 100,
			virtualDomBuffer:100,
			layout:"fitDataFill",
			tooltipsHeader: true,
			columns: columns,
		});
		this.tableCustom.setData(dataTable);
	}



	dropdownCustonGroups(cell, formatterParams, onRendered) {
		onRendered(function(){
			let itens = '';
			let i = 0;
			formatterParams.groups.forEach(element => {
				itens += '		<div class="item" data-value="' + i + '">' + element + '</div>';
				i++;
			});

			let genomeSelection = 
				'	<input type="hidden">' +
				'	<i class="dropdown icon"></i>' +
				'	<div class="default text"><i class="x icon"></i> Without group</div>' +
				'	<div class="menu">' +
				itens +
				'	</div>';

			let div = cell.getElement().querySelector('.ui.dropdown');
			if(div == null) {
				div = document.createElement("div");
				div.style.overflow = 'initial';
				div.classList.add('ui');
				div.classList.add('fluid');
				div.classList.add('dropdown');
				div.classList.add('clearable');
				div.innerHTML = genomeSelection;
				
				cell.getElement().appendChild(div);
				$(div).dropdown({clearable: true});
			}
			$(div).dropdown("set selected", cell.getValue());
			div.onchange = () => {
				cell.getData().select = $(div).dropdown("get value");
			}
		});
	}


	createTree() {
		let nodes = [];
		for (let i = 0; i < genomes.length; i++) {
			const gen = genomes[i];
			let obj = 
				{data:{
					key: gen.abbrev,
					domains: [],
					orthologs: [],
					org: gen.abbrev,
					genome: gen,
				}};
			for (let j = 0; j < gs.length; j++) {
				const g = gs[j];
				obj.data["rg" + j] = {id: gen.rg[j], name: g.childs[gen.rg[j]].name, color: g.childs[gen.rg[j]].color}
				
			}
			nodes.push(obj);
		}

		let sTree = '';
		if($("#treeType").dropdown("get value"))
			sTree = eval($("#treeType").dropdown("get value")).tree;
		this.divPhylogeny = new DivPhylogeny(
			document.getElementById("divPhylo"), 
			this,
			document.getElementById("phyloModal"),
			nodes,
			sTree);
		if(sTree != '') {
			this.divPhylogeny.makeTree();
		}
		this.divPhylogeny.setUpdateSelection((updatedRows) => {this.updateSelection(updatedRows)});
	}

	updateSelection(updatedRows, id) {
		if(this.lockSelection != undefined) 
			return;
		this.lockSelection = true; 
		
		let selectedRows = updatedRows;
		if(id != 0) this.selectData(selectedRows);
		if(id != 1) this.divPhylogeny.selectData(selectedRows);
		
		this.lockSelection = undefined;
	}
	
	selectData(selectedKeys) {
		
			let rows = this.tabGenomes.getRows();
        rows.forEach(function(row){
            let key = row.getData().abbrev;
            if(selectedKeys.indexOf(key) != -1)
                row.select();
            else
                row.deselect();
		});
	}
	

	loadPage(args) {
		setURL('page=home');

		if(args != undefined && args.tabGenomes != undefined) {
			this.tabGenomes.clearHeaderFilter();
			this.tabGenomes.clearFilter();
			args.tabGenomes.headFilters.forEach(el => {
				this.tabGenomes.setHeaderFilterValue(el.field, el.value);
			});
	
			this.tabGenomes.setSort(args.tabGenomes.sorters);
	
			this.tabGenomes.element.querySelector(".tabulator-tableHolder").scrollTop = args.tabGenomes.scroll.top;
			this.tabGenomes.element.querySelector(".tabulator-tableHolder").scrollLeft = args.tabGenomes.scroll.left;

			let rows = this.tabGenomes.getRows();
			for (let i = 0; i < rows.length; i++) {
				for (let j = 0; j < gs.length; j++) {
					rows[i].getCell('rg' + j + 'color').setValue(args.tabGenomes.colors[i][j]);
				}
				rows[i].reformat();
				
			}
			this.updateTotalFamiliesGenome();
		}
	}

    save() {
        let obj = {page:'home', tabGenomes: {headFilters: [], sorters: [], colors: []}};
        this.tabGenomes.getHeaderFilters().forEach(el => {
            obj.tabGenomes.headFilters.push({field: el.field, value: el.value});
        });
        this.tabGenomes.getSorters().forEach(el => {
            obj.tabGenomes.sorters.push({field: el.field, dir: el.dir});
        });
        obj.tabGenomes.scroll = {
            top:this.tabGenomes.element.querySelector(".tabulator-tableHolder").scrollTop,
            left:this.tabGenomes.element.querySelector(".tabulator-tableHolder").scrollLeft,
		};
		
		this.tabGenomes.getRows().forEach(row => {
			let tmp = [];
			for (let i = 0; i < gs.length; i++) {
				tmp.push(row.getCell('rg' + i + 'color').getValue());
			}
			obj.tabGenomes.colors.push(tmp);
		});

        return obj;
    }

    show() {
        this.div.style.display = 'block';
        return this.div;
    }
}