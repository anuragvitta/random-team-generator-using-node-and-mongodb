let express = require('express');
let bodyParser =require("body-parser");
const exphbs = require("express-handlebars");
let shuffle = require('shuffle-array');
let dateTime = require('node.date-time');
const path = require("path");
let fs= require('fs');
let MongoClient = require('mongodb').MongoClient;
let url = "mongodb://localhost:27017/mydb";
let app = express();
app.engine(".hbs", exphbs({
defaultLayout: "main",
extname: ".hbs",
layoutsDir: path.join(__dirname, "views/layouts")
}));
app.set("view engine", ".hbs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser());
app.post('/',function (req, res1) {
	let answer= req.body.filepath;
	fs.readFile(answer, 'utf8', function (err, data) {
		if(err)
		{
			res1.render("error",{error:"file error"});
		}
		else if(!data)
		{
	res1.render("error",{error:"json file empty or json syntax error"});
		}
		else
		{
	    let obj = JSON.parse(data);
    		MongoClient.connect(url, function(err, db) {
  				if (err){
  						res1.render("error",{error:"database connection error"});
 						 }
 						 else
 						 {
 						 	db.collection("aspirants").insertMany(obj, function(err, res) {
   								 if (err)
   								 {
   								  res1.render("error",{error:"database insertion error"});
   								}
   								else{
   									res1.render("home");
   								}
    								
    								db.close();
  							});
 						 }
			});
		}
	});
});
app.post('/generate',function (req, res2) {
	 let teamsize=req.body.tsize;
	if(teamsize==0|teamsize<0)
	{
		res2.render("error",{error:"teamsize cannot be zero or negative"});
	}
	else
	{
		MongoClient.connect(url, function(err, db) {
  if (err){
  	res2.render("error",{error:"database connection error"});
  }
  else
  {
  db.collection("aspirants").find({}).toArray(function(err, result) {
    if (err)
    {
    res2.render("error",{error:"database query error"});	
    }
    else
    {
    	var obj=result;
    	
    	let asize=result.length;
    	if(teamsize>asize)
    	{
    	res2.render("error",{error:"teamsize cannot be greater than total member size"});	
    	}
		else
    	{

    		let rem=asize%teamsize;
    let initnum=Math.floor(asize/teamsize);
    let addnum=asize-(initnum*teamsize);
    let tnum;
    let writestream = fs.createWriteStream('H:/berkadia/randomteamwithmongodb/result-files/team.txt');
    if(rem==0)
    {
      tnum=initnum;
      writestream.write("created-"+initnum+" number of teams with size"+teamsize);

    	
    }
    else
    {
    	writestream.write("created-"+initnum+" number of team with size"+teamsize+" and one team with size-"+addnum);
    	tnum=initnum+1;
    }
    let i,j=0;
    let arr=[];
    for(i=0;i<asize;i++)
    {
	arr.push(j);
	j++;
    }
    shuffle(arr);
    let u=0;
    let p;
    let temp=teamsize;
    		for( p=1;p<=tnum;p++)
           {
            writestream.write("\n---------");
            writestream.write("\nteam"+p);
            writestream.write("\n---------");

           for(var x=0;x<temp;x++,u++)
           {
          		if(u>=asize)
           		{
           			break;	
           		}
           		let z=arr[u];
              writestream.write("\n--------------");
              writestream.write("\nteam member ");
              writestream.write("\n--------------");
              
             writestream.write("\nname is-"+obj[z].name);
              writestream.write("\nbranch is-"+obj[z].branch);
              writestream.write("\nfavourite language  is-"+obj[z].favlang);
           	}
           
           }
            writestream.write("\n-------------");
            writestream.write("\nend of teams");
            writestream.on('finish', () => { 
                console.log("----------------------------");
                console.log('wrote all teams data to file');
                                    });


          writestream.end();  
          let logstream = fs.createWriteStream('H:/berkadia/randomteamwithmongodb/result-files/log.txt', {'flags': 'a'});
    	logstream.write("request made at :"+new Date());
    	logstream.write("\n");
    	logstream.on('finish', () => { 
                console.log("----------------------------");
                console.log('wrote all logss data to file');
                                    });
    	logstream.end();
    	var rstream = fs.createReadStream('H:/berkadia/randomteamwithmongodb/result-files/team.txt');
  rstream.pipe(res2);
    	}
    }
    db.close();
  });
}
});
	}
});
app.listen(3000,() => console.log('Example app listening on port 3000!'));