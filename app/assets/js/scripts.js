// Initialize underscore template variables
_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};

// Google Font Loader
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

// Define api url and templates
var WIKIPEDIA_API_URL = 'http://en.wikipedia.org/w/api.php',
  articleExtractTemplate = _.template(
    '<div class="wiki">' +
      '<div class="image">' +
        '<img src="{{ article.imageUrl }}">' +
      '</div>' +
      '<div class="title">' +
        '<a href="#">{{ article.title }}</a>' +
      '</div>' +
      '<div class="article">{{ article.extract }}</div>' +
    '</div>'
  ),
  articleContentTemplate = _.template(
    '<div class="article-content">{{ article.extract }}</div>'
  );

function getJSONP(url, data) {
  return $.ajax(url, {
    dataType: 'jsonp',
    data: data
  });
}

// Get's Article Extract on button press
function getArticleExtracts() {
  getJSONP(WIKIPEDIA_API_URL, {
    action: 'query',
    prop: 'images|info|extracts|pageimages',
    generator: 'random',
    grnlimit: numberOfArticles || 2,
    exintro: true,
    exlimit: numberOfArticles || 2,
    exsentences: 2,
    grnnamespace: 0,
    inprop: 'url',
    imlimit: 1,
    iiurlwidth: '275',
    iiurlheight: '100',
    format: 'json'
  }).then(function(data) {
    return _.values(data.query.pages)[0];
  }).then(getImage);
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
    appendArticleExtracts(article);
  });
}

function appendArticleExtracts(article) {
  $('.wiki-wrapper').append(articleExtractTemplate({article: article}));
}

function articleExt() {
  numberOfArticles = $('.numberOfArticles').val();
  $('.wiki-wrapper').empty();
  $('.article-content-wrapper').empty();
  _.each(_.range(0,numberOfArticles), getArticleExtracts);
}


// Get's article on clicking article extract link
function getArticle(title) {
  getJSONP(WIKIPEDIA_API_URL, {
    action: 'query',
    prop: 'info|extracts',
    grnlimit: numberOfArticles || 2,
    exintro: true,
    exlimit: numberOfArticles || 2,
    grnnamespace: 0,
    inprop: 'url',
    titles: title,
    format: 'json'
  }).then(function(data) {
    return _.values(data.query.pages)[0];
  }).then(appendArticle);
}

function appendArticle(article) {
  $('.article-content-wrapper').append(articleContentTemplate({article: article}));
}

function articleCont(title) {
  $('.article-content-wrapper').empty();
  getArticle(title);
}


// Click events
$('.btn').click(articleExt);

$(document).on("click", ".title a", function(e) {
  e.preventDefault();
  articleCont($(this).text());
});
