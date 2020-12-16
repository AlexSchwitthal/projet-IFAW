$(document).ready(function() {
	var isTyping = false;
	var draggableOption = {
        start: function( event, ui ) {
            isTyping = true;
        },
        stop: function( event, ui ) {
            isTyping = false;
            var id = this.querySelector("p").getAttribute("id");
            if (searchTimeout != undefined) clearTimeout(searchTimeout);
            var data = {};
            data._id = id;
            data.x = ui.position.left;
            data.y = ui.position.top;
            data.boardId = $('#listBoards').val();
            $.ajax({
                type : "PUT",
                url : "editNotePosition",
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
        },
    };
	var canShareBoard = false;
	var modal = document.getElementById("modal1"); 
	var filter = "";
	var spanCloseModal = document.getElementById("closeModal");
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
		data.color = "#f6ff7a";
        $.ajax({
            type : "PUT",
            url : "addNote",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            success : function(newNote) {
                var $noteElt = $(noteElement(newNote._id, newNote.text, newNote.color));
                $(".notes > ul").append($noteElt);
                /*$noteElt.css("top", "10px");
				$noteElt.css("left", "10px");*/
				$noteElt.css("left", "0px");
				$noteElt.css("top", "0px");
                $noteElt.draggable(draggableOption).click(function() {
                    $(this).draggable( {disabled: false, containment: [ 100, 100, 500, 500 ]});
                }).dblclick(function() {
                    $(this).draggable({ disabled: true });
                });
				//$noteElt.draggable();
				var data = {};
				data._id = newNote._id;
				data.x = 0;
				data.y = 0;
				data.boardId = $('#listBoards').val();
				$.ajax({
					type : "PUT",
					url : "editNotePosition",
					data: JSON.stringify(data),
					contentType: "application/json; charset=utf-8",
					error: function () {
						console.log("erreur");
					},
					timeout: 2000
				});
            }
        });
    });

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

	function colorFilter(){		
		console.log("filter " + filter);
		$("#notesBoard").children().each(function() {
			if (filter === "") {
				this.style.display = "block";
			}
			else {
				console.log(this.style.backgroundColor);
				this.style.display = "none";
				if(filter.includes("green") && this.style.backgroundColor === "rgb(134, 247, 137)") {					
					this.style.display = "block";
				}
				else if (filter.includes("yellow") && this.style.backgroundColor === "rgb(246, 255, 122)") {
					this.style.display = "block";
				} 
				else if (filter.includes("blue") && this.style.backgroundColor === "rgb(107, 188, 242)") {
					this.style.display = "block";
				}
				else if (filter.includes("orange") && this.style.backgroundColor === "rgb(245, 175, 91)") {
					this.style.display = "block";
				}
				else if (filter.includes("red") && this.style.backgroundColor === "rgb(242, 107, 107)") {
					this.style.display = "block";
				}
			}
		}) 		
	}

	$('#filtresList').on('click', 'li', (function() {
		// Clic sur le filtre blanc qui efface tous les filtres enregistrés
		if(this.id == "flitreAll") {
			while(document.getElementsByClassName("activeFilter").length != 0) { 
				let activeFilters = document.getElementsByClassName("activeFilter");
				for (let index = 0; index < activeFilters.length; ++index) {
					activeFilters[index].style.borderStyle = "dotted";
					activeFilters[index].classList.remove("activeFilter");	
				}
			}	
			filter = "";		
		}
		else {
			// Modification de l'icone du filtre
			if(this.classList.contains("activeFilter")) {
				this.classList.remove("activeFilter");
				this.style.borderStyle = "dotted";				
			}
			else {
				this.classList.add("activeFilter");
				this.style.borderStyle = "solid";
			}

			var colorList = ["blue", "green", "yellow", "orange", "red"];

			for(var color of colorList) {
				var elementId = "filtre" + color.charAt(0).toUpperCase() + color.slice(1);
				if(document.getElementById(elementId).classList.contains("activeFilter")) {
					if (!filter.includes(color)){
						filter += color + " ";
					}
				}
				else {
					if(filter.includes(color)) {
						filter = filter.replace(color + " ", "");
					}
				}
			}
		} 
		colorFilter();
	}));

	
	// choix de la couleur d'une note
	$('.notes ul').on('click', 'li .chooseColor', (function() {       
		var _id = this.parentNode.firstElementChild.id;
		var boardId = $('#listBoards').val();
		var element = this;
		modal.style.display = "block";
		let green = document.getElementById("colorGreen");
		let blue = document.getElementById("colorBlue");
		let yellow = document.getElementById("colorYellow");
		let orange = document.getElementById("colorOrange");
		let red = document.getElementById("colorRed");
		window.onclick = function(event) {
			if (event.target == green) {    
				modal.style.display = "none";                        
				element.parentNode.style.backgroundColor = "#86f789";
				changeColor(_id, boardId, "#86f789");                          
			}
			if (event.target == blue) { 
				modal.style.display = "none";                           
				element.parentNode.style.backgroundColor = "#6bbcf2";
				changeColor(_id, boardId, "#6bbcf2");
			}
			if (event.target == yellow) {
				modal.style.display = "none";
				element.parentNode.style.backgroundColor = "#f6ff7a";
				changeColor(_id, boardId, "#f6ff7a");
			}
			if (event.target == orange) {
				modal.style.display = "none";
				element.parentNode.style.backgroundColor = "#f5af5b";
				changeColor(_id, boardId, "#f5af5b");
			}
			if (event.target == red) {
				modal.style.display = "none";
				element.parentNode.style.backgroundColor = "#f26b6b";
				changeColor(_id, boardId, "#f26b6b");
			}     
		}   
	}));


	// Fermeture modal choix couleur
	spanCloseModal.onclick = function() {
		modal.style.display = "none";
	}
	window.onclick = function(event) {
		if (event.target == modal) {
			modal.style.display = "none";
		}
	}

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
	$("body").on("click", ".outside", (function() {
		if(canShareBoard) {
			var type = this;
			var icon = this.firstElementChild.firstElementChild;
			var name = this.firstElementChild.innerHTML;
			name = name.split('<span');
	
			var data = {};
			data._id = this.firstElementChild.id;
			data.name = name[0];
	
			data.boardId = $('#listBoards').val();
			$.ajax({
				type : "PUT",
				url : "addUser",
				data: JSON.stringify(data),
				contentType: "application/json; charset=utf-8",
				success : function() {
					type.classList.remove("outside");
					type.classList.add("inside");
					icon.classList.remove("fa-check");
					icon.classList.add("fa-times");
				},
			});
		}
	}));

	// suppression d'un utilisateur au tableau
	$("body").on("click", ".inside", (function() {
		if(canShareBoard) {
			var type = this;
			var icon = this.firstElementChild.firstElementChild;
			var name = this.firstElementChild.innerHTML;
			name = name.split('<span');

			var data = {};
			data._id = this.firstElementChild.id;
			data.name = name[0];

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
					icon.classList.add("fa-check");
				},
			});
		}
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
			success : function(response) {

				// chargement des nouvelles notes
				$(".notes > ul").empty();
				for(let note of response.board.notes) {
                    // ajout positions x et y
                    var noteElt = $(noteElement(note._id, note.text, note.color, note.x, note.y));
                    $(".notes > ul").append(noteElt);
                    noteElt.draggable(draggableOption).click(function() {
                        $(this).draggable( {disabled: false, containment: [ 100, 100, 500, 500 ]});
                    }).dblclick(function() {
                        $(this).draggable({ disabled: true });
                    });
                    //noteElt.draggable();
                }
				colorFilter();

				// chargement de la liste des utilisateurs
				$("#listUsersModal").empty();
				if(response.currentUser != response.board.creator_name) {
					document.getElementById("share").disabled = true;
					canShareBoard = false;
				}
				else {
					document.getElementById("share").disabled = false;
					canShareBoard = true;
				}

				for(let user of response.users) {
					if(user.login != response.currentUser) {
						if (response.board.users.some(e => e.name === user.login)) {
							$("#listUsersModal").append(userElement(user._id, user.login, "inside"));
						}
						else {
							$("#listUsersModal").append(userElement(user._id, user.login, "outside"));
						}
					}
				}
			},
			error: function () {
				alert("une erreur est survenue lors du changement de tableau");
			},
		});
	}


	// fonction d'une note du tableau
	function noteElement(id, text, color, x, y) {
		var position = x != null ? `;left:${x}px;top:${y}px` : '';
		var note = '<li style="position:absolute; background-color:' +color + position +'"><p onpaste="return false;" maxlength="30" contentEditable="true" id=' + id + '>' + text 
        + '</p><button class="chooseColor" style="background-color:#11ffee00;outline: 0;border-style: none; "><img width="13" height="13" src ="/img/ColorWheel.png"/></button>' 
        + '<button class="deleteNote" style="background-color:#11ffee00;outline: 0;border-style: none; ">✘</button></li>';
		return note;
	}

	function userElement(id, userName, type) {
		var icon = "check";
		if(type == "inside") {
			icon = "times";
		}
		var user =  "<div class=" + type + ">" +
                        "<div id=" + id + ">" + 
                            "<tr><td>" + userName + "</td>" +
                            "<td><span class='fas fa-" + icon + " float-right'></span></td></tr>" +
                        "</div>" +
                	"</div>";
		return user;
	}

	function changeColor(_id, boardId, color) {
		data = {};
		data._id = _id;
		data.boardId = boardId;
		data.color = color;
		$.ajax({
			type : "PUT",
			url : "chooseColor",
			data: JSON.stringify(data),
			contentType: "application/json; charset=utf-8"
		});
	}
    
	$("#searchBar").on({
		keyup : function() {
			var userInput = $(this).val();

			$("#notesBoard").children().each(function() {
				if ($(this).text().search(userInput) == -1) {
					$(this).css("display", "none");
				}
				else {
					$(this).css("display", "block");
				}
			})
		},
		click : function() {
			$(this).val("");
			$("#notesBoard").children().each(function() {
				$(this).css("display", "block");
			})
		}
	});
});


