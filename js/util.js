
var Util = {};
/**
 * 插件初始化
 */
jQuery(function(){
	//禁用ajax缓存
	jQuery.ajaxSetup({
		cache: false
	});
	/**************启动Title自定义提示***************/
	jQuery("[title],[original-title]").live("mouseover", function(){
		var target = jQuery(this);
		if(target.attr("title")){
			target.attr("original-title", target.attr("title"));
			target.removeAttr("title");
		}
		if(!target.attr("original-title")){
			return;
		}
		var title = target.attr("original-title");
		var tip = jQuery("#hover_tip");
		if(tip.length == 0){
			tip = jQuery("<div id='hover_tip'><div class='tip_arrow'></div><div class='tip_content radius3'></div></div>").appendTo("body");
		}
		jQuery(".tip_content").html(title);
		jQuery("#hover_tip").show();
		jQuery(".tip_arrow").removeClass("tip_right").removeClass("tip_top").css("top", "");
		if(target.attr("title_pos") == "right"){
			tip.css({
				left: target.offset().left + target.outerWidth() + 7,
				top: target.offset().top + target.outerHeight()/2 - tip.outerHeight()/2
			});
			jQuery(".tip_arrow").addClass("tip_right").css("top", tip.outerHeight()/2 - 7);
		}else if(target.attr("title_pos") == "top"){
			tip.css({
				left: target.offset().left + target.outerWidth()/2 - tip.outerWidth()/2,
				top: target.offset().top - tip.outerHeight()
			});
			jQuery(".tip_arrow").addClass("tip_top");
		}else{
			tip.css({
				left: target.offset().left + target.outerWidth()/2 - tip.outerWidth()/2,
				top: target.offset().top + target.outerHeight()
			});
		}
	}).live("mouseout", function(){
		jQuery("#hover_tip").hide();
	});
	/**************启动通知加载***************/
	var badges = jQuery(".notification_badge");
	if(badges.length){
		Util.notificationsTips();
	}
	/**************Header导航***************/
	var leaveTimeout;
	jQuery("#header-user").live("mouseenter",function(){
		clearTimeout(leaveTimeout);
		var target = jQuery(this);
		var menu = jQuery("#header_user_menu");
		target.addClass("droped");
		menu.popMenu({
			target: target,
			onClose: function(){
				target.removeClass("droped");
			}
		});
		menu.unbind().bind("mouseenter", function(){
			clearTimeout(leaveTimeout);
		}).bind("mouseleave", function(){
			leaveTimeout = setTimeout(function(){menu.popMenu("close");target.removeClass("droped");}, 200);
		});
	}).live("mouseleave", function(){
		var target = jQuery(this);
		leaveTimeout = setTimeout(function(){jQuery("#header_user_menu").popMenu("close");target.removeClass("droped");}, 200);
	});
	/**************启动user quickinfo***************/
	var userInfoRequest;
	var closeUserInfoTimeout;
	jQuery(".user_quickinfo").live("mouseenter", function(){
		var target = jQuery(this);
		var userId = target.attr("userId");
		if(userInfoRequest){
			userInfoRequest.abort();
		}
		clearTimeout(closeUserInfoTimeout);
		userInfoRequest = Util.ajax({
			url: "/u/quickinfo",
			data: {userId: userId},
			success:function(data){
				if(data.result == "not_exists"){
					return;
				}
				var box = getQuickInfoBox();
				box.attr("userId",userId);
				box.html(data);
				box.show();
				box.popMenu({
					autoClose: false,
					target: target,
					position: "left"
				});
				box.unbind().bind("mouseenter", function(){
					clearTimeout(closeUserInfoTimeout);
				}).bind("mouseleave", function(){
					box.popMenu("close");
				});
				jQuery(".unfollowuser_btn").die().on("mouseover",function(){
					jQuery(this).text("Unfollow").removeClass("green");
				}).live("mouseout",function(){
					jQuery(this).text("Following").addClass("green");
				}).live("click",function(){
					doUnFollowUser(this,userId);
				});
				jQuery(".followuser_btn").die().live("click",function(){
					doFollowUser(this,userId);
				});
				
			}
		});
	}).live("mouseleave", function(){
		closeUserInfoTimeout = setTimeout(function(){
			jQuery("#userQuickInfo").popMenu("close");
		},400);
	});
	
	function getQuickInfoBox(){
		var box = jQuery("#userQuickInfo");
		if(box.length == 0){
			box = jQuery("<div id='userQuickInfo' class='shadow_1 radius3' style='display:none;'></div>").appendTo("body");
		}
		return box;
	}
});

//Array 功能扩展：获取元素下标、判断包含、删除指定元素
Array.prototype.inArray = function(elem){
	for(var i = 0; i < this.length; i++){
		if(this[i] == elem) return true;
	}
	return false;
};
Array.prototype.indexOf = function(elem){
	for(var i = 0; i < this.length; i++){
		if(this[i] == elem) return i;	
	}
	return -1;
};
Array.prototype.remove = function(elem){
	var index = this.indexOf(elem);
	if(index > -1){
		this.splice(index, 1);
	}
};

