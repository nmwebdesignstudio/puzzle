function Game(canvas) {
  this.started = false;
  this.stage = 1;
  this.num_lines = 2;
  this.scale = 1;
  this.alpha = 1;
  this.fade1 = 0;
  this.fade2 = 0;
  this.resized = true;
  console.log('start loading...')
  this.loadAssets();
}

Game.prototype.loadAssets = function() {
  this.canvas = document.getElementById('canvas');
  this.context = this.canvas.getContext('2d');
  this.canvas_bg = document.getElementById('canvas_bg');
  this.context_bg = this.canvas.getContext('2d');
  
  //Canvas size
  document.getElementById('canvas').width = window.innerWidth;
  document.getElementById('canvas').height = window.innerHeight;
  document.getElementById('canvas_bg').width = window.innerWidth;
  document.getElementById('canvas_bg').height = window.innerHeight;
  console.log("canvas: "+window.innerWidth+", "+window.innerHeight)
  //
  
  this.original_width = this.canvas.width;
  this.original_height = this.canvas.height;
  this.font_size = Math.round(this.canvas.width/8);
  this.scaled_width = (this.canvas.width/this.scale)/2;
  this.scaled_height = (this.canvas.height/this.scale)/2;
  console.log('scaled_width: '+this.scaled_width);
  console.log('scaled_height: '+this.scaled_height);

  this.loaded_items = 0;
  this.loaded = false;
  this.interval = null;
  this.maxElapsedTime = 0;
  this.start_time = 0;
  
  var random_image = Math.floor(Math.random() * 12) + 1;
  if(random_image<10)
    random_image = new String("0"+random_image);
  
  this.assets = Array({
      type: "image",
      //src: "img/rainbow500x400.png",
      src: "img/puzzles/"+random_image+".png",
      slug: "img"
    },{
      type: "audio",
      src: "audio/final/drip",
      slug: "drip"
    },{
      type: "audio",
      src: "audio/final/twang2",
      slug: "twang"
    },{
      type: "audio",
      src: "audio/final/Pictures-Sleep_on_soft_sheets",
      slug: "bgm"
    },{
      type: "audio",
      src: "audio/final/chimes",
      slug: "chimes"
    }
  );
  
  this.items_to_load = this.assets.length;
  loadAssets(this, this.assets);
  
  this.w_rate = this.canvas.width / this.img.width;
  this.h_rate = this.canvas.height / this.img.height;
  this.w_scale = 1;
  this.h_scale = 1;
  
  console.log(this.loaded_items+' assets loaded');
}

Game.prototype.apply_scale = function(){
  document.getElementById('canvas').width = window.innerWidth;
  document.getElementById('canvas').height = window.innerHeight;
  document.getElementById('canvas_bg').width = window.innerWidth;
  document.getElementById('canvas_bg').height = window.innerHeight;
  
  var rw = document.getElementById('canvas').width / this.original_width;
  var rh = document.getElementById('canvas').height / this.original_height;
  this.scale = Math.min(rw,rh);
  
  /*
  console.log("window: " + window.innerWidth + ", " + window.innerHeight + " | img: "+this.img_width+", "+this.img_height);
  if(window.innerHeight-160 <= this.img_height + (this.piece_height*1.5)){
    var h = ((this.img_height + (this.piece_height*1.5))+160 + this.canvas.height)/2;
    this.scale = this.canvas.height/h;
  }
  else if(window.innerWidth <= this.img_width + (this.piece_width*1.2)){
    var w = ((this.img_width + (this.piece_width*1.2)) + this.canvas.width)/2;
    this.scale = this.canvas.width/w;
  }
  */

  this.context.scale(this.scale,this.scale);
  console.log('scale: '+this.scale);  
  this.resized = false;
}


