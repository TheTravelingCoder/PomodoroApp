var fs = require('fs');
const axios = require('axios');
var FormData = require('form-data');
const Path = require('path');
const https = require('https');

var xurl = 'https://s4.digitsec.com';
var rurl = 'https://s401.digitsec.com';
xurl = 'https://salesforce.s4io.live:8088';
rurl = 'https://salesforce.s4io.live:8088';
var url;
var file = '';
var org_Id= '5eb90554b46a76444f91e1b8'; //prod
//var org_Id= '5d65843feb4c6a2de12e8f5b'; //test
var scand_Id;
var token;
const download_directory = Path.resolve(__dirname)
var P = ['\\', '|', '/', '-'];
var x = 0;
var user = '';
var pass = '';
var format = 'pdf';
var orgname = '';
var listorg = false;
var search = '';


scansdisplayinterval = setInterval(function() {
        	twrl();
        	}, 250);

function twrl() {
    process.stdout.write('\rS4 Scanning ... ' + P[x++]);
    x &= 3;
  }

var myArgs = process.argv.slice(2);
//console.log('Arguments: ', myArgs);

if(myArgs.length >=6){
switch (myArgs[0]) {
case '-user':
    user = myArgs[1];
    break;
default:
    console.log('\x1b[36m%s\x1b[0m', 'Sorry, that didn\'t work. Use the following format:' );
    console.log('s4 -user \'user@domain.com\' -pass \'secret\' -file \'path_to_zip\'');
}
switch (myArgs[2]) {    
case '-pass':
    pass = myArgs[3];
    break;
default:
    console.log('\x1b[36m%s\x1b[0m', 'Sorry, that didn\'t work. Use the following format' );
    console.log('s4 -user \'user@domain.com\' -pass \'secret\' -file \'path_to_zip\'');
}

switch (myArgs[4]) {    
case '-file':
    file = myArgs[5]
    break;
case '-org':
  if(myArgs[5] == 'add')
  {
    orgname = myArgs[6];
  }else if(myArgs[5] == 'list')
  {
    listorg =true;
  }
  else if(myArgs[5] == 'search')
  {
    search =myArgs[6];
  }        
default:
    console.log('\x1b[36m%s\x1b[0m', 'Sorry, that didn\'t work. Use the following format' );
    console.log('s4 -user \'user@domain.com\' -pass \'secret\' -file \'path_to_zip\'');
}
switch (myArgs[6]) {    
case '-orgid':
    org_Id = myArgs[7];
    break;
case '-format':
    format = myArgs[7];
case '-s4url':
    xurl = myArgs[7];
    rurl = myArgs[7];     
default:
}
switch (myArgs[8]) {    
case '-format':
    format = myArgs[9];
case '-s4url':
    xurl = myArgs[9];
    rurl = myArgs[9];         
default:
}
switch (myArgs[10]) {   
case '-s4url':
    xurl = myArgs[11];
    rurl = myArgs[11];         
default:
}
}
else
{
	console.log('');
	console.log('\x1b[36m%s\x1b[0m', 'Sorry, that didn\'t work. Use the following format' );
  console.log('\x1b[33m%s\x1b[0m', 'Command: For windows use s4win.exe, for linux use ./s4linux, for mac osx use ./s4');
  console.log('For example:');
	console.log('./s4 -user \'user@domain.com\' -pass \'secret\' -file \'path_to_zip\'');
	console.log('');
  console.log('1. -user is the username of your S4 account');
  console.log('2. -pass is the api key or password of your S4 account');
  console.log('3. -file is the fully qualified path of your source code in zip format');
  console.log('{Or} 3. -org is the to add, list or search. For example: -org add "name_of_org", -org list, -org search "search_string"');
  console.log('');
  console.log('{Optional} 4. -orgid is the orgid against which you want to initiate the scan');
  console.log('{Optional} 5. -format is the format of output. The value can be pdf or json');
  console.log('{Optional} 6. -s4url is the url where s4 server is running. Default value is: ' + xurl);
  console.log('');
  console.log('\x1b[31m%s\x1b[0m', 'For additional help and support, drop us a line at support@digitsec.com');
	process.exit();
}

