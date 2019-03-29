class DivAlignment {
    constructor(div, superPage, divRedo, nodes) {
		this.div = div;
		this.divRedo = divRedo;
        this.nodes = nodes;
		this.snippet = div.querySelector("#snippetDiv");
		this.superPage = superPage;

        this.setDefaultValues();
        $(this.div.querySelector('#alignColumnsIcon')).popup({
			on: 'click',
			lastResort: 'right center',
			closable: true,
			exclusive: true,
			delay: {
				show: 300,
				hide: 800
			},
		});
		
		$(this.div.querySelector('#alignSidebar')).sidebar({
			transition: 'overlay',
			context: $(this.div.querySelector('#alignSegment'))
		});
		this.div.querySelector("#alignSidebarIcon").onclick = () => {
			$(this.div.querySelector('#alignSidebar')).sidebar('toggle');
		}

		if(typeof(serverUrl) == 'undefined' || typeof(makePort) == 'undefined') {
			this.div.querySelector('#alignRedoIcon').style.display = 'none';
		}

        $(this.div.querySelector('#linkCustomAlign')).popup({
			inline: true,
			hoverable: true,
			closable: false,
			position: 'top left',
			delay: {
				show: 300,
				hide: 800
			}
        });
        
        this.div.querySelector('#alignSorter').onchange = () => {
            this.m.seqs.sort();
            this.m.render();
        }

        this.div.querySelector('#alignIconOrder').onclick = () => {
            let obj = $(this.div.querySelector('#alignIconOrder'));
            if(obj.hasClass('down')) {
                obj.removeClass('down');
                obj.addClass('up');
            } else {
                obj.removeClass('up');
                obj.addClass('down');
            }
            this.m.seqs.sort();
            this.m.render();
        }

        this.div.querySelector('#alignShowId').onchange = () => {this.style();}
        this.div.querySelector('#alignShowLabel').onchange = () => {this.style();}
        this.div.querySelector('#alignShowData').onchange = () => {this.style();}
        this.div.querySelector('#alignShowMarkers').onchange = () => {this.style();}
        this.div.querySelector('#alignShowSeqlogo').onchange = () => {this.style();}
		this.div.querySelector('#alignShowConserv').onchange = () => {this.style();}
		
		this.div.querySelector("#linkFasta").onclick = () => {
            this.downloadCustomFasta(true, true);
        };

        this.div.querySelector("#linkCustomFastaDownload").onclick = () => {
            this.downloadCustomFasta(false, true);
		};
		
		/*$(this.divRedo.querySelector('#programAlign')).onchange = () => {
			this.divRedo.querySelector('#modalClustalo').style.display = 'none';
			this.divRedo.querySelector('#modalMafft').style.display = 'none';
			this.divRedo.querySelector('#modalMuscle').style.display = 'none';
			let value = $(this.divRedo.querySelector('#programAlign')).dropdown('get value');
			this.divRedo.querySelector('#' + value).style.display = 'block';
		};

		this.div.querySelector('#alignRedoIcon').onclick = () => {
			$(this.divRedo).modal('show');
			this.divRedo.querySelector('#programAlign').onchange();
		};*/

		/*this.divRedo.querySelector('#makeAlign').onclick = () => {
			this.redoAlignment();
		};*/

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
        $("#alignShowMarkers").checkbox('set checked');
        $("#alignShowConserv").checkbox('set checked');
        $("#alignShowId").checkbox('set checked');
        $("#alignShowLabel").checkbox('set checked');
    }

    selectData(selectedKeys) {
		if ($("#divAlign").css("display") != "none") {
			this.m.g.selcol.reset();
			this.m.g.selcol.invertRow(selectedKeys);
		}
	}
	
	orderData() {
		let order = {};
		if (typeof(m) !== "undefined") {
			for(var i = 0; i < m.seqs.length; i++)
				order[this.m.seqs.at(0).attributes.id] = i;
		}
		return order;
    }
    
    setUpdateSelection(updatedSelection) {
        this.updateSelection = updatedSelection;
    }

    makeAlignment() {
        this.setDefaultValues();
        let maxHeight = 100;
		let scaleLinear = (typeof d3 != "undefined") ? d3.scale.linear() : d3_scale.scaleLinear();
		let scale = scaleLinear
			.domain([0, maxHeight / 2, maxHeight])
			.range(['#f00', '#ff0', '#0f0']);
        let seqs = [];
        this.nodes.forEach(function(node){
            if(node.data.seq != "" && node.data.seq != "null") {
				let data = {};
				for(let j = 0; j < gs.length; j++)
					data["rg"+j] = (node.data["rg" + j].name);
				seqs.push({
                    id:node.data.key, 
                    name:node.data.org, 
                    defaultName:node.data.org, 
                    seq:node.data.seq, 
                    data:data});
			}
        });

		if(seqs.length == 0) {
			this.div.style.display = "none";
		}
		else {
			this.div.style.display = "grid";
			let opts = {
				el: this.snippet,
				seqs: seqs,
				bootstrapMenu: false,
				conserv: {
					maxHeight: maxHeight,
					strokeColor: '#000',
					rectStyler: function (rect, data) {
						if ( data.rowPos < 20 ) {
							rect.style.fill = scale(data.height);
						}
						return rect;
					}
				},
				zoomer: {
					alignmentWidth: "auto",
					autoResize: true,
					labelIdLength: 150,
					alignmentHeight: document.documentElement.clientHeight -240,
					labelNameLength: 200,
					textVisible: true,
				}
			};
			this.m = msa(opts);
            //this.m.seqs.comparator = this.comparator;
            this.m.seqs.comparator = (a,b) => {
                var mult = ($(this.div.querySelector('#alignIconOrder')).hasClass('down')?1:-1);
                var selected = $(this.div.querySelector("#alignSorter")).dropdown('get value');
                var va = "";
                var vb = "";
        
                if(selected == "id" || selected == "name" || selected == "seq") {
                    va = a.get(selected);
                    vb = b.get(selected);
                }
                else if(selected == "selected") {
                    var selectedA = false;
                    var selectedB = false;
                    Object.keys(m.g.selcol["_byId"]).forEach(function(selected) {
                        if(m.g.selcol["_byId"][selected].attributes.type == "row") {
                            if(a.get("id") == m.g.selcol["_byId"][selected].attributes.seqId)
                                selectedA = true;
                            if(b.get("id") == m.g.selcol["_byId"][selected].attributes.seqId)
                                selectedB = true;
                        }
                    });
                    if(selectedA && selectedB)
                        return 0;
                    else if(selectedA)
                        return -1;
                    return 1;
                }
                else if(selected == "tab" || selected == "phylo") {
                    var order = null;
                    if(selected == "tab")
                        order = tabOrderData();
                    else if(selected == "phylo")
                        order = treeLayoutOrderData();
                    va = order[a.get("id")];
                    vb = order[b.get("id")];
                }
                else {
                    va = a.get("data")[selected];
                    vb = b.get("data")[selected];
                }
                if(va < 0)
                    va = Number.MAX_SAFE_INTEGER;
                if(vb < 0)
                    vb = Number.MAX_SAFE_INTEGER;
        
                if(va < vb)
                    return -1*mult;
                if(vb < va) 
                    return 1*mult;
                if(a.get("id") < b.get("id"))
                    return -1*mult;
                return 1*mult;
            }
			this.m.seqs.sort();

			this.style();
			this.m.g.on("row:click", (data) => {
				var selectedKeys = [];
				Object.keys(this.m.g.selcol["_byId"]).forEach((selected) => {
					if(this.m.g.selcol["_byId"][selected].attributes.type == "row")
						selectedKeys.push(this.m.g.selcol["_byId"][selected].attributes.seqId);
                });
				//this.updateSelection(selectedKeys, 2);
				this.superPage.updateSelection.call(this.superPage, selectedKeys, 2);
			});
		}
    }

    /*comparator(a,b) {
		var mult = ($(this.div.querySelector('#alignIconOrder')).hasClass('down')?1:-1);
		var selected = $(this.div.querySelector("#alignSorter")).dropdown('get value');
		var va = "";
		var vb = "";

		if(selected == "id" || selected == "name" || selected == "seq") {
			va = a.get(selected);
			vb = b.get(selected);
		}
		else if(selected == "selected") {
			var selectedA = false;
			var selectedB = false;
			Object.keys(m.g.selcol["_byId"]).forEach(function(selected) {
				if(m.g.selcol["_byId"][selected].attributes.type == "row") {
					if(a.get("id") == m.g.selcol["_byId"][selected].attributes.seqId)
						selectedA = true;
					if(b.get("id") == m.g.selcol["_byId"][selected].attributes.seqId)
						selectedB = true;
				}
			});
			if(selectedA && selectedB)
				return 0;
			else if(selectedA)
				return -1;
			return 1;
		}
		else if(selected == "tab" || selected == "phylo") {
			var order = null;
			if(selected == "tab")
				order = tabOrderData();
			else if(selected == "phylo")
				order = treeLayoutOrderData();
			va = order[a.get("id")];
			vb = order[b.get("id")];
		}
		else {
			selected = parseInt(selected.substring(2));
			va = a.get("data")[selected];
			vb = b.get("data")[selected];
		}

		if(va < 0)
			va = Number.MAX_SAFE_INTEGER;
		if(vb < 0)
			vb = Number.MAX_SAFE_INTEGER;

		if(va < vb)
			return -1*mult;
		if(vb < va) 
			return 1*mult;
		if(a.get("id") < b.get("id"))
			return -1*mult;
		return 1*mult;
    }*/
    
    style() {
        if(typeof this.m === "undefined" || this.m === null)
            return;
		var checked = $(this.div.querySelector('#alignShowLabel')).checkbox('is checked');
		var value = $(this.div.querySelector('#alignShowData')).dropdown("get value");
		if(!checked && value == "")
			this.m.g.vis.attributes.labelName = false;
		else {
			this.m.g.vis.attributes.labelName = true;
			for(var i = 0; i < this.m.seqs.length; i++) {
				if(checked && value == "")
                    this.m.seqs.at(i).attributes.name = this.m.seqs.at(i).attributes.defaultName;
				else if(checked && value != "")
                    this.m.seqs.at(i).attributes.name = this.m.seqs.at(i).attributes.defaultName + " (" + this.m.seqs.at(i).attributes.data[value] + ")";
				else
                    this.m.seqs.at(i).attributes.name = this.m.seqs.at(i).attributes.data[value];
			}
		}

		if($(this.div.querySelector('#alignShowId')).checkbox('is checked'))
            this.m.g.vis.attributes.labelId = true;
		else
            this.m.g.vis.attributes.labelId = false;

        this.m.g.vis.set("markers", $(this.div.querySelector("#alignShowMarkers")).checkbox('is checked'));
        this.m.g.vis.set("seqlogo", $(this.div.querySelector("#alignShowSeqlogo")).checkbox('is checked'));
        this.m.g.vis.set("conserv", $(this.div.querySelector("#alignShowConserv")).checkbox('is checked'));
		//this.m.g.vis.set("scaleslider", document.getElementById("alignShowScale").checked);
		this.m.render();
	}

    display(value) {
        this.div.style.display = value;
	}
	
	downloadCustomFasta(defaultFile) {
        let fastaId = $(this.div.querySelector("#popupIdAlign")).dropdown("get value");
		let field1 = $(this.div.querySelector("#popupField1Align")).dropdown("get value");
        let field2 = $(this.div.querySelector("#popupField2Align")).dropdown("get value");
		let field3 = $(this.div.querySelector("#popupField3Align")).dropdown("get value");
        
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

            fasta += "\n" + node.data.seq.match(/.{1,60}/g).join("\n") + "\n";
        });
		downloadFile(fileName + ".align", fasta);
	}

	redoAlignment() {
		this.div.querySelector("#alignDimmerLoader").classList.add("active");
		setTimeout(() => {
			let page = serverUrl + makePort;
			let seqs = [];
			nodes.forEach(node => {
				seqs.push({key: node.data.key, seq: node.data.seq.replace(/\./g, '').replace(/\-/g, '')});
			});

			let program = '';
			switch ($(this.divRedo.querySelector('#programAlign')).dropdown('get value')) {
				case 'modalClustalo':
					program = "clustalo";
					break;
				case 'modalMafft':
					program = 'mafft';
					break;
				case 'modalMuscle':
					program = 'muscle'
					break;
			}

			let request = {
				seqs: seqs,
				program: program,
			}
			if(program == "clustalo") {
				request.iter = this.divRedo.querySelector('#iterClustalo').value;
				request.iterGuide = this.divRedo.querySelector('#iterGuideClustalo').value;
				request.iterHMM = this.divRedo.querySelector('#iterHMMClustalo').value;
			}
			else if(program == "mafft") {
				request.strategy = $(this.divRedo.querySelector('#strategyMafft')).dropdown('get value');
				request.gapOpening = this.divRedo.querySelector('#gapOpeningMafft').value;
				request.offset = this.divRedo.querySelector('#offsetMafft').value;
			}
			else if(program == 'raxml') {
				request.iter = this.divRedo.querySelector('#iterMuscle').value;
			}
			
			$.post(page, request).done((data) => {
				for (let i = 0; i < this.nodes.length; i++) {
					for (let j = 0; j < data.length; j++) {
						if(this.nodes[i].data.key == this.data[j].key)
							this.nodes[i].data.seq == this.data[j].seq;
					}
				}
				this.makeAlignment();
				div.querySelector("#alignDimmerLoader").classList.remove("active");
			}).fail((xhr, status, error) => {
				alert("Fail!");
				div.querySelector("#alignDimmerLoader").classList.remove("active");
			});
		}, 1000);
	}
}
