var express = require('express');
var app = express();
var path = require("path");
var bodyParser = require("body-parser");
var fileS = require('fs');
var parse = require('csv').parse;
var in_array = require('in_array');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname+'/public'));



function readLines(input, func) {
  var remaining = '';

  input.on('data', function(data) {
    remaining += data;
    var index = remaining.indexOf('\n');
    while (index > -1) {
      var line = remaining.substring(0, index);
      remaining = remaining.substring(index + 1);
      index = remaining.indexOf('\n');
      func(line);
    }
  });

  input.on('end', function() {
    if (remaining.length > 0) {
      func(remaining);
    }
  });
}
var totalValues = new Promise(function(resolve, reject){
	function readCsv(){
	  var totaldays = 0, totalmsg =0, totalwords=0, totalletters =0;
	  var arrDays = [];
	  fileS.createReadStream(__dirname+"/public/jsondata/chat.csv")
		.pipe(parse({delimiter: ','}))
		.on('data', function(csvrow) {
		  if(csvrow){
			var day = csvrow[0].split(' ')[0].replace(/[^0-9\^.]/g,'');

			if(!in_array(day,arrDays) && day !=""){
			  arrDays.push(day);
			}
			totalmsg++;
			if(!isNaN(csvrow[3]) && !isNaN(csvrow[4])){
			  totalwords += parseInt(csvrow[3]);
			  totalletters += parseInt(csvrow[4]);
			}
		  }

		})
		.on('end',function() {
		  //do something wiht csvData
		  var result = {'total_days': arrDays.length, 'total_msg': totalmsg, 'total_words': totalwords, 'total_letters': totalletters};
		  resolve(result);

		});

	}
	readCsv();
})

function func(data) {
  var csvHead = 'datatime,member,type,wordcount,lettercount\n'
  var dpattern = /([\[\]\,])/g;
  //console.log(typeof(data));
  var arr = data.split(" ");
  var result = arr.splice(0,3);
  //console.log(result[1].replace(/([\[\]\,])/g,''));
  if(result[0] != undefined && result[1] != undefined && result[2] != undefined ){
    console.log('index...');
    let datetime = result[0].replace(/([\[\]\,])/g, '').replace(/[\/]/g, '.')+' '+result[1].replace(/([\[\]\,])/g, '');
    let member = result[2].replace(':', '');
    let mtype = arr.join(" ").includes('image omitted') || arr.join(" ").includes('vedio omitted') ? 'media' : 'text';
    let wordcount = arr.join(' ').length;
    let lettercount = arr.join('').length;
    var line = datetime+','+member+','+mtype+','+wordcount+','+lettercount+'\n';
      fileS.appendFile(__dirname+"/public/jsondata/chat.csv", line );
  }
}



app.get('/', function(req, res){
    res.send("Chat viz app");
})

app.get('/readline', function(req, res){
  var input = fileS.createReadStream(__dirname+"/public/jsondata/<filename.txt>");
  readLines(input, func);
  res.send("reading file")
})
app.get('/viz', function(req, res){
  res.sendFile(path.join(__dirname + '/public/views/index.html'));
})
app.get('/total', function(req, res){
  totalValues.then((value) =>{
  res.json(value)})
  
})
app.get('/datacsv', function(req, res){
    res.sendFile(path.join(__dirname + '/public/jsondata/chat.csv'));
})


app.get('/api', function(req, res){
    var id = req.query.id;
    var d = req.query.data;
    var isSaved = saveTojsonfile(id, {'userId': id, 'story': d});
    if(isSaved){
      res.send("Story Saved Successful");
    } else {
      res.send("Not able to save...")
    }

})

const server = app.listen(8080, () => {
  const host = server.address().address;
  const port = server.address().port;

  console.log(`Example app listening at http://${host}:${port}`);
});
