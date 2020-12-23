var fs = require('fs');
const axios = require('axios');
var FormData = require('form-data');
const Path = require('path');
const https = require('https');

var xurl = 'https://s4.digitsec.com';
var rurl = 'https://s401.digitsec.com';
xurl = 'https://salesforce.s4io.live';
rurl = 'https://salesforce.s4io.live';
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
var format = 'json';
var orgname = '';
var listorg = false;
var search = '';

scansdisplayinterval = setInterval(function() {
        	twrl();
        	}, 250);

var myArgs = process.argv.slice(2);

switch (myArgs[0]) {
case '-v':
    console.log('\x1b[36m%s\x1b[0m', 'version 57' );
    break;
default:
}

switch (myArgs[0]) {
case '-version':
    console.log('\x1b[36m%s\x1b[0m', 'version 57' );
    break;
default:
    console.log('\x1b[36m%s\x1b[0m', 'version 57' );
}
//console.log('Arguments: ', myArgs);

if(myArgs.length >=6){
  var i=0;
  myArgs.forEach(function(arg){
    if(arg == '-user')
    {
     user = myArgs[i+1];
    }
    if(arg == '-pass')
    {
     pass = myArgs[i+1];
    }
    if(arg == '-file')
    {
     file = myArgs[i+1];
    }
    if(arg == '-org')
    {
      if(myArgs[i+1] == 'add')
      {
        orgname = myArgs[i+2];
      }else if(myArgs[i+1] == 'list')
      {
        listorg =true;
      }
      else if(myArgs[i+1] == 'search')
      {
        search =myArgs[i+2];
      }
    }
    if(arg == '-s4url')
    {
     xurl = myArgs[i+1];
     rurl = myArgs[i+1];
    }

    if(arg == '-format')
    {
     format = myArgs[i+1];
    }

    if(arg == '-orgid')
    {
     org_Id = myArgs[i+1];
    }
  i++;
  });
}
else
{

    if(user =='' || pass == '')
    {
  	console.log('');
  	console.log('\x1b[36m%s\x1b[0m', 'Sorry, that didn\'t work. Use the following format' );
    console.log('\x1b[33m%s\x1b[0m', 'Command: For windows use s4win.exe, for linux use ./s4linux, for mac osx use ./s4');
    console.log('For example:');
  	console.log('./s4 -user \'user@domain.com\' -pass \'secret\' -file \'path_to_zip\' -orgid \'id_of_saved_s4_org\'');
  	console.log('');
    console.log('1. -user is the username of your S4 account');
    console.log('2. -pass is the api key or password of your S4 account');
    console.log('3. -file is the fully qualified path of your source code in zip format');
    console.log('4. -orgid is the orgid against which you want to initiate the scan');
    console.log('');
    console.log('{Optional} 5. -org is the to add, list or search orgs. For example: -org add "name_of_org", -org list, -org search "search_string"');
    console.log('{Optional} 6. -format is the format of output. The value can be pdf or json. Default is json.');
    console.log('{Optional} 7. -s4url is the url where s4 server is running. Default value is: ' + xurl);
    console.log('');
    console.log('\x1b[31m%s\x1b[0m', 'For additional help and support, drop us a line at support@digitsec.com');
  	process.exit();
  }
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
      console.log(res);
      if(!res.data._id){
        console.log('\n\x1b[31m%s\x1b[0m', 'Invalid orgid passed. Please, pass a valid -orgid in the command.');
        clearInterval(scansdisplayinterval);
        process.exit();
        return;
      }
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

  			downloadPDF(url, token,body.scan_id, reps.data[0]);


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

  async function downloadPDF (durl, token,scanid, scan_stats) {  

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
          //console.log(response.data.toString());
          if(filext == '.pdf')
          {
           fs.createWriteStream('S4_Report_'+scanid+filext).write(response.data); 
          }else{
           var temp = [];
           temp.push(response.data.toString());
        	 fs.createWriteStream('S4_Report_'+scanid+filext).write('{"scanSummary":'+JSON.stringify(scan_stats).toString()+',"findings":['+temp.toString()+']}');
          }
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
  console.log('Search initiated ...');
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
      if(response.status == '200')
        {
          console.log('\x1b[32m%s\x1b[0m', 'Success!');
          console.log(response.data);
        }
        process.exit();
    })
    .catch(function(e){
      console.log('\n\x1b[31m%s\x1b[0m', 'Error creating org ... ', e.message);
      console.log(e.response.data);
     process.exit(); 
    });
   

}

function twrl() {
    process.stdout.write('\rS4 Scanning ... ' + P[x++]);
    x &= 3;
  }
