(function(){
    var JMS = function(rowCount, colCount, landMineCount){
        if(!(this instanceof JMS))
            return new JMS(rowCount, colCount, landMineCount);
        this.area = $(".sweep");
        this.cells = [];
        this.rowCount = rowCount || 10;
        this.colCount = colCount || 10;
        this.mines = [];        //存储地雷的序号
        this.landMineCount = landMineCount||10;
        this.setupCount = 0;
        this.markMineCount = 0;
        this.beginTime = null;
        this.endTime = null;
        this.remainingCount = landMineCount || 10;
        

        document.oncontextmenu = function(){
            return false;       //禁用右键菜单
        }
        this.drawMap();
    }

    JMS.prototype = {
        drawMap: function(){
            var width = (this.colCount>10) ? ((this.colCount>30) ? 15 : 25) : 40;
           
            var landWidth = (width+2)*this.colCount;
            $(".sweep").css("width",landWidth+'px');
            for(var i=0; i<this.rowCount; i++){
                var cols = [];
                for(var j=0; j<this.colCount; j++){
                    var oBrick = document.createElement('div');
                    $(oBrick).addClass('brick');
                    $(oBrick).css('width',width+'px').css('height',width+'px').css('font-size',width-2+'px').css('line-height',width-2+'px');
                    this.area.append(oBrick);
                    cols.push({'brick': oBrick, 'number':0});
                }
                this.cells.push(cols);
                
            }
            
            this.init();
        },
        init: function(){
            var allCount = this.rowCount * this.colCount;
            for(this.mines=[]; this.mines.length<this.landMineCount;){
                var rand = Math.floor(Math.random() * allCount);
                if($.inArray(rand, this.mines)!=-1){
                    continue;
                } else {    
                    this.mines.push(rand);
                    var row = Math.floor(rand/(this.rowCount));
                    var col = rand%(this.colCount);

                    this.cells[row][col].number = 9;
                }
            }

            for(var row=0; row<this.rowCount; row++){
                for(var col=0; col<this.colCount; col++){
                    if(this.cells[row][col].number!=9){
                        count = 0;
                        if(row-1>=0 && col-1>=0){
                            if(this.cells[row-1][col-1].number == 9){
                                count ++;
                            }
                        }
                        if(row-1>=0){
                            if(this.cells[row-1][col].number == 9){
                                count++;
                            }
                        }
                        if(row-1>=0 && col+1<this.colCount){
                            if(this.cells[row-1][col+1].number == 9){
                                count++;
                            }
                        }
                        if(row+1<this.rowCount && col-1>=0){
                            if(this.cells[row+1][col-1].number == 9){
                                count ++;
                            }
                        }
                        if(row+1<this.rowCount){
                            if(this.cells[row+1][col].number == 9){
                                count++;
                            }
                        }
                        if(row+1<this.rowCount && col+1<this.colCount){
                            if(this.cells[row+1][col+1].number == 9){
                                count++;
                            }
                        }
                        if(col-1>=0){
                            if(this.cells[row][col-1].number == 9){
                                count ++;
                            }
                        }
                        if(col+1<this.colCount){
                            if(this.cells[row][col+1].number == 9){
                                count++;
                            }
                        }
                        this.cells[row][col].number = count;
                    }
                    
                }
                
            }
            $('#remaining span').html(this.landMineCount);
            this.bindEvent();

        },
        bindEvent: function(){
            var self = this;
            for(var i=0; i<this.rowCount; i++){
                for(var j=0; j<this.colCount; j++){
                    (function(row,col){
                        $(self.cells[row][col].brick).mousedown(function(e){
                            var e = e||window.event;
                            var mouseNum = e.button;    //0左键 2右键
                            if(mouseNum == 2){
                                $(this).toggleClass('flag');
                                var count = $('#remaining span').html();
                                if($(this).attr('class').indexOf('flag') != -1){
                                    self.markMineCount ++;
                                    $('#remaining span').html(self.landMineCount - self.markMineCount);
                                    if(self.markMineCount + self.setupCount == self.rowCount*self.colCount){
                                        self.success();
                                    }
                                } else {
                                    self.markMineCount --;
                                    $('#remaining span').html(self.landMineCount - self.markMineCount);
                                }
                                var remaining = self.landMineCount - self.markMineCount;
                                $("#remaining>span").html = remaining;
                    
                            } else if(mouseNum == 0){
                                self.openBlock.call(self, this, row, col);
                            }
                            e.stopPropagation();
                        })
                    })(i,j);

                }
            }
            this.beginTime = new Date();
        },
        showNoMineLand: function(x,y){     //展开无雷区域
            for(var i=x-1; i<x+2; i++){
                for(var j=y-1; j<y+2; j++){
                    if(!(i==x && j==y) && (i>=0 && i<this.rowCount && j>=0 && j<this.colCount)){
                        var ele = this.cells[i][j].brick;
                        if(ele && $(ele).attr('class').indexOf('no-mine') == -1){
                            this.openBlock.call(this, ele, i, j);
                        }

                    }
                }
            }
        },
        showMineLand: function(){
            for(var i=0; i<this.landMineCount; i++){
                var row = Math.floor(this.mines[i]/this.rowCount);
                var col = this.mines[i]%this.colCount;
                
                $(this.cells[row][col].brick).css("background-color","red");
            }
        },
        showAllLand: function(){
            for(var i=0; i<this.rowCount; i++){
                for(var j=0; j<this.colCount; j++){
                    var ele = this.cells[i][j];
                    if(ele.number == 9 && $(ele.brick).attr('class').indexOf('flag') == -1){
                        $(this.cells[i][j].brick).addClass('bomb');
                    } else if(ele.number != 9 && $(ele.brick).attr('class').indexOf('flag') != -1){
                        $(ele.brick).removeClass('flag').addClass('wrong-flag');
                    } else if(ele.number != 9){
                        if(ele.number != 0){
                            $(ele.brick).html(ele.number);
                        }
                        $(ele.brick).addClass('no-mine');
                    }
                }
            }
        },
        openBlock: function(obj, x, y){
            if($(obj).attr('class').indexOf('flag') != -1){
                $(obj).removeClass('flag');
            } else{
                if(this.cells[x][y].number != 9){
                    this.setupCount ++;
                    if(this.cells[x][y].number != 0){
                        $(obj).addClass('no-mine').html(this.cells[x][y].number);
                    } else {
                        $(obj).addClass('no-mine');
                    }
                    if(this.setupCount + this.markMineCount == this.rowCount * this.colCount){

                        this.showAllLand();
                        this.success();
                    }
                    $(obj).unbind();        //翻开后就可取消绑定事件
                    if(this.cells[x][y].number == 0){
                        this.showNoMineLand.call(this, x, y);
                    }
                } else {
                    this.showAllLand();
                    $(obj).css('background-color','red');
                    this.failed();
                }
            }
            
        },
        success: function(){
            this.endTime = new Date();
 
            var self = this;
            setTimeout(
                function(){
                    if(confirm("你赢了!记录为"+Math.floor(self.endTime-self.beginTime)/1000 + "秒!是否开始新游戏?")){
                        jms = null;
                        beginGame();
                    } else {
                        self.unbindAll();
                        jms = null;
                    }
            
                },200);
            
        },
        failed: function(){
            this.showAllLand();
            this.endTime = new Date();
            var self = this;
            setTimeout(function(){
                if(confirm("你输了!用时"+Math.floor((self.endTime-self.beginTime)/1000) + "秒。是否开始新游戏?")){
                    jms = null;
                    beginGame();
                } else {
                    self.unbindAll();
                }
            },500);
            
            
            
        },
        unbindAll: function(){
            for(var i=0; i<this.rowCount; i++){
                for(var j=0; j<this.colCount; j++){
                    $(this.cells[i][j].brick).unbind();
                }
            }
            jms = null;
        }

    }
    window.JMS = JMS;
})();
var jms;
var timer;
$(window).load(function(){
    jms = null;

    $("#start").click(function(){
        beginGame();
    });
    var oRadios = $("input:radio[name='level']");
    for(var i=0; i<oRadios.length; i++){
        (function(j){
            $(oRadios[i]).click(function(){
                beginGame(); 
            })
        })(i);
    }
    beginGame();
    
})

function beginGame(){
    if(jms != null){
        if(confirm("你确定要退出此次游戏开始新游戏吗?")){
            jms = null;
        } else {
            return ;
        }
    } 
    $(".sweep").empty();
    var oLevel = $("input:radio[name='level']:checked");
    var landMineCount = $(oLevel).val();
    var rowCount = $(oLevel).data('row');
    var colCount = $(oLevel).data('col');
    jms = new JMS(rowCount, colCount, landMineCount);
    timer = setInterval(function(){
        if(jms){
            $('#cost-time span').html(Math.floor((new Date()-jms.beginTime)/1000));
        } else {
            timer = null;
        }
        
    },1000);

}