console.log('\x1b[36m%s\x1b[0m','S4 scan initializing ...');
try{

var body = {
        email: user,
        password: pass
    };
    var options = {
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            httpsAgent: new https.Agent({
            rejectUnauthorized: false
            })
        }
    };

	url = xurl + '/api/login';
	axios
  .post(url, body,options)
  .then(function (response) {
    if(!response.data.token){
      console.log('\x1b[31m%s\x1b[0m', 'Error: Invalid credentials. Please check your username and password. You can reset your password at https://s4.digitsec.com.'); process.exit();
    }
    console.log('\x1b[36m%s\x1b[0m','Auth successful ...');
    token = response.data.token;
    if(orgname != ''|| listorg == true || search != ''){
      processOrg(orgname,listorg,search,token);
    }else
    {
    url = xurl + '/scan';
    body=
    {
    	org_id:org_Id
    };
    options = {
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'x-access-token': token,
            httpsAgent: new https.Agent({
            rejectUnauthorized: false
            })
        }
    };
    axios
    .post(url, body,options)
    .then(function(res){
    	console.log('\x1b[36m%s\x1b[0m','Initiating scan with id ... ' + res.data._id);
    	scand_Id = res.data._id;
    	url = xurl + '/scan/start';
    	var form_data = new FormData();
    	if(!(fs.existsSync(file))){
		  console.log('\x1b[31m%s\x1b[0m', 'Error: Invalid input file. The input file does not exist or the path is inaccessible.'); process.exit();
    	}
		form_data.append('code', fs.createReadStream(file));
		form_data.append('orgId', org_Id);
		form_data.append('scanId', res.data._id);
		var xssd = form_data.getHeaders();
		xssd['x-access-token'] = token;
		options = {
        headers: xssd,
        maxContentLength: Infinity,
		    maxBodyLength: Infinity
    	};	
    	
      var formdata =  {
        orgId: org_Id,
        scanId: res.data._id
    };


    	axios
    	.post(url,form_data,options)
    	.then(function(resp)
    	{
    		console.log('');
    		console.log('\x1b[36m%s\x1b[0m','Scan start response status: ', resp.status );
    		console.log(resp.data);
    		var loop_status = true;
    		var has_results = false;
    		url = xurl + '/scan/list';
			    body=
			    {
			    	org_id: org_Id,
			    	scan_id: scand_Id
			    };
			    options = {
			        headers: {
			            'Content-Type': 'application/json; charset=utf-8',
			            'x-access-token': token
			        }
			    };
    		getsfdcScansinterval = setInterval(function() {
        	checkScanStatusRequest(url, body, options);
        	}, 10 * 500);



    	})
    	.catch(function(err){
    		console.log('@Error: ' , err);
        clearInterval(getsfdcScansinterval);
        clearInterval(scansdisplayinterval);
    		process.exit();
    	});

    });

}
  })
  .catch(function (error) {
    console.log(error);
    clearInterval(scansdisplayinterval);
    process.exit();
  });
}

catch(e){
	console.log(e);
  clearInterval(getsfdcScansinterval);
  clearInterval(scansdisplayinterval);
  process.exit();
}
  function checkScanStatusRequest(url, body, options)
  {
  	console.log('.');
  	axios
  	.post(url, body, options)
  	.then(function(reps)
  	{
  		console.log('');
  		console.log('\x1b[36m%s\x1b[0m','Checking scan status ...');
  		console.log(reps.data);
  		if(reps.data[0].status == 'completed')
  		{
  			console.log('');
  			console.log('\x1b[36m%s\x1b[0m','Scan completed ...');
  			clearInterval(getsfdcScansinterval);
        if(format == 'pdf'){
  			url = rurl + '/scan/' + body.scan_id + '/downloadpdf';
        }else
        {
          url = xurl + '/scan/' + body.scan_id + '/finding/download';
        }

  			downloadPDF(url, token,body.scan_id);


  		}else if(reps.data[0].status == 'pending')
  		{	
  			console.log('S4 scan in progress');
  		}else if(reps.data[0].status == 'error')
  		{
  		console.log('');
			console.log('An error occurred during scanning: ', reps.data[0].message);
			clearInterval(getsfdcScansinterval);
			clearInterval(scansdisplayinterval);
			process.exit();

  		}

  	}).catch(function(err){
  		console.log(err);
      clearInterval(getsfdcScansinterval);
      clearInterval(scansdisplayinterval);
      process.exit();
  	});
  	return;
  }

  async function downloadPDF (durl, token,scanid) {  

    try
    {
    var responset = 'arraybuffer';
    var filext = '.pdf';

  	console.log('Generating report ...');
  if(format == 'pdf'){
    filext = '.pdf';
  }	
  else
  {
    responset = 'json';
    filext = '.json';
  }

	if(!(fs.existsSync('S4_Report_'+scanid+filext)))
	{
		fs.writeFileSync('S4_Report_'+scanid+filext, '');
	}
  	const writer = fs.createWriteStream('S4_Report_'+scanid+filext);

  	axios.get(durl,
        {
            responseType: responset,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/pdf',
                'x-access-token': token
            }
        })
        .then((response) => {
        	fs.createWriteStream('S4_Report_'+scanid+filext).write(response.data.toString());
        	clearInterval(getsfdcScansinterval);
        	clearInterval(scansdisplayinterval);
        	console.log('');
        	console.log('\x1b[32m%s\x1b[0m','Report downloaded ...');
        	console.log('\x1b[32m%s\x1b[0m', 'S4_Report_'+scanid+filext);
        	console.log('Done');

        })
      }
      catch (err)
      {
      console.log(err);
      clearInterval(getsfdcScansinterval);
      clearInterval(scansdisplayinterval);
      process.exit();
      }

}


 function processOrg(org, list, search, token)
{

  console.log('\x1b[32m%s\x1b[0m','Processing org request ...');
  var options;
  if(org != ''){
    console.log('Add Org Called');
    options = {
      url: xurl + '/s4onprem/offline',
      method: 'post',
      data: {name:org},
      headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'x-access-token': token
      },
      httpsAgent: new https.Agent({
      rejectUnauthorized: false
      })
    };
  }
  if(list)
  {
    console.log('LIST Called');
    options = {
      url: xurl + '/sfdcinfo',
      method: 'get',
      headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'x-access-token': token
      },
      httpsAgent: new https.Agent({
      rejectUnauthorized: false
      })
    };
  }

 if(search != '')
 {
  console.log('SEARCH Called');
    options = {
      url: xurl + '/sfdcinfo/?search='+search,
      method: 'get',
      headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'x-access-token': token
      },
      httpsAgent: new https.Agent({
      rejectUnauthorized: false
      })
    };
 }
 console.log('\x1b[32m%s\x1b[0m','Sending Request ...');
    axios.request(options)
    .then((response) => {
      console.log(response);
      if(response.status == '200')
        {
          console.log('\x1b[32m%s\x1b[0m', 'Success!');
          console.log(response.data);
        }
        process.exit();
    });
   

}
