class DivPhylogeny {
    constructor(div, superPage, divRedo, nodes, newick) {
		this.div = div;
		this.divRedo = divRedo;
        this.nodes = nodes;
        this.newick = newick;
        this.divProgram = div.querySelector("#phylogram");
		this.tree = null;
		this.superPage = superPage;

        this.mast = [];
        this.emast = [];
		this.phyloHeight = 500;
		this.updateSelection = null;

		this.setDefaultValues();
        $(this.div.querySelector('#treeColumnsIcon')).popup({
			on: 'click',
			lastResort: 'right center',
			closable: true,
			exclusive: true,
			delay: {
				show: 300,
				hide: 800
			},
        });
		
		$(this.div.querySelector('#treeSidebar')).sidebar({
			transition: 'overlay', 
			context: $(this.div.querySelector('#treeSegment'))
		});
		this.div.querySelector("#treeSidebarIcon").onclick = () => {
			$(this.div.querySelector('#treeSidebar')).sidebar('toggle');
		}
		
		if(this.div.querySelector("#treeRedoIcon") && (typeof(serverUrl) == 'undefined' || typeof(makePort) == 'undefined')) {
			this.div.querySelector('#treeRedoIcon').style.display = 'none';
		}
        
        let eventTimer = new EventTimer(() => {this.style();}, 5);
        $(this.div.querySelector('#treeZoom')).slider({min: 1, max: 200, start: 51, onChange: () => {eventTimer.trigger();}});
		$(this.div.querySelector('#treeSliderFont')).slider({min: 1, max: 50,  start: 10, onChange: () => {eventTimer.trigger();}});
		$(this.div.querySelector('#treeSliderBranchWidth')).slider({min: 0, max: 50, start: 1, onChange: () => {eventTimer.trigger();}});
		$(this.div.querySelector('#treeSliderBranchLength')).slider({min: 1, max: 200, start: 101, onChange: () => {eventTimer.trigger();}});
		this.div.querySelector('#treeBranchScale').onchange = () => {eventTimer.trigger();};
		this.div.querySelector('#treeZoomScale').onchange = () => {eventTimer.trigger();};
		$(this.div.querySelector('#treeSliderNodeSize')).slider({min: 0, max: 50, start: 0, onChange: () => {eventTimer.trigger();}});

		$('#sliderAlignZoom').slider({
			min: 4,
			max: 8,
			value: 5,
			slide: function( event, ui ) {
				m.g.scale.setSize(ui.value);
			}
		});
        
        this.div.querySelector('#phyloLayout').onchange = () => {
            this.tree.setTreeType($(this.div.querySelector('#phyloLayout')).dropdown('get value'));
        }

        let eventStyle = () => {this.style();};
        this.div.querySelector('#treeRightLabel').onchange = eventStyle;
        this.div.querySelector('#treeLabels').onchange = eventStyle;
        this.div.querySelector('#treeBranchLenght').onchange = eventStyle;
        this.div.querySelector('#treeNodeGroup').onchange = eventStyle;
        this.div.querySelector('#treeEdgeGroup').onchange = eventStyle;
        this.div.querySelector('#treeNodeName').onchange = eventStyle;
        this.div.querySelector('.inverted.plus.square.icon').onclick = () => {this.updateHeight(20);};
		this.div.querySelector('.inverted.minus.square.icon').onclick = () => {this.updateHeight(-20);};
		this.div.querySelector('#treeMetadata').innerHTML = '';
		for (var i = 0; i < gs.length; i++)
		this.div.querySelector('#treeMetadata').innerHTML += "<option value=\"" + i + "\">" + gs[i].name + "</option>";
        this.div.querySelector('#treeMetadata').onchange = () => {this.showMetadata();};
		this.div.querySelector('#treeMetadataText').onchange = () => {this.showMetadata();};
		this.div.querySelector('#downloadTree').onclick = () => {
			downloadFile('tree.svg', this.tree.exportSVG.getSVG().outerHTML);
		}
		this.div.querySelector('#downloadNewick').onclick = () => {
			downloadFile('tree.nwk', this.tree.stringRepresentation);
		}
		
		if(this.divRedo != null) {
			$(this.divRedo.querySelector('#programPhylo')).onchange = () => {
				this.divRedo.querySelector('#modalFasttree').style.display = 'none';
				this.divRedo.querySelector('#modalPhyml').style.display = 'none';
				this.divRedo.querySelector('#modalRaxml').style.display = 'none';
				let value = $(this.divRedo.querySelector('#programPhylo')).dropdown('get value');
				this.divRedo.querySelector('#' + value).style.display = 'block';
			};
			this.div.querySelector('#treeRedoIcon').onclick = () => {
				$(this.divRedo).modal('show');
				this.divRedo.querySelector('#programPhylo').onchange();
			};
			this.divRedo.querySelector('#makePhylo').onclick = () => {
				this.redoPhylogeny();
			};
		}

		if(this.div.querySelector('#treeType') != null) {
			this.div.querySelector('#treeType').onchange = () => {
				let text = $(this.div.querySelector('#treeType')).dropdown('get value');
				if(text != '') {
					let sTree = eval(text).tree;
					this.setNewick(sTree);
					this.makeTree();
				}
			};
		}

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
	
	setNewick(newick) {
		this.newick = newick;
	}

    setDefaultValues() {
        let layout = $(this.div.querySelector('#phyloLayout'));
        if(layout.dropdown("get value") === "")
            layout.dropdown("set selected", "rectangular")
    }

    setMast(mast, emast) {
        this.mast = mast;
        this.emast = emast;
    }

    setUpdateSelection(updateSelection) {
        this.updateSelection = updateSelection;
    }

    selectData(selectedKeys) {
        if(this.div.style.display !== "none" && this.tree != null && this.tree != undefined) {
            this.tree.clearSelect();
            selectedKeys.forEach((key) => {
                this.tree.branches[key].selected = true;
                this.tree.branches[key].cascadeFlag('selected', true);
            });
            this.tree.draw();
        }
	}

	orderData() { 
		var order = {};
		if (typeof(treeLayout) !== "undefined") {
			for(var i = 0; i < tree.leaves.length; i++)
				order[tree.leaves[i].mydata.originalName] = i;
		}
		return order;
	}

    preTreeLoad() {
		this.tree.mydata = {totais: getTotais()};
		this.tree.mydata.totais = [];
		for(let i = 0; i < gs.length; i++) {
			this.tree.mydata.totais.push([]);
			for(let j = 0; j < gs[i].childs.length; j++)
				this.tree.mydata.totais[i].push(0);
		}
		this.traverse(this.tree.root);
		this.traverse2(this.tree.root, [], [], true, true);
    }
	
	findPos(vet, func) {
		for(let i = 0; i < this.nodes.length; i++) {
			if(func(this.nodes[i]))
				return i;
		}
		return -1;
	}
    traverse(node) {
		if(node.leaf == true) {
			let j = this.findPos(this.nodes, (a) => {return a.data.key == node.id});
			node.mydata = {originalName:this.nodes[j].data.key, genome: this.nodes[j].data.genome, doms:this.nodes[j].data.domains, orthologs:this.nodes[j].data.orthologs, org: this.nodes[j].data.org, mast: (this.mast.indexOf(this.nodes[j].data.key)>=0), emast: (this.emast.indexOf(this.nodes[j].data.key)>=0)};
			for(let k = 0; k < gs.length; k++) {
				this.tree.mydata.totais[k][this.nodes[j].data["rg" +k].id]++;
				node.mydata["rg" + k] = this.nodes[j].data["rg"+k];
			}
			
			/*for(let j = 0; j < this.nodes.length; j++) {
				if(this.nodes[j].data.key == node.id) {
					node.mydata = {originalName:this.nodes[j].data.key, doms:this.nodes[j].data.domains, orthologs:this.nodes[j].data.orthologs, org: this.nodes[j].data.org, mast: (this.mast.indexOf(this.nodes[j].data.key)>=0), emast: (this.emast.indexOf(this.nodes[j].data.key)>=0)};
					for(let k = 0; k < gs.length; k++) {
						this.tree.mydata.totais[k][this.nodes[j].data["rg" +k].id]++;
						node.mydata["rg" + k] = this.nodes[j].data["rg"+k];
					}
				}
			}*/
		}
		else {
			node.children.forEach(child => {
				this.traverse(child);
			});
			node.mydata = {
				a:{
					rg:getTotais(), 
					doms:[], 
					orthologs:[], 
					mast:false, 
					emast:false}, 
				b:{
					rg:[], 
					doms:[], 
					orthologs:[], 
					mast:false, 
					emast:false}};
			//node.mydata.a.rg["rg" + j] = -1;
			node.children.forEach(child => {
				if(child.leaf) {
					for (var j = 0; j < gs.length; j++) {
						node.mydata.a.rg[j][child.mydata["rg" + j].id]++;
					}
					node.mydata.a.doms = node.mydata.a.doms.concat(child.mydata.doms);
					node.mydata.a.orthologs = node.mydata.a.orthologs.concat(child.mydata.orthologs);
					node.mydata.a.mast = node.mydata.a.mast || child.mydata.mast;
					node.mydata.a.emast = node.mydata.a.emast || child.mydata.emast;
				}
				else {
					node.mydata.a.rg = sumTotais(node.mydata.a.rg, child.mydata.a.rg);
					node.mydata.a.doms = child.mydata.a.doms.concat(node.mydata.a.doms);
					node.mydata.a.orthologs = node.mydata.a.orthologs.concat(child.mydata.a.orthologs);
					node.mydata.a.mast = node.mydata.a.mast || child.mydata.a.mast;
					node.mydata.a.emast = node.mydata.a.emast || child.mydata.a.emast;
				}
				
			});
			node.mydata.a.doms = node.mydata.a.doms.unique();
			node.mydata.a.orthologs = node.mydata.a.orthologs.unique();
		}
	}

	traverse2(node, doms, orthologs, mast, emast) {
		if(node.leaf == false) {
			node.mydata.b.rg = subTotais(this.tree.mydata.totais, node.mydata.a.rg);
			//var totalDoms = node.mydata.a.doms.slice(0);
			//var totalOrthologs = node.mydata.a.orthologs.slice(0);

			node.mydata.b.doms = doms;
			node.mydata.b.orthologs = orthologs;

			let totalDoms = node.mydata.a.doms.concat(doms);
			let totalOrthologs = node.mydata.a.orthologs.concat(orthologs);
			let totalMast = [mast];
			let totalEMast = [emast];
			for (let i = 0; i < node.children.length; i++) {
				if(node.children[i].leaf) {
					totalDoms = totalDoms.concat(node.children[i].mydata.doms);
					totalOrthologs = totalOrthologs.concat(node.children[i].mydata.orthologs);
					totalMast = totalMast.concat([node.children[i].mydata.mast]);
					totalEMast = totalEMast.concat([node.children[i].mydata.emast]);
				}
				else {
					totalDoms = totalDoms.concat(node.children[i].mydata.a.doms);
					totalOrthologs = totalOrthologs.concat(node.children[i].mydata.a.orthologs);
					totalMast = totalMast.concat([node.children[i].mydata.a.mast]);
					totalEMast = totalEMast.concat([node.children[i].mydata.a.emast]);
				}
			}

			for (let i = 0; i < node.children.length; i++) {
				if(node.children[i].leaf == false) {
					node.children[i].mydata.b.doms = totalDoms.diff(node.children[i].mydata.a.doms).unique();
					node.children[i].mydata.b.orthologs = totalOrthologs.diff(node.children[i].mydata.a.orthologs).diff(node.children[i].mydata.a.orthologs).unique();
					node.children[i].mydata.b.mast = totalMast.diff([node.children[i].mydata.a.mast]).indexOf(true) >= 0;
					node.children[i].mydata.b.emast = totalEMast.diff([node.children[i].mydata.a.emast]).indexOf(true) >= 0;
					this.traverse2(node.children[i], totalDoms.diff(node.children[i].mydata.a.doms), totalOrthologs.diff(node.children[i].mydata.a.orthologs), node.children[i].mydata.b.mast, node.children[i].mydata.b.eMast);
				}
			}
		}
    }
    
    makeTree() {
		if(typeof this.newick !== 'undefined' && this.newick !== "") {
            this.div.style.display = "grid";
			if (typeof this.tree == 'undefined' || this.tree == null) {
				this.tree = Phylocanvas.createTree(this.divProgram);
				this.tree.setTreeType($(this.div.querySelector('#phyloLayout')).dropdown("get value"));
				this.tree.fillCanvas = true;
				this.tree.disableZoom = true;
				this.tree.on('beforeFirstDraw', () => {
					this.preTreeLoad();
					this.tree.fillCanvas = true;
					this.tree.padding = 0;
					this.style();
					this.showMetadata();
				});
				this.tree.on('click', () => {
					//this.updateSelection(this.tree.getSelectedNodeIds(), 1);
					this.superPage.updateSelection.call(this.superPage, this.tree.getSelectedNodeIds(), 1);
				});
			}
			this.tree.load(this.newick);
		}
		else {
			this.div.style.display = "none";
		}
    }
    
    style() {
		if(this.tree == null || this.tree == undefined)
			return;
		this.tree.alignLabels = $(this.div.querySelector('#treeRightLabel')).checkbox('is checked');
		this.tree.showBranchLengthLabels = $(this.div.querySelector('#treeBranchLenght')).checkbox('is checked');
		this.tree.setNodeSize($(this.div.querySelector('#treeSliderNodeSize')).slider("get value"));
		this.tree.lineWidth = $(this.div.querySelector('#treeSliderBranchWidth')).slider("get value");
		var value = $(this.div.querySelector('#treeZoom')).slider('get value');
		if(value >= 51)
            this.tree.zoom = 1 + (value - 50)/25;
		else
			this.tree.zoom = (value/50);
		if(this.div.querySelector('#treeZoomScale').value != "") {
			this.tree.zoom = parseFloat(this.div.querySelector('#treeZoomScale').value);
		}



		var node = $(this.div.querySelector("#treeNodeGroup")).dropdown("get value");
		var edge = $(this.div.querySelector("#treeEdgeGroup")).dropdown("get value");
		var treeNodeName = $("#treeNodeName").dropdown("get value");
		if($(this.div.querySelector('#treeLabels')).checkbox('is checked') || treeNodeName != "")
            this.tree.showLabels = true;
		else
            this.tree.showLabels = false;

		for(let branchId in this.tree.branches) {
			let branch = this.tree.branches[branchId];
			if(branch.leaf == true) {
				let genome = branch.mydata.genome;
				let labelColor = 'black';
				if(node.indexOf("rg") == 0) {
					let gsId = parseInt(node.substring(2));
					labelColor = gs[gsId].childs[genome.rg[gsId]].color;
				}
				else if(node.indexOf("dom") == 0) {
					labelColor = "#ff0000";
				}
				else if(node.indexOf("ortho") == 0) {
					if(branch.mydata.orthologs.indexOf(parseInt(node.substring(5))) >= 0)
						labelColor = "#ff0000";
				}
				else if(node == "mast") {
					if(branch.mydata.mast)
						labelColor = "#ff0000";
				}
				else if(node == "eMast") {
					if(branch.mydata.emast)
						labelColor = "#ff0000";
				}
				branch.setDisplay({labelStyle: {colour: labelColor}});

				let edgeColor = "black";
				if(edge.indexOf("rg") == 0) {
					let gsId = parseInt(edge.substring(2));
					edgeColor = gs[gsId].childs[genome.rg[gsId]].color;
				}
				else if(edge.indexOf("dom") == 0) {
					edgeColor = "#ff0000";
				}
				else if(edge.indexOf("ortho") == 0) {
					if(branch.mydata.orthologs.indexOf(parseInt(edge.substring(5))) >= 0)
						edgeColor = "#ff0000";
				}
				else if(node == "mast") {
					if(branch.mydata.mast)
						edgeColor = "#ff0000";
				}
				else if(node == "eMast") {
					if(branch.mydata.emast)
						edgeColor = "#ff0000";
				}
				branch.setDisplay({colour: edgeColor});

				if($('#treeLabels').checkbox('is checked')) {
					if(treeNodeName.indexOf("rg") == 0)
						branch.label = branch.mydata.originalName + " (" + branch.mydata["rg" + parseInt(treeNodeName.substring(2))].name + ")";
					else if(treeNodeName == "org")
						branch.label = branch.mydata.originalName + " (" + branch.mydata.org + ")";
					else
						branch.label = branch.mydata.originalName;
				}
				else {
					if(treeNodeName.indexOf("rg") == 0)
						branch.label = branch.mydata["rg" + parseInt(treeNodeName.substring(2))].name;
					else if(treeNodeName == "org")
						branch.label = branch.mydata.org;
				}
			}
			else {
				let edgeColor = 'black';
				if(edge.indexOf("rg") == 0) {
					if(parseInt(edge.substring(2)) > 0) {
						var indexA = uniqueTotais(branch.mydata.a.rg[parseInt(edge.substring(2))]);
						var indexB = uniqueTotais(branch.mydata.b.rg[parseInt(edge.substring(2))]);
						if(indexA >= 0)
							edgeColor = gs[parseInt(edge.substring(2))].childs[indexA].color;
						else if(indexA >= 0)
							edgeColor = gs[parseInt(edge.substring(2))].childs[indexB].color;
					}
				}
				else if(edge.indexOf("dom") == 0) {
					if(branch.mydata.a.doms.indexOf(parseInt(edge.substring(3))) >= 0 && branch.mydata.b.doms.indexOf(parseInt(edge.substring(3))) >= 0)
						edgeColor = "#ff0000";
				}
				else if(edge.indexOf("ortho") == 0) {
					if(branch.mydata.a.orthologs.indexOf(parseInt(edge.substring(5))) >= 0 && tree.branches[branch].mydata.b.orthologs.indexOf(parseInt(edge.substring(5))) >= 0)
						edgeColor = "#ff0000";
				}
				else if(edge.indexOf("mast") == 0) {
					if(branch.mydata.a.mast)
						edgeColor = "#ff0000";
				}
				else if(edge.indexOf("eMast") == 0) {
					if(branch.mydata.a.mast)
						edgeColor = "#ff0000";
				}
				branch.setDisplay({colour: edgeColor});
			}
		}

		this.tree.draw(true);
		this.tree.setTextSize($(this.div.querySelector('#treeSliderFont')).slider("get value"));
		if(this.div.querySelector('#treeBranchScale').value != "") {
			this.tree.branchScalar = parseInt(this.div.querySelector('#treeBranchScale').value);
			this.tree.draw();
		}
		else {
			value = $(this.div.querySelector('#treeSliderBranchLength')).slider("get value");
			if(value >= 101)
			value = 1 + (value - 100)/25;
			else
			value = (value/100);
			this.tree.setBranchScale(value);
		}
    }
    
    showMetadata() {
		if(this.tree == null || this.tree == undefined)
			return;
		for(var i = 0; i < this.tree.leaves.length; i++) {
			this.tree.leaves[i].data = {};
			var k = 1;
			for(var j = 0; j < gs.length; j++) {
				if (this.div.querySelector("#treeMetadata").options[j].selected) {
					if($(this.div.querySelector("#treeMetadataText")).checkbox('is checked'))
						this.tree.leaves[i].data[gs[j].name] = {colour: gs[j].childs[this.tree.leaves[i].mydata.genome.rg[j]].color, label: this.tree.leaves[i].mydata["rg"+j].name};
					else
						this.tree.leaves[i].data[gs[j].name] = {colour: gs[j].childs[this.tree.leaves[i].mydata.genome.rg[j]].color};
					k++;
				}
			}
		}
		this.tree.draw(true);
		this.tree.setTextSize($(this.div.querySelector('#treeSliderFont')).slider("get value"));
    }
    
    updateHeight(x) {
		this.phyloHeight += x;
		//document.getElementById("pusher").style.height = (500*0.38 + 0.62*phyloHeight)+"px";
		document.getElementById("pusher").style.height = this.phyloHeight+"px";
		document.getElementById("phylogram").style.height = (this.phyloHeight)+"px";
		document.getElementById("phylogram__canvas").style.height = (this.phyloHeight)+"px";
		this.tree.canvas.canvas.height = this.phyloHeight;
		this.tree.draw(true);
		this.tree.setTextSize($('#treeSliderFont').slider("value"));
    }
    
    display(value) {
		if(div != null)
        div.style.display = value;
	}
	
	redoPhylogeny() {
		this.div.querySelector("#phyloDimmerLoader").classList.add("active");
		setTimeout(() => {
			let page = serverUrl + makePort;
			let seqs = [];
			nodes.forEach(node => {
				seqs.push({key: node.data.key, seq: node.data.seq});
			});

			let program = '';
			switch ($('#programPhylo').dropdown('get value')) {
				case 'modalFasttree':
					program = "fasttree";
					break;
				case 'modalPhyml':
					program = 'phyml';
					break;
				case 'modalRaxml':
					program = 'raxml'
					break;
			}
			let request = {
				seqs: seqs,
				program: program,
			}
			if(program == "fasttree") {
				request.search = ''+$(this.divRedo.querySelector('#searchFasttree')).dropdown('get value');
				request.topology = ''+$(this.divRedo.querySelector('#topologyFasttree')).dropdown('get value');
				request.model = ''+$(this.divRedo.querySelector('#modelFasttree')).dropdown('get value');
				request.join = ''+$(this.divRedo.querySelector('#joinFasttree')).dropdown('get value');
			}
			else if(program == "phyml") {
				request.model = ''+$(this.divRedo.querySelector('#modelPhyml')).dropdown('get value');
				request.propInvar = this.divRedo.querySelector('#propInvarPhyml').value;
				request.subRate = this.divRedo.querySelector('#subRatePhyml').value;
				request.gammaShape = this.divRedo.querySelector('#gammShapePhyml').value;

				request.improvement = ''+$(this.divRedo.querySelector('#improvementPhyml')).dropdown('get value');
				request.randTrees = this.divRedo.querySelector('#randTreesPhyml').value;
				request.startTrees = this.divRedo.querySelector('#startTreesPhyml').value;
			}
			else if(program == 'raxml') {
				request.model = ''+$(this.divRedo.querySelector('#subModelRaxml')).dropdown('get value') + $(this.divRedo.querySelector('#matrixRaxml')).dropdown('get value');
				request.numRuns = this.divRedo.querySelector('#numRunsRaxml').value;
				request.rapidRandSeed = this.divRedo.querySelector('#rapidRandSeedRaxml').value;
				request.randSeed = this.divRedo.querySelector('#randSeedRaxml').value;
			}
			
			$.post(page, request).done((data) => {
				if(data != null && data != '') {
					this.newick = data;
					this.makeTree();
				}
				this.div.querySelector("#phyloDimmerLoader").classList.remove("active");
			}).fail((xhr, status, error) => {
					alert("Fail!");
					this.div.querySelector("#phyloDimmerLoader").classList.remove("active");
				}
			);
		}, 1000);
	}
}