Util.notificationsTips = function(){
	jQuery.get("/notification/count", {}, function(data){
		if(data.goon){
			//如果后台允许再次刷新
			setTimeout(Util.notificationsTips, 30 * 1000);
		}
		if(data.count > 0){
			jQuery(".notification_badge").text(data.count).show();
		}else{
			jQuery(".notification_badge").hide();
		}
	});
};

/**
 * 格式化字符串：xxx {0} xxx {1} xxx
 * @param {Object} str
 * @param {Object} args 字符串变量，多个变量数组形式
 */
Util.formatMsg = function(str, args){
	if(typeof args != "object"){
		eval("args=['"+ args + "']");
	}
	for(var i = 0; i < args.length; i++){
		var toReplace = "{" + i + "}";
		str = str.replace(toReplace, args[i]);
	}
	return str;
};


/**
 * 数字按千位逗号分割
 * 参数：s，需要格式化的金额数值.
 * 参数：decimal,判断格式化后的金额是否需要小数位.
 **/
Util.formatNumber = function(s,decimal) {
	if (/[^0-9\.]/.test(s)) return "0";
	if (s == null || s == "") return "0";
	s = s.toString().replace(/^(\d*)$/, "$1.");
	s = (s + "00").replace(/(\d*\.\d\d)\d*/, "$1");
	s = s.replace(".", ",");
	var re = /(\d)(\d{3},)/;
	while (re.test(s)){
		s = s.replace(re, "$1,$2");
	}
	s = s.replace(/,(\d\d)$/, ".$1");
	if (decimal == 0) {// 不带小数位(默认是有小数位)
		var a = s.split(".");
		if (a[1] == "00") {
			s = a[0];
		}
	}
	return s;
};

/**
 * 输入框允许输入数字，用于onkeydown
 * @param {Object} eventTag
 */
Util.onlyNum = function(eventTag){
	var event = eventTag||window.event;
	if(!(event.keyCode>=8 && event.keyCode <= 20) || (event.keyCode>=33 && event.keyCode <= 46)) 
	if(!((event.keyCode>=48&&event.keyCode<=57)||(event.keyCode>=96&&event.keyCode<=105))) {
		if(window.event){
			event.returnValue=false; 
		}else{
			event.preventDefault();
		}
	}
	return event.keyCode;
};

/**
 * 清空DOM中的输入框
 */
jQuery.fn.clear = function(){
	jQuery(this).find("input[type=text]").val("");
	jQuery(this).find("input[type=password]").val("");
	jQuery(this).find("textarea").val("");
	jQuery(this).find("select").val("");
};

/**
 * 扩展的form提交 post ajax形式
 * @param {Object} options
 * @param .url  提交地址
 * @param .onSubmit  提交前事件
 * @param .success  提交成功事件
 */
jQuery.fn.submitFormAjax = function(options){
	var form = jQuery(this);
	if(options.onSubmit){
		if (options.onSubmit.call() == false) {
			return;
		}
	}
	jQuery.ajax({
		url:options.url ? options.url : jQuery(this).attr("action"),
		type:"POST",
		data:jQuery(this).serialize(),
		success:function(data){
			if(data.error == "error"){
				jQuery.simpleAlert("Server is temporarily unable to process your request, please try again", "error", 3000);
			}else if (data.error == "notlogin") {
				//由AOP拦截处理的登录验证
				Util.loginWindow("open", function(){
					form.submitFormAjax(options);
				});
			}else if (options.success) {
				options.success(data);
			}
		},
		error:function(data){
			jQuery.simpleAlert("Server is temporarily unable to process your request, please try again".errorMsg,"error",3000);
			if(options.error){
				options.error(data);
			}
		}
	});
};

/**
 * 扩展的form提交 post hidden frame形式
 * @param {Object} options
 * @param .url  提交地址
 * @param .onSubmit  提交前事件
 * @param .success  提交成功事件
 * @param {boolean} json 是否是json形式
 */
jQuery.fn.submitForm = function(opt){
	var defaultOpt = {
			json:true
	};
	var options = jQuery.extend(defaultOpt, opt);
	var form = jQuery(this);
	if(options.onSubmit){
		if (options.onSubmit.call(form) == false) {
			return;
		}
	}
	if (options.url){
		form.attr('action', options.url);
	}
	var frameId = 'submit_frame_' + (new Date().getTime());
	var frame = jQuery('<iframe id='+frameId+' name='+frameId+'></iframe>')
		.attr('src', window.ActiveXObject ? 'javascript:false' : 'about:blank')
		.css({
			position:'absolute',
			top:-1000,
			left:-1000
		});
	form.attr('target', frameId);
	frame.appendTo('body');
	frame.bind('load', submitCallback);
	form.append("<input type='hidden' name='submitFormByHiddenFrame' id='submitFormByHiddenFrameParam' value='hiddenFrame'/>");
	form[0].submit();
	jQuery("#submitFormByHiddenFrameParam").remove();
	
	var checkCount = 10;
	function submitCallback(){
		frame.unbind();
		var body = jQuery('#'+frameId).contents().find("body");
		var data = body.html();
		if (data == ''){
			if (--checkCount){
				setTimeout(submitCallback, 200);
				return;
			}
			return;
		}
		var ta = body.find('>textarea');
		if (ta.length){
			data = ta.val();
		} else {
			var pre = body.find('>pre');
			if (pre.length){
				data = pre.html();
			}
		}
		try{
			eval('data='+data);
			if(data.error == "error"){
				jQuery.simpleAlert("Server is temporarily unable to process your request, please try again","error",3000);
			}else if (data.error == "notlogin") {
				//由AOP拦截处理的登录验证
				Util.loginWindow("open", function(){
					form.submitForm(options);
				});
			}else if (options.success) {
				options.success(data);
			}
		} catch(e) {
			if(options.json){
				jQuery.simpleAlert("Server is temporarily unable to process your request, please try again","error",3000);
				if (options.error){
					options.error(data);
				}
			}else{
				if (options.success) {
					options.success(data);
				}
			}
		}
		setTimeout(function(){
			frame.unbind();
			frame.remove();
		}, 100);
	}
};

