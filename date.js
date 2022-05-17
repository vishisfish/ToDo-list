module.exports.getDate = getDate; //as modeule.exports is an object

function getDate(){
  var today = new Date();

  var options = {
    weekday: "long",
    day: "numeric",
    month: "long"
  };

  var day = today.toLocaleDateString("en-US", options);
  return day;
}

module.exports.getDay = getDay;

function getDay(){
  var today = new Date();

  var options = {
    weekday: "long"
  };

  var day = today.toLocaleDateString("en-US", options);
  return day;
}
