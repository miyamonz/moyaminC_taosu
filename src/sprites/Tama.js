const LOAD = require("../loadFiles.js")

module.exports = function(core) {
  const sound = require("../sound.js")(core)
  return Class.create(Sprite, {
    initialize: function(scene, x, y){
      Sprite.call(this, 27, 3);
      this.image = core.assets[LOAD.IMG.TAMA_IMG];
      this.x = x + 48;        //数字は発射位置の調整
      this.y = y + 9;         //数字は発射位置の調整
      this.speed = 20;        //弾の進むスピード
      this.interval = 100;    //連射間隔
      this.addEventListener('enterframe', function(){ //このイベントリスナーは必須
        this.x += this.speed;
        if (this.x > 960) {
          this.delete(scene);
        }
        this.hit(scene);
      });
      scene.addChild(this);
    },
    //弾がボスと当たったか判定するメソッド
    hit: function(scene){
      //objに当たった場合
      if (this.intersect(boss)) {
        //objのlifeがある時
        if (boss.life > 0 && (boss.barrier == false)) {
          //プレイヤーのライフがある時（ゲームオーバー後に当たった弾でボスのライフが削れるのを防ぐため）
          if (player.life > 0) {
            sound.bossDamageSe(1); //ヒット音
            boss.frame = 1;                               //ダメージ受けた時のボスの画像
            boss.life -= 1;                               //ボスのライフを１削る
          }
          this.delete(scene);
          setTimeout(function(){
            //弾ヒット後に無敵状態に入った場合の対処法
            if (boss.barrier == false) {
              boss.frame = 0;
            } else if(boss.barrier == true){
              boss.frame = 2;
            }
          }, 2000);
        }
      }
    },
    //消去するメソッド
    delete: function(scene){
      scene.removeChild(this);
      delete this;
    }
  });
}
