class ModuleGenome {
    constructor(genome, genomeName, contig, start, end, key, genomeId, familyList, indexFamilyList, colors) {
        this.genome = genome;
        this.genomeName = genomeName;
        this.contig = contig;
        this.start = start;
        this.end = end;
        this.key = key;
        this.genomeId = genomeId;
        this.familyList = familyList;
        this.indexFamilyList = indexFamilyList;
        this.colors = colors;

        this.div = document.createElement("div");
        this.div.classList.add('rowModuleGenome');
        this.div.style.display = "none";

        this.divHeader = document.createElement("div");
        this.divHeader.classList.add('headerModuleGenome');
        this.divHeader.innerHTML = '<b>Navigation: </b> ';
        //let i1 = document.createElement("i");
        //let i2 = document.createElement("i");
        let i3 = document.createElement("i");
        //let i4 = document.createElement("i");
        //let i5 = document.createElement("i");
        let i6 = document.createElement("i");
        let i7 = document.createElement("i");

        //i1.className = "angle double left icon";
        //i2.className = "angle left icon";
        i3.className = "map marker icon";
        //i4.className = "angle right icon";
        //i5.className = "angle double right icon";
        i6.className = "minus square icon";
        i7.className = "plus square icon";
        i3.onclick = () => {
            let localMiddle = Math.round((this.end + this.start)/2);
            if(localMiddle < 2500)
                localMiddle = 2500;
            let localStart = localMiddle - 2500;
            let localEnd = localMiddle + 2500;
            this.igvBrowser.goto(this.contig + ":" + localStart + "-" + localEnd);
        }
        i6.onclick = () => {
            this.igvBrowser.zoomOut();
        }
        i7.onclick = () => {
            this.igvBrowser.zoomIn();
        }
        //this.divHeader.appendChild(i1);
        //this.divHeader.appendChild(i2);
        this.divHeader.appendChild(i3);
        //this.divHeader.appendChild(i4);
        //this.divHeader.appendChild(i5);
        //this.divHeader.appendChild("<b>Zoom: </b>");
        this.divHeader.appendChild(i6);
        this.divHeader.appendChild(i7);

        this.div.appendChild(this.divHeader);

        this.divIgv = document.createElement("div");
        this.divIgv.classList.add('divModuleGenome');
        this.div.appendChild(this.divIgv);

        this.divFooter = document.createElement("div");
        //this.divFooter.innerText = "";
        this.div.appendChild(this.divFooter);
        //this.familyList = loadFamilyList();
    }

    binSearch(familyList, start, end, value) {
        let i = Math.round((start + end)/2);
        if(familyList[i].s == value)
            return i;
        else if(familyList[i].s < value)
            return this.binSearch(familyList, i+1, end, value);
        else
            return this.binSearch(familyList, start, i-1, value);
    }

    listNeighborhood() {
        let threshold = this.indexFamilyList[this.genomeId];
        this.pos = this.binSearch(this.familyList, threshold.start, threshold.end, this.start);
        let neighborhood = [];
        for (let i = Math.max(this.pos-5, threshold.start); i >= threshold.start && i <= Math.min(threshold.end, this.pos+5); i++) {
            if(this.familyList[i].seq != this.key)
                neighborhood.push({start:this.familyList[i].s, end:this.familyList[i].e, fam:this.familyList[i].head, key:this.familyList[i].seq});
        }
        return neighborhood;
    }

    setColors() {
        this.colors.forEach(color => {});
        this.neighborhood.forEach(neighbor => {
            let ok = false;
            this.colors.forEach(color => {
                if(color.fam === neighbor.fam) {
                    neighbor.color = color.color;
                    ok = true;
                }
            });
            if(!ok) {
                neighbor.color = colorScale[this.colors.length];
                this.colors.push({fam:neighbor.fam, color:neighbor.color});
            }
        });

    }

    toggle() {
        if(this.div.style.display == "none") {
            this.div.style.display = "block";
            if(typeof this.igvBrowser === "undefined" || this.igvBrowser === null) {
                this.neighborhood = this.listNeighborhood();
                this.setColors();
                this.makeBrowser();
            }
        }
        else
            this.div.style.display = "none";
    }

    makeBrowser() {
        let localMiddle = Math.round((this.end + this.start)/2);
        if(localMiddle < 2500)
            localMiddle = 2500;
        let localStart = localMiddle - 2500;
        let localEnd = localMiddle + 2500;

        let options = {
			showNavigation: true,
			showRuler: false,
			showTrackLabelButton: false,
			showTrackLabels: true,
			reference: {
				fastaURL: serverUrl + downloadPort + "/" + projectPath + "/data/genomes/" + this.genome.replace(/\ /g, '_') + ".fna",
                indexURL: serverUrl + downloadPort + "/" + projectPath + "/data/genomes/" + this.genome.replace(/\ /g, '_') + ".fna.fai",
			},
			locus: this.contig + ":" + localStart + "-" + localEnd,
			tracks: [
				{
					name: "Genes",
					type: "annotation",
					format: "bed",
					sourceType: "file",
                    //url: "http://localhost:3000/data/genomes/Streptococcus_pyogenes_1E1.bed.gz",
                    url: serverUrl + downloadPort + "/" + projectPath + "/data/genomes/" + this.genome.replace(/\ /g, '_') + ".bed.gz",
					indexed: false,
					order: Number.MAX_VALUE,
					visibilityWindow: 300000000,
					displayMode: "EXPANDED",
					removable: false,
					/*color: function(feature) {
						return "#FF0000";
                    }*/
                    color: (feature) => {
                        return this.colorBy(feature);
                    }
				}
			],
            showNavigation: false,
        }
        igv.createBrowser(this.divIgv, options).then((igvBrowser) => {
            this.igvBrowser = igvBrowser;
            this.igvBrowser.on('trackclick', (track, popoverData) => {
                let threshold = this.indexFamilyList[this.genomeId];
                let posSeq = this.binSearch(this.familyList, threshold.start, threshold.end, popoverData[1].value);
                let row = this.familyList[posSeq];
                this.divFooter.innerHTML = 
                    '<b>Sequence: </b>' + row.seq + 
                    '&#9;<b>Family: </b><a href="family.htm?file=' + row.head + '">' + row.head + '</a>' +
                    '&#9;<b>Function: </b>' + row.func;
                return false;
            });
        });
    }

    colorBy(feature) {
        if(this.key == feature.id) {
            feature.fam = "main";
            return "#FF0000";
        }
        else {
            for (let i = 0; i < this.neighborhood.length; i++) {
                const neighbor = this.neighborhood[i];
                if(neighbor.start == feature.start && neighbor.key == feature.id) {
                    return neighbor.color;
                }
            }
            this.neighborhood.forEach(neighbor => {
            });
        }
        return "#999999";
    }
}