/**
 * 封装的ajax，对jQuery.ajax结果进行了过滤
 * @param {Object} options
 */
Util.ajax = function(options){
	if(options.onSend){
		if(options.onSend() == false){
			return;
		}
	}
	var defaults = {
		type: "POST"
	}
	options = jQuery.extend(defaults, options);
	return jQuery.ajax({
		url:options.url,
		type:options.type,
		traditional:true,
		data:options.data,
		success:function(data){
			if(data.error == "error"){
				jQuery.simpleAlert("Server is temporarily unable to process your request, please try again","error",3000);
				if(options.error){
					options.error(data);
				}
			}else if (data.error == "notlogin") {
				//由AOP拦截处理的登录验证
				if(options.loginValidate){
					options.loginValidate(data);
				}
				Util.loginWindow("open", function(){
					//登录成功再次执行本次请求.
					Util.ajax(options);
				});
			}else{
				if(options.success){
					options.success(data);
				}
			}
		},
		error:function(data){
			if(data.status){
				if(options.error){
					options.error(data);
				}else{
					jQuery.simpleAlert("Server is temporarily unable to process your request, please try again","error",3000);
				}
			}
		}
	});
};

Util.load = function(dom, url, params, callback, filter){
	jQuery.ajax({
		url:url,
		type:"POST",
		dataType: "html",
		data:params,
		success:function(data){
			if(data.error == "error"){
				jQuery.simpleAlert("Server is temporarily unable to process your request, please try again","error",3000);
			}else if (data.error == "notlogin") {
				//由AOP拦截处理的登录验证
				Util.loginWindow("open", function(){
					//登录成功再次执行本次load.
					Util.load(dom, url, params, callback, filter);
				});
			}else if(filter){
				if(filter(data)){
					dom.html(data);
					if(callback){
						callback(data);
					}else{
						dom.html(data);
					}
				}
			}else if(callback){
				dom.html(data);
				callback(data);
			}else{
				dom.html(data);
			}
		},
		error:function(data){
			jQuery.simpleAlert("Server is temporarily unable to process your request, please try again","error",3000);
		}
	});
};

Util.get = function(url, params, callback){
	jQuery.ajax({
		url:url,
		type:"GET",
		data:params,
		success:function(data){
			if(data.error == "error"){
				jQuery.simpleAlert("Server is temporarily unable to process your request, please try again","error",3000);
			}else if (data.error == "notlogin") {
				//由AOP拦截处理的登录验证
				Util.loginWindow("open", function(){
					//再次执行
					Util.get(url, params, callback);
				});
			}else{
				callback(data);
			}
		},
		error:function(data){
			jQuery.simpleAlert("Server is temporarily unable to process your request, please try again","error",3000);
		}
	});
};

/**
 * 置为不可用
 */
jQuery.fn.disable = function(grow,zindex){
	jQuery(this).attr("disable",true);
	jQuery(this).addClass("opacity");
	for(var i = 0 ; i < jQuery(this).length; i++){
		var dom = jQuery(this)[i];
		jQuery(dom).unbind("mouseover.disable").bind("mouseover.disable", function(){
			var mask = jQuery("<div class='disabled-mask'></div>").appendTo("body");
			if(!grow){
				grow = 2;
			}
			mask.css({
				width:jQuery(this).outerWidth() + grow,
				height:jQuery(this).outerHeight() + 4,
				top:jQuery(this).offset().top,
				left:jQuery(this).offset().left
			});
			if(zindex){
				mask.css("z-index", zindex);
			}
			mask.bind("mouseout", function(){
				jQuery(this).remove();
			});
		}).bind("focus", function(){
			jQuery(this).blur();
		});
		jQuery(dom).trigger("mouseover.disable");
	}
	return this;
};

/**
 * 激活
 * @param {Object} fn  重新绑定的事件
 */
jQuery.fn.enable = function(){
	jQuery(this).attr("disable",false);
	jQuery(this).removeClass("opacity");
	for(var i = 0 ; i < jQuery(this).length; i++){
		var dom = jQuery(this)[i];
		jQuery(dom).unbind("mouseover.disable").unbind("focus");
	}
	jQuery(".disabled-mask").trigger("mouseout");
	return this;
};

