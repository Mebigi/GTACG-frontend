class Venn {
    constructor(div) {
        this.div = div;
        this.subPages = new SubPages(
            this.div,
            document.getElementById('menuPageVenn'),
            this,
            document.querySelector('#menuPageSuperVenn > i > .ui.floating.label'),
        );

        this.div.querySelector("#downloadVenn").onclick = () => {
            save_image('SVG', this.subPages.activeSubPage.div);
        };
    }

    loadPage(args) {
        if(!this.created)
            this.createPage();

        this.updateIcon();
        session.changePage('venn');
        this.subPages.subPages.forEach(element => {
            if(element.div != undefined || element.div != null)
            element.div.style.display = 'none';
        });
        let activeSubPage = this.subPages.activeSubPage;
        if(args == undefined) {
            
            if(activeSubPage.div != undefined)
            activeSubPage.div.style.display = 'block';
            this.changeURL();
            return;
        }
        activeSubPage.args = args;
        activeSubPage.div = document.createElement("div");
        this.div.append(activeSubPage.div);
        let dataset = "homo";
        if(args.dataset == "d")
            dataset = "doms";
        else if(args.dataset == "o")
            dataset = "orthos";
        
        let gsId = args.gsId;
        let all = args.all;
        activeSubPage.dataset = dataset;
        activeSubPage.gsId = args.gsId;
        activeSubPage.all = args.all;

        let lgs = gs[gsId];

        let sets = [];
        let array = statRg[dataset][gsId];
        let totais = Array(Math.pow(2,lgs.childs.length)).fill(0);
        for (let i = 0; i < array.length; i++) {
            if(all || array[i].all == 'f') {
                const element = array[i]; 
                let set = [];
                for (let j = 0; j < lgs.childs.length; j++) {
                    if(array[i]["c" + j] == "Yes" || array[i]["c" + j] == "Yes(Core)") {
                        set.push(j);
                    }
                }
                var num = Math.pow(2,set.length)    ;
                for (let j = 0; j < num; j++) {
                    var pos = 0;
                    for (let k = 0; k < set.length; k++) {
                        if((j & (1 << k)) == (1 << k)) {
                            pos += (1 << set[k]);
                        }
                    }
                    totais[pos] += array[i].total;
                }
            }
        }

        var num = Math.pow(2,lgs.childs.length);
        for (let i = 1; i < num; i++) {
            let set = [];
            let pos = 0;
            for (let j = 0; j < lgs.childs.length; j++) {
                if((i & (1 << j)) == (1 << j)) {
                    set.push(j);
                    pos += Math.pow(2,j);
                }
            }
            let total = totais[pos];
            if(set.length == 1)
                sets.push({sets:set, label: lgs.childs[set[0]].name, size: total});
            else if(total > 0)
                sets.push({sets:set, size: total});
        }

        var chart = venn.VennDiagram().width(500).height(500);
        var div = d3.select(activeSubPage.div)
        div.datum(sets).call(chart);

        var tooltip = d3.select("body").append("div").attr("class", "venntooltip");

        div.selectAll("path").style("stroke-opacity", 0).style("stroke", "#fff").style("stroke-width", 3)

        div.selectAll("g")
        .on("mouseover", function(d, i) {
            venn.sortAreas(div, d);

            tooltip.transition().duration(400).style("opacity", .9);
            tooltip.text(d.size + " families");

            var selection = d3.select(this).transition("tooltip").duration(400);
            selection.select("path").style("fill-opacity", d.sets.length == 1 ? .4 : .1).style("stroke-opacity", 1);
        })
        .on("mousemove", function() {
            tooltip.style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY - 28) + "px");
        })

        .on("mouseout", function(d, i) {
            tooltip.transition().duration(400).style("opacity", 0);
            var selection = d3.select(this).transition("tooltip").duration(400);
            selection.select("path").style("fill-opacity", d.sets.length == 1 ? .25 : .0).style("stroke-opacity", 0);
        });

        setURL('page=venn');
        this.changeURL();
    }

    getClearPage() {
        return {};
    }
    clearPage() {

    }

    updateIcon() {
        if(this.subPages.lenght() < 2) {
            document.getElementById("menuPageSuperVenn").setAttribute('style', 'display:none !important');
            return false;
        }
        else {
            document.getElementById("menuPageSuperVenn").setAttribute('style', 'display:block !important');
            return true;
        }
    }

    onRemovePage(page) {
        this.div.removeChild(page.div);
        this.updateIcon();
        session.changePage('home');
    }

    save() {
		return this.subPages;
    }
    
    changeURL() {
        let url = "page=venn";
        let args = this.subPages.activeSubPage.args;
        url += '&dataset=' + JSON.stringify(args.dataset);
        url += '&all=' + JSON.stringify(args.all);
        url += '&gsId=' + JSON.stringify(args.gsId);
        changeURL(url, {guid: this.subPages.activeSubPage.guid});
    }
}