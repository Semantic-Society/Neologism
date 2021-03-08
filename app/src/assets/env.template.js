(function(window) {
    window.env = window.env || {};
  
    // Environment variables
    window["env"]["guser"] = "${NEO_GUSER}";
    window["env"]["gpass"] = "${NEO_GPASS}";
  })(this);