$(document).ready(function() {
    $("#addNote").click(function() {
        $.ajax({
            type : "PUT",
            url : "addNote",
            contentType: "application/json; charset=utf-8",
            success : function(newNote) {
                $(".notes > ul").append('<li><p contentEditable="true" id=' + newNote._id +'>' + newNote.text + '</p><button class="deleteNote">✘</button></li>');
            }
        });
    });

    $('ul').on('focusout', 'li p', (function() {
        var data = {};
        data._id = this.id;
        data.text = $(this).html();

        $.ajax({
            type : "PUT",
            url : "saveNote",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8"
        });
    }));

    $('.notes ul').on('click', 'li button', (function() {
        var data = {};
        data._id = this.parentNode.firstElementChild.id;
        var element = this;
        $.ajax({
            type : "DELETE",
            url : "deleteNote",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            success : function(result) {
                if (result == "success") {
                    element.parentNode.remove();
                }
            }
        });
    }));
});


