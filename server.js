var express = require('express');
var app_blast = express();
var app_make = express();
var app_download = express();
var fs = require('fs');
const { exec } = require('child_process');
const uuidv4 = require('uuid/v4');
var xml2js = require('xml2js');
var bodyParser = require('body-parser');
var path = require('path');


/**********
 * blast
 **********/
var port_blast = process.env.PORT || 8080;

app_blast.use( bodyParser.json() );
app_blast.use(bodyParser.urlencoded({extended: true}));

app_blast.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});  
app_blast.set('json spaces', 40);

app_blast.post('/', function(req, res) {
	var dbPath = req.body.project + '/blast/base.faa.db';

	var filenameIn = "/tmp/" + '.in.' + uuidv4();
	var filenameOut = "/tmp/" + '.out.' + uuidv4();
	fs.writeFile(filenameIn, req.body.seq, function(err) {
		if(err) {
			return console.log('a' + err);
		}
	});
	var command = req.body.program + ' -query ' + filenameIn + ' -out ' + filenameOut + ' -db ' + req.body.project + '/blast/base.faa.db -outfmt 5';
	if(req.body.textEvalue != undefined && req.body.textEvalue != '')
		command += ' -evalue ' + req.body.textEvalue;
	if(req.body.textTScore != undefined && req.body.textTScore != '')
		command += ' -threshold ' + req.body.textTScore;
	if(req.body.textWSize != undefined && req.body.textWSize != '')
		command += ' -word_size ' + req.body.textWSize;
	if(req.body.textCoverage != undefined && req.body.textCoverage != '')
		command += ' -qcov_hsp_perc ' + req.body.textCoverage;
	if(req.body.textNumAlign != undefined && req.body.textNumAlign != '')
		command += ' -num_alignments ' + req.body.textNumAlign;
	if(req.body.textGapOpening != undefined && req.body.textGapOpening != '')
		command += ' -gapopen ' + req.body.textGapOpening;
	if(req.body.textGapExtension != undefined && req.body.textGapExtension != '')
		command += ' -gapextend ' + req.body.textGapExtension;

	//console.log(command);
	exec(command, (err, stdout, stderr) => {
		if (err) {}
		fs.readFile(filenameOut, function (err, data) {
			if (err) {}
			xml2js.parseString(data, 'utf8', function (err, obj) {
				if (err) {}
				let dataTable = [];
				//console.log(obj);
				obj.BlastOutput.BlastOutput_iterations[0].Iteration.forEach(it => {
					it.Iteration_hits[0].Hit.forEach(hsp => {
						let itHsp = hsp.Hit_hsps[0].Hsp[0];
						let query = it['Iteration_query-def'][0];
						/*let func = query.substring(query.indexOf(' ') + 1);
						if (func.indexOf('[') >= 0)
							func = func.substring(0, func.indexOf('[') - 1);*/
						if(query.includes(' '))
							query = query.substring(0, query.indexOf(' '));
						let subject = hsp.Hit_def[0];
						subject = subject.substring(0, subject.indexOf(' '));

						dataTable.push({
							query: query,
							subject: subject,
							//func: func,
							evalue: itHsp['Hsp_evalue'][0],
							identity: itHsp['Hsp_identity'][0],
							bitscore: itHsp['Hsp_bit-score'][0],
							alignLen: itHsp['Hsp_align-len'][0],
							gaps: itHsp['Hsp_gaps'][0],
							score: itHsp['Hsp_score'][0],
						});
					});
				});
				//console.log(dataTable);
				res.send(dataTable);
			});
		});
	});
});
var server_blast = require('http').createServer(app_blast);
server_blast.listen(port_blast, function() {
    console.log('Listening blast server on port ' + port_blast);
});

/**********
 * make
 **********/
var port_make = process.env.PORT || 8081;
var blankString = '                         ';

app_make.use(bodyParser.json());
app_make.use(bodyParser.urlencoded({extended: true}));

app_make.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});  
app_make.set('json spaces', 40);

