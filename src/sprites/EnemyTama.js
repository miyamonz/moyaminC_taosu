const LOAD = require("../loadFiles.js")

module.exports = function(core) {
  const sound = require("../sound.js")(core)
  return Class.create(Sprite, {
    initialize: function(scene, x, y, boss, xAngle, yAngle, playerHitBox){
      Sprite.call(this, 16, 16);
      this.image = core.assets[LOAD.IMG.BOSS_TAMA_IMG];
      this.x = x;         //数字は発射位置の調整
      this.y = y;         //数字は発射位置の調整
      this.speed = 10;        //弾の進むスピード
      this.interval = 100;    //連射間隔
      this.onFrame(scene, xAngle, yAngle, playerHitBox);
    },
    //敵弾の進み方 (弾の生成条件はcreateGameSceneの中でおこなう)
    onFrame: function(scene, xAngle, yAngle, playerHitBox){
      this.addEventListener('enterframe', function(){
        //弾がプレイヤーに当たったかチェック
        this.hitBullet(scene, playerHitBox);
        this.x += this.speed * xAngle;;
        this.y += this.speed * yAngle;
        //端までいったら消える
        if (this.x < -40 || this.x > 1000 || this.y < -40 || this.y > 600) {
          this.delete(scene);
        }
        //ボスを倒したら敵弾も消える
        if (boss.life <= 0){
          this.delete(scene);
        }
      });
    },
    //敵弾がプレイヤーと当たったか判定するメソッド
    hitBullet: function(scene, playerHitBox){
      //プレイヤーに当たった場合
      if (this.intersect(playerHitBox) && player.playFlag == true) {
        //プレイヤーのライフがまだある時
        if (player.life - 1 > 0 && (player.barrier == false)) {
          player.damage();        //ダメージアクション
          scene.removeChild(player.myLifeLabel[player.life]); //ライフ表示を１減らす
          this.delete(scene);     //敵弾を消去
          //プレイヤーのライフが0になる時
        }else if(player.life - 1 == 0 && (player.barrier == false)){
          player.life -= 1;
          player.dead(scene);
          scene.removeChild(player.myLifeLabel[0]);
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
