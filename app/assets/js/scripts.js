_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};

(function () {
  WebFontConfig = {
    google: { families: ['Raleway:100,600', 'Ubuntu:400,700'] }
  };
  var wf = document.createElement('script');
  wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
            '://ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js';
  wf.type = 'text/javascript';
  wf.async = 'true';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(wf, s);
}());

var WIKIPEDIA_API_URL = 'http://en.wikipedia.org/w/api.php',
  template = _.template(
  '<div class="wiki">' +
    '<div class="image">' +
      '<img src="{{ article.imageUrl }}">' +
    '</div>' +
    '<div class="title">' +
      '<a href="{{ article.fullurl }}" target="_blank">{{ article.title }}</a>' +
    '</div>' +
    '<div class="article">{{ article.extract }}</div>' +
  '</div>'
);

function getJSONP(url, data) {
  return $.ajax(url, {
    dataType: 'jsonp',
    data: data
  });
}

function getArticle() {
  $('.wiki-wrapper').empty();
  for (var i = 0; i < 6; i += 1) {
    getJSONP(WIKIPEDIA_API_URL, {
      action: 'query',
      prop: 'images|info|extracts|pageimages',
      generator: 'random',
      exintro: 0,
      grnnamespace: 0,
      inprop: 'url',
      imlimit: 1,
      sections: 0,
      format: 'json'
    }).then(function(data) {
      return _.values(data.query.pages)[0];
    }).then(getImage);
  }
}

function getImage(article) {
  getJSONP(WIKIPEDIA_API_URL, {
    action: 'query',
    titles: 'File:' + article.pageimage,
    prop: 'imageinfo',
    iiprop: 'url',
    iilocalonly: '',
    format: 'json'
  }).then(function(data) {
    data = _.values(data.query.pages)[0];
    if (data.imageinfo) {
      article.imageUrl = data.imageinfo[0].url;
    }
    appendArticle(article);
  });
}

function appendArticle(article) {
  $('.wiki-wrapper').append(template({article: article}));
}

$('.btn').click(function() {
  getArticle();
});