app_make.post('/', function(req, res) {
	var filenameIn = "/tmp/" + '.in.' + uuidv4();
    var filenameOut = "/tmp/" + '.out.' + uuidv4();
    var filenameStdout =  "/tmp/" + '.stdout.' + uuidv4();
    var filenameStderr =  "/tmp/" + '.stderr.' + uuidv4();
    var program = req.body.program;
    var seqs = "";
    if(program == "fasttree" || program == "raxml" || program == "clustalo" || program == "mafft" || program == "muscle") {
        req.body.seqs.forEach(seq => {
            seqs += ">" + seq.key + "\n" + seq.seq.match(/.{1,60}/g).join("\n")+"\n";
        });
    }
    else if(program == "phyml") {
        var seqs = req.body.seqs.length + ' ' + req.body.seqs[0].seq.length + '\n';
        for (let i = 0; i < req.body.seqs.length; i++) {
            seqs += ('a' + i + 'a' + blankString).substring(0,9) + req.body.seqs[i].seq + "\n";
        }
    }

	fs.writeFile(filenameIn, seqs, function(err) {
		if(err) {
			return console.log('a' + err);
		}
    });

	var command = '';
    if(program == "fasttree") {
        command = 'fasttree -out ' + filenameOut;
        if(req.body.search != undefined && req.body.search != '')
            command += ' ' + req.body.search;
        if(req.body.topology != undefined && req.body.topology != '')
            command += ' ' + req.body.topology;
        if(req.body.model != undefined && req.body.model != '')
            command += ' ' + req.body.model;
        if(req.body.join != undefined && req.body.join != '')
            command += ' ' + req.body.join;
        command += ' ' + filenameIn;
    }
    else if(program == 'phyml') {
        filenameOut = filenameIn + '_phyml_tree.txt';
        command = 'phyml -i ' + filenameIn + ' -d aa';
        if(req.body.model != undefined && req.body.model != '')
            command += ' ' + req.body.model;
        if(req.body.propInvar != undefined && req.body.propInvar != '')
            command += ' -v ' + req.body.propInvar;
        if(req.body.gammaShape != undefined && req.body.gammaShape != '')
            command += ' -a ' + req.body.gammaShape;
        if(req.body.improvement != undefined && req.body.improvement != '')
            command += ' ' + req.body.improvement;
        if(req.body.randTrees != undefined && req.body.randTrees != '')
            command += ' --n_rand_starts ' + req.body.randTrees;
        if(req.body.randTrees != undefined && req.body.randTrees != '')
            command += ' --startTrees ' + req.body.randTrees;
    }
    else if(program == 'raxml') {
        filenameOut = uuidv4();
        command = 'raxmlHPC -w /tmp/ -s ' + filenameIn + ' -n ' + filenameOut + ' -m PROTGAMMAWAG -p 123123 ';
        filenameOut = '/tmp/RAxML_result.' + filenameOut;

        if(req.body.model != undefined && req.body.model != '')
            command += ' ' + req.body.model;
        if(req.body.numRuns != undefined && req.body.numRuns != '')
            command += ' -N ' + req.body.numRuns;
        if(req.body.rapidRandSeed != undefined && req.body.rapidRandSeed != '')
            command += ' -x ' + req.body.rapidRandSeed;
        if(req.body.randSeed != undefined && req.body.randSeed != '')
            command += ' -p ' + req.body.randSeed;
        else
            command += ' -p 1234';
    }
    else if(program == 'clustalo') {
        command = 'clustalo -i ' + filenameIn + ' -o ' + filenameOut + ' --infmt fa --outfmt fa';
        if(req.body.iter != undefined && req.body.iter != '')
            command += ' --iter=' + req.body.iter;
        if(req.body.iterGuide != undefined && req.body.iterGuide != '')
            command += ' --max-guidetree-iterations=' + req.body.iterGuide;
        if(req.body.iterHMM != undefined && req.body.iterHMM != '')
            command += ' --max-hmm-iterations=' + req.body.iterHMM;
    }
    else if(program == 'muscle') {
        command = 'muscle -in ' + filenameIn + ' -out ' + filenameOut;
        if(req.body.iter != undefined && req.body.iter != '')
            command += ' -maxiters ' + req.body.iter;
    }
    else if(program == 'mafft') {
        command = 'mafft';
        if(req.body.strategy != undefined && req.body.strategy != '')
            command += ' ' + req.body.strategy;
        else
            command += ' --auto';
        if(req.body.gapOpening != undefined && req.body.gapOpening != '')
            command += ' --op ' + req.body.gapOpening;
        if(req.body.offset != undefined && req.body.offset != '')
            command += ' --ep ' + req.body.offset;
        command += ' ' + filenameIn + ' &> ' + filenameOut;
    }

    exec(command, (err, stdout, stderr) => {
        fs.readFile(filenameOut, function (err, data) {
            if (err) {}
            data = '' + data;
            if(program == "phyml") {
                for (let i = 0; i < req.body.seqs.length; i++) {
                    data = data.replace('a' + i + 'a', req.body.seqs[i].key);
                }
            }
            else if(program == 'clustalo' || program == 'mafft' || program == 'muscle') {
                var newData = [];
                var vet = data.split(data.match('\n>'));
                for (let i = 0; i < vet.length; i++) {
                    newData[i] = {key: vet[i].substring(0, vet[i].indexOf('\n')).replace('>',''), seq:vet[i].substring(vet[i].indexOf('\n')+1).replace(/\n/g,'')};
                }
                data = newData;
            }
            res.send(data);
        });
    });
});
var server_make = require('http').createServer(app_make);
server_make.listen(port_make, function() {
    console.log('Listening make server on port ' + port_make);
});

/**********
 * download
 **********/
var port_download = process.env.PORT || 8082;

app_download.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
	res.header("Access-Control-Allow-Headers", "RANGE, Cache-control, If-None-Match, Content-Type");
	res.header("Access-Control-Expose-Headers", "Content-Length");
	next();
});  

var root = path.dirname(require.main.filename)
app_download.get('/*', function(req, res, next) {
	res.download(req.url.substring(1));
});
var server_download = require('http').createServer(app_download);
server_download.listen(port_download, function() {
    console.log('Listening download server on port ' + port_download);
});

