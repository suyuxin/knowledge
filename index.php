<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Knowledge</title>
</head>
<body>
<?php
if(!file_exists("data/")){
    mkdir("data/");
}
if(!empty($_POST)) {
    $title = $_POST['title'];
    $content = $_POST['content'];
    $file_handle = fopen("data/{$title}", "w+");
    if(fwrite($file_handle, $content) == FALSE) {
        echo "Cannot write to file {$title}";
    }
    fclose($file_handle);
}
?>
<link href="css/global.css" rel="stylesheet">
<link href="css/designer.css" rel="stylesheet">
<link type="text/css" rel="stylesheet" href="css/ui.css">

<script type="text/javascript" src="js/plugins/jquery.js"></script>
<script src="js/plugins/bootstrap.min.js"></script>
<!--mathjax -->
<script type="text/x-mathjax-config">
	MathJax.Hub.Config({
    	extensions: ["tex2jax.js"],
    	jax: ["input/TeX","output/HTML-CSS"],
    	tex2jax: {inlineMath: [["$","$"],["\\(","\\)"]]}
  	});
</script>
<script type="text/javascript" src="http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML">
</script>
<!--graph -->
<script src="js/util.js" type="text/javascript" charset="UTF-8"></script>
<script src="js/schema.js" type="text/javascript" charset="UTF-8"></script>
<script type="text/javascript" charset="UTF-8" src="js/standard.js"></script>

<script type="text/javascript">
var definition = {
    "page":{
        "showGrid":true,
        "padding":0,
        "gridSize":15,
        "width":1500,
        "height":1500,
        "backgroundColor":"255,255,255"
    },
    <?php
        $content = "{}";
        $title = "empty";
        if(!empty($_GET)) {
            $title = $_GET['title'];
            $file_name = "data/{$title}";
            if(file_exists($file_name)){
                $file_handle = fopen($file_name, "r+");
                $content = fread($file_handle, filesize($file_name));
            }
        }
    ?>
    "elements": <?php echo $content; ?>,
    "title" : "<?php echo $title; ?>"
};
var role = "owner";
var userId = "529ebc4d0cf20042951b2f49";
var userName = "Su Yuxin";
var time = "1386142082157";
</script>
<script type="text/javascript" charset="UTF-8" src="js/designer_core.js"></script>
<!-- <script type="text/javascript" charset="UTF-8" src="js/tikz.js"></script> -->
<script type="text/javascript" charset="UTF-8" src="js/designer_ui.js"></script>
<script type="text/javascript" charset="UTF-8" src="js/designer_event.js"></script>
<script type="text/javascript" charset="UTF-8" src="js/designer_function.js"></script>
<!-- content -->
<canvas id="support_canvas" style="display: none;"></canvas>
<script type="text/javascript">
if(!document.getElementById("support_canvas").getContext){
	window.location.href = "/diagraming/not_support";
}
</script>
<div id="designer_header">
	<div class="row row1">
		<div id="title_container">
			<button class="btn" id="save">Save</button>
			<span class="diagram_title">Type title here</span>
		</div>
	</div>
