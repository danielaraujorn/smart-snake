$(document).ready(function() {
  //Canvas stuff
  var canvas = $("#canvas")[0];
  var ctx = canvas.getContext("2d");
  var w = $("#canvas").width();
  var h = $("#canvas").height();

  //Lets save the cell width in a variable for easy control
  var cw = 10;
  var d;
  var food;
  var score;
  var level;
  //Lets create the snake now
  var snake_array; //an array of cells to make up the snake

  function init() {
    d = "right"; //default direction
    create_snake();
    create_food(); //Now we can see the food particle
    //finally lets display the score
    score = 0;
    level = 1;

    //Lets move the snake now using a timer which will trigger the paint function
    //every 60ms
    if (typeof game_loop != "undefined") clearInterval(game_loop);
    game_loop = setInterval(paint, 15);
  }
  init();

  function create_snake() {
    var length = 5; //Length of the snake
    snake_array = []; //Empty array to start with
    for (var i = length - 1; i >= 0; i--) {
      //This will create a horizontal snake starting from the top left
      snake_array.push({ x: i, y: 0 });
    }
  }
  function inside(point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    var inside = false;
    for (var i = 1, j = vs.length - 1; i < vs.length; j = i++) {
      var intersect =
        vs[i].y > point.y != vs[j].y > point.y &&
        point.x <
          (vs[j].x - vs[i].x) * (point.y - vs[i].y) / (vs[j].y - vs[i].y) +
            vs[i].x;
      if (intersect) inside = !inside;
    }

    return inside;
  }
  //Lets create the food now
  function create_food() {
    food = {
      x: Math.round(Math.random() * (w - cw) / cw),
      y: Math.round(Math.random() * (h - cw) / cw)
    };
    //This will create a cell with x/y between 0-44
    //Because there are 45(450/10) positions accross the rows and columns
  }
  function decisaoFinal(nx, ny, last) {
    if (
      (last !== "up",
      checkColision(nx - 1, ny, snake_array) &&
        !checkColision(nx, ny - 1, snake_array) &&
        !inside({ x: nx, y: ny - 1 }, snake_array))
    ) {
      d = "up";
    } else if (
      (last !== "right",
      checkColision(nx, ny - 1, snake_array) &&
        !checkColision(nx + 1, ny, snake_array) &&
        !inside({ x: nx + 1, y: ny }, snake_array))
    ) {
      d = "right";
    } else if (
      (last !== "down",
      checkColision(nx + 1, ny, snake_array) &&
        !checkColision(nx, ny + 1, snake_array) &&
        !inside({ x: nx, y: ny + 1 }, snake_array))
    ) {
      d = "down";
    } else if (
      (last !== "left",
      !checkColision(nx - 1, ny, snake_array) &&
        !inside({ x: nx - 1, y: ny }, snake_array))
    ) {
      d = "left";
    }
  }
  function verifyCloserWay(nx, ny, lastHorizontal) {
    if (
      Math.abs(snake_array[0].x - food.x) >= Math.abs(snake_array[0].y - food.y)
    ) {
      if (snake_array[0].x - food.x >= 0) {
        if (
          !checkColision(nx - 1, ny, snake_array) &&
          !inside({ x: nx - 1, y: ny }, snake_array)
        )
          d = "left";
        else decisaoFinal(nx, ny, "left");
      } else {
        if (
          !checkColision(nx + 1, ny, snake_array) &&
          !inside({ x: nx + 1, y: ny }, snake_array)
        )
          d = "right";
        else decisaoFinal(nx, ny, "right");
      }
    } else {
      if (snake_array[0].y - food.y >= 0) {
        if (
          !checkColision(nx, ny - 1, snake_array) &&
          !inside({ x: nx, y: ny - 1 }, snake_array)
        )
          d = "up";
        else decisaoFinal(nx, ny, "up");
      } else {
        if (
          !checkColision(nx, ny + 1, snake_array) &&
          !inside({ x: nx, y: ny + 1 }, snake_array)
        )
          d = "down";
        else decisaoFinal(nx, ny, "down");
      }
    }
  }
  //Lets paint the snake now
  function paint() {
    //To avoid the snake trail we need to paint the BG on every frame
    //Lets paint the canvas now
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "black";
    ctx.strokeRect(0, 0, w, h);

    //The movement code for the snake to come here.
    //The logic is simple
    //Pop out the tail cell and place it infront of the head cell
    var nx = snake_array[0].x;
    var ny = snake_array[0].y;

    verifyCloserWay(nx, ny);
    //These were the position of the head cell.
    //We will increment it to get the new head position
    //Lets add proper direction based movement now
    if (d == "right") nx++;
    else if (d == "left") nx--;
    else if (d == "up") ny--;
    else if (d == "down") ny++;

    //Lets add the game over clauses now
    //This will restart the game if the snake hits the wall
    //Lets add the code for body collision
    //Now if the head of the snake bumps into its body, the game will restart
    if (checkColision(nx, ny, snake_array)) {
      console.log("ta dentro?", inside({ x: nx, y: ny }, snake_array));
      init();
      //Lets organize the code a bit now.
      return;
    }

    //Lets write the code to make the snake eat the food
    //The logic is simple
    //If the new head position matches with that of the food,
    //Create a new head instead of moving the tail
    if (nx == food.x && ny == food.y) {
      var tail = { x: nx, y: ny };
      score++;

      //Create new food
      create_food();
    } else {
      var tail = snake_array.pop(); //pops out the last cell
      tail.x = nx;
      tail.y = ny;
    }
    //The snake can now eat the food.

    snake_array.unshift(tail); //puts back the tail as the first cell

    for (var i = 0; i < snake_array.length; i++) {
      var c = snake_array[i];
      //Lets paint 10px wide cells
      paint_cell(c.x, c.y, "blue");
    }

    //Lets paint the food
    paint_cell(food.x, food.y, "red");
    //Lets paint the score
    var score_text = "Score: " + score;
    var level_text = "Level: " + level;
    ctx.fillText(score_text, 5, h - 5);
    ctx.fillText(level_text, 60, h - 5);
  }

  function checkColisionWall(x, y, array) {
    //This function will check if the provided x/y coordinates exist
    //in an array of cells or not
    if (x == -1 || x == w / cw || y == -1 || y == h / cw) {
      return true;
    } else return false;
  }
  function checkColision(x, y, array) {
    //This function will check if the provided x/y coordinates exist
    //in an array of cells or not
    if (
      x == -1 ||
      x == w / cw ||
      y == -1 ||
      y == h / cw ||
      check_collision(x, y, snake_array)
    ) {
      return true;
    } else return false;
  }
  //Lets first create a generic function to paint cells
  function paint_cell(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * cw, y * cw, cw, cw);
    ctx.strokeStyle = "white";
    ctx.strokeRect(x * cw, y * cw, cw, cw);
  }

  function check_collision(x, y, array) {
    //This function will check if the provided x/y coordinates exist
    //in an array of cells or not
    for (var i = 0; i < array.length; i++) {
      if (array[i].x == x && array[i].y == y) return true;
    }
    return false;
  }

  //Lets add the keyboard controls now
  $(document).keydown(function(e) {
    var key = e.which;
    //We will add another clause to prevent reverse gear
    if (key == "37" && d != "right") d = "left";
    else if (key == "38" && d != "down") d = "up";
    else if (key == "39" && d != "left") d = "right";
    else if (key == "40" && d != "up") d = "down";
    //The snake is now keyboard controllable
  });
});
