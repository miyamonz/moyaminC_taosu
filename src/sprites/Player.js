const LOAD = require("../loadFiles.js")

module.exports = function(core){
  return Class.create(Sprite, {
    initialize: function(scene){
      Sprite.call(this, 50, 23);
      this.image = core.assets[LOAD.IMG.PLAYER_IMG];
      this.life = 5;          //プレイヤーのライフ
      this.myLifeLabel = [];
      this.damageTime = 40;   //ダメージ受けた時のアクション合計時間(8の倍数？)
      this.barrier = false;   //ダメージ受けた後の無敵判定
      this.playFlag = true;   //ゲームプレイ中（ボス未撃破）かどうか判定する変数
      this.x = 100;
      this.y = core.height/2;
      scene.addChild(this);
    },
    //当たり判定用のSpriteを作成する
    hitbox: function (scene) {
      var hitBoxScale = 0.5; //プレイヤーの大きさに対するhitBoxの大きさ
      var hitBoxScaleX = Math.round(this.width * hitBoxScale);  //0.5なら25
      var hitBoxScaleY = Math.round(this.height * hitBoxScale); //0.5なら12
      var hitBox = new Sprite(hitBoxScaleX, hitBoxScaleY); //当たり判定用のSprite
      hitBox.x = this.x + (this.width - hitBox.width)/2;
      hitBox.y = this.y + (this.height - hitBox.height)/2;
      scene.addChild(hitBox);
      return hitBox;
    },
    //自機がobj(敵)と当たったか判定するメソッド (sceneのイベントリスナー内で呼び出すこと)
    hit: function(obj, scene, playerHitBox){
      //ライフのあるobjに当たった場合
      if (playerHitBox.intersect(obj) && obj.life > 0) {
        //自機のライフがまだある時
        if (player.life - 1 > 0 && (player.barrier == false)) {
          player.damage();        //ダメージアクション
          scene.removeChild(player.myLifeLabel[player.life]);
          //自機のライフが0になる時
        }else if(player.life - 1 == 0 && (player.barrier == false)){
          player.life -= 1;
          player.dead(scene);
          scene.removeChild(player.myLifeLabel[0]);
        }
      }
    },
    //ダメージを受けた時(ライフがある時)
    damage: function(){
      sound.playerDamageSe(1); //プレイヤーがダメージを受けた時のSE
      this.barrier = true;    //無敵発動
      this.life -= 1;         //ライフ１削る
      core.playerDamgeNum++;  //被ダメージ合計回数を1増やす
      player.opacity = 0.5;   //半透明になる
      //無敵時間（2.5秒）
      setTimeout(function(){
        player.barrier = false;   //無敵解除
        player.opacity = 1;       //半透明解除
      },2500);
      //ダメージアクション（左右に30度傾く ２往復）(合計60フレーム = 2秒)
      player.tl.rotateTo(30, 5, BACK_EASEOUT);
      player.tl.rotateTo(-30, 5);
      player.tl.rotateTo(30, 10);
      player.tl.rotateTo(-30, 20);
      player.tl.rotateTo(0, 20, BACK_EASEOUT);
    },
    //死んだ時のエフェクト
    dead: function(scene) {
      core.playerDamgeNum++;  //被ダメージ合計回数を1増やす
      var playerDead = new Sprite(96, 96);
      playerDead.image = core.assets[LOAD.IMG.PLAYER_DEAD_IMG];
      playerDead.x = player.x - 23; //爆発画像が中心に来るように調整
      playerDead.y = player.y - 32; //爆発画像が中心に来るように調整
      scene.removeChild(player);
      scene.addChild(playerDead);
      //5フレーム毎に画像を更新
      playerDead.tl.delay(5).then(function() {
        playerDead.frame = 1;
      }).delay(5).then(function() {
        playerDead.frame = 2;
      }).delay(5).then(function() {
        playerDead.frame = 3;
      }).delay(5).then(function() {
        scene.removeChild(playerDead);
      })
    },
    //自機の体力表示
    lifeLabel: function(scene){
      for (var i = 0; i < this.life; i++) {
        var label = new Sprite(16,16);
        label.image = core.assets[LOAD.IMG.MYLIFE_IMG];
        label.frame = 10;
        label.scale(2);
        label.x = 45 + 40 * i;
        label.y = 85;
        scene.addChild(label);
        this.myLifeLabel[i] = label;
      }
    },
    //プレイヤーの動き方
    move: function(x, y, obj){
      var playerMaxSpeed = 7;     //プレイヤーの最高スピード
      if(this.playFlag == true){  //ボス撃破（playFlag = false）なら動かない
        if (core.input.left) {
          if (x >= (this.width - obj.width)/2) {  //左方向の限界
            x -= playerMaxSpeed;
          }
        }
        if (core.input.right) {
          if (x <= 960 - this.width + (this.width - obj.width)/2) { //右方向の限界
            x += playerMaxSpeed;
          }
        }
        if (core.input.up) {
          if (y >= (this.height - obj.height)/2) {  //上方向の限界
            y -= playerMaxSpeed;
          }
        }
        if (core.input.down) {
          if (y <= 540 - this.height + (this.height - obj.height)/2) {  //下方向の限界
            y += playerMaxSpeed;
          }
        }
        obj.x = x;
        obj.y = y;
      }
    },
    moveTouch: function(e) {
      var playerMaxSpeed = 7;     //プレイヤーの最高スピード
      // var startX = e.x;
      var startY = e.y;
      if(this.playFlag == true){  //ボス撃破（playFlag = false）なら動かない
        if (core.input.left) {
          if (x >= (this.width - obj.width)/2) {  //左方向の限界
            x -= playerMaxSpeed;
          }
        }
        if (core.input.right) {
          if (x <= 960 - this.width + (this.width - obj.width)/2) { //右方向の限界
            x += playerMaxSpeed;
          }
        }
        if (core.input.up) {
          if (y >= (this.height - obj.height)/2) {  //上方向の限界
            y -= playerMaxSpeed;
          }
        }
        if (core.input.down) {
          if (y <= 540 - this.height + (this.height - obj.height)/2) {  //下方向の限界
            y += playerMaxSpeed;
          }
        }
        this.x = e.x;
        this.y = e.y;
      }
    }
  });
}
