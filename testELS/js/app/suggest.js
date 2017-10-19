var SUGGEST = {
  querySuggest: {
     "type":"searchFilter",
     "mapping":"KnowledgeBaseDocument",
     "locale":"xx_XX",
     "filter":{
        "operator":"AND",
        "fields":[
           {
              "type":"int",
              "propertyName":"templateGroupType",
              "criteria":{
                 "value":1,
                 "operator":"TERM"
              }
           },
           {
              "type":"in-hierarchy",
              "propertyName":"templateGroupId",
              "kind":"TemplateGroup",
              "value":OPTIONS.essmRootNode,
              "operator":"IN_DESCENDANT",
              "inclusive":true,
              "separator":"/"
           },
           {
              "type":"boolean",
              "propertyName":"valid",
              "criteria":{
                 "value":true,
                 "operator":"EQUALS"
              }
           }
        ],
        "subFilters":[
           {
              "operator":"OR",
              "fields":[

              ],
              "subFilters":[

              ],
              "semanticFields":[
                 {
                    "propertyNames":[
                       "html",
                       "text",
                       "description",
                       "label",
                       "attachments.attachment*.text.xx_XX"
                    ],
                    "query":"xxxxx"
                 }
              ]
           }
        ],
        "semanticFields":[

        ]
     },
     "requiredFields":[],
     "pager":{
        "startOffset":0,
        "size":5
     },
     "strategy":"xxx",
     "expansionRadius":0,
     "elasticHighlight":null,
     "minimalRelevance":0.6
  },

  performSuggest: function(query,expansionRadius,strategy,locale,callback) {
    SUGGEST.querySuggest.locale = locale;
    SUGGEST.querySuggest.filter.subFilters[0].semanticFields = [
                 {
                    "propertyNames":["html","text","description","label","attachments.attachment*.text."+locale],
                    "query":query
                 }
              ];
    SUGGEST.querySuggest.strategy = strategy;
    SUGGEST.querySuggest.expansionRadius = expansionRadius;

    var q = JSON.stringify(SUGGEST.querySuggest);
    console.debug("Send query: ",q);

    var settings = {
      "async": true,
      "crossDomain": true,
      "url": OPTIONS.elsURI+"/api/search/index/"+OPTIONS.elsIndex,
      "method": "POST",
      "headers": {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache"
      },
      "processData": false,
      "data": q
    }

    var ts = new Date().getTime();
    $.ajax(settings).done(function (response) {
      var results = {
        'elements':[]
      };
      for (var i=0; i<response.documentList.length; i++) {
        results.elements.push(response.documentList[i]);
      }
      results.duration = new Date().getTime() - ts;
      results.query = JSON.stringify(SUGGEST.querySuggest, null, 2);
      results.response = JSON.stringify(response, null, 2);
      callback(results);

    }).fail(function (response) {
        callback({error: "[" + response.status + "] " + response.statusText});
    });
  }
};