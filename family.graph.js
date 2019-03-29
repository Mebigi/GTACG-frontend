class DivGraph {
    constructor(div, superPage, nodes) {
        this.div = div;
        this.nodes = nodes;
		this.edges = null;
		this.s = null;
		this.superPage = superPage;
		
		$(this.div.querySelector('#graphColumnsIcon')).popup({
			on: 'click',
			lastResort: 'right center',
			closable: true,
			exclusive: true,
			delay: {
				show: 300,
				hide: 800
			},
		});
		$(this.div.querySelector('#graphSidebar')).sidebar({
			transition: 'overlay',
			context: $(this.div.querySelector('#graphSegment'))
		});
		this.div.querySelector("#graphSidebarIcon").onclick = () => {
			$(this.div.querySelector('#graphSidebar')).sidebar('toggle');
		}
		

        $(this.div.querySelector("#graphLayout")).checkbox('set unchecked');
        $(this.div.querySelector("#showSmallGraphNodes")).checkbox('set unchecked');

        $(this.div.querySelector('#graphSliderZoom')).slider({
			min: 1,
			max: 200,
			start: 101,
			onMove: (value) => {
				if(this.s != null) {
					if(value >= 101)
						value = 1 + (value - 100)/25;
					else
						value = (value/100);
					this.s.camera.goTo({ratio:value});
				}
			}
		});
		$(this.div.querySelector('#graphSliderForce')).slider({
			min: 1,
			max: 100,
			start: 10,
			onMove: (value) => {
				if(this.s != null)
					this.s.configForceAtlas2({slowDown: 10, strongGravityMode: true, scalingRatio: Math.pow(2,1+0.2*value)});
			}
        });


        this.div.querySelector('#graphLayout').onchange = () => {
            if ($(this.div.querySelector("#graphLayout")).checkbox('is checked')) 
                this.s.stopForceAtlas2(); 
            else 
                this.s.startForceAtlas2();
        };

        this.div.querySelector('#exportGraph').onclick = () => {
            sigma.plugins.image(this.s, this.s.renderers[0], {
                download: true, 
                size: 0, 
                margin: 200, 
                format: 'png', 
                zoomRatio: 1, 
                labels: true, 
                filename: 'graph.png'}
            );
        };

        this.div.querySelector("#graphLabels").onchange = () => {
            let select = $(this.div.querySelector("#graphLabels")).dropdown("get value");
            this.s.graph.nodes().forEach(node => {
                node.label = node.data[select];
            });
            this.s.refresh();
        };

        this.div.querySelector('#graphEdgesColor').onchange = () => {
            this.setEdgeColor();
        };
    
    
        this.div.querySelector("#graphColors").onchange = () => {
            var select = $("#graphColors").dropdown("get value");
            if(select == ""){
                for(let i = 0; i < this.s.graph.nodes().length; i++)
                    s.graph.nodes()[i].color = "";
            }
            else {
                if(select.indexOf("rg") == 0) {
                    select = parseInt(select.substring(2));
                    for(let i = 0; i < this.s.graph.nodes().length; i++)
                        this.s.graph.nodes()[i].color = this.s.graph.nodes()[i].data['rg' + select].color;
                }
                else if(select.indexOf("dom") == 0) {
                    select = parseInt(select.substring(3));
                    for(let i = 0; i < this.s.graph.nodes().length; i++) {
                        this.s.graph.nodes()[i].color = "";
                        for(j = 0; j < this.s.graph.nodes()[i].data.domains.length; j++)
                            if(s.graph.nodes()[i].data.domains[j] == select)
                                this.s.graph.nodes()[i].color = "#f00";
                    }
                }
                else if(select.indexOf("ortho") == 0) {
                    select = parseInt(select.substring(5));
                    for(i = 0; i < this.s.graph.nodes().length; i++) {
                        this.s.graph.nodes()[i].color = "";
                        for(j = 0; j < this.s.graph.nodes()[i].data.orthologs.length; j++)
                            if(s.graph.nodes()[i].data.orthologs[j] == select)
                                this.s.graph.nodes()[i].color = "#f00";
                    }
                }
            }
            this.s.refresh();
        };
    
        this.div.querySelector('#showSmallGraphNodes').onchange = () => {
            this.changeNodeType($(this.div.querySelector('#showSmallGraphNodes')).checkbox('is checked'));
        };

        this.div.querySelector('#graphEdgesLabel').onchange = () => {
            this.setEdgeLabel();
        };

        this.div.querySelector('#graphEdgesCondA').onchange = () => {this.setEdgeCond()};
        this.div.querySelector('#graphEdgesCondB').onchange = () => {this.setEdgeCond()};
        this.div.querySelector('#graphEdgesCondC').onchange = () => {this.setEdgeCond()};
        
        this.div.querySelector('#graphNodeA').onchange = () => {this.setTable()};
		this.div.querySelector('#graphNodeB').onchange = () => {this.setTable()};
		
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

    changeNodeType(small) {
		if(small) {
			this.s.graph.nodes().forEach(function(n) {
				n.type = "circle";
				n.size = 10;
			});
			this.s.settings("labelAlignment", "right")
			this.s.settings("defaultHoverLabelBGColor", "#333")
			this.s.settings("labelSizeRatio", "1")
			this.s.settings("drawLabels", false);
		}
		else {
			this.s.graph.nodes().forEach(function(n) {
				n.type = "circle2";
				n.size = 80;
			});
			this.s.settings("labelAlignment", "inside")
			this.s.settings("defaultHoverLabelBGColor", "#0f0")
			this.s.settings("labelSizeRatio", 0.15)
			this.s.settings("drawLabels", true);
		}
	}

    makeGraph(gs) {
        if(typeof this.nodes === "undefined" || this.nodes === null || typeof this.edges === "undefined" || this.edges === null) {
            this.display("none");
            return;
        }
        
        this.display("grid");
		$(this.div.querySelector('#graphNumNodes')).append(this.nodes.length);
		$(this.div.querySelector('#graphNumEdges')).append(this.edges.length);

		processNodesAndEdges(this.nodes, this.edges);
		this.s = new sigma({
            graph: {nodes: this.nodes, edges: this.edges}, 
            settings: settingsSigma
        });
		this.s.addRenderer({container: this.div.querySelector('#graphContainer'), type: 'canvas'});
		this.s.startForceAtlas2({slowDown: 10, strongGravityMode: true, scalingRatio: 8});
		this.s.refresh();
        
        sigma.plugins.tooltips(this.s, this.s.renderers[0], getSettingsSigmaTooltip(gs));

        this.nodes.forEach(node => {
            $(this.div.querySelector("#graphNodeA")).find(".menu").append('<div class="item" data-value="' + i + '">' + node.data.key + '</div>');
            $(this.div.querySelector("#graphNodeB")).find(".menu").append('<div class="item" data-value="' + i + '">' + node.data.key + '</div>');
        });

		this.setEdgeColor();
		setTimeout(() => {$(this.div.querySelector("#graphLayout")).checkbox("check")}, 2000);
	}

    setEdges(edges) {
        this.edges = edges;
    }

    setEdgeColor() {
		let select = $(this.div.querySelector("#graphEdgesColor")).dropdown("get value");
		if(select.includes("rg")) {
			this.s.graph.edges().forEach(e => {
				e.color = "";
				e.size = 1;
				if(this.s.graph.nodes(e.source).data[select].color == this.s.graph.nodes(e.target).data[select].color) {
					e.color = this.s.graph.nodes(e.source).data[select].color;
					e.size = 5;
				}
			});
		}
		else if(select == "rand") {
			this.s.graph.edges().forEach(e => {
				e.color = '#'+Math.floor(Math.random()*16777215).toString(16).substring(1,4);
				e.size = 2;
			});
		}
		else if(select == "cond") {
			this.setEdgeCond();
		}
		else {
			this.s.graph.edges().forEach(e => {
				e.color = "";
				e.size = 1;
			});
		}

		this.div.querySelector("#graphEdgesCond").style.visibility = (select == "cond"?"visible":"hidden");
		this.s.refresh();
	}

	setEdgeLabel() {
		let select = $(this.div.querySelector("#graphEdgesLabel")).dropdown("get value");
		if(select == "e-value")
			select = "e";
		else if(select == "identity")
			select = "i";
		else if(select == "length")
			select = "l";
		else if(select == "mismatch")
			select = "m";
		else if(select == "gap")
			select = "g";
		else if(select == "bitscore")
			select = "b";
		for(let i = 0; i < this.s.graph.edges().length; i++) {
			this.s.graph.edges()[i].label = ""+this.s.graph.edges()[i].data[select];
		}
		this.s.refresh();
	}
	setEdgeCond() {
		let field = $(this.div.querySelector("#graphEdgesCondA")).dropdown("get value");
		let op = $(this.div.querySelector("#graphEdgesCondB")).dropdown("get value");
		let value = this.div.querySelector("#graphEdgesCondC").value;
		if(field == "" || op == "" || value == "" || this.div.querySelector("#graphEdgesCond").style.visibility == "hidden") {
			this.s.graph.edges().forEach(function(e) {
				e.color = "";
				e.size = 1;
			});
		}
		else {
			if(field == "e-value")
				field = "e";
			else if(field == "identity")
				field = "i";
			else if(field == "length")
				field = "l";
			else if(field == "mismatch")
				field = "m";
			else if(field == "gap")
				field = "g";
			else if(field == "bitscore")
				field = "b";

			let total = 0;
			this.s.graph.edges().forEach(function(e) {
				e.color = "";
				e.size = 1;

				let ok = false;
				if(op == ">" && e.data[field] > value) ok = true;
				else if(op == ">=" && e.data[field] >= value) ok = true;
				else if(op == "<" && e.data[field] < value) ok = true;
				else if(op == "<=" && e.data[field] <= value) ok = true;
				else if(op == "=" && e.data[field] == value) ok = true;
				if(ok) {
					e.color = "#f00";
					e.size = 5;
					total++;
				}
				else {
					e.color = "";
					e.size = 1;
				}
			});
			$(this.div.querySelector("#graphEdgesCondClabel")).text(total);
		}
	}

	setTable() {
		let keyA = $(this.div.querySelector("#graphNodeA")).dropdown("get value");
        let keyB = $(this.div.querySelector("#graphNodeB")).dropdown("get value");
        alert(keyA);

		if(keyA == "" && keyB == "")
            this.div.querySelector("#graphTableNode").style.display = "none";
		else {
			this.div.querySelector("#graphTableNode").style.display = "block";
			if(keyA != "" && keyB != "" && keyA != keyB)
                this.div.querySelector("#graphTableEdge").style.display = "block";
			else
                this.div.querySelector("#graphTableEdge").style.display = "none";
		}

		$(this.div.querySelector("#graphNodeAorg")).empty();
		$(this.div.querySelector("#graphNodeAlen")).empty();
		for(let i = 0; i < gs.length; i++)
			$(this.div.querySelector("#graphNodeArg" + i)).empty();

		if(keyA != "") {
			console.log(keyA);
			$(this.div.querySelector('#graphNodeAorg')).append(this.nodes[keyA].data.org);
			$(this.div.querySelector('#graphNodeAlen')).append(this.nodes[keyA].data.len);
			for(let i = 0; i < gs.length; i++)
				$(this.div.querySelector("#graphNodeArg" + i)).append(this.nodes[keyA].data["rg" + i].name);
		}

		$(this.div.querySelector("#graphNodeBorg")).empty();
		$(this.div.querySelector("#graphNodeBlen")).empty();
		for(var i = 0; i < gs.length; i++)
			$(this.div.querySelector("#graphNodeBrg" + i)).empty();
			
		if(keyB != "") {
			$(this.div.querySelector('#graphNodeBorg')).append(this.nodes[keyB].data.org);
			$(this.div.querySelector('#graphNodeBlen')).append(this.nodes[keyB].data.len);
			for(var i = 0; i < gs.length; i++)
				$(this.div.querySelector("#graphNodeBrg" + i)).append(this.nodes[keyB].data["rg" + i].name);
		}

		$(this.div.querySelector('#graphEdgeIdentity')).empty();
		$(this.div.querySelector('#graphEdgeEValue')).empty();
		$(this.div.querySelector('#graphEdgeLength')).empty();
		$(this.div.querySelector('#graphEdgeMismatch')).empty();
		$(this.div.querySelector('#graphEdgeGap')).empty();
		$(this.div.querySelector('#graphEdgeBitscore')).empty();
		if(keyA != "" && keyB != "" && keyA != keyB) {
			var idA = nodes[keyA].id;
			var idB = nodes[keyB].id;

			for(var i = 0; i < this.edges.length; i++) {
				if((idA == this.edges[i].source && idB == this.edges[i].target) || (idA == this.edges[i].target && idB == this.edges[i].source)) {
					$(this.div.querySelector('#graphEdgeIdentity')).append(this.edges[i].data.i);
					$(this.div.querySelector('#graphEdgeEValue')).append(this.edges[i].data.e);
					$(this.div.querySelector('#graphEdgeLength')).append(this.edges[i].data.l + " (" + edges[i].data.lp + "%)");
					$(this.div.querySelector('#graphEdgeMismatch')).append(this.edges[i].data.m);
					$(this.div.querySelector('#graphEdgeGap')).append(this.edges[i].data.g);
					$(this.div.querySelector('#graphEdgeBitscore')).append(this.edges[i].data.b);
				}
			}
		}
	}

    setUpdateSelection(updatedSelection) {
        this.updateSelection = updatedSelection;
    }

	selectData(selectedKeys) {
		if (typeof(this.s) !== "undefined") {
			this.s.graph.nodes().forEach(node => {
				var key = node.data.key;
				if(selectedKeys.indexOf(key) != -1)
					node.color = "#f00";
				else
					node.color = "";
			});
		}
    }
    
    display(value) {
        this.div.style.display = value;
    }
}