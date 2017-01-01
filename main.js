enchant();

//ゲームで使用する画像
var TITLE_IMG = './image/title.png'
var BACKGROUND_IMG = './image/cosmo.jpg'
var PLAYER_IMG = './image/player1.png';
var TAMA_IMG = './image/tama.png';
var BOSS_IMG = './image/moyaminC.png';
var BOSS_TAMA_IMG ='./image/moyaminC_grass.png'
var MYLIFE_IMG = './icon0.png';
var GAMEOVER_IMG = './image/gameover.png';
var CLEAR_IMG = './image/clear.png'

var IMG = [TITLE_IMG, BACKGROUND_IMG, PLAYER_IMG, TAMA_IMG, BOSS_IMG, BOSS_TAMA_IMG, MYLIFE_IMG, GAMEOVER_IMG, CLEAR_IMG];

window.onload = function() {

  var core = new Core(960, 540);
  //replaceSceneでメモリが増えないように, 現在のシーンに存在するノードを全て削除してからシーンを切り替える
  core.replaceScene=function(scene) {
    var currentScene = core.popScene();
    while (currentScene.childNodes.length > 0) {
      　currentScene.removeChild(currentScene.childNodes[0]);
    }
    return core.pushScene(scene);
  }
  //画像ファイル読み込み
  core.preload(IMG);
  //fps設定
  core.fps = 30;
  //ショットのキーバインド
  core.keybind( 'X'.charCodeAt(0), 'a' );

  core.onload = function() {
    //プレイヤーを作成するクラス
    var Player = Class.create(Sprite, {
        initialize: function(scene){
          Sprite.call(this, 50, 23);
          this.image = core.assets[PLAYER_IMG];
          this.life = 5;
          this.myLifeLabel = [];
          this.damageTime = 40; //ダメージ受けた時のアクション合計時間(8の倍数？)
          this.barrier = false; //ダメージ受けた後の無敵判定
          this.playFlag = true; //ゲームプレイ中（ボス未撃破）かどうか判定する変数
          this.x = 100;
          this.y = core.height/2;
          this.lifeLabel(scene);
          scene.addChild(this);
        },
        //自機がobj(敵)と当たったか判定するメソッド (sceneのイベントリスナー内で呼び出すこと)
        hit: function(obj, scene){
            //ライフのあるobjに当たった場合
            if (player.intersect(obj) && obj.life > 0) {
              //自機のライフがまだある時
              if (player.life - 1 > 0 && (player.barrier == false)) {
                player.damage();        //ダメージアクション
                scene.removeChild(player.myLifeLabel[player.life]);
              //自機のライフが0になる時
            }else if(player.life - 1 == 0 && (player.barrier == false)){
                player.life -= 1;
                scene.removeChild(player.myLifeLabel[0]);
                scene.removeChild(player);
              }
            }
        },
        //ダメージを受けた時(ライフがある時)
        damage: function(){
          this.barrier = true;  //無敵発動
          this.life -= 1;       //ライフ１削る
          player.opacity = 0.5;
          //無敵時間（3秒）
          setTimeout(function(){
            player.barrier = false;
            player.opacity = 1;
          },3000);
          //ダメージアクション（左右に30度傾く ２往復）
          player.tl.rotateTo(30, this.damageTime/8, BACK_EASEOUT);
          player.tl.rotateTo(-30, this.damageTime/8);
          player.tl.rotateTo(30, this.damageTime/4);
          player.tl.rotateTo(-30, this.damageTime/2);
          player.tl.rotateTo(0, this.damageTime/2, BACK_EASEOUT);
        },
        //自機の体力表示
        lifeLabel: function(scene){
          for (var i = 0; i < this.life; i++) {
            var label = new Sprite(16,16);
            label.image = core.assets[MYLIFE_IMG];
            label.frame = 10;
            label.scale(2);
            label.x = 85 + 40 * i;
            label.y = 60;
            scene.addChild(label);
            this.myLifeLabel[i] = label;
          }
        },
        //プレイヤーの動き方
        move: function(x, y){
          var playerMaxSpeed = 7;     //プレイヤーの最高スピード
          if(this.playFlag == true){
            if (core.input.left) {
              if (x >= 0) {
                x -= playerMaxSpeed;
              }
            }
            if (core.input.right) {
              if (x <= 960 - 50) {
                x += playerMaxSpeed;
              }
            }
            if (core.input.up) {
              if (y >= 0) {
                y -= playerMaxSpeed;
              }
            }
            if (core.input.down) {
              if (y <= 540 - 23) {
                y += playerMaxSpeed;
              }
            }
            this.x = x;
            this.y = y;
          }
        }
    });

    //自弾を作成するクラス
    var Tama = Class.create(Sprite, {
        initialize: function(scene, x, y){
          Sprite.call(this, 27, 3);
          this.image = core.assets[TAMA_IMG];
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
                  boss.frame = 1;  //ダメージ受けた時のボスの画像
                  boss.life -= 1;  //ボスのライフを１削る
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

    //敵を作成するクラス
    var Boss = Class.create(Sprite, {
        //初期化メソッド
        initialize: function(scene){
          Sprite.call(this, 80, 80);
          this.image = core.assets[BOSS_IMG];
          this.frame = 0;
          this.center = (core.height - this.height)/2;
          this.x = 700;
          this.y = this.center;
          this.life = 80;    //ボスの体力
          this.barrier = false; //攻撃無効化
          this.ransha = false;    //パターン２のときかどうか
          this.ranshaTime = 120;
          this.ranshaEnd = true;
          scene.addChild(this);
        },
        move: function(pattern){
          switch (pattern) {
            //パターン０：上下運動
            case 0:
              this.haba = 200;        //振幅
              this.moveTime = 60;     //１周期の時間
              this.barrier = false;   //攻撃可能パターン
              this.easing = enchant.Easing.QUAD_EASEINOUT //イージング設定
              //3周期分上下する
              for (var i = 0; i < 3; i++) {
                this.tl.moveTo(800, this.center + this.haba, this.moveTime/2, this.easing);
                this.tl.moveTo(800, this.center - this.haba, this.moveTime/2, this.easing);
              }
              break;
            //パターン１：ジグザグ体当たり
            case 1:
              this.tl.then(function(){
                this.barrier = true; //バリア発動
                this.frame = 2;
              });
              this.tl.delay(10).scaleTo(1.5, 10); //巨大化
              this.tl.and();                      //巨大化と半透明化は同時に
              this.tl.fadeTo(0.3, 10);            //バリア発動中はボスを薄く表示
              this.tl.delay(20).moveTo(80, 450, 30, enchant.Easing.BACK_EASEINOUT);　            //左下に移動
              this.tl.moveTo(80, 50, 20, enchant.Easing.BACK_EASEINOUT);                         //左上に移動
              this.tl.moveTo(800, this.center + this.haba, 30, enchant.Easing.BACK_EASEINOUT);  //右下に移動
              this.tl.moveTo(800, this.center, 20, enchant.Easing.BACK_EASEIN);                 //右側中央に移動
              this.tl.scaleTo(1, 10);             //元のサイズに戻る
              this.tl.and();                      //元のサイズに戻るのと半透明化は同時に
              this.tl.fadeTo(1, 10);              //透明化解除
              this.tl.delay(10).then(function(){
                this.barrier = false;
                this.frame = 0;
              });
              break;
            //パターン２：中央で弾乱射
            case 2:
            this.tl.then(function(){
              this.barrier = true;  //バリア発動
              this.frame = 2;       //攻撃中のボス画像
              this.ransha = true;
            });
            this.tl.fadeTo(0.3, 10);            //バリア発動中はボスを薄く表示
            this.tl.delay(10).moveTo(480, 270, 30);
            this.tl.delay(this.ranshaTime).then(function(){
                this.ransha = false;
            });
            this.tl.delay(10).moveTo(800, this.center + this.width, 30);
            this.tl.fadeTo(1, 10);              //透明化解除
            this.tl.delay(10).then(function(){
              this.barrier = false;
              this.frame = 0;
            });
          }
        },
        //消去するメソッド
        delete: function(scene){
          scene.removeChild(this);
          delete this;
        }
    });

    //敵弾を作成するクラス
    var EnemyTama = Class.create(Sprite, {
        initialize: function(scene, x, y, boss, xAngle, yAngle){
          Sprite.call(this, 16, 16);
          this.image = core.assets[BOSS_TAMA_IMG];
          this.x = x ;        //数字は発射位置の調整
          this.y = y + 40;         //数字は発射位置の調整
          this.speed = 10;        //弾の進むスピード
          this.interval = 100;    //連射間隔
          this.onFrame(scene, xAngle, yAngle);
        },
        onFrame: function(scene, xAngle, yAngle){
          this.addEventListener('enterframe', function(){
            this.hitBullet(scene);
            if (boss.ransha == false && boss.ranshaEnd == true) {
              this.x -= this.speed;
            }else if(boss.ransha == false && boss.ranshaEnd == false){
              this.x += this.speed * xAngle;
              this.y += this.speed * yAngle;
              setTimeout(function(){
                boss.ranshaEnd = true;
              },2000);
            }else if (boss.ransha == true) {
              boss.ranshaEnd = false;
              this.x += this.speed * xAngle;
              this.y += this.speed * yAngle;
            }
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
        hitBullet: function(scene){
            //プレイヤーに当たった場合
            if (this.intersect(player) && player.playFlag == true) {
              //プレイヤーのライフがまだある時
              if (player.life - 1 > 0 && (player.barrier == false)) {
                player.damage();        //ダメージアクション
                scene.removeChild(player.myLifeLabel[player.life]); //ライフ表示を１減らす
                this.delete(scene);     //敵弾を消去
              //プレイヤーのライフが0になる時
            }else if(player.life - 1 == 0 && (player.barrier == false)){
                player.life -= 1;
                scene.removeChild(player.myLifeLabel[0]);
                scene.removeChild(player);
              }
            }
          },
        //消去するメソッド
        delete: function(scene){
          scene.removeChild(this);
          delete this;
        }
    });

    //ゲームシーン
    var createGameScene = function(){
      //背景
      var scene = new Scene();
      var backGround = new Sprite(960, 540);
      backGround.image = core.assets[BACKGROUND_IMG];
      scene.addChild(backGround);
      //プレイヤー配置
      player = new Player(scene);
      //ボス配置
      boss = new Boss(scene);
      boss.opacity = 0;   //フェードインさせるために最初は透明にしておく
      boss.frame = 4;     //フェードイン時のボス画像
      //ボス登場時のセリフ
      var abo = new Label("アボアボ");
      abo.color = 'white';
      abo.x = boss.x - 10;    //ボスの頭上に表示
      abo.y = boss.y - 50;    //ボスの頭上に表示
      abo.font = '24px "Arial"';
      //ボス登場シーン
      bossAppearTime = 130; //ボス登場シーンにかかる合計時間
      boss.tl.fadeIn(60, QUAD_EASEINOUT); //フェードイン
      boss.tl.delay(20).then(function(){
        boss.frame = 2;                   //セリフを言う時のボス画像
        scene.addChild(abo);              //登場時のセリフ
      })
      boss.tl.delay(50).then(function(){
        boss.frame = 0;                   //戦闘時のボス画像
        scene.removeChild(abo);           //セリフは消す
      })
      //ボスの動き方パターンを配列に格納（[0, 1, 0, 1, 2]のループ)
      bossPattern = [];
      var j = 0;
      for (var i = 0; i < 48; i++) {    //パターン0とパターン1の繰り返しを入れる
        bossPattern[i] = j;
        if (j == 1) j = -1;
        j++;
      }
      for (var i = 0; i <= 60; i+=5) {
        bossPattern.splice( i, 0, 2);   //５つごとにパターン2を挿入
      }
      bossPattern.shift();  //先頭に挿入したパターン2を消す
      console.log(bossPattern);
      //敵の体力表示（バー）
      var bossLifeLabel = new Sprite(10,15);
      bossLifeLabel.x=(core.width-boss.life * 10)/2;
      bossLifeLabel.y=20;
      bossLifeLabel.backgroundColor = 'red';
        bossLifeLabel.on('enterframe',function(){
          bossLifeLabel.width = boss.life * 10;
        })
      scene.addChild(bossLifeLabel);
      //変数宣言
      var flag = true;            //連射間隔を守るためのチェック変数
      var gameoverFlag = false;   //ゲームオーバーしたかどうかチェックする変数
      var gameClearFlag = false;  //一度ゲームクリアしたかどうかチェックする変数
      var ranTama = 0;
      var ranTama2 = 0;
      //シーンのイベントリスナー
      scene.addEventListener('enterframe', function(){
        player.move(player.x, player.y);
        player.hit(boss, scene);
        //ボタンを押したら自弾発射(ボス登場シーン終了後 ＆ プレイヤーのライフあり & プレイヤー無敵時間以外 & 連射感覚守る)
        if (core.input.a && boss.age > bossAppearTime && player.life > 0 && player.barrier == false && flag == true) {
          //"flag = false" 中はボタンを押しても弾が出ないようにする
          flag = false;
          //ボタン押したら弾を一発表示
          var tama = new Tama(scene, player.x, player.y);
          //発射した弾がボスに当たったか判定
          tama.hit(boss);
          //連射間隔を守る
          setTimeout(function(){
            flag = true;
          },tama.interval);
        }
        //
        //敵弾の発射条件（通常時：ボス出現後から16フレーム毎）
        if ((boss.age - bossAppearTime) % 16 == 0 && (boss.age - bossAppearTime) >= 0 && boss.ransha == false && boss.ranshaEnd == true && gameoverFlag == false) {
          var enemyTama = new EnemyTama(scene, boss.x, boss.y, boss, -1, 0);
          scene.addChild(enemyTama);
        //乱射パターン時
      } else if ((boss.age - bossAppearTime) % 4 == 0 && (boss.age - bossAppearTime) >= 0 && boss.ransha == true && boss.ranshaEnd == false && gameoverFlag == false) {
          setTimeout(function(){
            var random = Math.PI * rand(360) / 180;
            var xAngle = Math.sin(random);
            var yAngle = Math.cos(random);
            if (boss.ransha == true) {
              ranTama = new EnemyTama(scene, 480, 270, boss, xAngle, yAngle);
              ranTama2 = new EnemyTama(scene, 480, 270, boss, -xAngle, -yAngle);
              scene.addChild(ranTama);
              scene.addChild(ranTama2);
            }
          }, 1000 * 50/core.fps);
        }
      //ゲームオーバーシーン ここから　//
      //  ゲームオーバー画面の表示    //
        if (player.life == 0) {
          boss.tl.clear();        //ボスの動きストップ
          gameoverFlag = true;    //ゲームオーバーフラッグを立てることで敵弾発射回避
          //ゲームオーバーの文字
          var gameover = new Sprite(189, 97);
          gameover.image = core.assets[GAMEOVER_IMG];
          gameover.scale(3);
          gameover.x = (scene.width - gameover.width) / 2 ;
          gameover.y = 160;
          scene.addChild(gameover);
          //3秒後にタイトル画面に戻る
          setTimeout(function(){
            core.replaceScene(createGameStartScene());
          }, 3000)
        }
      // ゲームオーバーシーン ここまで //

      //ゲームクリアシーン
        if (boss.life == 0 && gameClearFlag == false && player.life > 0) {
          boss.delete(scene);
          gameClearFlag = true;
          player.playFlag = false;
          //自機のアニメーション
          player.tl.delay(60).moveTo((core.width - player.width)/2, (core.height - player.height)/2 + 100, 90, enchant.Easing.BACK_EASEOUT);
          player.tl.then(function(){
            core.replaceScene(createGameClearScene(player, scene));
          });
        }
      });

        //ボス登場後、ボスの動き方を順に呼び出す
        setTimeout(function(){
          bossPattern.forEach(function(value){
            boss.move(value, boss, scene);
          });
        }, bossAppearTime / core.fps)
          return scene;
        };

    //ゲームクリア画面
    var createGameClearScene = function(player, gameScene){
        var scene = new Scene();
        var backGround = new Sprite(960, 540);
        backGround.image = core.assets[BACKGROUND_IMG];
        scene.addChild(backGround);
        scene.addChild(player);
        for (var i = 0; i < player.life; i++) {
          scene.addChild(player.myLifeLabel[i]);
        }
        //ゲームクリアの文字
        var clearLabel = new Sprite(267, 48)
        clearLabel.image = core.assets[CLEAR_IMG];
        clearLabel.scale(2.8);
        clearLabel.x = (scene.width - clearLabel.width) / 2 ;
        clearLabel.y = 160;
        //ゲームクリアの文字を表示
        player.tl.delay(10).then(function(){
            scene.addChild(clearLabel);
        });
        //タイトル画面に戻るボタン
        var button = new Button("Play again!", "light");
        button.x = scene.width / 2 - 100;
        button.y = 350;
        button.scale(2);
        //タイトル画面に戻るボタンを表示
        player.tl.delay(75).then(function(){
            scene.addChild(button);
        });
        button.ontouchstart = function(){
          core.replaceScene(createGameStartScene());
        }
        return scene;
    }

    //スタート画面
    var createGameStartScene = function(){
      var scene = new Scene();
      var backGround = new Sprite(960, 540);
      backGround.image = core.assets[BACKGROUND_IMG];
      scene.addChild(backGround);
      //タイトル文字
      var title = new Sprite(645,90);
      title.image = core.assets[TITLE_IMG];
      title.x = (scene.width - title.width) / 2;
      title.y = 100;
      scene.addChild(title);
      //操作説明
      var howToPlay = new Label("ショット：Xキー , 移動：十字キー");
      howToPlay.width = 400;
      howToPlay.x = scene.width / 2 - howToPlay.width /2;
      howToPlay.y = 250;
      howToPlay.color = 'white';
      howToPlay.font = '24px "Arial"';
      scene.addChild(howToPlay);
      //バージョン表示
      var verLabel = new Label("Ver. 1.1")  //更新したら書き換える！！
      verLabel.x = 10;
      verLabel.y = 10;
      verLabel.color = 'white';
      verLabel.font = '12px "Arial"';
      scene.addChild(verLabel);
      //スタートボタン
      var button = new Button("Play!", "light");
      button.x = scene.width / 2 - 80;
      button.y = 350;
      button.scale(2);
      scene.addChild(button);

      button.ontouchstart = function(){
        core.replaceScene(createGameScene());
      }
      return scene;
    }

    //0からnまでの乱数を生成する関数
    function rand(n) {
      return Math.floor(Math.random() * (n+1));
    }

    core.replaceScene(createGameStartScene());
  }
  core.start();
};
