(function() {
    console.log("External JS");
    setTimeout(function() {
        $('#header-content').prepend(
            $('<p style="float:right;margin-top:35px;margin-left:50px;color:red;font-weight:bold;">Added by external essm-custom.js '+new Date().toLocaleString('en-GB')+'</p>')
        )}, 1000);
})();