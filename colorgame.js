var colors = newColor(9);
var pickedColor = pickColor(9);
var squares = document.querySelectorAll(".square");
var resultDisplay = document.getElementById("result");
var reset = document.getElementById("reset");
var easyMode = document.getElementById("easymode");
var hardMode = document.getElementById("hardmode");
var headerColor = document.querySelector("#header");
var pickedColorDisplay = document.getElementById("rgbColor");

easyMode.addEventListener("click", function(){
	hardMode.classList.remove("selected");
	easyMode.classList.add("selected");
	resetGame(3);
});

hardMode.addEventListener("click", function(){
	easyMode.classList.remove("selected");
	hardMode.classList.add("selected");
	resetGame(9);
});


pickedColorDisplay.textContent = pickedColor;

reset.addEventListener("click",function(){
	resetGame(9);
});

mainGame(9);




function resetGame(num){
	colors = newColor(num);
	pickedColor = pickColor(num);
	pickedColorDisplay.textContent = pickedColor;
	headerColor.style.backgroundColor = "steelblue";
	resultDisplay.textContent = "";
	reset.textContent = "New Colors";
	mainGame(num);
}

//
//color picking logic

function pickColor(num){
	return colors[Math.floor(Math.random()*(num))];
};


function newColor(num){
	var arr = [];

	for(var i = 0; i < num; i++){
		arr.push(randomColors());
	};
	return arr;
};

function changeColors(color, num){
	for(var i = 0; i < colors.length; i++){
				squares[i].style.backgroundColor = color;
			};
	headerColor.style.backgroundColor = color;
			
};


function randomColors(){
	r = Math.floor(Math.random() * (255+1)+0);
	g = Math.floor(Math.random() * (255+1)+0);
	b = Math.floor(Math.random() * (255+1)+0);
	return 'rgb(' + r + ', ' + g + ', ' + b + ')';

};



//main logic of game

function mainGame(num){
	for(var i = 0; i < squares.length; i++){
	squares[i].style.backgroundColor = "#232323";
	};
	for(var i = 0; i < colors.length; i++){
	squares[i].style.backgroundColor = colors[i];
	//add click listeners
	squares[i].addEventListener("click",function(){
		var clickedColor = this.style.backgroundColor;
		if (clickedColor === pickedColor){
			resultDisplay.textContent = "Correct!";
			changeColors(clickedColor, num);
			reset.textContent = "Play Again?";
		} else {
			resultDisplay.textContent = "Try Again";
			this.style.backgroundColor = "#232323";
		}
	});
};
};

