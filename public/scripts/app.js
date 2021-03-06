var userName;

$(document).ready(function() {

	userName= $("#userName").val();

	$("form").on("click", "button", function(event) {
		event.preventDefault();
		var comment = $(this).parent().parent().find("p textarea.comment").val();
		var postID = $(this).parent().parent().find("input.postID").val();
		postComment(comment, postID, displayData);
	});

	$("input").keypress(function (event) {
		if (event.which == 13) {
			$('button').click();
			return false;
		}
	});

	$("a").on("click", function(event){
		if ($(this).hasClass("disabled")) {
			return false;
		}
	});

});

function postComment(comment, postID, callback) {
	var settings = {
		url: "/comment",
		data: {
			comment: comment,
			postID: postID
		},
		type: 'POST',
		success: callback
	};
	$.ajax(settings);
}

function displayData(data) {
	$('#'+data.postID+' .comment').val('');
	$('#'+data.postID+' .comments').append('<div class="singleComment"><p><a href="/profile/'+data.authorID+'">'+userName+'</a> wrote on '+data.created.toString()+'</p><p>'+data.comment+'</p></div>');
}