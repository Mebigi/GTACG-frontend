class FamilyList {
    constructor(div) {
        this.div = div;
        $('.ui.dropdown').dropdown();
    
        this.lockPage = false;

        this.subPages = [];
        this.subPages.push(this.getClearPage());
        this.activeSubPage = this.subPages[0];
        
        this.div.querySelector('#saveSubPage').onclick = () => {
            document.getElementById('saveSubPageText').value = this.activeSubPage.title;
            $('#saveSubPageModal').modal('show');
        }
        this.div.querySelector('#saveSubPageButton').onclick = () => {
            this.saveSubPage();
        }
        this.div.querySelector('#removePage').onclick = () => {
            this.removePage();
        }

        this.table = new Tabulator(div.querySelector("#example-table"), {
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
            columns: [
                {title:"Locus Tag", field:"seq", headerFilter:true, headerSort:true, headerFilterFunc:alphFilter, headerFilterPlaceholder:"Alphabetical Filter", width:200},
                {title:"Family", field:"head", headerFilter:true, headerSort:true, formatter:"link", formatterParams:{labelField:"head", urlPrefix:"family.htm?file="}, headerFilterFunc:alphFilter, headerFilterPlaceholder:"Alphabetical Filter", width:200},
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

        


        this.div.querySelector('#clearFilters').onclick = () => {
            this.table.clearFilter();
        }
        this.div.querySelector('#clearHeaderFilters').onclick = () => {
            this.table.clearHeaderFilter();
        }
        this.div.querySelector('#groupByClear').onclick = () => {
            this.table.setGroupBy('');
            this.activeSubPage.groupColumn = '';
        }
        this.div.querySelector('#groupByFunc').onclick = () => {
            this.table.setGroupBy('func');
            this.table.setSort([{column:'sortGroupColumn', dir:'asc'}]);
            this.activeSubPage.groupColumn = 'func';
        }
        this.div.querySelector('#groupByGen').onclick = () => {
            this.table.setGroupBy('gen');
            this.table.setSort([{column:'sortGroupColumn', dir:'asc'}]);
            this.activeSubPage.groupColumn = 'gen';
        }

        this.tableHolder = this.div.querySelector(".tabulator-tableHolder");
        this.div.onscroll = () => {
            this.activeSubPage.scrollLeft = this.tableHolder.scrollLeft;
            this.activeSubPage.scrollTop = this.tableHolder.scrollTop;
        };
    }

    getClearPage() {
        return {
            title: '',
            link: null,
            seq: '',
            head: '',
            gen: '',
            func: '',
            s: '',
            e: '',
            d: '',
            groupColumn: '',
            scrollTop: 0,
            scrollLeft: 0,
            sorters: [],
        };    
    }

    saveSubPage() {
        let newTitle = document.getElementById('saveSubPageText').value;
        if(this.activeSubPage.link == null) {
            if(newTitle != '') {
                this.activeSubPage.title = newTitle;
                this.activeSubPage.link = document.createElement("a");
                this.activeSubPage.link.classList.add("item");
                this.activeSubPage.link.innerText = newTitle;

                let localSubPage = this.activeSubPage;
                this.activeSubPage.link.onclick = () => {this.activeSubPage = localSubPage;this.loadPage();};
                document.getElementById('menuSubPageFamilyList').appendChild(this.activeSubPage.link);

                this.subPages.push(this.activeSubPage);
                this.subPages[0] = this.getClearPage();
            }
        }
        else {
            this.activeSubPage.link.innerText = newTitle;
            this.activeSubPage.title = newTitle;
        }
    }


    loadPage() {
        if(!this.lockPage) {
            this.lockPage = true;
            
            this.table.setHeaderFilterValue("seq", this.activeSubPage.seq);
            this.table.setHeaderFilterValue("head", this.activeSubPage.head);
            this.table.setHeaderFilterValue("func", this.activeSubPage.func);
            this.table.setHeaderFilterValue("s", this.activeSubPage.s);
            this.table.setHeaderFilterValue("e", this.activeSubPage.e);
            this.table.setHeaderFilterValue("d", this.activeSubPage.d);
            this.table.setSort(this.activeSubPage.sorters);
            this.table.setGroupBy(this.activeSubPage.groupColumn);

            this.tableHolder.scrollLeft = this.activeSubPage.scrollLeft
            this.tableHolder.scrollTop = this.activeSubPage.scrollTop;
        }
    }

    removePage() {       
        if(this.activeSubPage.link == null) {
            this.table.setGroupBy('');
            this.table.clearSort();
            this.table.clearFilter();
            this.table.clearHeaderFilter();
        }
        else {
            document.getElementById('menuPageFamilyList').removeChild(this.activeSubPage.link);
            this.subPages = this.subPages.remove(this.subPages.indexOf(this.activeSubPage));
            this.activeSubPage = this.subPages[0];
            this.loadPage();
        }
    }

    updateSorter() {
        if(this.table != undefined && this.table != null) {
            this.activeSubPage.sorters = [];
            this.table.getSorters().forEach(el => {
                this.activeSubPage.sorters.push({column: el.field, dir: el.dir});
            });
        }

    }

    updateFilter() {
        if(this.table != undefined && this.table != null)
            this.table.getHeaderFilters().forEach(el => {
                this.activeSubPage[el.field] = el.value;
            });
    }
}