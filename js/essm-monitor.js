// ------------ for essm-monitor.html ------------
var monitor = false;
var responseContainer;
var initESSMMonitor = function() {
    responseContainer = CodeMirror.fromTextArea(document.getElementById('essm-monitor-response'), {
        mode: {name: "javascript", json: true},
        readOnly: "true",
        lineNumbers: true,
        lineWrapping: true,
        gutters: ["CodeMirror-linenumbers"]
    });

    $('.collapse').collapse('hide');
    $("#get-essm-status").click(updateESSMStatus);
    $("#monitor-essm-status").click(toggleESSMMonitoring);
    $('#essm-status-loading').hide();
    $('#essm-status-loading > .glyphicon').removeClass("spinning");
    $('#date').text("[" + new Date().toLocaleTimeString() + "] - ");
    $('#essm-url').val("http://" + window.location.host + "/essm");
    $('#essm-monitor-confs').hide();
};

var essmStatuses = {
    "RUNNING": "label-success",
    "STARTING": "label-success",
    "ORPHAN": "label-warning",
    "PAUSED": "label-warning",
    "ERROR": "label-danger"
};

var updateESSMStatus = function() {
    if (!monitor) {
        $('#essm-status-loading').show();
        $('#essm-status-loading > .glyphicon').addClass("spinning");
    }

    $.ajax({
        type: "GET",
        url: $('#essm-url').val() + "/api/admin/status",
        cache: false,
        username: $('#user').val(),
        password: $('#pwd').val()
    }).always(function(data) {
        $('#essm-monitor-response').val(JSON.stringify(data, null, 2));
        responseContainer.setValue(JSON.stringify(data, null, 2));

        //console.log(arguments);
        //console.log(arguments[0].getAllResponseHeaders().length);

        var status = data.status;
        var statusText = data.statusText;

        if (statusText) {
            status += " " + statusText;
        }

        var statusClass = essmStatuses[status];
        $('#essm-status-status').text(status).removeClass("label-success label-warning label-danger").addClass(statusClass);
        $('#date').text("[" + new Date().toLocaleTimeString() + "] - ");

        $('#essm-monitor-confs > tbody').remove();

        if (data.configurations) {
            // "default" is first
            var confNames = Object.keys(data.configurations).sort(function(a,b) {
                if (a === 'default' || a < b) {
                    return -1;
                } else if (b === 'default' || a > b) {
                    return 1;
                } else {
                    return 0;
                }
            });
            $.each(confNames, function(i, name) {
                createConfStatusLine(name, data.configurations[name]);
            });
            $('#essm-monitor-confs').show();
        } else {
            $('#essm-monitor-confs').hide();
        }

        if (!monitor){
            $('#essm-status-loading').hide();
            $('#essm-status-loading > .glyphicon').removeClass("spinning");
        }
    });
};

function createConfStatusLine(name, status) {
    var row = $('<tr></tr>')
        .addClass(status === "VALID" ? "success" : status === "DISABLED" ? "active" : "danger")
        .append($('<td style="width:60%;"></td>').append('<span class="glyphicon" aria-hidden="true"></span>&nbsp;&nbsp;').append($("<span></span>").text(name)))
        .append($('<td style="width:40%;"></td>').append($("<span></span>").text(status)));
    $('#essm-monitor-confs').append(row);
}

var monitorId = null;
var toggleESSMMonitoring = function() {
    if (monitor) {
        monitor = false;
        $('#monitor-essm-status').removeClass("btn-warning pause").addClass("btn-success play");
        $('#get-essm-status').prop("disabled", false).text("Get ESSM status");
        clearInterval(monitorId);
    } else {
        monitor = true;
        $('#monitor-essm-status').removeClass("btn-success play").addClass("btn-warning pause");
        $('#get-essm-status').prop("disabled", true).text("Monitoring ESSM status...");
        updateESSMStatus();
        monitorId = setInterval(updateESSMStatus, 500);
    }
};

// ------------ end essm-monitor.html ------------