</div>
<div id="designer">
	<div style="overflow: scroll;" id="side_bar">
        <?php
            foreach(new DirectoryIterator("data") as $fileinfo) {
                if($fileinfo->isDot()) continue;
                $file_name = $fileinfo->getFilename();
        ?>
                <h4 class="panel_title"><div class="ico ico_accordion"></div><a href="index.php?title=<?php echo $file_name;?>"><?php echo $file_name;?></a></h4>
        <?php
            }
        ?>
	</div>
	
	<div id="designer_viewport">
			<div style="width: 1050px; height: 1500px; padding: 100px; cursor: default;" id="canvas_container">
				<div style="background-color: rgb(242, 242, 242);" id="designer_canvas">
					<canvas height="1500" width="1050" id="designer_grids"></canvas>
					<ul id="designer_contextmenu" class="menu list options_menu">
						<li ac="cut"><div class="ico cut"></div>Cut<div class="extend">Ctrl+X</div></li>
						<li ac="copy"><div class="ico copy"></div>Copy<div class="extend">Ctrl+C</div></li>
						<li ac="paste"><div class="ico paste"></div>Paste<div class="extend">Ctrl+V</div></li>
						<li ac="duplicate">Duplicate<div class="extend">Ctrl+D</div></li>
						<li class="devider devi_clip"></li>
						<li ac="front"><div class="ico ico_front"></div>Bring To Front<div class="extend">Ctrl+]</div></li>
						<li ac="back"><div class="ico ico_back"></div>Send To Back<div class="extend">Ctrl+[</div></li>
						<li ac="lock"><div class="ico ico_lock"></div>Lock<div class="extend">Ctrl+L</div></li>
						<li ac="unlock"><div class="ico ico_unlock"></div>Unlock<div class="extend">Ctrl+Shift+L</div></li>
						<li ac="group">Group<div class="extend">Ctrl+G</div></li>
						<li ac="ungroup">Ungroup<div class="extend">Ctrl+Shift+G</div></li>
						<li id="ctxmenu_align">
							Align Shapes<div class="extend ex_arrow">►</div>
							<ul class="menu list extend_menu">
								<li ac="align_shape" al="left">Left</li>
								<li ac="align_shape" al="center">Center</li>
								<li ac="align_shape" al="right">Right</li>
								<li class="devider"></li>
								<li ac="align_shape" al="top">Top</li>
								<li ac="align_shape" al="middle">Middle</li>
								<li ac="align_shape" al="bottom">Bottom</li>
							</ul>
						</li>
						<li class="devider devi_shape"></li>
						<li ac="edit"><div class="ico edittext"></div>Edit Text<div class="extend">Space</div></li>
						<li ac="delete"><div class="ico remove"></div>Delete<div class="extend">Delete/Backspace</div></li>
						<li class="devider devi_del"></li>
						<li ac="drawshape">Draw Shap<div class="extend">S</div></li>
						<li ac="selectall">Select All<div class="extend">Ctrl+A</div></li>
						<li class="devider devi_selectall"></li>
						<li ac="drawline"><div class="ico linkertype_normal"></div>Draw Line<div class="extend">L</div></li>
						<li ac="changelink"><div class="ico ico_link"></div>Add Note Link</li>
					</ul>
				</div>
			</div>
			<div id="shape_img_container"></div>
			<div id="layout_block"></div>
		<div id="shape_thumb" class="menu"><canvas width="160px"></canvas><div></div></div>
	</div>
	<div style="height: 535px;" id="shape_panel" class="layout">
	</div>
</div>

<div id="ui_container">
	<div id="color_picker" class="menu color_picker" style="display: none;">
		<div class="color_items"><div style="background-color:rgb(255,255,255);"></div><div style="background-color:rgb(229,229,229);"></div><div style="background-color:rgb(207,207,207);"></div><div style="background-color:rgb(184,184,184);"></div><div style="background-color:rgb(161,161,161);"></div><div style="background-color:rgb(138,138,138);"></div><div style="background-color:rgb(115,115,115);"></div><div style="background-color:rgb(92,92,92);"></div><div style="background-color:rgb(69,69,69);"></div><div style="background-color:rgb(50,50,50);"></div><div style="background-color:rgb(23,23,23);"></div><div style="background-color:rgb(0,0,0);"></div><div class="clear"></div></div>
		<div class="color_items"><div style="background-color:rgb(255,204,204);"></div><div style="background-color:rgb(255,230,204);"></div><div style="background-color:rgb(255,255,204);"></div><div style="background-color:rgb(230,255,204);"></div><div style="background-color:rgb(204,255,204);"></div><div style="background-color:rgb(204,255,230);"></div><div style="background-color:rgb(204,255,255);"></div><div style="background-color:rgb(204,229,255);"></div><div style="background-color:rgb(204,204,255);"></div><div style="background-color:rgb(229,204,255);"></div><div style="background-color:rgb(255,204,255);"></div><div style="background-color:rgb(255,204,230);"></div><div style="background-color:rgb(255,153,153);"></div><div style="background-color:rgb(255,204,153);"></div><div style="background-color:rgb(255,255,153);"></div><div style="background-color:rgb(204,255,153);"></div><div style="background-color:rgb(153,255,153);"></div><div style="background-color:rgb(153,255,204);"></div><div style="background-color:rgb(153,255,255);"></div><div style="background-color:rgb(153,204,255);"></div><div style="background-color:rgb(153,153,255);"></div><div style="background-color:rgb(204,153,255);"></div><div style="background-color:rgb(255,153,255);"></div><div style="background-color:rgb(255,153,204);"></div><div style="background-color:rgb(255,102,102);"></div><div style="background-color:rgb(255,179,102);"></div><div style="background-color:rgb(255,255,102);"></div><div style="background-color:rgb(179,255,102);"></div><div style="background-color:rgb(102,255,102);"></div><div style="background-color:rgb(102,255,179);"></div><div style="background-color:rgb(102,255,255);"></div><div style="background-color:rgb(102,178,255);"></div><div style="background-color:rgb(102,102,255);"></div><div style="background-color:rgb(178,102,255);"></div><div style="background-color:rgb(255,102,255);"></div><div style="background-color:rgb(255,102,179);"></div><div style="background-color:rgb(255,51,51);"></div><div style="background-color:rgb(255,153,51);"></div><div style="background-color:rgb(255,255,51);"></div><div style="background-color:rgb(153,255,51);"></div><div style="background-color:rgb(51,255,51);"></div><div style="background-color:rgb(51,255,153);"></div><div style="background-color:rgb(51,255,255);"></div><div style="background-color:rgb(51,153,255);"></div><div style="background-color:rgb(51,51,255);"></div><div style="background-color:rgb(153,51,255);"></div><div style="background-color:rgb(255,51,255);"></div><div style="background-color:rgb(255,51,153);"></div><div style="background-color:rgb(255,0,0);"></div><div style="background-color:rgb(255,128,0);"></div><div style="background-color:rgb(255,255,0);"></div><div style="background-color:rgb(128,255,0);"></div><div style="background-color:rgb(0,255,0);"></div><div style="background-color:rgb(0,255,128);"></div><div style="background-color:rgb(0,255,255);"></div><div style="background-color:rgb(0,127,255);"></div><div style="background-color:rgb(0,0,255);"></div><div style="background-color:rgb(127,0,255);"></div><div style="background-color:rgb(255,0,255);"></div><div style="background-color:rgb(255,0,128);"></div><div style="background-color:rgb(204,0,0);"></div><div style="background-color:rgb(204,102,0);"></div><div style="background-color:rgb(204,204,0);"></div><div style="background-color:rgb(102,204,0);"></div><div style="background-color:rgb(0,204,0);"></div><div style="background-color:rgb(0,204,102);"></div><div style="background-color:rgb(0,204,204);"></div><div style="background-color:rgb(0,102,204);"></div><div style="background-color:rgb(0,0,204);"></div><div style="background-color:rgb(102,0,204);"></div><div style="background-color:rgb(204,0,204);"></div><div style="background-color:rgb(204,0,102);"></div><div style="background-color:rgb(153,0,0);"></div><div style="background-color:rgb(153,76,0);"></div><div style="background-color:rgb(153,153,0);"></div><div style="background-color:rgb(77,153,0);"></div><div style="background-color:rgb(0,153,0);"></div><div style="background-color:rgb(0,153,77);"></div><div style="background-color:rgb(0,153,153);"></div><div style="background-color:rgb(0,76,153);"></div><div style="background-color:rgb(0,0,153);"></div><div style="background-color:rgb(76,0,153);"></div><div style="background-color:rgb(153,0,153);"></div><div style="background-color:rgb(153,0,77);"></div><div style="background-color:rgb(102,0,0);"></div><div style="background-color:rgb(102,51,0);"></div><div style="background-color:rgb(102,102,0);"></div><div style="background-color:rgb(51,102,0);"></div><div style="background-color:rgb(0,102,0);"></div><div style="background-color:rgb(0,102,51);"></div><div style="background-color:rgb(0,102,102);"></div><div style="background-color:rgb(0,51,102);"></div><div style="background-color:rgb(0,0,102);"></div><div style="background-color:rgb(51,0,102);"></div><div style="background-color:rgb(102,0,102);"></div><div style="background-color:rgb(102,0,51);"></div><div style="background-color:rgb(51,0,0);"></div><div style="background-color:rgb(51,26,0);"></div><div style="background-color:rgb(51,51,0);"></div><div style="background-color:rgb(26,51,0);"></div><div style="background-color:rgb(0,51,0);"></div><div style="background-color:rgb(0,51,26);"></div><div style="background-color:rgb(0,51,51);"></div><div style="background-color:rgb(0,25,51);"></div><div style="background-color:rgb(0,0,51);"></div><div style="background-color:rgb(25,0,51);"></div><div style="background-color:rgb(51,0,51);"></div><div style="background-color:rgb(51,0,26);"></div><div class="clear"></div></div>
	</div>
	
	<div id="hotkey_list" class="dialog">
		<div class="dialog_header">Hotkey Reference</div>
		<div class="dialog_content">
			<div class="hotkey_content">
				<span class="hotkey_line hotkey_group">General </span>
				<span class="hotkey_line">
					<span class="hotkey">Alt</span><span class="hotkey_desc">Hold down alt, click and drag to pan around the page </span>
				</span>
				<span class="hotkey_line">
					<span class="hotkey">Ctrl</span><span class="hotkey_desc">Hold down ctrl, click on an shape to add or remove it from the selection </span>
				</span>
				<span class="hotkey_line">
					<span class="hotkey">Ctrl + &lt; , Ctrl + &gt;</span><span class="hotkey_desc">Zoom in or out </span>
				</span>
				<span class="hotkey_line">
					<span class="hotkey">Ctrl + A</span><span class="hotkey_desc">Select all </span>
				</span>
				<span class="hotkey_line">
					<span class="hotkey">Esc</span><span class="hotkey_desc">Unselect all and cancel current operation </span>
				</span>
				<span class="hotkey_line">
					<span class="hotkey">T</span><span class="hotkey_desc">Insert text </span>
				</span>
				<span class="hotkey_line">
					<span class="hotkey">I</span><span class="hotkey_desc">Insert an image </span>
				</span>
				<span class="hotkey_line">
					<span class="hotkey">L</span><span class="hotkey_desc">Draw line </span>
				</span>
				<span class="hotkey_line null_line">&nbsp;</span>
				<span class="hotkey_line hotkey_group">With Selected Shapes </span>
				<span class="hotkey_line">
					<span class="hotkey">Arrow Keys (←↑↓→) </span><span class="hotkey_desc">Move selected shapes left, up, down or right </span>
				</span>
				<span class="hotkey_line">
					<span class="hotkey">Ctrl + Arrow Keys (←↑↓→) </span><span class="hotkey_desc">Move selected shapes one pixel at a time </span>
				</span>
				<span class="hotkey_line">
					<span class="hotkey">Ctrl + Resize </span><span class="hotkey_desc">Resize shapes and constrain proportions </span>
				</span>
				<span class="hotkey_line">&nbsp;</span>
				<span class="hotkey_line">
					<span class="hotkey">Ctrl + Z</span><span class="hotkey_desc">Undo </span>
				</span>
				<span class="hotkey_line">
					<span class="hotkey">Ctrl + Y</span><span class="hotkey_desc">Redo </span>
				</span>
				<span class="hotkey_line">&nbsp;</span>
				<span class="hotkey_line">
					<span class="hotkey">Ctrl + X</span><span class="hotkey_desc">Cut </span>
				</span>
				<span class="hotkey_line">
					<span class="hotkey">Ctrl + C</span><span class="hotkey_desc">Copy </span>
				</span>
				<span class="hotkey_line">
					<span class="hotkey">Ctrl + V</span><span class="hotkey_desc">Paste </span>
				</span>
				<span class="hotkey_line">
					<span class="hotkey">Ctrl + D</span><span class="hotkey_desc">Duplicate </span>
				</span>
				<span class="hotkey_line">
					<span class="hotkey">Ctrl + Shift + B</span><span class="hotkey_desc">Brush </span>
				</span>
				<span class="hotkey_line">
					<span class="hotkey">Delete, Backspace</span><span class="hotkey_desc">Delete selection </span>
				</span>
				<span class="hotkey_line">&nbsp;</span>
				<span class="hotkey_line">
					<span class="hotkey">Ctrl + ]</span><span class="hotkey_desc">Bring selected items to front layer </span>
				</span>
				<span class="hotkey_line">
					<span class="hotkey">Ctrl + [</span><span class="hotkey_desc">Send selected items to back layer </span>
				</span>
				<span class="hotkey_line">
					<span class="hotkey">Ctrl + Shift + ]</span><span class="hotkey_desc">Bring selected items forward one layer </span>
				</span>
				<span class="hotkey_line">
					<span class="hotkey">Ctrl + Shift + [</span><span class="hotkey_desc">Send selected items backward one layer </span>
				</span>
				<span class="hotkey_line">&nbsp;</span>
				<span class="hotkey_line">
					<span class="hotkey">Ctrl + L</span><span class="hotkey_desc">Lock selection </span>
				</span>
				<span class="hotkey_line">
					<span class="hotkey">Ctrl + Shift + L</span><span class="hotkey_desc">Unlock selection </span>
				</span>
				<span class="hotkey_line">&nbsp;</span>
				<span class="hotkey_line">
					<span class="hotkey">Ctrl + G</span><span class="hotkey_desc">Group selection </span>
				</span>
				<span class="hotkey_line">
					<span class="hotkey">Ctrl + Shift + G</span><span class="hotkey_desc">Ungroup selection </span>
				</span>
				<span class="hotkey_line null_line">&nbsp;</span>
				<span class="hotkey_line hotkey_group">Edit Text </span>
				<span class="hotkey_line">
					<span class="hotkey">Space </span><span class="hotkey_desc">Edit Text </span>
				</span>
				<span class="hotkey_line">
					<span class="hotkey">Ctrl + B</span><span class="hotkey_desc">Bold </span>
				</span>
				<span class="hotkey_line">
					<span class="hotkey">Ctrl + I</span><span class="hotkey_desc">Italic </span>
				</span>
				<span class="hotkey_line">
					<span class="hotkey">Ctrl + U</span><span class="hotkey_desc">Underline </span>
				</span>
				<span class="hotkey_line">
					<span class="hotkey">Ctrl + Enter</span><span class="hotkey_desc">Save text editing </span>
				</span>
			</div>
		</div>
		<div class="designer_button normal hotkey_ok" onclick="$('#hotkey_list').dlg('close')">OK </div>
	</div>
	
	<div id="link_dialog" class="dialog" style="min-width: 500px;">
		<div class="dialog_header">Insert Link</div>
		<div class="dialog_content" style="padding: 30px 20px; text-align: center;">
			<b>Input the link of note:&nbsp;</b><input id="linkto_addr" class="input_text" style="width: 350px;" type="text">
		</div>
		<div class="dialog_buttons">
			<div class="designer_button" onclick="UI.setLink()">OK</div>&nbsp;
			<div class="designer_button normal" onclick="$('#link_dialog').dlg('close');">Cancel</div>
		</div>
	</div>
	
	<div id="saveas_dialog" class="dialog" style="min-width: 450px;">
		<div class="dialog_header">Save As...</div>
		<div class="dialog_content" style="padding: 30px 20px; text-align: center;">
			<form id="saveas_form" action="/diagraming/saveas" method="post">
			<input id="hid_saveas_id" name="id" type="hidden">
			<b>Title:&nbsp;</b><input name="title" id="saveas_title" class="input_text" style="width: 300px;" onkeydown="if(event.keyCode == 13) return false;" type="text">
			</form>
		</div>
		<div class="dialog_buttons">
			<div class="designer_button" onclick="UI.doSaveAs()" id="btn_dosaveas">OK</div>&nbsp;
			<div class="designer_button normal" onclick="$('#saveas_dialog').dlg('close');">Cancel</div>
		</div>
	</div>
	
	<div id="export_dialog" class="dialog" style="min-width: 450px;">
		<div class="dialog_header">Download Format</div>
		<div class="dialog_content">
			<form id="export_form" action="/diagram_export" method="post">
				<ul class="export-list">
					<li class="first">
						<input id="export_png" name="type" value="image" checked="checked" style="float: left;margin-right: 5px;" type="radio">
						<label for="export_png" class="export-menu" style="float:left;line-height: 18px;">
							Image File<span class="suffix"> (*.png)</span>
							<span class="export_des">Image file of this diagram</span>
						</label>
						<div style="clear: both;"></div>
					</li>
					<li class="first">
						<input id="export_pdf" name="type" value="pdf" style="float: left;margin-right: 5px;" type="radio">
						<label for="export_pdf" class="export-menu" style="float:left;line-height: 18px;">
							PDF File<span class="suffix"> (*.pdf)</span>
							<span class="export_des">PDF file generated by diagram image</span>
						</label>
						<div style="clear: both;"></div>
					</li>
					<li class="first">
						<input id="export_pos" name="type" value="pos" style="float: left;margin-right: 5px;" type="radio">
						<label for="export_pos" class="export-menu" style="float:left;line-height: 18px;">
							POS File<span class="suffix"> (*.pos)</span>
							<span class="export_des">With image and diagram structure definition</span>
						</label>
						<div style="clear: both;"></div>
					</li>
				</ul>
				<input id="export_definition" name="definition" type="hidden">
				<input id="export_title" name="title" type="hidden">
				<input name="chartId" value="52a2d0dd0cf231dc109a9a75" type="hidden">
				<input name="ignore" value="definition" type="hidden">
			</form>
		</div>
		<div class="dialog_buttons">
			<div class="designer_button" onclick="UI.doExport()">OK</div>&nbsp;
			<div class="designer_button normal" onclick="$('#export_dialog').dlg('close');">Cancel</div>
		</div>
	</div>

	<div id="image_dialog" class="dialog">
		<div class="dialog_header">Select Image</div>
		<div class="dialog_content" style="padding: 0px;">
			<ul class="image_sources">
				<li ty="upload" class="active">My Images</li>
				<li ty="url">By URL</li>
				<li ty="search">Search Image</li>
			</ul>
			<div class="image_content">
				<div id="image_select_upload" class="image_list">
					<form id="frm_upload_image" action="/user_image/upload" method="post" enctype="multipart/form-data">
						<div id="btn_img_upload" class="toolbar_button active">
							<div class="ico"></div>Upload an Image
							<input id="input_upload_image" name="image" type="file">
						</div>
						<span id="upload_img_res"></span>
						<div style="clear: both;"></div>
					</form>
					<div id="user_image_items" class="image_items"></div>
				</div>
				<div id="image_select_url" class="image_list" style="display: none">
					Paste an image URL here:&nbsp;<input id="input_img_url" class="input_text" style="width: 380px;" type="text">
					<div id="img_url_area"></div>
				</div>
				<div id="image_select_search" class="image_list" style="display: none">
					<input id="input_img_search" class="input_text" style="width: 380px;" type="text">
					<div id="btn_img_search" class="toolbar_button active" style="display: inline-block;width: 70px;">Search</div>
					<div style="padding: 15px 0px 0px;">Type your search in the box above to find images using Google Search.</div>
					<div id="google_image_items" class="image_items"></div>
				</div>
				<div class="image_btns">
					<div id="set_image_submit" class="designer_button">OK</div>
					<div id="set_image_cancel" class="designer_button normal">Cancel</div>
					<span id="set_image_text"></span>
				</div>
			</div>
			<div style="clear: both;"></div>
		</div>
	</div>
	
</div>

<div style="left: 513.5px; top: 102px; display: none;" id="hover_tip"><div class="tip_arrow"></div><div class="tip_content radius3">Line dash</div></div></body></html>
