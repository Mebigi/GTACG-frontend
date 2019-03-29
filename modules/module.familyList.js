class FamilyList {
    constructor(div, page, create) {
        this.div = div;
        $('.ui.dropdown').dropdown();

        this.subPages = new SubPages(
            this.div,
            document.getElementById('menuPageFamilyList'),
            this,
            document.querySelector('#menuPageFindFamilies > i > .ui.floating.label')
        );

        this.created = false;
        if(create != false)
            this.createPage();
    }

    createPage() {
        this.created = true;
        this.table = new Tabulator(this.div.querySelector("#example-table"), {
            height: "calc(100vh - 2.85714286em)",
            progressiveRender:       true,
            progressiveRenderSize:   200,
            progressiveRenderMargin: 200,
            columnVertAlign:"bottom",
            resizableRows:false,
            movableRows: false,
            resizableColumns:false,
            tooltipsHeader:true,
            layout:"fitDataFill",
            dataSorted:(sorters, rows) => {this.updateSorter()},
            dataFiltered:(filters, rows) => {this.updateFilter()},
            cellClick:(e, cell) => {
                if(cell.getColumn().getField() == "head" && e.path[0].tagName == "A") {
                    session.changePage('family', cell.getData().head);
                }
            },
            columns: [
                {title:"Locus Tag", field:"seq", headerFilter:true, headerSort:true, headerFilterFunc:alphFilter, headerFilterPlaceholder:"Alphabetical Filter", width:200},
                {title:"Family", field:"head", headerFilter:true, headerSort:true, formatter:"link", formatterParams:{/*labelField:"head", urlPrefix:"family.htm?file="*/url:"#"}, headerFilterFunc:alphFilter, headerFilterPlaceholder:"Alphabetical Filter", width:200},
                {title:"Genome", field:"gen", headerFilter:true, headerSort:true, headerFilterFunc:alphFilter, headerFilterPlaceholder:"Alphabetical Filter", width:200, mutator:function(value, data, type, params, component){return genomes[value].abbrev;}},
                {title:"Function", field:"func", headerFilter:true, headerTooltip:"Function annotated in the fasta file", headerFilterFunc:alphFilter, headerFilterPlaceholder:"Alphabetical Filter", width:600},
                {title:"Start Codon", field:"s", headerFilter:true, headerFilterFunc:numFilter, sorter:"number", formatter:'money', formatterParams:{precision:0}, headerFilterPlaceholder:"Numerical Filter", width:110, align:'right'},
                {title:"End Codon", field:"e", headerFilter:true, headerFilterFunc:numFilter, sorter:"number", formatter:'money', formatterParams:{precision:0}, headerFilterPlaceholder:"Numerical Filter", width:110, align:'right'},
                {title:"Strand", field:"d", headerFilter:true, width:80, align:'center',},
                {title:"", field:"sortGroupColumn", headerFilter:true, visible: false, sorter:customSorterGroup}
            ]
        });
        this.table.setData(sequenceList);
        this.table.setGroupStartOpen(false);
        $("#download-csv").click(() => { this.table.download("csv", "data.csv"); });
        $("#download-json").click(()=> {this.table.download("json", "data.json");});
        $("#download-xlsx").click(()=> {this.table.download("xlsx", "data.xlsx");});

        /*this.div.querySelector('#clearFilters').onclick = () => {
            this.table.clearFilter();
        }*/
        this.div.querySelector('#clearHeaderFilters').onclick = () => {
            this.table.clearHeaderFilter();
        }
        this.div.querySelector('#groupByClear').onclick = () => {
            this.table.setGroupBy('');
            this.subPages.activeSubPage.groupColumn = '';
            this.changeURL();
        }
        this.div.querySelector('#groupByFunc').onclick = () => {
            this.table.setGroupBy('func');
            this.table.setSort([{column:'sortGroupColumn', dir:'asc'}]);
            this.subPages.activeSubPage.groupColumn = 'func';
            this.changeURL();
        }
        this.div.querySelector('#groupByGen').onclick = () => {
            this.table.setGroupBy('gen');
            this.table.setSort([{column:'sortGroupColumn', dir:'asc'}]);
            this.subPages.activeSubPage.groupColumn = 'gen';
            this.changeURL();
        }

        this.tableHolder = this.div.querySelector(".tabulator-tableHolder");
        this.div.onscroll = () => {
            this.subPages.activeSubPage.scrollLeft = this.tableHolder.scrollLeft;
            this.subPages.activeSubPage.scrollTop = this.tableHolder.scrollTop;
        };
        setURL('page=familyList');
    }

    getClearPage() {
        return {
            title: '',
            link: null,
            headFilters: [],
            groupColumn: '',
            sorters: [],
            scrollTop: 0,
            scrollLeft: 0,
        };    
    }

    loadPage(args) {
        if(!this.created)
            this.createPage();

        let page = JSON.parse(JSON.stringify(this.subPages.activeSubPage));

        console.log(args);

        this.table.clearHeaderFilter();
        page.headFilters.forEach(el => {
			this.table.setHeaderFilterValue(el.column, el.value);
		});
        this.table.setSort(page.sorters);
        this.table.setGroupBy(page.groupColumn);

        this.tableHolder.scrollLeft = page.scrollLeft
        this.tableHolder.scrollTop = page.scrollTop;

        setURL('page=familyList',{guid: page.guid});
        this.changeURL();
    }

    clearPage() {
        this.table.setGroupBy('');
        this.table.clearSort();
        this.table.clearFilter();
        this.table.clearHeaderFilter();
        this.changeURL();
    }

    updateSorter() {
        if(this.table != undefined && this.table != null) {
            this.subPages.activeSubPage.sorters = [];
            this.table.getSorters().forEach(el => {
                this.subPages.activeSubPage.sorters.push({column: el.field, dir: el.dir});
            });
        }
        this.changeURL();
    }

    updateFilter() {
        this.subPages.activeSubPage.headFilters = [];
        if(this.table != undefined && this.table != null)
            this.table.getHeaderFilters().forEach(el => {
                this.subPages.activeSubPage.headFilters.push({column: el.field, value: el.value});
            });
        this.changeURL();
    }

    changeURL() {
        let url = "page=familyList";
        let page = this.subPages.activeSubPage;
        if(page.headFilters.length > 0)
            url += '&headFilters=' + JSON.stringify(page.headFilters);
        if(page.groupColumn.length > 0)
            url += '&groupColumn=' + JSON.stringify(page.groupColumn);
        if(page.sorters.length > 0)
            url += '&sorters=' + JSON.stringify(page.sorters);
        changeURL(url, {guid: page.guid});
    }

    save() {
		return this.subPages.save();
	}
}