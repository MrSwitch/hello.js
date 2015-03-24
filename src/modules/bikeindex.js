//
// BikeIndex
// https://bikeindex.org/documentation/api_v2
(function(hello){


function formatError(o){
  if(o && "meta" in o && "error_type" in o.meta){
    o.error = {
      code : o.meta.error_type,
      message : o.meta.error_message
    };
  }
}

function formatUser(o){
  if(o.id){
    o.thumbnail = o.image;
  }
  if(o.user){
    o.name = o.user.name;
  }
  return o;
}

function paging(res,headers,req){
  if(res.data&&res.data.length&&headers&&headers.Link){
    var next = headers.Link.match(/<(.*?)>;\s*rel=\"next\"/);
    if(next){
      res.paging = {
        next : next[1]
      };
    }
  }
}

hello.init({
  bikeindex : {
    name : 'BikeIndex',
    login: function(p){
      p.qs.display = '';
    },

    oauth : {
      version : 2,
      auth : 'https://bikeindex.org/oauth/authorize/',
      grant : 'https://api.bikeindex.org/oauth/access_token'
    },

    // Refresh the access_token once expired
    refresh : true,

    scope : {
      basic : 'read_bikes',
      email : 'read_user',
      // read_bikes : "View user's bikes user owned",
      // write_bikes : 'Edit and create bikes'
    },
    scope_delim : '+',

    base : 'https://bikeindex.org/api/v2/',

    // There aren't many routes that map to the hello.api so I included me/bikes
    // ... because, bikes
    get : {
      'me' : 'me',
      'me/bikes' : 'me/bikes'
    },

    post : {},

    del : {},

    wrap : {
      me : function(o,headers){

        formatError(o,headers);
        formatUser(o);

        return o;
      },
      "default" : function(o,headers,req){

        formatError(o,headers);

        if(Object.prototype.toString.call(o) === '[object Array]'){
          o = {data:o};
          paging(o,headers,req);
          for(var i=0;i<o.data.length;i++){
            formatUser(o.data[i]);
          }
        }
        return o;
      }
    },
    xhr : function(p){
      if( p.method !== 'get' && p.data ){
        // Serialize payload as JSON
        p.headers = p.headers || {};
        p.headers['Content-Type'] = 'application/json';
        if (typeof(p.data) === 'object'){
          p.data = JSON.stringify(p.data);
        }
      }

      return true;
    }
  }
});
})(hello);