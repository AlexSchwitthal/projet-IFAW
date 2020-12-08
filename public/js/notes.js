$(document).ready(function() {
    var isTyping = false;
    changeBoard($('#listBoards').val());

     setInterval(function() { 
        if(!isTyping) {
            changeBoard($('#listBoards').val());
        }
    }, 5000);

    // ajout d'une note
    $("#addNote").click(function() {
        var data = {};
        data.boardId = $('#listBoards').val();
        $.ajax({
            type : "PUT",
            url : "addNote",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            success : function(newNote) {
                $(".notes > ul").append(noteElement(newNote._id, newNote.text));
            }
        });
    });

    // deprecated
/*     $('ul').on('focusout', 'li p', (function() {
        var data = {};
        data._id = this.id;
        data.text = $(this).html();
        data.boardId = $('#listBoards').val();
        $.ajax({
            type : "PUT",
            url : "saveNote",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8"
        });
    })); */

    // sauvegarde d'une note dès que l'on arrête d'écrire pendant plus d'1 seconde
     var searchTimeout;
    $('ul').on('keyup', 'li p', (function() {
        isTyping = true;
        var text = $(this).html();
        var id = this.id;
        if (searchTimeout != undefined) clearTimeout(searchTimeout);
        var data = {};
        data._id = id;
        data.text = text;
        data.boardId = $('#listBoards').val();
        $.ajax({
            type : "PUT",
            url : "saveNote",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            error: function () {
                console.log("erreur");
            },
            timeout: 2000
        });
        searchTimeout = setTimeout(function() {
            isTyping = false;
        }, 2000);
    })); 


    // choix de la couleur d'une note
    $('.notes ul').on('click', 'li .chooseColor', (function() {        
        var data = {};
        data._id = this.parentNode.firstElementChild.id;
        data.boardId = $('#listBoards').val();
        var element = this;
        $.ajax({
            type : "PUT",
            url : "chooseColor",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",            
            success : function(result) {
                if (result == "success") {
                    
                    element.parentNode.style.backgroundColor = "#00FF00";
                }
            }
        });
    }));

    // suppression d'une note
    $('.notes ul').on('click', 'li .deleteNote', (function() {        
        var data = {};
        data._id = this.parentNode.firstElementChild.id;
        data.boardId = $('#listBoards').val();
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

    // ajout d'un utilisateur au tableau
    $(".dropdown-menu").on("click", ".outside .dropdown-item", (function() {
        var type = this.parentNode;
        var icon = this.children[1];

        var data = {};
        data._id = this.id;
        data.name = this.firstElementChild.innerHTML;
        data.boardId = $('#listBoards').val();
        $.ajax({
            type : "PUT",
            url : "addUser",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            success : function() {
                type.classList.remove("outside");
                type.classList.add("inside");
                icon.classList.remove("fa-plus");
                icon.classList.add("fa-times");
                icon.style.marginRight = "1px";
            },
        });
    }));

    // suppression d'un utilisateur au tableau
    $(".dropdown-menu").on("click", ".inside .dropdown-item", (function() {
        var type = this.parentNode;
        var icon = this.children[1];
        
        var data = {};
        data._id = this.id;
        data.name = this.firstElementChild.innerHTML;
        data.boardId = $('#listBoards').val();
        $.ajax({
            type : "DELETE",
            url : "removeUser",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            success : function() {
                type.classList.remove("inside");
                type.classList.add("outside");
                icon.classList.remove("fa-times");
                icon.classList.add("fa-plus");
                icon.style.marginRight = "0px";
            },
        });
    }));

    // ajout d'un tableau
    $("#addBoard").click(function() {
        var boardName = window.prompt("veuillez saisir un nom pour votre nouveau tableau : ", "");
        boardName = boardName.split("").join("");
        if(boardName != "") {
            var data = {};
            data.boardName = boardName;
            $.ajax({
                type : "PUT",
                url : "addBoard",
                data: JSON.stringify(data),
                contentType: "application/json; charset=utf-8",
                success : function(newBoard) {
                    // ajout du nouveau tableau à la liste des tableaux;
                    var o = new Option(newBoard.name, newBoard._id);
                    $(o).html(newBoard.name);
                    $("#listBoards").append(o).prop('selected', true);
                    alert("le nouveau tableau a bien été créé !");
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

    // fonction d'une note du tableau
    function noteElement(id, text) {
        var note = '<li><p maxlength="30" contentEditable="true" id=' + id + '>' + text 
        + '</p><button class="chooseColor"><img width="13" height="13" src ="/img/ColorWheel.png"/></button>' 
        + '<button class="deleteNote">✘</button></li>';
        return note;
    }
});


