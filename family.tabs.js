class TabSequences {
    constructor(div, superPage, familyList, indexFamilyList, fileName) {
        this.div = div;
        this.familyList = familyList;
        this.indexFamilyList = indexFamilyList;
        this.divDomains = div.querySelector("#divDomains");
        this.divOrthologs = div.querySelector("#divOrthologs");
        this.divTab = div.querySelector("#tabSeqs");
        this.superPage = superPage;

        $(div.querySelector('#tabColumnsIcon')).popup({
			on: 'click',
			lastResort: 'right center',
			closable: true,
			exclusive: true,
			delay: {
				show: 300,
				hide: 800
			},
			onShow: function(module) {
			}
        });

        $(this.div.querySelector('#tabSidebar')).sidebar({
			transition: 'overlay',
			context: $(this.div.querySelector('#tabSegment'))
		});
		this.div.querySelector("#tabSidebarIcon").onclick = () => {
			$(this.div.querySelector('#tabSidebar')).sidebar('toggle');
		}
		
        
        $(div.querySelector('#linkCustomFasta')).popup({
			inline: true,
			hoverable: true,
			closable: false,
			position: 'top left',
			delay: {
				show: 300,
				hide: 800
			}
		});
        this.setDefaultValues();
        
        this.div.querySelector("#selectAll").onclick = () => {
            this.selectAll();
        };
        this.div.querySelector("#deselectAll").onclick = () => {
            this.deselectAll();
        };
        this.div.querySelector("#showNotPresentGenomes").onchange = () => {
            if(typeof this.tabSeqs === "undefined" || this.tabSeqs === null)
                return;
            this.tabSeqs.removeFilter('data.present', '=', true);
            if(!$('#showNotPresentGenomes').checkbox('is checked'))
                this.tabSeqs.setFilter('data.present', '=', true);
        };

        this.div.querySelector("#tabSeqsGroupBy").onchange = () => {
            if(typeof this.tabSeqs === "undefined" || this.tabSeqs === null)
                return;
            this.tabSeqs.setGroupBy($('#tabSeqsGroupBy').dropdown('get value'));
            this.tabSeqs.setSort([{column:'sortGroupColumn', dir:'asc'}]);
        };

        this.div.querySelector("#linkFasta").onclick = () => {
            alert();
            this.downloadCustomFasta(true);
        };

        this.div.querySelector("#linkCustomFastaDownload").onclick = () => {
            this.downloadCustomFasta(false);
        };

        if(this.div.querySelector('#thumbtack') != null) {
			let divSidebar = this.div.querySelector('.demo.sidebar.menu');
			let divPusher = this.div.querySelector('.sectionData.pusher');
			let divThumbtack = this.div.querySelector('#thumbtack');
			divSidebar.style.zIndex = 1;
			divPusher.style.zIndex = 0;
			divThumbtack.onclick = () => {
				$(divSidebar).sidebar('hide');
				if(divThumbtack.classList.value.includes("red")) {
					divThumbtack.classList.remove("red");
					$(divSidebar).sidebar('setting', 'closable', true);
					$(divSidebar).sidebar('setting', 'dimPage', true);
				}
				else {
					divThumbtack.classList.add("red");
					$(divSidebar).sidebar('setting', 'closable', false);
					$(divSidebar).sidebar('setting', 'dimPage', false);
				}
				setTimeout(() => {
					$(divSidebar).sidebar('show');
					setTimeout(() => {
						if(divThumbtack.classList.value.includes("red"))
							$(divPusher).removeClass("dimmed");
						else
							$(divPusher).addClass("dimmed");
					}, 200);
				}, 100);
			};
		}
    }

    setDefaultValues() {
        $(this.div.querySelector('#showNotPresentGenomes')).checkbox('set unchecked');
        $(this.div.querySelector("#tabSeqsGroupBy")).dropdown("clear");
    }

    setDomains(numDomains) {
        this.numDomains = numDomains;
        if(numDomains > 0) {
            var html = "<b>Domains:</b> ";
            var htmlHeader = '<div class="divider"></div><div class="header"><i class="folder icon"></i> Domains</div>';
            $("#graphColors").find(".menu").append(htmlHeader);
            $("#treeNodeGroup").find(".menu").append(htmlHeader);
            $("#treeEdgeGroup").find(".menu").append(htmlHeader);
            $("#treeNodeName").find(".menu").append(htmlHeader);
            for(var i = 1; i <= numDomains; i++) {
                var htmlItem = '<div class="sub item" data-value="dom' + i + '">Domain ' + i + '</div>';
                $("#graphColors").find(".menu").append(htmlItem);
                $("#treeNodeGroup").find(".menu").append(htmlItem);
                $("#treeEdgeGroup").find(".menu").append(htmlItem);
                $("#treeNodeName").find(".menu").append(htmlItem);
                if(i == numDomains)
                    html += ' and ';
                else if(i > 1)
                    html += ', ';
                html += '<a href="family.htm?file=' + fileName + '.d' + (i-1) + '">' + i + '</a>';
            }
            this.divDomains.innerHTML = html;
        }
    }

    setOrthologs(numOrthologs) {
        this.numOrthologs = numOrthologs;
        if(numOrthologs > 0) {
            var html = "<b>Orthologs:</b> ";
            var htmlHeader = '<div class="divider"></div><div class="header"><i class="folder icon"></i> Orthologs</div>';
            $("#graphColors").find(".menu").append(htmlHeader);
            $("#treeNodeGroup").find(".menu").append(htmlHeader);
            $("#treeEdgeGroup").find(".menu").append(htmlHeader);
            $("#treeNodeName").find(".menu").append(htmlHeader);
            for(var i = 1; i <= numOrthologs; i++) {
                var htmlItem = '<div class="sub item" data-value="dom' + i + '">Ortholog ' + i + '</div>';
                $("#graphColors").find(".menu").append(htmlItem);
                $("#treeNodeGroup").find(".menu").append(htmlItem);
                $("#treeEdgeGroup").find(".menu").append(htmlItem);
                $("#treeNodeName").find(".menu").append(htmlItem);
                if(i == numOrthologs)
                    html += ' and ';
                else if(i > 1)
                    html += ', ';
                html += '<a href="family.htm?file=' + fileName + '.d' + (i-1) + '">' + i + '</a>';
            }
            this.divOrthologs.innerHTML = html;
        }
    }

    setNodes(nodes) {
        this.nodes = nodes;
        for(var i = 0; i < nodes.length; i++) {
            nodes[i].data.present = true;
            nodes[i].data.cols = {domains:{}, orthologs:{}};
            for(var k = 0; k < getNumDomains(); k++)
                nodes[i].data.cols.domains["d"+k] = nodes[i].data.domains.indexOf(k+1) > -1;
            nodes[i].data.cols.orthologs = nodes[i].data.orthologs[0];
        }
    }

    checkMaxNodes(maxNodes) {
        return this.nodes.length < maxNodes;
    }

    getNotPresentGenomes(genomes) {
        let notPresent = [];
        for(let i = 0; i < genomes.length; i++) {
            let included = false;
            for(let j = 0; j < this.nodes.length; j++) {
                if(genomes[i].abbrev == this.nodes[j].data.org) {
                    included = true;
                }
            }
            if(!included) {
                let newNode = {data:{org:genomes[i].abbrev, key:"Not Present", seq:"",present:false}};
                for(let j = 0; j < gs.length; j++) {
                    newNode.data["rg" + j] = {name:gs[j].childs[genomes[i].rg[j]].name};
                }
                notPresent.push(newNode);
            }
        }
        return notPresent;
    }

    calcHeight() {
        let height = "calc(100vh - 105px)";
        if(this.numDomains > 0 && this.numOrthologs > 0)
            height = "calc(100vh - 145px)";
        else if(this.numDomains > 0 || this.numOrthologs > 0)
            height = "calc(100vh - 125px)";
        return height;
    }

    getColumnsSeqs(gs) {
        let column = [
            {title:"Genome", field:"data.org", headerFilter:true, headerFilterFunc:alphFilter, width:120, bottomCalc:diffCalcs},
            {title:"Locus Tag", field:"data.key", headerFilter:true, headerFilterFunc:alphFilter, width:180, bottomCalc:"count"},
            {title:"Position", columns:[
                {title:"Length", field:"data.len", headerFilter:true, headerFilterFunc:numFilter, width:80},
                {title:"Start Codon", field:"data.s", headerFilter:true, headerFilterFunc:numFilter, sorter:"number", formatter:'money', formatterParams:{precision:0}, headerFilterPlaceholder:"Numerical Filter", width:110, align:'right'},
                {title:"End Codon", field:"data.e", headerFilter:true, headerFilterFunc:numFilter, sorter:"number", formatter:'money', formatterParams:{precision:0}, headerFilterPlaceholder:"Numerical Filter", width:110, align:'right'},
                {title:"Contig", field:"data.c", headerFilter:true, headerFilterFunc:alphFilter, },
                {title:"Strand", field:"data.d", headerFilter:true, width:80, align:'center', mutator:function(value, data, type, params, component){if(data.data.key != "Not Present" && typeof(data.data.key) != "number") return (value==true?'-':'+');}},
                {title:"", field:"genomeIcon", width:15, formatter:"html", align:'center', mutator:function(value, data, type, params, component){if(data.data.key != "Not Present" && typeof(data.data.key) != "number") return '<i class="icon search"></i>'; return "";}},
            ]},
            {title:"Clustering Coeff.", field:"data.coef", headerFilter:true, headerFilterFunc:numFilter, width:80},
            {title:"Function", field:"data.func", headerFilter:true, headerFilterFunc:alphFilter, bottomCalc:diffCalcs},
        ];
        if(this.numDomains != undefined && this.numDomains != null && this.numDomains > 0) {
            let domains = [];
            for(let i = 0; i < this.numDomains; i++)
                domains.push({title:""+(i+1), formatter:"tickCross", field:"data.cols.domains.d" + i, headerFilter:true, width:30});
            column.push({title:"Domains", columns:domains});
        }
        if(this.numOrthologs != undefined && this.numOrthologs != null && this.numOrthologs > 0)
            column.push({title:"COG", field:"data.cols.orthologs", headerFilter:true, headerFilterFunc:numFilter, width:70, headerTooltip:"Cluster of Orthologs Groups"});
        let columnGroups = [];
        for(let i = 0; i < gs.length; i++)
            columnGroups.push({title:gs[i].name, field:"data.rg" + i + ".name", headerFilter:true, headerFilterFunc:alphFilter, width:160, bottomCalc:diffCalcs});
        column.push({title:"Groups", columns:columnGroups});
        column.push({title:"Blast", field:"data.seq", formatter:'link', formatterParams:{label:"BLAST", urlPrefix:"https://blast.ncbi.nlm.nih.gov/Blast.cgi?PROGRAM=blastp&DATABASE=nr&CMD=PUT&QUERY="}});
        column.push({field:"data.present", visible:false});
        column.push({field:"module.genome", visible:false});
        return column;
    }

    makeTabulator(genomes) {
        this.colors = [];
        this.nodes.forEach(node => {
            let genome = 0;
            let genomeName = "";
            for (let i = 0; i < genomes.length; i++)
                if(genomes[i].abbrev == node.data.org) {
                    genome = i;
                    genomeName = genomes[i].name;
                }
            node.moduleGenome = new ModuleGenome(node.data.org, genomeName, node.data.c, node.data.s, node.data.e, node.data.key, genome, this.familyList, this.indexFamilyList, this.colors);
        });

        this.tabSeqs = new Tabulator(this.div.querySelector("#tabSeqs"), {
            height: this.calcHeight(),
            columnVertAlign:"bottom",
            progressiveRender: true,
            progressiveRenderSize: 200,
            progressiveRenderMargin: 200,
            groupToggleElement:"header",
            groupStartOpen:false,
            selectable: true,
            rowSelected:(row) => {
                let vet = [];
                this.tabSeqs.getSelectedRows().forEach(function(row) {
                    vet.push(row.getData().data.key);
                });
                this.superPage.updateSelection.call(this.superPage, vet, 0);
            },
            rowDeselected:(row) => {
                let vet = [];
                this.tabSeqs.getSelectedRows().forEach(function(row) {
                    vet.push(row.getData().data.key);
                });
                this.superPage.updateSelection.call(this.superPage, vet, 0);
            },
            dataFiltered:function(filters, rows){
                if($("#alignSorter").val() == "tab" && typeof(m) !== "undefined") {
                    m.seqs.sort();
                    m.render();
                }
            },
            dataSorted:function(sorters, rows){
                if($("#alignSorter").val() == "tab" && typeof(m) !== "undefined") {
                    m.seqs.sort();
                    m.render();
                }
            },
            rowFormatter:function(row){
                if(row._row.type == "row") {
					if(row.getData().moduleGenome != null && row.getData().data.key != "Not Present")
	                    row.getElement().appendChild(row.getData().moduleGenome.div);
                    return false;
                }
            },
            cellClick:(e, cell) => {
                this.e = e;
                this.cell = cell;
                if(cell.getColumn().getField() == "genomeIcon") {
                    cell.getData().moduleGenome.toggle();
                    cell.getRow().toggleSelect();
                    return false;
                }
            },
            columns: this.getColumnsSeqs(gs)
        });
        this.tabSeqs.setData(this.getNotPresentGenomes(genomes).concat(this.nodes));
        this.tabSeqs.setFilter("data.present", "=", true);

        document.getElementsByClassName("tabulator-tableHolder")[0].onscroll = () => {
            this.tabSeqs.getRows().forEach(function(row){
            if(typeof(row.getData().moduleGenome) != "undefined")
                row.getData().moduleGenome.div.style.marginLeft = document.getElementsByClassName("tabulator-tableHolder")[0].scrollLeft + "px";
            });
        }
    
    }

    selectData(selectedKeys) {
        let rows = this.tabSeqs.getRows();
        rows.forEach(function(row){
            let key = row.getData().data.key;
            if(selectedKeys.indexOf(key) != -1)
                row.select();
            else
                row.deselect();
        });
    }

    orderData() {
		let order = {};
		let rows = this.tabSeqs.getRows();
		rows.forEach(function(row){
			if(row.row.data.data.present)
				order[row.row.data.data.key] = row.getPosition(true);

		});
		return order;
    }
    
    setUpdateSelection(updatedSelection) {
        this.updateSelection = updatedSelection;
    }

    selectAll() {
		let selectedRows=[];
		this.tabSeqs.getRows(true).forEach(function(row){
			selectedRows.push(row.getData().data.key);
        });
        updateSelection(selectedRows, -1);
    }

    deselectAll() {
		let selectedRows=[];
		updateSelection(selectedRows, -1);
    }
    
    display(value) {
        div.style.display = value;
    }

    downloadCustomFasta(defaultFile) {
        let fastaId = $(this.div.querySelector("#popupIdFasta")).dropdown("get value");
		let field1 = $(this.div.querySelector("#popupField1Fasta")).dropdown("get value");
        let field2 = $(this.div.querySelector("#popupField2Fasta")).dropdown("get value");
		let field3 = $(this.div.querySelector("#popupField3Fasta")).dropdown("get value");
        
        let fasta = "";
        this.nodes.forEach(function(node){
            if(defaultFile)
				fasta += ">" + node.data.key;
			else {
				fasta += ">" + node.data[fastaId];
				if(field1 != "" && field1 != "a") {
					if(field1.includes("rg"))
						fasta += " " + node.data[field1].name;
					else
						fasta += " " + node.data[field1];
				}
				if(field2 != "" && field2 != "a") {
					if(field2.includes("rg"))
						fasta += " " + node.data[field2].name;
					else
						fasta += " " + node.data[field2];
				}
				if(field3 != "" && field3 != "a") {
					if(field3.includes("rg"))
				 		fasta += " " + node.data[field3].name;
					else
						fasta += " " + node.data[field3];
                }
            }

            fasta += "\n" + node.data.seq.replace(/\./g, '').replace(/\-/g, '').match(/.{1,60}/g).join("\n") + "\n";
        });
		downloadFile(fileName + ".fasta", fasta);
	}
}