Game.prototype.init = function(){
  //this.loadAssets();

  this.loaded = true;
  this.pieces = new Array();
  this.holders = new Array();
  this.placed_pieces = new Array();
  this.moving = true;
  this.selected = null;
  this.over = null;
  this.is_over = false;

  console.log(this.img.width+','+this.img.height)
  this.img_width = this.img.width;
  this.img_height = this.img.height;
  this.num_pieces = this.num_lines * this.num_lines;
  this.piece_width = this.img_width / this.num_lines;
  this.piece_height = this.img_height / this.num_lines;
  
  //IMAGE SIZE
  if(this.resized)
    this.apply_scale();

  this.font_size = Math.round(this.canvas.width/8);
  this.scaled_width = (this.canvas.width/this.scale)/2;
  this.scaled_height = (this.canvas.height/this.scale)/2;
  
  this.draw_bg();
  
  this.remaining_time = this.num_pieces*(10/this.stage);
  this.time_to_complete = this.remaining_time;
  this.clock_interval = null;
  this.mouse = new Mouse(this);

  this.auto_snap = true;

  this.placeHolders();
  this.placePieces();
  
}

Game.prototype.placePieces = function(){
  for(i=0; i<this.num_pieces; i++){
    x = Math.floor(Math.random()*this.scaled_width*2);
    y = Math.floor(Math.random()*this.scaled_height*2);
    temp = new Piece(
      i+1,
      this,
      this.piece_width,
      this.piece_height,
      x,
      y,
      new Point2D(this.x,this.y),
      new Point2D(this.holders[i].x,this.holders[i].y),
      this.holders[i],
      true,
      false
    );
    this.pieces.push(temp);
    console.log('pieces array length>>'+this.pieces.length);
  }
  if(this.chimes.currentTime != 0)
    this.chimes.currentTime = 0;
  this.chimes.play();
}

Game.prototype.placeHolders = function(){
  var pieces = 1;
  var offsetx = Math.round(this.scaled_width-(this.img_width)/2);
  var offsety = Math.round(this.scaled_height-(this.img_height)/2);
  offsety += 40;
  for(var i = 0; i < this.num_lines; ++i) {
    for(var j = 0; j < this.num_lines; ++j) {
      temp = new Holder(
        pieces,
        this,
        j*this.piece_width+offsetx+this.piece_width/2,
        i*this.piece_height+offsety+this.piece_height/2,
        i,
        j,
        false
      );
      this.holders.push(temp);
      console.log('holders array length>>'+this.holders.length+' '+temp.x+','+temp.y);
      pieces++;
    }
  }
}

Game.prototype.render = function() {
  this.draw_bg();

  //LOADING
  if(!this.loaded){
    if((this.items_to_load > 0)&&(this.loaded_items == this.items_to_load)){
      this.items_to_load = 0;
      var t = setTimeout("game.init();", 1500);
    }else{
      this.draw_loading();
    }
  }
  else{
    //HOLDERS
    for(var i = 0; i < this.holders.length; i++){
      holder = this.holders[i];
      holder.draw();
    }
  
    //PIECES
    var not_placed = new Array();
    var over = false;
    for(var i = 0; i < this.pieces.length; i++){
      piece = this.pieces[i];
      if(!over && piece.mouse_is_over())
        over = true;
      if(!piece.placed)
        not_placed.push(piece);
      else if(piece != this.selected)
        piece.draw();
        
      if(!this.selected){
        if((!this.over)||(this.over.id < piece.id)||(piece.mouse_is_over())){
          if(piece.mouse_is_over() && !piece.placed){
            this.over = piece;
          }
        }
      }
        
    }
    for(var i = 0; i < not_placed.length; i++){
      not_placed[i].draw();
    }
    if(this.selected)
      this.selected.draw();
  
    if(!over)
      this.over = null;
    
    //move
    if((this.selected != null)&&(this.selected.moveble)){
      this.selected.x = Math.round(this.mouse.x);
      this.selected.y = Math.round(this.mouse.y);
    }

    //REMAINING TIME
    this.draw_remaining();

    //Game Over
    if(this.remaining_time <= 0){
      this.remaining_time = 0;
      window.m.pauseGame();
      if(confirm('Timeup! Try again')){
        this.is_over = false;
        this.init();
        window.m.startGame();
      }
    }
    else{
      if(this.is_over){
        window.m.pauseGame();
        $('#stage').html("Stage "+this.stage+" completed!");
        $('#pieces').html(this.num_lines*this.num_lines+" pieces in "+(this.time_to_complete-this.remaining_time)+"s");
        $('#modal-success').modal();
        /*
        if(confirm('Yes, you did it! Try the next level')){
          this.is_over = false;
          this.num_lines++;
          this.init();
          window.m.startGame();
        }
        */
      }else{
        if(this.num_pieces == this.placed_pieces.length){
          this.is_over = true;
        }
      }
    }
  }

  //DEBUG
  /*
  if(this.debug){
    document.getElementById('mx').value = this.mouse.x;
    document.getElementById('my').value = this.mouse.y;
  
    document.getElementById('hx').value = this.holders[0].x;
    document.getElementById('hy').value = this.holders[0].y;
    document.getElementById('hx2').value = this.holders[1].x;
    document.getElementById('hy2').value = this.holders[1].y;
  
    document.getElementById('moving').value = this.mouse.moving;
    if(this.over)
      document.getElementById('over').value = this.over.id;
    else
      document.getElementById('over').value = "";
    if(this.selected)
      document.getElementById('selected').value = this.selected.id;
    else
      document.getElementById('selected').value = "";
  
    document.getElementById('p').value = this.num_pieces;
    document.getElementById('l').value = this.num_lines;
    document.getElementById('pw').value = this.piece_width;
    document.getElementById('ph').value = this.piece_height;
  
    document.getElementById('pp').value = this.placed_pieces.length;
  }
  */

}

