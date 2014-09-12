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
    '<div class="title">' +
      '<a href="#">{{ article.title }}</a>' +
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

function getArticleExtracts() {
  getJSONP(WIKIPEDIA_API_URL, {
    action: 'query',
    prop: 'info|extracts',
    generator: 'random',
    grnlimit: numberOfArticles || 1,
    exintro: true,
    exlimit: numberOfArticles || 1,
    exsentences: 2,
    grnnamespace: 0,
    inprop: 'url',
    format: 'json'
  }).then(function(data) {
    return _.values(data.query.pages)[0];
  }).then(appendArticleExtracts);
}

function getArticle(title) {
  getJSONP(WIKIPEDIA_API_URL, {
    action: 'query',
    prop: 'info|extracts',
    grnlimit: numberOfArticles || 1,
    exintro: true,
    exlimit: numberOfArticles || 1,
    grnnamespace: 0,
    inprop: 'url',
    titles: title,
    format: 'json'
  }).then(function(data) {
    return _.values(data.query.pages)[0];
  }).then(appendArticle);
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
  $('.wiki-wrapper').append(template({article: article}));
}

function appendArticle(article) {
  $('.article-content').append(article.extract);
}

function articleExt() {
  numberOfArticles = $('.numberOfArticles').val();
  $('.wiki-wrapper').empty();
  $('.article-content').empty();
  _.each(_.range(0,numberOfArticles), getArticleExtracts);
}

function articleCont(title) {
  $('.article-content').empty();
  getArticle(title);
}

$('.btn').click(articleExt);

$(document).on("click", ".title a", function() {
  articleCont($(this).text());
});


$(document).ready(function(){
  $('.selectholder').each(function(){
    $(this).children().hide();
    var description = $(this).children('label').text();
    $(this).append('<span class="desc">'+description+'</span>');
    $(this).append('<span class="pulldown"></span>');
    // set up dropdown element
    $(this).append('<div class="selectdropdown"></div>');
    $(this).children('select').children('option').each(function(){
      if($(this).attr('value') != '0') {
        $drop = $(this).parent().siblings('.selectdropdown');
        var name = $(this).attr('value');
        $drop.append('<span>'+name+'</span>');
      }
    });
    // on click, show dropdown
    $(this).click(function(){
      if($(this).hasClass('activeselectholder')) {
        // roll up roll up
        $(this).children('.selectdropdown').slideUp(200);
        $(this).removeClass('activeselectholder');
        // change span back to selected option text
        if($(this).children('select').val() != '0') {
          $(this).children('.desc').fadeOut(100, function(){
            $(this).text($(this).siblings("select").val());
            $(this).fadeIn(100);
          });
        }
      }
      else {
        // if there are any other open dropdowns, close 'em
        $('.activeselectholder').each(function(){
          $(this).children('.selectdropdown').slideUp(200);
          // change span back to selected option text
          if($(this).children('select').val() != '0') {
            $(this).children('.desc').fadeOut(100, function(){
              $(this).text($(this).siblings("select").val());
              $(this).fadeIn(100);
            });
          }
          $(this).removeClass('activeselectholder');
        });     
        // roll down
        $(this).children('.selectdropdown').slideDown(200);
        $(this).addClass('activeselectholder');
        // change span to show select box title while open
        if($(this).children('select').val() != '0') {
          $(this).children('.desc').fadeOut(100, function(){
            $(this).text($(this).siblings("select").children("option[value=0]").text());
            $(this).fadeIn(100);
          });
        }
      }
    });
  });
  // select dropdown click action
  $('.selectholder .selectdropdown span').click(function(){
    $(this).siblings().removeClass('active');
    $(this).addClass('active');
    var value = $(this).text();
    $(this).parent().siblings('select').val(value);
    $(this).parent().siblings('.desc').fadeOut(100, function(){
      $(this).text(value);
      $(this).fadeIn(100);
    });
  });
});