/**
 * 打开登录窗口
 * @param {Object} method
 * @param {Object} callback
 */
Util.loginWindow = function(method, callback){
	if(typeof method == "undefined"){
		method="open";
	}
	if (method == "open") {
		if (jQuery("#loginWindow").length) {
			jQuery("#loginWindow").remove();
		}
		var loginWindow = jQuery("<div id='loginWindow' class='loginWindow'></div>").appendTo("body");
		loginWindow.append("<div id='loginWindow-content' class='loginWindow-content'><img src='/images/ajaxload.gif' style='margin:80px 0px 0px 45%'/></div>");
		jQuery("#loginWindow-content").load("/login/window",function(){
			loginCallback = callback;
		});
		loginWindow.dialog();
	}else if(method="close"){
		jQuery("#loginWindow").dialog("close");
	}
};

/**
* Plugs
**/

(function($) {
	
	/**
	 * 打开一个遮罩
	 * @param {Object} method
	 */
	var maskStackCount = 0;
	jQuery.mask = function(method){
		if(typeof method == "undefined"){
			method="open";
		}
		if (method == "open") {
			if (maskStackCount == 0) {
				var mask = jQuery("<div id='window-mask' class='window-mask' style='display:none'></div>").appendTo("body");
				mask.css({
					width: jQuery(window).width() + "px",
					height: jQuery(window).height() + "px",
					filter: "alpha(opacity=60)"
				}).show();
				jQuery(window).bind("resize.mask", function(){
					mask.css({
						width: jQuery(window).width() + "px",
						height: jQuery(window).height() + "px"
					});
				});
			}
			maskStackCount++;
		}
		else if(method == "close"){
			maskStackCount--;
			if(maskStackCount == 0){
				jQuery("#window-mask").remove();
				jQuery(window).unbind("resize.mask");
			}
		}
		
	};
	/**
	 * 弹出窗口
	 * ---options---
	 * width
	 * heiht
	 * title
	 * onClose
	 */
	jQuery.fn.dialog = function(options){
		var dialogWin = jQuery(this);
		//如果是字符串类型，则调用方法
		if(typeof options == "string"){
			//关闭
			if(options == "close"){
				dialogWin.find(".dialog_close").trigger("click");
				if(jQuery("#window-mask") != null){
					jQuery("#window-mask").hide();
				}
			}
		}else{
			var defaults = {
				fixed: true,
				closable: true,
				mask: true
			};
			options = jQuery.extend(defaults, options);
			//初始化，打开
			if(!options){
				options = {};
			}
			var title = "";
			if(options.title){
				title = options.title;
			}else if(dialogWin.attr("title")){
				title = dialogWin.attr("title");
				dialogWin.attr("title", "");
			}
//			dialogWin.css({
//				"width": dialogWidth,
//				"height": dialogHeight
//			})
			dialogWin.addClass("dialog_box")
			.show();
			var dialogClose = jQuery("<div class='dialog_close'></div>")
				.appendTo(dialogWin);
			dialogClose.bind("click", function(){
				if(options.onClose){
					if(options.onClose() == false){
						return;
					}
				}
				jQuery.mask("close");
				dialogWin.hide();
				dialogWin.removeClass("dialog_box").find(".dialog_close").remove();
				var title = dialogWin.find(".dialog_title");
				dialogWin.attr("title",title.text());
				title.remove();
				jQuery(window).unbind("resize.dialog");
			});
			if(options.closable){
				dialogClose.show();
			}
			if(title != ""){
				dialogWin.prepend("<h2 class='dialog_title'>"+title+"</h2>");
			}
			//遮罩
			if(options.mask){
				jQuery.mask();
			}
			var dialogWidth = dialogWin.outerWidth();
			var dialogHeight = dialogWin.outerHeight();
			jQuery(window).bind("resize.dialog", function(){
				var top = 0;
				if(options.fixed){
					dialogWin.css("position", "fixed");
					top = (jQuery(window).height() - dialogHeight) / 2 + "px";
				}else{
					dialogWin.css("position", "absolute");
					top = (jQuery(window).height() - dialogHeight) / 2 + jQuery(document).scrollTop() + "px";
				}
				var left = (jQuery(window).width() - dialogWidth) / 2 + "px";
				dialogWin.css({
					top: top,
					left: left
				});
			});
			jQuery(window).trigger("resize.dialog");
			dialogWin.find(".dialog_title").draggable({target:dialogWin});
		}
		return dialogWin;
	};
	
	jQuery.confirm = function(options){
		var confirmWin = jQuery("#global_confirm_window")
		if(!confirmWin.length){
			confirmWin = jQuery("<div id='global_confirm_window' title='Please Confirm'><div class='msg'></div><div class='buttons'><span class='button default okbtn'>OK</span>&nbsp;&nbsp;<span class='button cancelbtn'>Cancel</span></div></div>").appendTo("body");
		}
		confirmWin.find(".msg").html(options.content);
		if(options.width){
			confirmWin.css("width", options.width);
		}
		if(options.height){
			confirmWin.css("height", options.height);
		}
		confirmWin.dialog();
		confirmWin.find(".okbtn").unbind().bind("click", function(){
			confirmWin.dialog("close");
			if(options.onConfirm){
				options.onConfirm();
			}
		});
		confirmWin.find(".cancelbtn").unbind().bind("click", function(){
			confirmWin.dialog("close");
			if(options.onCancel){
				options.onCancel();
			}
		});
	};
	
	/**
	 * 下拉菜单
	 * @param options{
	 * 	position: left, center, right
	 * 	offsetX 左偏移
	 * 	offsetY 上下偏移
	 * 	zindex zindex值，默认2
	 * 	autoClose 是否点击其他区域后自动关闭
	 * 	closeAfterClick 点击后是否自动关闭
	 * 	target 相对的某个元素弹出
	 * 	onClose 关闭时执行的函数
	 *  autoPosition 是否当显示位置超出浏览器窗口时，自动移动
	 * }
	 */
	jQuery.fn.popMenu = function(options){
		var menu = jQuery(this);
		if(typeof options == "string"){
			//关闭
			if(options == "close"){
				menu.hide().removeClass("popover");
				jQuery(window).unbind("resize.popmenu");
			}
			return;
		}
		var defaults = {
				position: "left",
				fixed: false,
				offsetX: 0,
				offsetY: 0,
				zindex: 2,
				autoClose: true,
				closeAfterClick: false,
				autoPosition: true
		};
		var opt = jQuery.extend(defaults, options);
		var target = jQuery(opt.target);
		menu.addClass("popover").css("z-index", opt.zindex);
		if(opt.fixed){
			menu.css("position", "fixed");
		}
		if(opt.autoClose){
			if(opt.closeAfterClick == false){
				menu.unbind("mouseup.popmenu").bind("mouseup.popmenu", function(e){
					e.stopPropagation();
				});
			}
			jQuery(document).bind("mouseup.popmenu", function(){
				menu.popMenu("close");
				jQuery(document).unbind("mouseup.popmenu");
				if(opt.onClose){
					opt.onClose();
				}
			});
		}
		jQuery(window).bind("resize.popmenu", function(){
			menu.popMenu(options);
		});
		menu.show();
		var left = 0;
		if(opt.position == "center"){
			left = target.offset().left + target.outerWidth() / 2 - menu.outerWidth() / 2;
		}else if(opt.position == "right"){
			left = target.offset().left + target.outerWidth() - menu.outerWidth();
		}else{
			left = target.offset().left;
		}
		if(left + menu.outerWidth() > jQuery(window).width()){
			left = jQuery(window).width() - menu.outerWidth();
		}
		var top = target.offset().top + target.outerHeight();
		if(opt.autoPosition && top + opt.offsetY + menu.outerHeight() > jQuery(window).height() + jQuery(document).scrollTop()){
			menu.css({
				top:jQuery(window).height() - menu.outerHeight() + jQuery(document).scrollTop(),
				left:left + opt.offsetX
			});
		}else{
			menu.css({
				top:top + opt.offsetY,
				left:left + opt.offsetX
			});
		}
	};
	
	/**
	 * 短提示，2000毫秒关闭
	 * @param {Object} msg
	 * @param {Object} type  [info,error,ok]
	 */
	jQuery.simpleAlert=function(msg,type,delay){
		if(msg == "close"){
			jQuery("#simplealert").remove();
			return;
		}
		if(jQuery("#simplealert").length){
			jQuery("#simplealert").remove();
		}
		var alertType="simplealert-icon-info";
		if(type){
			alertType = "simplealert-icon-" + type;
		}
		var simpleAlert = jQuery("<div id='simplealert' class='simplealert'></div>").appendTo("body");
		var html = "<div class='"+alertType+"'>";
		if(type == "loading"){
			html += "<img src='/images/default/designer/loading.gif' style='margin:10px 0px 0px 12px'/>";
		}
		html += "</div><div class='simplealert-msg'>"+msg+"</div><div class='simplealert-right'></div>";
		simpleAlert.html(html);
		simpleAlert.css("top", ( jQuery(window).height() - simpleAlert.height() ) / 2+jQuery(window).scrollTop() + "px"); 
	    simpleAlert.css("left", ( jQuery(window).width() - simpleAlert.width() ) / 2+jQuery(window).scrollLeft() + "px");
		simpleAlert.show();
		if(delay != "no"){
			setTimeout(function(){
				simpleAlert.fadeOut(200);
			},delay ? delay : 3500);
		}
	};
	
	/**
	 * 默认的Tooltip
	 * @param {Object} options
	 */
	jQuery.fn.tooltip = function(content, type, fade){
		var tip;
		type = type ? type : "warning";
		if(type != "none"){
			content = "<img src='/images/icon/ico-"+type+".png' style='vertical-align:middle;margin-right:5px;'/><span>" 
				+ content + "</span>";
		}
		if(jQuery("p#p_toolTip").length){
			jQuery("p#p_toolTip").remove();
		}
		jQuery('body').append( '<p id="p_toolTip" class="radius3"><img id="img_toolTip_Arrow" src="/images/icon/arrow-left.png" />'+content+'</p>' );
		tip =   jQuery('p#p_toolTip');
		jQuery('p#p_toolTip #img_toolTip_Arrow').css({"position": "absolute", "top": "5px", "left": "-13px"});
		if(!fade){
			tip.show();
		}else{
			tip.fadeIn("fast");
		}
		tip.css({
			left:jQuery(this).offset().left + jQuery(this).width() + 18,
			top:jQuery(this).offset().top - 16
		});
	};

	/**
	 * 关闭Tooltip
	 */
	jQuery.closeTooltip = function(){
		jQuery("p#p_toolTip").remove();
	};
	
	jQuery.fn.draggable = function(options){
		var defaults = {
			target:jQuery(this)
		};
		var opt = jQuery.extend(defaults, options);
		jQuery(this).unbind("dragstart").bind("dragstart", function(){return false;});
		jQuery(this).unbind("mousedown.drag").bind("mousedown.drag", function(e){
			jQuery(document).bind("selectstart", function(){return false;});
			var downX = e.pageX;
			var downY = e.pageY;
			var downLeft = opt.target.offset().left;
			var downTop = opt.target.offset().top;
			jQuery(document).bind("mousemove.drag", function(e){
				var left = e.pageX - downX + downLeft;
				var top = e.pageY - downY + downTop;
				if(opt.bounding){
					var boundingleft = opt.bounding.offset().left;
					var boundingtop = opt.bounding.offset().top;
					if(left > boundingleft && top > boundingtop
						&& left < boundingleft + opt.bounding.outerWidth() - opt.target.outerWidth()
						&& top < boundingtop + opt.bounding.outerHeight() - opt.target.outerHeight()){
						opt.target.offset({
							left: left,
							top: top
						});
					}
				}else{
					opt.target.offset({
						left: left,
						top: top
					});
				}
			});
			jQuery(document).bind("mouseup.drag", function(e){
				jQuery(document).unbind("selectstart");
				jQuery(document).unbind("mousemove.drag");
				jQuery(document).unbind("mouseup.drag");
			});
		});
	};
	
	jQuery.fn.suggest = function(options){
		var target = jQuery(this);
		var defaults = {
			valueField: "value",
			width: target.outerWidth(),
			format: function(item){
				return item.text;
			}
		};
		var opt = jQuery.extend(defaults, options);
		if(!target.data("suggest")){
			var menu = jQuery("<ul class='suggest_menu'></ul>").appendTo("body");
			menu.width(opt.width);
			target.data("suggest", menu);
		}
		var index = -1;
		var last = "";
		target.unbind("keydown.suggest").bind("keydown.suggest", function(e){
			var suggest = target.data("suggest");
			if(e.keyCode == 40){
				//向下
				e.preventDefault();
				if(index < suggest.children().length - 1){
					index ++;
					suggest.find(".selected").removeClass("selected");
					suggest.find("li[index=" + index + "]").addClass("selected");
				}
			}else if(e.keyCode == 38){
				//向上
				e.preventDefault();
				suggest.find(".selected").removeClass("selected");
				if(index >= 0){
					index --;
					suggest.find("li[index=" + index + "]").addClass("selected");
				}
			}else if(e.keyCode == 13){
				var selected = suggest.find(".selected");
				if(selected.length){
					target.val(selected.attr("val"));
				}
				if(opt.onEnter){
					opt.onEnter(target);
				}
				suggest.empty().popMenu("close");
			}
		}).unbind("keyup.suggest").bind("keyup.suggest", function(e){
			var suggest = target.data("suggest");
			var value = target.val();
			if(value == ""){
				suggest.empty().popMenu("close");
			}else if(value != last){
				index = -1;
				jQuery.get(opt.url, {q: value}, function(data){
					suggest.empty();
					var items = data.items;
					if(items.length == 0){
						suggest.empty().popMenu("close");
					}else{
						for(var i = 0; i < items.length; i++){
							var item = items[i];
							var itemHtml = "<li index='" + i + "' class='suggest_item' val='" + item[opt.valueField] + "'>";
							itemHtml += opt.format(item);
							itemHtml += "</li>";
							suggest.append(itemHtml);
						}
						suggest.popMenu({
							target: target,
							zindex: 4
						});
						suggest.find(".suggest_item").bind("mousedown", function(e){
							e.preventDefault();
							target.val(jQuery(this).attr("val"));
							if(opt.onEnter){
								opt.onEnter(target);
							}
							suggest.empty().popMenu("close");
						});
					}
				});
			}
			last = value;
		}).unbind("blur.suggest").bind("blur.suggest", function(e){
			var suggest = target.data("suggest");
			suggest.empty().popMenu("close");
		});
	};
	
	/**
	 * 说明： 在页面指定元素中构建分页条
	 * @param curPage 当前第几页
	 * @param totalPage 一共有多少页
	 * @param clickHandler 点击事件，传入参数为当前第几页
	 * @param barCount 分页条共显示多少个按钮
	 */
	jQuery.fn.pagination = function(curPage, totalPage, clickHandler, barCount){
		if(totalPage <= 0){
			return;
		}
		var pageBarNum = 5;
		if(barCount){
			pageBarNum = barCount;
		}
		var tar = jQuery(this).addClass("pagination");
		var start = 1;
		var end = totalPage;
		if(totalPage > pageBarNum){
			var index = Math.floor(pageBarNum/2);
			var start = (curPage-index) > 0 ? (curPage-index) : 1;
			if(totalPage - start < pageBarNum){
				start = totalPage - pageBarNum + 1;
			}
			var end = start + pageBarNum - 1;
		}
		var pageHtml = "";
		if(curPage > 1){
			pageHtml += "<a p='" + (curPage - 1) + "'>«</a>";
		}else{
			pageHtml += "<a class='disabled'>«</a>";
		}
		if(start >= 2){
			pageHtml += "<a p='1'>1</a>";		
		}
		if(start >= 3){
			pageHtml += "<a class='disabled ellipsis'>...</a>";		
		}
		for (var i = start; i <= end; i++) {
			if (i > totalPage)
				break;
			if (i == curPage) {
				pageHtml += '<a class="disabled">' + i + '</a>';
			} else {
				pageHtml += "<a p='" + i + "'>" + i + "</a>";
			}
		}
		if(end <= totalPage - 2){
			pageHtml += "<a class='disabled ellipsis'>...</a><a p='"+totalPage+"'>"+totalPage+"</a>";		
		}else if(end <= totalPage - 1){
			pageHtml += "<a p='"+ totalPage +"'>"+totalPage+"</a>";	
		}
		if(curPage < totalPage){
			pageHtml += "<a p='" + (curPage + 1) + "'>»</a>";
		}else{
			pageHtml += "<a class='disabled'>»</a>";
		}
		tar.html(pageHtml);
		if(clickHandler){
			tar.find("a[p]").bind("click", function(){
				var page = jQuery(this).attr("p");
				clickHandler(page);
			});
		}
	};
	//文件上传前判断文件大小
	jQuery.fn.fileSize = function(){
		 var target = this.get(0);
		 var fileSize = 0;
         if (jQuery.browser.msie && !target.files) {
             var filePath = target.value;
             var fileSystem = new ActiveXObject("Scripting.FileSystemObject");   
             var file = fileSystem.GetFile (filePath);
             fileSize = file.Size;
         } else {
             fileSize = target.files[0].size;
         }
		 return fileSize*1024;
	};
	jQuery.fn.errorTip = function(content, type){
		var tip;
		var classType = "error"
		if(jQuery(".signin-error").length){
			jQuery(".signin-error").remove();
		}
		if(type != null){
			classType = type;
		}
		var html = '<span class="signin-error"><span class="signin-'+classType+'-tip">' +
					content + '<label class="signin-'+classType+'-tip-arrow right"></label>' +
					'<label class="signin-'+classType+'-tip-arrow right1"></label></span></span>';
		if(jQuery(this).offset().left < 200){
			html = '<span class="signin-error"><span class="signin-'+classType+'-tip">' +
					content + '<label class="signin-'+classType+'-tip-arrow left"></label>' +
					'<label class="signin-'+classType+'-tip-arrow left1"></label></span></span>';
		}
		jQuery('body').append(html);
		tip = jQuery('.signin-error');
		tip.css({
			left:jQuery(this).offset().left - tip.width(),
			top:jQuery(this).offset().top+jQuery(this).height()/2-7,
			opacity:"0",
			filter:"alpha(opacity=0)"
		});
		jQuery(this).addClass(classType);
		if(jQuery(this).offset().left < 200){
			tip.animate({
				left:jQuery(this).offset().left + tip.width(),
				top:jQuery(this).offset().top+jQuery(this).height()/2-7,
				opacity:"0.7",
				filter:"alpha(opacity=70)"
			}, 200);
		}else{
			tip.animate({
				left:jQuery(this).offset().left - tip.width() - 14,
				top:jQuery(this).offset().top+jQuery(this).height()/2-7,
				opacity:"0.7",
				filter:"alpha(opacity=70)"
			}, 200);
		}
	};

	/**
	 * 关闭Tooltip
	 */
	jQuery.closeErrorTip = function(){
		jQuery(".signin-error").remove();
		jQuery("input.error").removeClass("error");
	};
	
})(jQuery);

