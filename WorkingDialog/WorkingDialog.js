
var WorkingDialog = {
  jobs: [],
  autoclose: 1,
  autoclosedelay: 1500,
  indicator: { 
    running:  { image: 'WorkingDialog/running.gif', color: 'black' }, 
    done:     { image: 'WorkingDialog/done.png',    color: 'green' },
    error:    { image: 'WorkingDialog/error.png',   color: 'red' },
    waiting:  { image: 'WorkingDialog/running.gif', color: 'black' }
  },
  addJob : function(text) {
    var job = new Job(text);
    this.jobs.push(job);
    job.addChangeListener(this);
    
    return job;
  },
  removeJob : function(rjob) {
    for (var i=0; i < this.jobs.length; i++) {
        if (this.jobs[i] == rjob) {
          return this.jobs.splice(i,1);
        }
    }
  },
  jobList: function() {
    return this.jobs;
  },
  clear: function() {
    this.jobs = [];
  },
  show: function(options) {
    options.modal=true;
    options.autoOpen=false;
    $('#WorkingDialog').dialog(options);
    $('#WorkingDialog').dialog('open');
  },
  hide: function() {
    $('#WorkingDialog').dialog('close');
  },
  _redraw: function() {
    
    $('#WorkingDialog').empty();
    
    
    for (var i=0;i < this.jobs.length; i++) {

      $item = $("<div style='-moz-border-radius: 10px;border-radius: 15px;border: 1px solid #CCCCCC;margin:5px;line-height:32px;padding:3px;background:white'></div>");
      
      var status;
      
      if (this.jobs[i].status() == "running")   status = this.indicator.running;
      if (this.jobs[i].status() == "done")      status = this.indicator.done;
      if (this.jobs[i].status() == "error")     status = this.indicator.error;
      if (this.jobs[i].status() == "waiting")   status = this.indicator.waiting;
      
      $item.append($("<img src='"+ status.image +"' style='vertical-align:middle;margin-right:4px;'/>"));
      if (this.jobs[i].status() == "running" || this.jobs[i].status() == "waiting") {
        $item.append($("<span style='color: "+status.color+"'>" +this.jobs[i].text() + "<span>"));
      } else {
        $item.append($("<span style='color: "+status.color+"'>" +this.jobs[i].text() + " ("+ this.jobs[i].elapsedTime() + " s)<span>"));
      }
      $('#WorkingDialog').append($item);
    
    }
  },
  updateCallback: function(context) {
    context._redraw();
    
    if (context.autoclose) {
    
      for (var i=0; i < context.jobs.length;i++) {
        if (context.jobs[i].status() != "done") {
            return;
        }
      }
      setTimeout(function() {
        $('#WorkingDialog').dialog( "option", "hide", 'fade');
        context.hide();
      }, context.autoclosedelay);
      
    }
  }
};


// JOB 

function Job(text) {
  this._text = text;
  this._status = "waiting";
  this._listeners = [];
}


Job.prototype.setText = function(newText) {
  this._text = newText;
  this.notifyChangeListeners();
};
Job.prototype.start = function() {
	this._startTime = new Date().getTime();
  this._status = "running";
  this.notifyChangeListeners();
};
Job.prototype.end = function() {
	this._endTime = new Date().getTime();
  this._status = "done";
  this.notifyChangeListeners();
};
Job.prototype.fail = function() {
	this._endTime = new Date().getTime();
  this._status = "error";
  this.notifyChangeListeners();
};
Job.prototype.elapsedTime = function() {
  if (this._endTime === undefined) {
    return (new Date().getTime() - this._startTime) / 1000;
  } else {
    return (this._endTime - this._startTime) / 1000;
  }
};
Job.prototype.status = function() {
  return this._status ? this._status : false;
};
Job.prototype.text = function() {
  return this._text;
};

Job.prototype.addChangeListener = function(fn) {
  this._listeners.push(fn);
};

Job.prototype.notifyChangeListeners = function() {
  
  for (var i=0;i < this._listeners.length;i++) {
    this._listeners[i].updateCallback(this._listeners[i]);
  }
  
};

