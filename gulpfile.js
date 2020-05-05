let project_folder = 'dist'; // эту папку надо выгружать на сервер и передавать заказчику
let source_folder = '#src'; // папка с исходниками

let path = {
	build: {
		html: project_folder + '/',
		css: project_folder + '/css/',
		js: project_folder + '/js/',
		img: project_folder + '/img/',
		fonts: project_folder + '/fonts/'
	}, // пути вывода
	src: {
		html: [source_folder + '/*.html', '!' + source_folder + '/_*.html'],
		css: [source_folder + '/scss/style.scss', source_folder + '/scss/normalize.scss'],
		js: source_folder + '/js/script.js',
		img: source_folder + '/img/**/*.{jpg,jpeg,png,svg,gif,ico,webp}',
		fonts: source_folder + '/fonts/*.{ttf,woff,woff2}'
	}, // пути вывода
	watch: {
		html: source_folder + '/**/*.html',
		css: source_folder + '/scss/**/*.scss',
		js: source_folder + '/js/**/*.js',
		img: source_folder + '/img/**/*.{jpg,jpeg,png,svg,gif,ico,webp}'
	},
	clean: './' + project_folder + '/'
};
//ПЕРЕМЕННЫЕ
let { src, dest } = require('gulp'),
	gulp = require('gulp'),
	browsersync = require('browser-sync').create(),
	fileinclude = require('gulp-file-include'),
	del = require('del'),
	scss = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	group_media = require('gulp-group-css-media-queries'),
	clean_css = require('gulp-clean-css'),
	rename = require('gulp-rename'),
	uglify = require('gulp-uglify-es').default,
	imagemin = require('gulp-imagemin'),
	webp = require('gulp-webp'),
	webphtml = require('gulp-webp-html'),
	ttf2woff = require('gulp-ttf2woff'),
	ttf2woff2 = require('gulp-ttf2woff2');

function browserSync() {
	browsersync.init({
		server: {
			baseDir: './' + project_folder + '/'
		},
		port: 3000,
		notify: false
	});
}

function html() {
	return src(path.src.html)
		.pipe(fileinclude())
		.pipe(webphtml())
		.pipe(dest(path.build.html))
		.pipe(browsersync.stream());
} //работа с html файлами

function css() {
	return src(path.src.css)
		.pipe(
			scss({
				outputStyle: 'expanded' // scss формируетя не сжатым
			})
		)
		.pipe(group_media())
		.pipe(
			autoprefixer({
				overrideBrowserslist: ['last 5 versions'],
				cascade: true
			})
		) // настройка аутопрефикса для css

		.pipe(dest(path.build.css)) // выгружаем файл css
		.pipe(clean_css()) //сжимаем css файл
		.pipe(
			rename({
				extname: '.min.css'
			})
		) //  создаем сжатый файл css
		.pipe(dest(path.build.css))
		.pipe(browsersync.stream());
} //работа с css файлами

function js() {
	return src(path.src.js)
		.pipe(fileinclude())
		.pipe(dest(path.build.js))
		.pipe(uglify())
		.pipe(
			rename({
				extname: '.min.js'
			})
		)
		.pipe(dest(path.build.js)) // создает файл
		.pipe(browsersync.stream());
} //работа с js файлами

function images() {
	return src(path.src.img)
		.pipe(
			webp({
				quality: 70
			})
		)
		.pipe(dest(path.build.img))
		.pipe(src(path.src.img))
		.pipe(
			imagemin({
				progressive: true,
				svgoPlugins: [{ removeViewBox: false }],
				interlaced: true,
				optimizationLevel: 3 // 0 to 7
			})
		)
		.pipe(dest(path.build.img))
		.pipe(browsersync.stream());
} //работа с img файлами

function fonts() {
	src(path.src.fonts).pipe(ttf2woff()).pipe(dest(path.build.fonts));
	return src(path.src.fonts).pipe(ttf2woff2()).pipe(dest(path.build.fonts));
}

function watchFiles() {
	gulp.watch([path.watch.html], html);
	gulp.watch([path.watch.css], css);
	gulp.watch([path.watch.js], js);
	gulp.watch([path.watch.img], images);
} //обновляет код html

function clear() {
	return del(path.clean);
} //удаляет папку dist

let build = gulp.series(clear, gulp.parallel(js, css, html, images, fonts));
let watch = gulp.parallel(build, watchFiles, browserSync); //вызывает функции

exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