/**
 *  扩展js String
 */
String.prototype.isEmpty = function(){
	if(this.replace(/(^\s*)|(\s*$)/g, '').length<=0){//null
		return true;
	}
	else{// not null
		return false;
	}
};
String.prototype.notEmpty = function(){
	return !this.isEmpty();
};
String.prototype.isEmail = function(){
	if(this.isEmpty() || (! /^([\w]+)(.[\w]+)*@([\w-]+\.){1,5}([A-Za-z]){2,4}$/.test(this))){//格式不正确
		return false;
	}else{// 格式正确
		return true;
	}
};
String.prototype.isPhoneNumber = function(){
	if(this.isEmpty() || (! /^0{0,1}(13[0-9]|15[7-9]|153|156|18[7-9])[0-9]{8}$/.test(this))){//格式不正确
		return false;
	}else{// 格式正确
		return true;
	}
};
String.prototype.minLength = function(minNum){
	if(this.length >= minNum){
		return true;
	}else{
		return false;
	}
};
String.prototype.maxLength = function(maxNum){
	if(this.length <= maxNum){
		return true;
	}else{
		return false;
	}
	
};


/**
 * 截取字符串
 * @param len 长度
 * @param s 后缀，默认省略符号
 * @returns {String}
 */
String.prototype.cut = function(len, s) {
    var resultStr = "";  
    if(this == ""){
		return resultStr;
	}
	if(typeof s == "undefined"){
		s = "...";
	}
    var strLen = 0;
    for (var i = 0; i < this.length; i++) {  
        if (this.charCodeAt(i) > 127 || this.charCodeAt(i) == 94) {  
        	strLen += 2;  
        } else {  
        	strLen ++;  
        }  
    }  
    if (strLen <= len) {
        return this.toString();  
    }
    strLen = 0;  
    len  = (len > s.length) ? len - s.length : len;  
    for (var i = 0; i < this.length; i++) {  
        if (this.charCodeAt(i)>127 || this.charCodeAt(i)==94) {  
        	strLen += 2;  
        } else {  
        	strLen ++;  
        }  
        if (strLen > len) {  
        	resultStr += s;  
            break;  
        }  
        resultStr += this.charAt(i);  
    }  
    return resultStr;  
};

