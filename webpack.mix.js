// webpack.mix.js

let mix = require('laravel-mix');

// we instruct mix to 
// compile 'resources/js/app.js' file and save it to 'public/js/app.js' 
// compile 'resources/scss/app.scss' file and save it to 'public/css/app.css'
// using js() and sass() functions repectively
mix.js('resources/js/app.js', 'public/js/app.js').sass('resources/scss/app.scss','public/css/app.css');
mix.babelConfig({
    "plugins": ["@babel/plugin-proposal-class-properties"]
});