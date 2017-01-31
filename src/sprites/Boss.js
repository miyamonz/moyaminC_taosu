const LOAD = require("../loadFiles.js")

module.exports = function(core) {
  const sound = require("../sound.js")(core)
  return Class.create(Sprite, {
    //初期化メソッド
    initialize: function(scene, stageNumber){
      Sprite.call(this, 80, 80);
      this.image = core.assets[LOAD.IMG.BOSS_IMG];
      this.frame = 0;
      this.center = (core.height - this.height)/2;
      this.centerX = (core.width - this.width)/2;
      this.x = 700;
      this.y = this.center;
      this.barrier = false;   //攻撃無効化
      this.pattern = 0;       //ボスの攻撃パターン
      this.ransha = false;    //パターン２において乱射しているときかどうか
      this.ranshaTime = 120;
      switch (stageNumber) {
        case 1: this.life = 60; //ステージ1のボスの体力 60
          break;
        case 2: this.life = 70; //ステージ2のボスの体力 70
          break;
        case 3:
          this.life = 90 - core.gameoverNum * 5;  //ステージ3のボスの体力 90 ただしゲームオーバーするごとに5ずつ減る（以前のステージでのゲームオーバーも含む）
          if (this.life < 40) {
            this.life = 40;       //下限は40
          }
          break;
        default:
      }
      scene.addChild(this);
    },
    //攻撃時の動き方パターン
    move: function(pattern, stageNumber){
      switch (pattern) {
          //パターン０：上下運動
        case 0:
          this.haba = 200;        //振幅
          switch (stageNumber) {
            case 1:
              this.moveTime = 80;     //１周期の時間
              break;
            case 2:
            case 3:
              this.moveTime = 60;
              break;
          }
          this.barrier = false;   //攻撃可能パターン
          this.easing = enchant.Easing.QUAD_EASEINOUT //イージング設定
          //3周期分上下する
          this.tl.then(function(){
            this.pattern = 0;
          })
          for (var i = 0; i < 3; i++) {
            this.tl.moveTo(800, this.center + this.haba, this.moveTime/2, this.easing);
            this.tl.moveTo(800, this.center - this.haba, this.moveTime/2, this.easing);
          }
          break;
          //パターン１：ジグザグ体当たり
        case 1:
          this.tl.then(function(){
            this.pattern = 1;
            this.barrier = true; //バリア発動
            this.frame = 4;
          });
          this.tl.delay(10).scaleTo(1.5, 10); //巨大化
          this.tl.and();                      //巨大化と半透明化は同時に
          this.tl.fadeTo(0.3, 10) //バリア発動中はボスを薄く表示
          this.tl.delay(20).then(function() {
            this.frame = 4;
          });
          this.tl.moveTo(80, 450, 30, enchant.Easing.BACK_EASEINOUT);　            //左下に移動
          this.tl.moveTo(80, 50, 20, enchant.Easing.BACK_EASEINOUT);                         //左上に移動
          this.tl.moveTo(800, this.center + 200, 30, enchant.Easing.BACK_EASEINOUT);  //右下に移動
          this.tl.moveTo(800, this.center, 20, enchant.Easing.BACK_EASEIN);                 //右側中央に移動
          this.tl.scaleTo(1, 10);             //元のサイズに戻る
          this.tl.and();                      //元のサイズに戻るのと半透明化は同時に
          this.tl.fadeTo(1, 10);              //透明化解除
          this.tl.delay(10).then(function(){
            this.barrier = false;
            this.frame = 0;
          });
          break;
          //パターン２：中央で弾乱射(中央に移動するだけ)
        case 2:
          this.tl.then(function(){
            this.pattern = 2;
            this.barrier = true;  //バリア発動
            this.frame = 2;       //攻撃中のボス画像
          });
          this.tl.fadeTo(0.3, 10);            //バリア発動中はボスを薄く表示
          this.tl.delay(10).moveTo(this.centerX, this.center, 30).delay(10).then(function(){
            this.ransha = true;
          });
          this.tl.delay(this.ranshaTime).then(function(){
            this.ransha = false;
          });
          this.tl.delay(10).moveTo(700, this.center, 30);
          this.tl.fadeTo(1, 10);              //透明化解除
          this.tl.delay(10).then(function(){
            this.barrier = false;
            this.frame = 0;
          });
          break;
      }
    },
    //ボスの体力表示
    lifeLabel: function(scene){
      var label = new Sprite(10,15);
      label.x　=　80;
      label.y　=　20;
      label.backgroundColor = 'red';
      label.on('enterframe',function(){
        label.width = boss.life * 10;
      })
      scene.addChild(label);
    },
    //消去するメソッド
    delete: function(scene){
      scene.removeChild(this);
      delete this;
    }
  });
}
