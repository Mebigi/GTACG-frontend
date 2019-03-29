class Family {
    constructor(div) {
		this.div = div;
		this.div.setAttribute('style', 'overflow:scroll !important;');

		this.subPages = new SubPages(
            this.div,
            document.getElementById('menuSubPageFamily'),
            this,
            document.querySelector('#menuPageFamily > i > .ui.floating.label')
		);
	}

    getClearPage() {
        return {
			title: '',
			selectedRows: [],
			
			scrollTop: 0,
            scrollLeft: 0,
			groupColumn: '',
        };
	}

    loadPage(args) {
		this.updateIcon();
        session.changePage('family');
        this.subPages.subPages.forEach(element => {
            if(element.div != undefined || element.div != null)
            	element.div.style.display = 'none';
        });
        if(args == undefined) {
            if(this.subPages.activeSubPage.div != undefined)
                this.subPages.activeSubPage.div.style.display = 'block';
            return;
		}
		
		if(args.id != undefined)
			args = args.id;
        
		this.subPages.activeSubPage.div = document.createElement("div");
		this.subPages.activeSubPage.div.style.paddingLeft = '10px';
		this.subPages.activeSubPage.div.style.paddingRight = '10px';
		this.div.appendChild(this.subPages.activeSubPage.div);
		this.subPages.activeSubPage.fileName = args;
		$.ajax({
			url: "family.htm",
			cache: false,
			dataType: "html",
			success: (data) => {
				this.subPages.activeSubPage.div.innerHTML = data;
				this.preLoadSubPage();
				$.getScript("data/families/" + args + ".js", () => {
					this.loadSubPage();
				}, true);
			}
		});
		this.subPages.savePage(args);

		this.subPages.activeSubPage.id = args;
		setURL('page=family&id=' + this.subPages.activeSubPage.id);
	}

	preLoadSubPage() {
		$('.ui.checkbox').checkbox();
		$('.ui.dropdown').dropdown();
		$('.ui.dropdown.clearable').dropdown({clearable: true});
		$('.ui.dropdown.item').dropdown({action: 'hide'});

		this.subPages.activeSubPage.selectedRows = [];
	}

	loadSubPage() {
		let dataFields = getDataFields();
		this.div.querySelector('#graphCoeff').innerText = dataFields.coeff;

		let numOrthologs = getNumOrthologs();
		let numDomains = getNumDomains();

		this.subPages.activeSubPage.divTab = new TabSequences(
			this.subPages.activeSubPage.div.querySelector("#divTab"), 
			this,
			sequenceList, 
			indexSequenceList,
			this.subPages.activeSubPage.fileName);
		this.subPages.activeSubPage.divTab.setDomains(getNumDomains());
		this.subPages.activeSubPage.divTab.setOrthologs(getNumOrthologs());
		let nodes = getNodes();
		nodes.forEach(node => {
			node.data.genome = genomes.find((gen) => {
				if(gen.abbrev == node.data.org)
					return true;
				return false;
			});
		});

		this.subPages.activeSubPage.divTab.setNodes(nodes);
		
		this.subPages.activeSubPage.divAlign = new DivAlignment(
			this.subPages.activeSubPage.div.querySelector("#divAlign"), 
			this,
			this.div.querySelector("#alignModal"), 
			nodes);

		let dataRg = getDataRg();
		this.subPages.activeSubPage.divTab.makeTabulator(genomes);
		for(let i = 0; i < gs.length; i++) {
			let tabRg = new Tabulator("#tabRg" + i, {columns: columnsGs, layout:"fitDataFill",});
			tabRg.setData(dataRg[i]);
		}

		let sTree = "";
		if(typeof(getTree) !== "undefined")
			sTree = getTree();
		this.subPages.activeSubPage.divPhylogeny = new DivPhylogeny(
			this.subPages.activeSubPage.div.querySelector("#divPhylo"), 
			this,
			this.div.querySelector("#phyloModal"), 
			nodes, 
			sTree);
		if(typeof getMast !== "undefined")
			this.subPages.activeSubPage.divPhylogeny.setMast(getMast(), getEMast());

		this.subPages.activeSubPage.divGraph = new DivGraph(
			this.subPages.activeSubPage.div.querySelector("#divGraph"), 
			this,
			nodes);
		this.subPages.activeSubPage.divGraph.setEdges(getEdges());
		if(this.subPages.activeSubPage.divTab.checkMaxNodes(maxNodes)) {
			this.subPages.activeSubPage.divPhylogeny.makeTree();
			this.subPages.activeSubPage.divGraph.makeGraph(gs);
			this.subPages.activeSubPage.divAlign.makeAlignment();
		}
		else {
			this.subPages.activeSubPage.divPhylogeny.display("none");
			this.subPages.activeSubPage.divAlign.display("none");
			this.subPages.activeSubPage.divGraph.display("none");
			$('#largeModal').modal({closable: false});
			$('#largeModal').modal('show');
		}
		this.subPages.activeSubPage.divTab.setUpdateSelection(this.updateSelection);
		this.subPages.activeSubPage.divAlign.setUpdateSelection(this.updateSelection);
		this.subPages.activeSubPage.divPhylogeny.setUpdateSelection(this.updateSelection);
		this.subPages.activeSubPage.divGraph.setUpdateSelection(this.updateSelection);
	}
	
	updateSelection(updatedRows, id) {
		this.subPages.activeSubPage.selectedRows = updatedRows;
		if(id != 0) this.subPages.activeSubPage.divTab.selectData(updatedRows);
		if(id != 1) this.subPages.activeSubPage.divPhylogeny.selectData(updatedRows);
		if(id != 2) this.subPages.activeSubPage.divAlign.selectData(updatedRows);
		if(id != 3) this.subPages.activeSubPage.divGraph.selectData(updatedRows);
	}
	
	
    clearPage() {

	}
	
	updateIcon() {
        if(this.subPages.lenght() < 2) {
			document.getElementById("menuPageFamily").setAttribute('style', 'display:none !important');
			console.log("none");
            return false;
        }
        else {
			document.getElementById("menuPageFamily").setAttribute('style', 'display:block !important');
			console.log("block");
            return true;
        }
	}
	
	onRemovePage(page) {
        this.div.removeChild(page.div);
		this.updateIcon();
		console.log("remove");
        session.changePage('home');
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
                this.subPages.activeSubPage.headFilters.push({column: el.field, value: el.value});
            });
	}

	save() {
		return this.subPages.save();
	}
}