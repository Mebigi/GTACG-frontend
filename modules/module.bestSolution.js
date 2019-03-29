class BestSolution {
    constructor(div, page, create) {
		this.div = div;
		for(var i = 0; i < gs.length; i++)
			$("#group").find(".menu").append("<div class=\"item\" data-value=\"" + i + "\">" + gs[i].name + "</div>");
        $('.ui.dropdown').dropdown();

        this.subPages = new SubPages(
            this.div,
            document.getElementById('menuSubPageBestSolution'),
            this,
            document.querySelector('#menuPageBestSolution > i > .ui.floating.label')
		);
		
		this.created = false;
        if(create != false)
			this.createPage();
	}

	createPage() {
		this.created = true;
        let columns = getIndexBaseColumns("h");
		for(var i = 0; i < columns.length; i++) {
			columns[i].bottomCalc = null;
		}
		columns.reverse();
		columns.pop();
		columns.reverse();
		columns.push({title:"", width:40, field:"type", visible: false});

		setTimeout(() =>{
		this.table = new Tabulator(this.div.querySelector("#example-table"), {
			height: "calc(100vh - 110px)",
				progressiveRender: true,
				progressiveRenderSize: 200,
				progressiveRenderMargin: 200,
				selectable: true,
			columns: [
					{title:"Presence", field:"presence", bottomCalc:"sum", topCalcParams:{precision:2}, sorter:"number", align:"right", formatter:"money", formatterParams:{precision:2,symbol:"%",symbolAfter:true}, headerFilter:true, headerFilterFunc:numFilter, width:100, frozen:true, headerTooltip:"Percentage presence of sequence family in all set of families", headerFilterPlaceholder:"Numerical Filter"}
				].concat(columns)
		});}, 100);

		this.baseData = dataHomo.concat(dataDoms.concat(dataOrthos));
		
		
		this.div.querySelector('#group').onchange = () => {
			this.updateFields();
			this.changeGs();
		}
		this.div.querySelector('#type').onchange = () => {
			this.updateFields();
			this.changeType();
		}
		this.div.querySelector('#conformation').onchange = () => {
			this.updateFields();
			this.changeData();
        }
/*
        this.tableHolder = this.div.querySelector(".tabulator-tableHolder");
        this.div.onscroll = () => {
            this.subPages.activeSubPage.scrollLeft = this.tableHolder.scrollLeft;
            this.subPages.activeSubPage.scrollTop = this.tableHolder.scrollTop;
        };*/
    }

    getClearPage() {
        return {
            title: '',
			group: '',
			type: '',
			conformation: '',
            scrollTop: 0,
            scrollLeft: 0,
            sorters: [],
        };
	}
	
	updateFields() {
		this.subPages.activeSubPage.group = $(this.div.querySelector("#group")).dropdown('get value');
		this.subPages.activeSubPage.type = $(this.div.querySelector("#type")).dropdown('get value');
		this.subPages.activeSubPage.conformation = $(this.div.querySelector("#conformation")).dropdown('get value');
	}

    loadPage(i) {
		if(!this.created)
			this.createPage();

		this.table.clearData();
		let group = this.subPages.activeSubPage.group;
		let type = this.subPages.activeSubPage.type;
		let conformation = this.subPages.activeSubPage.conformation;
		if(i != undefined)
		group = i;
		
		if(group != '')
		$(this.div.querySelector("#group")).dropdown('set selected', group);
		else
		$(this.div.querySelector("#group")).dropdown('clear');
		if(type != '')
		$(this.div.querySelector("#type")).dropdown('set selected', type);
		else
		$(this.div.querySelector("#type")).dropdown('clear');
		if(conformation != '')
		$(this.div.querySelector("#conformation")).dropdown('set selected', conformation);
		else
		$(this.div.querySelector("#conformation")).dropdown('clear');
		
        this.tableHolder.scrollLeft = this.subPages.activeSubPage.scrollLeft;
        this.tableHolder.scrollTop = this.subPages.activeSubPage.scrollTop;
		
		setURL('page=bestSolution');
    }

    clearPage() {
        this.table.setGroupBy('');
        this.table.clearSort();
        this.table.clearFilter();
        this.table.clearHeaderFilter();
    }

    updateSorter() {
        if(this.table != undefined && this.table != null) {
            this.subPages.activeSubPage.sorters = [];
            this.table.getSorters().forEach(el => {
                this.subPages.activeSubPage.sorters.push({column: el.field, dir: el.dir});
            });
        }
    }

    updateFilter() {
        if(this.table != undefined && this.table != null)
            this.table.getHeaderFilters().forEach(el => {
                this.subPages.activeSubPage[el.field] = el.value;
            });
    }

    changeData() {
		this.table.clearData();
		let group = parseInt(this.subPages.activeSubPage.group);
		let type = parseInt(this.subPages.activeSubPage.type);
		let conformation = parseInt(this.subPages.activeSubPage.conformation);
		let data = [];
		if(!isNaN(group) && !isNaN(type) && !isNaN(conformation)) {
			for(let i = 0; i < bestSoluctions[group][type][conformation].length; i++) {
				for(let k = 0; k < bestSoluctions[group][type][conformation][i].length; k++) {
					let cod = bestSoluctions[group][type][conformation][i][k].cod;
					let presence = bestSoluctions[group][type][conformation][i][k].pg;
					for(let j = 0; j < this.baseData.length; j++) {
						if(this.baseData[j].cod == cod) {
							this.baseData[j].type = i;
							this.baseData[j].presence = presence;
							data.push(this.baseData[j]);
						}
					}
				}
			}
			this.table.setData(data);
			let rows = this.table.getRows();
			for(let i = 0; i < rows.length; i++) {
				rows[i].getElement().style.backgroundColor = colorScale[rows[i].getData().type];
			}
		}
	}

	changeGs() {
		this.table.clearData();
		let group = parseInt(this.subPages.activeSubPage.group);
		$(this.div.querySelector("#type")).dropdown('clear');
		$(this.div.querySelector("#conformation")).dropdown('clear');
		if(!isNaN(group)) {
			let values = [];
			for(let i = 0; i < gs[group].childs.length; i++)
				values.push({
					name: gs[group].childs[i].name, 
					text: gs[group].childs[i].name, 
					value:i
				});

			console.log(values);
			$(this.div.querySelector('#type')).dropdown({values:
				values}
			);
		}

	}

	changeType() {
		this.table.clearData();
		var group = parseInt($("#group").dropdown('get value'));
		var type = parseInt($("#type").dropdown('get value'));
		var values = [];
		if(!isNaN(group) && !isNaN(type)) {
			for(var i = 0; i < bestSoluctions[group][type].length; i++)
				values.push({name: i+1, value:i});

			$('#conformation').dropdown({
				values: values
			});
		}
	}

	getClipboard() {
		var url = "&fheaders=[";

		var group = parseInt($("#group").dropdown('get value'));
		var type = parseInt($("#type").dropdown('get value'));
		var conformation = parseInt($("#conformation").dropdown('get value'));
	
		if(isNaN(group))
			group = -1;
		if(isNaN(type))
			type = -1;
		if(isNaN(conformation))
			conformation = -1;
		copyToClipboard("bestSolution.htm?values=[" + [group, type, conformation] + "]");
	}

	save() {
		return {subPages: this.subPages};
	}
}