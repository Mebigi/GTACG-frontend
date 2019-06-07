# GTACG-frontend
Frontend application for the GTACG project (Gene Tags Assessment by Comparative Genomics)

This project is the frontend part of the GTACG framework (Gene Tags Assessment by Comparative Genomics): a framework for comparative analysis of bacterial genomes.

Overall, this project has a static set of web sites. You can just download the folder of the project and put the results of the ExportReport (from the GTACG backend) as a folder named "data". Then, you have to just make the folder available on a server, or run a server for local access, using, for example:


	http-server report -p 3000 --cors


Some specific features depend on running server.js (which requires the configuration file config.js):
	
 	nodejs server.js
