$(document).ready(function() {


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
	// console.log("Data returned from comment form: "+Object.keys(data));
	$('#'+data.postID+' .comment').val('');
	$('#'+data.postID+' .comments').append('<div class="singleComment"><p>'+data.comment+'</p></div>');
}