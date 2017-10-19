var BAS = {
  query: {
     "type":"bestAndSearchTemplate",
     "locale":"xx_XX",
     "best":{
        "type":"bestTemplate",
        "locale":"xx_XX",
        "question":"xxxxxxx",
        "pager":{
           "startOffset":0,
           "size":10
        },
        "strategy":"xxxxxx",
        "expansionRadius":10,
        "templatesFilter":{
           "operator":"AND",
           "fields":[
              {
                 "type":"in-hierarchy",
                 "propertyName":"templateGroupId",
                 "kind":"TemplateGroup",
                 "value":9,
                 "operator":"IN_DESCENDANT",
                 "inclusive":true,
                 "separator":"/"
              }
           ],
           "subFilters":[],
           "semanticFields":[]
        },
        "qtPairsFilter":{
           "operator":"AND",
           "fields":[],
           "subFilters":[],
           "semanticFields":[]
        },
        "minimalRelevance":0.4
     },
     "search":{
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
                 // dynamicly generated
              ]
           }
        ],
        "semanticFields":[

        ]
     },
     "requiredFields":[
        "templateId",
        "locale",
        "accountId",
        "attachments.attachment1.id",
        "attachments.attachment2.id",
        "attachments.attachment3.id",
        "attachments.attachment4.id",
        "attachments.attachment5.id",
        "attachments.attachment6.id",
        "attachments.attachment7.id",
        "attachments.attachment8.id",
        "attachments.attachment9.id",
        "attachments.attachment10.id",
        "attachments.attachment11.id",
        "attachments.attachment12.id",
        "attachments.attachment13.id",
        "attachments.attachment14.id",
        "attachments.attachment15.id",
        "attachments.attachment16.id",
        "attachments.attachment17.id",
        "attachments.attachment18.id",
        "attachments.attachment19.id",
        "attachments.attachment20.id"
     ],
     "pager":{
        "startOffset":0,
        "size":200
     },
     "strategy":"xxxxx",
     "expansionRadius":10,
     "elasticHighlight":{
        "fields":{
           "label.*":{
              "type":"plain"
           },
           "description.*":{
              "type":"plain"
           },
           "attachments.attachment*.text*":{
              "type":"plain"
           },
           "custom_INFO":{
              "type":"plain"
           },
           "text.*":{
              "type":"plain"
           },
           "custom_*":{
              "type":"plain"
           },
           "html.*":{
              "type":"plain"
           }
        }
     },
     "searchWeight":50.0,
     "bestOnStandardWeight":37.5,
     "bestOnCustomerWeight":12.5,
     "minimalRelevance":0.4
  },

  performBestAndSearch: function(query,expansionRadius,strategy,locale,callback) {
    BAS.query.locale = locale;
    BAS.query.best.locale = locale;
    BAS.query.best.strategy = strategy;
    BAS.query.best.question = query;
    BAS.query.best.expansionRadius = expansionRadius;
    BAS.query.search.subFilters[0].fields = [];
    for (var i=0; i<OPTIONS.customFields.length; i++) {
      BAS.query.search.subFilters[0].fields.push({
          "type":"string",
          "propertyName":"custom_"+OPTIONS.customFields[i],
          "criteria":{
             "value":query,
             "operator":"CONTAINS"
          }
       });
    }

    BAS.query.search.subFilters[0].semanticFields = [
                 {
                    "propertyNames":["html","text","description","label","attachments.attachment*.text."+locale],
                    "query":query
                 }
              ];
    BAS.query.strategy = strategy;
    BAS.query.expansionRadius = expansionRadius;

    var q = JSON.stringify(BAS.query);
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
      results.query = JSON.stringify(BAS.query, null, 2);
      results.response = JSON.stringify(response, null, 2);
      callback(results);
    }).fail(function (response) {
        callback({error: "[" + response.status + "] " + response.statusText});
    });
  }
};