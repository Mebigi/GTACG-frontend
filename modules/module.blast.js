class Blast {
    constructor(div, page, create) {
        this.div = div;

        $('.ui.dropdown').dropdown();
        $('.ui.link.dropdown').dropdown({
			action: 'hide'
		});
		$(this.div.querySelector('#blastModal')).modal({
			closable: false,
            context: this.div,
		});
		$(this.div.querySelector('#blastModal')).modal('show');

		this.subPages = new SubPages(
			this.div,
			document.getElementById('menuSubPageBlast'),
            this,
		);
		
		this.created = false;
        if(create != false)
			this.createPage();
	}

	createPage() {
		this.created = true;		
        this.table = new Tabulator(this.div.querySelector("#example-table"), {
			height: "calc(100vh - 40px)",
			progressiveRender: true,
			progressiveRenderSize: 200,
			progressiveRenderMargin: 200,
			selectable: false,
			placeholder: "No Data Available",
			dataSorted:(sorters, rows) => {this.updateSorter()},
            dataFiltered:(filters, rows) => {this.updateFilter()},
            columns: [{
					title: "Query",
					field: "query",
					headerFilter: true,
					headerFilterFunc: alphFilter,
					headerFilterPlaceholder: "Alphabetical Filter",
					bottomCalc:diffCalcs,
				},
				{
					title: "Subject",
					field: "subject",
					headerFilter: true,
					headerFilterFunc: alphFilter,
					headerFilterPlaceholder: "Alphabetical Filter",
					bottomCalc:diffCalcs,
				},
				{
					title: "Family",
					field: "family",
					formatter: "link",
					formatterParams: {
						labelField: "family",
						urlPrefix: "family.htm?file="
					},
					headerFilter: true,
					headerFilterFunc: alphFilter,
					headerFilterPlaceholder: "Alphabetical Filter",
					bottomCalc:diffCalcs,
				},
				{
					title: "Function",
					field: "func",
					headerFilter: true,
					headerFilterFunc: alphFilter,
					headerFilterPlaceholder: "Alphabetical Filter",
					bottomCalc:diffCalcs,
				},
				{
					title: "Genome",
					field: "gen",
					headerFilter: true,
					headerFilterFunc: alphFilter,
					headerFilterPlaceholder: "Alphabetical Filter",
					bottomCalc:diffCalcs,
				},
				{
					title: "Identity",
					field: "identity",
					sorter: "number",
					headerFilter: true,
					headerFilterFunc: numFilter,
					headerFilterPlaceholder: "Numerical Filter"
				},
				{
					title: "E-Valeu",
					field: "evalue",
					sorter: "number",
					headerFilter: true,
					headerFilterFunc: numFilter,
					headerFilterPlaceholder: "Numerical Filter"
				},
				{
					title: "Gaps",
					field: "gaps",
					sorter: "number",
					headerFilter: true,
					headerFilterFunc: numFilter,
					headerFilterPlaceholder: "Numerical Filter"
				},
				{
					title: "Score",
					field: "score",
					sorter: "number",
					headerFilter: true,
					headerFilterFunc: numFilter,
					headerFilterPlaceholder: "Numerical Filter"
				},
				{
					title: "Bit-Score",
					field: "bitscore",
					sorter: "number",
					headerFilter: true,
					headerFilterFunc: numFilter,
					headerFilterPlaceholder: "Numerical Filter"
				},
			]
        });
		
		this.div.querySelector('#makeBlast').onclick = () => {
			setTimeout(() => {
				this.processBlastResult();
			}, 100);
		};

		this.div.querySelector('#clearFilters').onclick = () => {
            this.table.clearFilter();
        }
        this.div.querySelector('#clearHeaderFilters').onclick = () => {
            this.table.clearHeaderFilter();
        }
        
		$("#download-csv").click(() => { this.table.download("csv", "data.csv"); });
        $("#download-json").click(()=> {this.table.download("json", "data.json");});
        $("#download-xlsx").click(()=> {this.table.download("xlsx", "data.xlsx");});

		this.tableHolder = this.div.querySelector(".tabulator-tableHolder");
        this.div.onscroll = () => {
            this.subPages.activeSubPage.scrollLeft = this.tableHolder.scrollLeft;
            this.subPages.activeSubPage.scrollTop = this.tableHolder.scrollTop;
        };
    }

    groupTable(field) {
        let groupBy=field;
        if(field == null)
            this.table.setGroupBy('');
        else {
            this.table.setGroupBy(field);
            this.table.setSort([{column:'sortGroupColumn', dir:'asc'}]);
        }
	}
	
	processBlastResult() {
		$("#dimmerLoader").addClass("active");
		setTimeout(() => {
			this.table.clearData();
			var page = serverUrl + blastPort;
			let request = {
				project: projectPath,
				program: $("#program").dropdown("get value"),
				textEvalue: $("#textEvalue").val(),
				textTScore: $("#textTScore").val(),
				textWSize: $("#textWSize").val(),
				textCoverage: $("#textCoverage").val(),
				textNumAlign: $("#textNumAlign").val(),
				textGapOpening: $("#textGapOpening").val(),
				textGapExtension: $("#textGapExtension").val(),
				seq: $('#textBlast').val()//.replace(/\n/g,'\\n')
			}
			$.post(
				page, 
				request,
				(data) => {
					let result = data;
					let dataTable = data;
					for (let i = 0; i < dataTable.length; i++) {
						for (let j = 0; j < sequenceList.length; j++) {
							if (sequenceList[j].seq == dataTable[i].subject) {
								dataTable[i].family = sequenceList[j].head;
								dataTable[i].gen = sequenceList[j].gen;
								dataTable[i].func = sequenceList[j].func;
								break;
							}
						}
					}
					this.table.setData(dataTable);
					this.subPages.activeSubPage.data = dataTable;
					$("#dimmerLoader").removeClass("active");
				}
			);
		}, 1000);
	}

	getClearPage() {
        return {
            title: '',
            headFilters: [],
			groupColumn: '',
			data: null,
            scrollTop: 0,
            scrollLeft: 0,
            sorters: [],
        };    
	}
	
	loadPage() {
        if(!this.created)
            this.createPage();

		if(this.subPages.activeSubPage.data == undefined || this.subPages.activeSubPage.data == null) {
			this.table.clearData();
			$(this.div.querySelector('#blastModal')).modal('show');
		}
		else {
			$(this.div.querySelector('#blastModal')).modal('hide');
			console.log(this.subPages.activeSubPage.data);
			setTimeout(() => {
				this.table.setData(this.subPages.activeSubPage.data);
			}, 400);
		}
		this.table.clearHeaderFilter();
		this.subPages.activeSubPage.headFilters.forEach(el => {
			this.table.setHeaderFilterValue(el.column, el.value);
		});
        this.table.setSort(this.subPages.activeSubPage.sorters);
        this.table.setGroupBy(this.subPages.activeSubPage.groupColumn);

        this.tableHolder.scrollLeft = this.subPages.activeSubPage.scrollLeft
		this.tableHolder.scrollTop = this.subPages.activeSubPage.scrollTop;
		
		setURL('page=blast');
    }

	clearPage() {       
        this.table.setGroupBy('');
        this.table.clearSort();
        this.table.clearFilter();
		this.table.clearHeaderFilter();
		this.table.clearData();
		this.subPages.activeSubPage.data = null;
		$(this.div.querySelector('#blastModal')).modal('show');
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
        if(this.table != undefined && this.table != null) {
			this.subPages.activeSubPage.headFilters = [];
			this.table.getHeaderFilters().forEach(el => {
				this.subPages.activeSubPage.headFilters.push({column: el.field, value: el.value});
			});
		}
	}
	
	save() {
		return this.subPages;
	}
}