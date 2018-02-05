(function(){
    $('#js-sandbox').append("<li>4. Added by 'secu.js' after page load (relative).</li>");
    $('#add-button-3').click(() => $('#js-sandbox').append("<li>4. Added by click on button #3 (event handler set in 'secu.js').</li>"));
})();

eval("$('#js-sandbox').append(\"<li>8. Added by 'eval()'.</li>\");");

function addMessage() {
    $('#js-sandbox').append('<li>11. Added by click on button #1.</li>');
}