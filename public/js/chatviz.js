var getChatData = new Promise((resolve, reject)=>{
  $.ajax({
    url: '/total',
    contentType: 'application/json',
    success: (data,statusText, xhr)=>{
      if(xhr.status==200){
        resolve(data);
      }
    },
    error: (err)=>{
      reject(err)
    }
  })
})

getChatData.then((result) =>{
  document.getElementById("total_days").innerHTML = result.total_days.toLocaleString();
  document.getElementById("total_messages").innerHTML = result.total_msg.toLocaleString();
  document.getElementById("total_words").innerHTML = result.total_words.toLocaleString();
  document.getElementById("total_letters").innerHTML = result.total_letters.toLocaleString();
  var avgMsgPerDay = (result.total_msg/result.total_days).toFixed(2);
  var avgLettersPerDay = (result.total_letters/result.total_days).toFixed(2);
  var avgWordsPerMsg = (result.total_words/result.total_msg).toFixed(2);
  var avglettersPerMsg = (result.total_letters/result.total_msg).toFixed(2);
  document.getElementById("avg_msg_day").innerHTML = avgMsgPerDay;
  document.getElementById("avg_letters_day").innerHTML = avgLettersPerDay;
  document.getElementById("avg_words_msg").innerHTML = avgWordsPerMsg;
  document.getElementById("avg_letters_mgs").innerHTML = avglettersPerMsg;
  
})

var counter = function(){
  var privateCounter = 0;
  function changeValue(val){
        privateCounter += val;
    }
  return {
    increment: function(){
      changeValue(1);
    },
    value : function(){
      return privateCounter;
    }
  }
}
var imageCounter = counter();
var videoCounter = counter();
var audioCounter = counter();
var gpsCounter = counter();
function drawTimeline(){
 if(document.getElementById('spinner').classList.contains('hidden')){
   document.getElementById("spinner").classList.toggle('hidden')
 }
  var svg = dimple.newSvg("#timeline_graph", "100%", 900);
  var ringChartsvg = dimple.newSvg("#ring_chart", "100%", 400);
  var fileChartsvg = dimple.newSvg("#file_chart", "100%", 400);
  var dchart = [];
      d3.csv("jsondata/chat.csv", function (data) {
        data.forEach(function(d){
          if(d.type == 'text'){
           dchart.push({'Date':d.datetime.split(' ')[0], 'LetterCount': d.lettercount, 'Time': d.datetime.split(' ')[1], 'User':d.member});
          } else {
            if(d.type == 'image'){
              imageCounter.increment();
            } else if(d.type == '‎video'){
              videoCounter.increment();
            } else if(d.type == 'audio'){
              audioCounter.increment();
            } else if(d.type == 'gps'){
              gpsCounter.increment();
            }
          }
        },this)
        
        var filesdata = [{'ftype': 'gps', 'value':gpsCounter.value()},{'ftype': 'video', 'value':videoCounter.value()}
        ,{'ftype': 'audio', 'value':audioCounter.value()},
        {'ftype': 'image', 'value':imageCounter.value()}];
        var myChart = new dimple.chart(svg, dchart);
        myChart.setMargins(20, 50, 20, 40);
        var x = myChart.addMeasureAxis("x","LetterCount");
        var y =  myChart.addCategoryAxis("y", "Date");
        myChart.defaultColors = [
          new dimple.color("#52489C"),
          new dimple.color("#59C3C3")
        ];
        y.hidden = true;
        myChart.addSeries('User', dimple.plot.bar);
        myChart.addLegend(60, 10, 510, 20, "right");
        myChart.draw();
        //myChart.series[0].shapes.selectAll('rect').attr("transform", "translate(5px, 5px)");
        //myChart.series[0].shapes.selectAll('rect').attr("height", "6px");
        var ringChart = new dimple.chart(ringChartsvg, data);
        ringChart.addMeasureAxis("p", "wordcount");
        var ring = ringChart.addSeries("member", dimple.plot.pie);
        ringChart.defaultColors = [
          new dimple.color("#52489C"),
          new dimple.color("#59C3C3")
        ];
        ringChart.addLegend(60, 10, 510, 20, "right");
        ring.innerRadius = "80%";
        ringChart.draw();

        var fileChart = new dimple.chart(fileChartsvg, filesdata);
        var fx = fileChart.addMeasureAxis("x", "value");
       var fy = fileChart.addCategoryAxis('y', 'ftype');
         fileChart.defaultColors = [
          new dimple.color("#52489C"),
        ];
        fx.hidden = true;
        fy.hidden = true;
        fileChart.addSeries('ftype', dimple.plot.bar);
        fileChart.draw();
      //  cleanAxis(y,90);
      if(!document.getElementById('spinner').classList.contains('hidden')){
         document.getElementById("spinner").classList.toggle('hidden')
      }
      });

  }

  drawTimeline();
