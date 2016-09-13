var gulp = require('gulp');
var exec = require('child_process').exec;
var postcss = require('postcss');
var minify = require('html-minifier').minify;
const fs = require('fs');
const del = require('del');

//////////

// Build steps
// - complete `clear-build` task
// - run `dev-tasks` or `production-tasks`
// - embed the css and js
// - run an html task

//////////

gulp.task('clear-build', ['delete-build'], function() {
	// fs.mkdir('./dist', function(exception) {
	// 	cb(exception);
	// });

	return Promise.all([
		new Promise(function(resolve, reject) {
			fs.mkdir('./dist', function(err) {
				if (err) {
					reject(err);
				}
				else {
					resolve();
				}
			});
		}),
		new Promise(function(resolve, reject) {
			fs.mkdir('./output', function(err) {
				if (err) {
					reject(err);
				}
				else {
					resolve();
				}
			});
		})
	]);
});

gulp.task('dev-tasks',        ['css-dev',        'js-dev']);
gulp.task('production-tasks', ['css-production', 'js-production']);

gulp.task('embed', function() {
	return Promise.all([
		new Promise(function(resolve, reject) {
			fs.readFile('./src/index.html', 'utf-8', function(err, html) {
				if (err) reject(err);

				resolve(html);
			});
		}),
		new Promise(function(resolve, reject) {
			fs.readFile('./output/style.css', 'utf-8', function(err, css) {
				if (err) reject(err);

				resolve(css);
			});
		}),
		new Promise(function(resolve, reject) {
			fs.readFile('./output/bundle.js', 'utf-8', function(err, js) {
				if (err) reject(err);

				resolve(js);
			});
		})
	]).then(function(values) {
		var html = values[0];
		var css = values[1];
		var js = values[2];

		html = html.replace('/* css hook */', css);
		html = html.replace('/* js hook */', js);

		return new Promise(function(resolve, reject) {
			fs.writeFile('./output/index.html', html, function(err) {
				if (err) reject(err);

				resolve();
			});
		});
	});
});

//////////

gulp.task('delete-build', function() {
	// return del(['./dist']);

	return Promise.all([del(['./dist']), del(['./output'])]);
});

// gulp.task('move-audio', function() {
// 	var stream = gulp.src(['./src/audio/*'])
// 		.pipe(gulp.dest('./dist/audio'));
//
// 	return stream;
// });

/**
 * Returns a promise that handles the css
 * @param {array of require calls} plugins
 */
function handleCSS(plugins) {
	return new Promise(function(resolve, reject) {
		fs.readFile('./src/styles/style.css', 'utf-8', function(err, css) {
			if (err) reject(err);

			resolve(css);
		});
	})
	.then(function(css) {
		var processor = postcss(plugins);

		return processor.process(css);
	})
	.then(function(result) {
		return new Promise(function(resolve, reject) {
			fs.writeFile('./output/style.css', result.css, function(err) {
				if (err) reject(err);

				resolve();
			});
		});
	});
}

gulp.task('css-dev', function() {
	return handleCSS([
		require('postcss-advanced-variables')
	]);
});

gulp.task('css-production', function() {
	return handleCSS([
		require('postcss-advanced-variables'),
		require('cssnano')
	]);
});

// webpack is run on the command line because of the nice output it gives there,
//  as opposed to the possible output from running webpack from JavaScript.
gulp.task('js-dev', function (cb) {
	exec('webpack --progress', function (err, stdout, stderr) {
		console.log(stdout);
		console.log(stderr);
		cb(err);
	});
});

gulp.task('js-production', function (cb) {
	exec('webpack --progress -p', function (err, stdout, stderr) {
		console.log(stdout);
		console.log(stderr);
		cb(err);
	});
});

gulp.task('html-dev', function() {
	var stream = gulp.src(['./output/index.html'])
		.pipe(gulp.dest('./dist'));

	return stream;
});

gulp.task('html-production', function() {
	return new Promise(function(resolve, reject) {
		fs.readFile('./output/index.html', 'utf-8', function(err, html) {
			if (err) reject(err);

			resolve(html);
		});
	}).then(function(html) {
		var result = minify(html, {
			removeComments: true,
			collapseWhitespace: true
		});

		return new Promise(function(resolve, reject) {
			fs.writeFile('./dist/index.html', result, function(err) {
				if (err) reject(err);

				resolve();
			});
		});
	});
});