/**
 * 获取字节长度，中文两个字节
 * @return {}
 */
String.prototype.byteLength = function() {
    var strLen = 0;
    for (var i = 0; i < this.length; i++) {  
        if (this.charCodeAt(i) > 127 || this.charCodeAt(i) == 94) {  
        	strLen += 2;
        } else {  
        	strLen ++;  
        }  
    }  
   	return strLen; 
};

/**
 * 新版设计器新建选择分类和模板-初始化
 * @return {}
 */
function initTemplateCategorySelect(){
	jQuery("#template-category-select li").unbind().bind("click", function(){
        jQuery(".template-category li").removeClass("current");
        jQuery(this).addClass("current");
		var category = jQuery(this).attr("category");
		//加载模板文件
		getTemplates(category);
    });
    jQuery(".item-container").die().live("click", function(){
    	jQuery(".template_selected").removeClass("template_selected");
    	jQuery(this).addClass("template_selected");
    	jQuery("#template_select_ok").enable();
    }).live("dblclick", function(){
		templateSelected();    
    });
}


/**
 * 新版设计器新建选择分类和模板-加载可选模板
 * @return {}
 */
function getTemplates(category){
		Util.get("/diagraming/gettemplates", {
	        category: category
	    	}, function(data){
	    		if(category == "my_template"){
	    			jQuery(".template-select").remove();
	    		}else{
	    			jQuery(".template-select[chartId!='']").remove();
	    			if(jQuery(".template-select[chartId='']").length == 0){
	    				jQuery("#template-container").append('<div class="item-container template-select template_selected radius3" chartId=""><div></div>Blank</div>');
	    			}
	    		}
		        for (var i = 0; i < data.templates.length; i++) {
		            var tem = data.templates[i];
		            jQuery("#template-container").append('<div define="' + tem.chartId + '" class="item-container template-select radius3"><div><img src="/file/response/' + tem.thumbnail + '/chart_image"/></div>' + tem.title + '</div>');
		        }
		        var selected = jQuery(".template_selected");
				if(selected.length <= 0){
					jQuery("#template_select_ok").disable();
				}
	    });
}

