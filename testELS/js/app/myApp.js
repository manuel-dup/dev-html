function go() {
  var previousResults = $('#results').html().trim();
  if (previousResults) {
    $('#previous-results').html(previousResults);
    $('#previous-results-duration').text("(" + $('#duration').text() + ")");
    $('#previous-results, #previous-results-label, #previous-results-duration').show();
  } else {
    $('#previous-results, #previous-results-label').hide();
  }

  $('#results').empty();
  $('#duration').hide();
  $('#searching').addClass('active');
  $('#sentquery').text('');
  $('#received').text('');

  var fctn = ($('#type').val()==='suggest')? SUGGEST.performSuggest : BAS.performBestAndSearch;

  var ids = fctn($('#query').val(),parseInt($('#expansionRadius').val()),$('#strategy').val(),$('#locale').val(), function(results) {
    if (results.error){
        $('#sentquery').text(results.error.trim());
    } else {
        for (var i=0; i<results.elements.length; i++) {
          var docId = results.elements[i].id;
          var aElmt = $('<a href="'+OPTIONS.essmURI+'/template.do?id='+docId+'" target="_blank" class="collection-item"></a>').appendTo($('#results'));
          var titleElmt = $('<span></span>').appendTo(aElmt).text(docId);
          $('<span class="badge"></span>').appendTo(aElmt).text(results.elements[i].relevance);

          $('#duration').text(results.duration+" ms");
          $('#duration').show();

          var settings = {
            "async": true,
            "crossDomain": true,
            "url": OPTIONS.essmURI+"/api/configuration/default/document/"+docId,
            "method": "GET",
            "headers": {
              "Accept-Language": $('#locale').val().toLowerCase().replace('_','-'),
              "cache-control": "no-cache"
            }
          }

          $.ajax(settings).done($.proxy(function (response) {
            this.titleElmt.text(response.names[0].name);
          },{ 'titleElmt': titleElmt }));
        }

        $('#sentquery').text(results.query.trim());
        $('#received').text(results.response.trim());
      }

      $('#searching').removeClass('active');
  });
}

$('select').material_select();
