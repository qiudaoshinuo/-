/*jshint browser:true, jquery:true, devel:true */
/*global impress */
(function ($) {
	'use strict';

	// 检测 IE 版本（兼容老代码保留，仅用于决定是否启用 impress.js）
	var ieVersion = (navigator.appVersion.indexOf('MSIE') !== -1)
		? parseFloat(navigator.appVersion.split('MSIE')[1])
		: 99;

	$(function () {

		// 移除 loading 遮罩
		$('body').removeClass('preload');

		// ---------- impress.js 初始化 ----------
		if (ieVersion > 10 && typeof impress === 'function') {
			try {
				var imprs = impress();
				imprs.init();
				document.addEventListener('impress:stepenter', function (e) {
					var fn = e.target.id + 'PageAnimate';
					if (typeof window[fn] === 'function') {
						window[fn]();
					}
				});
			} catch (err) {
				console.log(err);
			}
		}

		// 禁用"打开邮箱"按钮默认跳转（如需改动在此处理）
		$('a.dwn-vcard').on('click', function () {
			return false;
		});

		// ---------- 作品集分类过滤（事件委托 + 合并重复代码）----------
		// 只要 <li> 有 id="cat_xx" 或 id="all1/all2" 就会被这里处理
		$('section.portfolio_container ul.filter').on('click', 'li', function () {
			var $li = $(this);
			var id = $li.attr('id');
			if (!id) { return; }

			// 切换 active 状态（原来每组 filter 分开做，这里统一处理）
			$li.siblings().removeClass('active');
			$li.addClass('active');

			// 根据 id 决定改的是哪个列表：all1/cat_0[1-4] -> #portfolio-list
			//                           all2/cat_0[5-7] -> #portfolio-list2
			var targetSelector;
			var className;
			if (id === 'all1') {
				targetSelector = '#portfolio-list';
				className = 'all';
			} else if (id === 'all2') {
				targetSelector = '#portfolio-list2';
				className = 'all';
			} else if (/^cat_0[1-4]$/.test(id)) {
				targetSelector = '#portfolio-list';
				className = id;
			} else if (/^cat_0[5-7]$/.test(id)) {
				targetSelector = '#portfolio-list2';
				className = id;
			} else {
				return;
			}

			$(targetSelector)
				.removeClass('all cat_01 cat_02 cat_03 cat_04 cat_05 cat_06 cat_07')
				.addClass(className);
		});

		// ---------- 技能条形图动画 ----------
		var graphHeight = $('.graph-skill').height();
		var $graphBars = $('.graph-skill li');

		$graphBars.each(function () {
			var $this = $(this);
			var $title = $this.children('span.bar-title');
			var val = parseFloat($title.text());

			// 限定 1~100
			val = (!val || val < 1) ? 1 : (val > 100 ? 100 : val);

			$this.css({
				'margin-top': graphHeight * (100 - val) / 100,
				height: graphHeight * val / 100 + 'px'
			}).data('percentValue', val);

			$title.html(val + '%');
		});

		// 进入 resume 页时触发的动画（impress.js 会按 id 找 xxxPageAnimate）
		window.resumePageAnimate = function () {
			var delay = 1;
			$graphBars.each(function () {
				var $bar = $(this);
				var val = $bar.data('percentValue');
				var scale = 0.2;
				$bar
					.delay(delay)
					.animate({
						'margin-top': graphHeight * (100 - (val * scale)) / 100,
						height: graphHeight * val * scale / 100 + 'px'
					}, 200, 'swing')
					.animate({
						'margin-top': graphHeight * (100 - val) / 100,
						height: graphHeight * val / 100 + 'px'
					}, 300, 'swing');
				delay += 120;
			});
		};

		// ---------- ColorBox 图片灯箱 ----------
		if ($.fn.colorbox) {
			$('.port_group').colorbox({
				rel: 'port_group',
				transition: 'fade',
				scrolling: false,
				returnFocus: false,
				maxHeight: window.innerHeight - 50,
				maxWidth: window.innerWidth - 50
			});
		}

		// ---------- 自定义 placeholder 行为（使用事件委托）----------
		var $placeholders = $('div.lblplaceholder');
		$placeholders.on('focus', 'input, textarea', function () {
			var id = $(this).attr('data-lbl');
			$('label#' + id).css('visibility', 'hidden');
		});
		$placeholders.on('blur', 'input, textarea', function () {
			if (!$(this).val()) {
				var id = $(this).attr('data-lbl');
				$('label#' + id).css('visibility', 'visible');
			}
		});
		$placeholders.on('click', 'label', function () {
			var $label = $(this);
			var dataId = $label.attr('data-id');
			$placeholders.find('label').css('visibility', 'visible');
			$placeholders.find("input[data-lbl='" + dataId + "'], textarea[data-lbl='" + dataId + "']").focus();
			$label.css('visibility', 'hidden');
		});

		// ---------- 皮肤切换面板 ----------
		$('div.skin-selector a#toggle-panel').on('click', function (e) {
			e.preventDefault();
			$('div.skin-selector').toggleClass('openpanel');
		});

		// 关键 Bug 修复：原代码里 `backgrlound` 拼写错误导致背景切换无法清除旧 class
		var bodyClass = {
			background: false,   // 背景图 / 纯色背景
			foreground: false,   // 文字背景（fg-xxx）
			foreColor: false     // 文字颜色（fc-xxx）
		};

		$('div.pattern-bg ul li, div.color-bg ul li').on('click', function () {
			if (bodyClass.background) {
				$('body').removeClass(bodyClass.background);
			}
			bodyClass.background = $(this).attr('class');
			$('body').addClass(bodyClass.background);
		});

		$('div.style-color ul li').on('click', function () {
			if (bodyClass.foreground) {
				$('body').removeClass(bodyClass.foreground);
			}
			bodyClass.foreground = 'fg-' + $(this).attr('class');
			$('body').addClass(bodyClass.foreground);
		});

		$('div.font-color ul li').on('click', function () {
			if (bodyClass.foreColor) {
				$('span.h1-text').removeClass(bodyClass.foreColor);
			}
			bodyClass.foreColor = 'fc-' + $(this).attr('class');
			$('span.h1-text').addClass(bodyClass.foreColor);
		});

		// ---------- 头像悬停 → 显示二维码 ----------
		$('.dwn-vcard').on('mouseenter', function () {
			$('.me').addClass('hover');
		}).on('mouseleave', function () {
			$('.me').removeClass('hover');
		});

		// ---------- 主菜单悬停展开 ----------
		$('nav.mainmenu ul > li').on('mouseenter', function () {
			$(this).stop().animate({ right: '0px' }, 100);
		}).on('mouseleave', function () {
			$(this).stop().animate({ right: '-140px' }, 400);
		});

		// ---------- 联系表单校验 ----------
		var emailPattern = /^[a-z0-9+_%.\-]+@(?:[a-z0-9\-]+\.)+[a-z]{2,6}$/i;

		var validateText = function (str, len) {
			return typeof str === 'string' && str.length >= len;
		};
		var validateEmail = function (str) {
			return emailPattern.test(str);
		};

		$('#contact-form').on('submit', function () {
			var hasError = false;

			var checkField = function (selector, validator) {
				var $target = $(selector);
				if (validator($target.val())) {
					$target.removeClass('err').addClass('ok');
				} else {
					$target.removeClass('ok').addClass('err');
					hasError = true;
				}
			};

			checkField('#name', function (v) { return validateText(v, 3); });
			checkField('#mail', validateEmail);
			checkField('#msg',  function (v) { return validateText(v, 10); });

			if (!hasError) {
				$('#ifrm').animate({ height: '70px' }, 700);
			}
			return !hasError;
		});

	});

})(jQuery);