var globalNewTeamId;
var globalNewFolderId;

/*新版设计器-新建-选择分类和模板dialog 入口*/
function globalNewDialog(teamId, folderId, source){
	globalNewTeamId = teamId;
	globalNewFolderId = folderId;
	
	if(jQuery("#dialog_new_diagram").length == 0){
		Util.ajax({
			url: "/diagraming/new_dialog",
			data:{},
			success: function(data){
				jQuery("body").append(data);
				//弹出新建窗口
		    	jQuery("#dialog_new_diagram").dialog();
		    	initTemplateCategorySelect();
		        jQuery("#template_select_ok").bind("click", function(){
		        	templateSelected(source);
		        });
		        jQuery("#template_select_cancel").bind("click", function(){
		        	jQuery("#dialog_new_diagram").dialog("close");
		        });
				getTemplates("uncategorized");
			}
		});
	}else{
		jQuery("#dialog_new_diagram").dialog();
	}
}

/**
 * 新版设计器新建选择分类和模板-选择模板
 * @return {}
 */
function templateSelected(source){
	var selected = jQuery(".template_selected");
	if(selected.length <= 0){
		return;
	}
	var currentTag = jQuery("#template-category-select li.current");
	var category = currentTag.attr("category");
	var templateId = selected.attr("define");
	if(!templateId){
		templateId = "";
	}
	jQuery("#dialog_new_diagram").dialog("close");
	var url = "/diagraming/new?template=" + templateId + "&category=" + category;
	if(category == "my_template"){
		url = "/diagrams/new_from_template?chartId=" + templateId;
	}
	if(source == "template"){
		url = "/diagraming/new?template=" + templateId + "&category=" + category + "&istemplate=true";
	}
	if(globalNewTeamId){
		url += "&team=" + globalNewTeamId;
	}
	if(globalNewFolderId){
		url += "&folder=" + globalNewFolderId;
	}
	window.location.href = url;
}