Game.prototype.draw_bg = function() {
  if(!this.scale) this.scale = 1;
  this.context.fillStyle = "rgba(125, 125, 125, 1)";
  this.context_bg.fillRect(0,0,this.canvas_bg.width/this.scale,this.canvas_bg.height/this.scale);
  //puzzle image
  var offsetx = Math.round(this.scaled_width-(this.img_width)/2);
  var offsety = Math.round(this.scaled_height-(this.img_height)/2);
  offsety += 40;
  this.context_bg.globalAlpha = 0.2;
  this.context_bg.drawImage(this.img, offsetx, offsety, this.img_width, this.img_height);
}

Game.prototype.draw_remaining = function() {
  this.fade1 = this.fade1+(0.010*this.alpha);
  if(this.fade1 >= 0.6)
    this.alpha = -1;
  else if(this.fade1 <= 0.2)
    this.alpha = 1;
  this.context.fillStyle = "rgba(255, 255, 255, "+this.fade1+")";
  this.context.strokeStyle = "rgba(0, 0, 0, 0.5)";
  this.context.lineWidth = 2;
  this.context.font = "bold "+this.font_size+"px Arial";
  this.context.textBaseline = 'middle';
  this.context.textAlign = 'center';
  this.context.fillText(game.remaining_time, this.scaled_width, this.scaled_height);
}

Game.prototype.draw_loading = function() {
  this.fade1 = this.fade1+0.025;
  if(this.fade1 >= 1)
    this.fade1 = 0;
  this.fade2 = 1-this.fade1;
  
  this.context.fillStyle = "rgba(255, 255, 255, "+this.fade2+")";
  this.context.strokeStyle = "rgba(255, 255, 255, "+this.fade1+")";
  this.context.font = "bold "+this.font_size+"px Arial";
  this.context.textBaseline = 'middle';
  this.context.textAlign = 'center';
  this.context.lineWidth = 5;
  this.context.strokeText("LOADING", this.scaled_width, this.scaled_height);
  this.context.fillText("LOADING", this.scaled_width, this.scaled_height);
  //console.log('loading...');
}

////////////////////////////////////////

Game.prototype.clockTick = function() {
  this.remaining_time--;
}

Game.prototype.getTimer = function() {
  return (new Date().getTime() - this.start_time); //milliseconds
}

Game.prototype.nextStage = function() {
  this.is_over = false;
  this.stage++;
  this.num_lines++;
  this.init();
  window.m.startGame();
}
