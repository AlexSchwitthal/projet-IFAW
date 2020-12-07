$(document).ready(function() {
    changeBoard($('#listBoards').val());

    // ajout d'une note
    $("#addNote").click(function() {
        $.ajax({
            type : "PUT",
            url : "addNote",
            contentType: "application/json; charset=utf-8",
            success : function(newNote) {
                $(".notes > ul").append(noteElement(newNote._id, newNote.text));
              //  $(".notes > ul").append('<li><p contentEditable="true" id=' + newNote._id +'>' + newNote.text + '</p><button class="deleteNote"><img width="13" height="13" src ="/img/ColorWheel.png"/></button>' + '<button class="deleteNote">✘</button></li>');
            }
        });
    });

    // sauvegarde d'une note
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

    // suppression d'une note
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

    // ajout d'un tableau
    $("#addBoard").click(function() {
        var boardName = window.prompt("veuillez saisir un nom pour votre nouveau tableau : ","");
        if(boardName != "") {
            var data = {};
            data.boardName = boardName;
            $.ajax({
                type : "PUT",
                url : "addBoard",
                data: JSON.stringify(data),
                contentType: "application/json; charset=utf-8",
                success : function(newBoard) {
                    //$(".notes > ul").append('<li><p contentEditable="true" id=' + newNote._id +'>' + newNote.text + '</p><button class="deleteNote">✘</button></li>');
                },
                error: function () {
                    alert("erreur ! vous disposez déjà d'un tableau avec ce nom !");
                },
            });
        }
    });

    // maxlength d'une note
    $('.notes ul').on('keypress', 'li p', function (event) {
        var cntMaxLength = parseInt($(this).attr('maxlength'));

        if ($(this).text().length === cntMaxLength && event.keyCode != 8) {
            event.preventDefault();
        }
   });

   // changement de tableau
   $('#listBoards').change(function() {
        var boardId = $(this).val();
        changeBoard(boardId);
    });


    // fonction d'une note du tableau
    function noteElement(id, text) {
        var note = '<li><p contentEditable="true" id=' + id + '>' + text 
        + '</p><button class="deleteNote"><img width="13" height="13" src ="/img/ColorWheel.png"/></button>' 
        + '<button class="deleteNote">✘</button></li>';
        return note;
    }

    // fonction de chargement de tableau
    function changeBoard(boardId) {
        var data = {};
        data.boardId = boardId;
        $.ajax({
            type : "POST",
            url : "changeBoard",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            success : function(currentBoard) {
                $(".notes > ul").empty();
                for(let note of currentBoard) {
                    $(".notes > ul").append(noteElement(note._id, note.text));
                }
            },
            error: function () {
                alert("une erreur est survenue lors du changement de tableau");
            },
        });
    }
});


