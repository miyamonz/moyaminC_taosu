enchant();
var VERSION = '1.3.4';  //変更したらバージョンを書き換える

//ゲームで使用する画像
var TITLE_IMG = './image/title.png'
var BACKGROUND_IMG = './image/cosmo.jpg'
var PLAYER_IMG = './image/player1.png';
var PLAYER_DEAD_IMG = './image/player_dead.png';
var TAMA_IMG = './image/tama.png';
var BOSS_IMG = './image/moyaminC.png';
var BOSS_TAMA_IMG ='./image/moyaminC_grass.png'
var MYLIFE_IMG = './icon0.png';
var GAMEOVER_IMG = './image/gameover.png';
var CLEAR_IMG = './image/clear.png'
var ALLCLEAR_IMG = './image/congratulations.png'

//ゲームで使用するBGM＆効果音
var STAGE1_BGM = './sound/night3.mp3'
var STAGE2_BGM = './sound/strained.mp3'
var STAGE3_BGM = './sound/confront.mp3'
var BOSS_DEAD_SE = './sound/gun.mp3'
var BOSS_DAMAGE_SE = './sound/hit1.mp3'
var PLAYER_DEAD_SE = './sound/taihou.mp3'
var PLAYER_DAMAGE_SE = './sound/bomb3.mp3'

var IMG = [TITLE_IMG, BACKGROUND_IMG, PLAYER_IMG, PLAYER_DEAD_IMG, TAMA_IMG, BOSS_IMG, BOSS_TAMA_IMG, MYLIFE_IMG, GAMEOVER_IMG, CLEAR_IMG, ALLCLEAR_IMG];
var BGM = [STAGE1_BGM, STAGE2_BGM, STAGE3_BGM]
var SE = [BOSS_DEAD_SE, BOSS_DAMAGE_SE, PLAYER_DEAD_SE, PLAYER_DAMAGE_SE];

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
  //ゲームで使用する画像およびBGM等を読み込む
  core.preload(IMG);  //画像データをあらかじめ読み込む
  core.preload(BGM);  //BGMデータをあらかじめ読み込む
  core.preload(SE);  //SEデータをあらかじめ読み込む
  //fps設定
  core.fps = 30;
  //BGM&効果音のマスター音量
  core.masterBgm = 0;
  core.masterSe = 0;
  core.countBgm = 10; //表示用
  core.countSe = 10;  //表示用
  core.gameoverNum = 0;     //ゲームオーバーになった合計回数
  core.playerDamgeNum = 0;  //プレイヤーが受けたダメージの合計回数
  core.bolumeStep = Math.round((0.04/100)*1000)/1000; //0.002の1/100を小数第三位まで
  //ショットのキーバインド
  core.keybind( 'X'.charCodeAt(0), 'a' );
  core.keybind( 'P'.charCodeAt(0), 'b' );

  core.onload = function() {
    //BGMおよびSEを流すクラス
    var sound = {
      initialize: function(){
        this.playerDamageSe(1);
        this.playerDamageSe(0).volume = this.playerDamageSe(2);
        this.reset(this.playerDamageSe(0));

        this.playerDeadSe(1);
        this.playerDeadSe(0).volume = this.playerDeadSe(2);
        this.reset(this.playerDeadSe(0));

        this.bossDamageSe(1);
        this.bossDamageSe(0).volume = this.bossDamageSe(2);
        this.reset(this.bossDamageSe(0));

        this.bossDeadSe(1);
        this.bossDeadSe(0).volume = this.bossDeadSe(2);
        this.reset(this.bossDeadSe(0));

        this.stage1Bgm(1);
        this.stage1Bgm(0).volume = this.stage1Bgm(2);
        this.reset(this.stage1Bgm(0));

        this.stage2Bgm(1);
        this.stage2Bgm(0).volume = this.stage2Bgm(2);
        this.reset(this.stage2Bgm(0));

        this.stage3Bgm(1);
        this.stage3Bgm(0).volume = this.stage3Bgm(2);
        this.reset(this.stage3Bgm(0));

      },
      reset: function (TARGET) {
        TARGET.pause();
        TARGET.currentTime = 0;
      },
      // プレイヤーがダメージを受けた時のSE
      playerDamageSe: function(play) {  //0でそのものを返す 1で再生 2で音量初期化
        var se = core.assets[PLAYER_DAMAGE_SE];
        if (play == 1) {
          se.play();     //Se再生
        } else if (play == 2) {
          return 0.12;
        }
        return se;
      },
      playerDeadSe: function(play) {  //1で再生 2で音量初期化
        var se = core.assets[PLAYER_DEAD_SE];
        if (play == 1) {
          se.play();     //Se再生
        } else if (play == 2) {
          return 0.8;
        }
        return se; //0.8
      },
      //ボスがダメージを受けた時のSE
      bossDamageSe: function(play) {  //1で再生 2で音量初期化
        var se = core.assets[BOSS_DAMAGE_SE];
        if (play == 1) {
          se.play();     //Se再生
        } else if (play == 2) {
          return 0.03;
        }
        return se; //0.03
      },
      bossDeadSe: function(play) {  //1で再生 2で音量初期化
        var se = core.assets[BOSS_DEAD_SE];
        if (play == 1) {
          se.play();     //Se再生
        } else if (play == 2) {
          return 0.04;
        }
        return se; //0.04
      },
      stage1Bgm: function(play) { //1で再生 2で音量初期化
        var stageBgm = core.assets[STAGE1_BGM];
        if (play == 1) {
          stageBgm.play();
        } else if (play == 2){
          return 0.07;  //音量初期値
        }
        return stageBgm;
      },
      stage2Bgm: function(play) { //1で再生 2で音量初期化
        var stageBgm = core.assets[STAGE2_BGM];
        if (play == 1) {
          stageBgm.play();
        } else if (play == 2){
          return 0.13;  //音量初期値
        }
        return stageBgm;
      },
      stage3Bgm: function(play) { //1で再生 2で音量初期化
        var stageBgm = core.assets[STAGE3_BGM];
        if (play == 1) {
          stageBgm.play();
        } else if (play == 2){
          return 0.13;  //音量初期値
        }
        return stageBgm;
      },
      bgmLength : function(num) { //BGMの長さ(5の倍数で切り上げ)
        switch (num) {
          case 1: return 100; //100
            break;
          case 2: return 105; //105
            break;
          case 3: return 150; //150
            break;
          default:

        }
      },
      volumeChange: function(change, nowVolume, initVolume){  //change: 0が初期化 １で音量アップ ２で音量ダウン
        var tmpVolume = nowVolume;
        switch (change) {
          case 0:
            if (nowVolume == 1) {
              //変更なしバージョン
              nowVolume = initVolume;
            }else {
              //変更ありバージョン
              nowVolume = tmpVolume;
            }
            return nowVolume;
            break;
          case 1:
            var volume = nowVolume;
            volume = Math.round((volume + initVolume/10) * 1000)/1000;
            return volume;
            break;
          case 2:
            var volume = nowVolume;
            volume = Math.round((volume - initVolume/10) * 1000)/1000;
            return volume;
            break;
        }
      }
    };
    sound.initialize();
    //プレイヤーを作成するクラス
    var Player = Class.create(Sprite, {
        initialize: function(scene){
          Sprite.call(this, 50, 23);
          this.image = core.assets[PLAYER_IMG];
          this.life = 5;          //プレイヤーのライフ
          this.myLifeLabel = [];
          this.damageTime = 40;   //ダメージ受けた時のアクション合計時間(8の倍数？)
          this.barrier = false;   //ダメージ受けた後の無敵判定
          this.playFlag = true;   //ゲームプレイ中（ボス未撃破）かどうか判定する変数
          this.x = 100;
          this.y = core.height/2;
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
          //無敵時間（3秒）
          setTimeout(function(){
            player.barrier = false;   //無敵解除
            player.opacity = 1;       //半透明解除
          },3000);
          //ダメージアクション（左右に30度傾く ２往復）
          player.tl.rotateTo(30, this.damageTime/8, BACK_EASEOUT);
          player.tl.rotateTo(-30, this.damageTime/8);
          player.tl.rotateTo(30, this.damageTime/4);
          player.tl.rotateTo(-30, this.damageTime/2);
          player.tl.rotateTo(0, this.damageTime/2, BACK_EASEOUT);
        },
        //死んだ時のエフェクト
        dead: function(scene) {
          core.playerDamgeNum++;  //被ダメージ合計回数を1増やす
          var playerDead = new Sprite(96, 96);
          playerDead.image = core.assets[PLAYER_DEAD_IMG];
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
            label.image = core.assets[MYLIFE_IMG];
            label.frame = 10;
            label.scale(2);
            label.x = 45 + 40 * i;
            label.y = 85;
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

    //敵を作成するクラス
    var Boss = Class.create(Sprite, {
        //初期化メソッド
        initialize: function(scene, stageNumber){
          Sprite.call(this, 80, 80);
          this.image = core.assets[BOSS_IMG];
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

    //敵弾を作成するクラス
    var EnemyTama = Class.create(Sprite, {
        initialize: function(scene, x, y, boss, xAngle, yAngle){
          Sprite.call(this, 16, 16);
          this.image = core.assets[BOSS_TAMA_IMG];
          this.x = x;         //数字は発射位置の調整
          this.y = y;         //数字は発射位置の調整
          this.speed = 10;        //弾の進むスピード
          this.interval = 100;    //連射間隔
          this.onFrame(scene, xAngle, yAngle);
        },
        //敵弾の進み方 (弾の生成条件はcreateGameSceneの中でおこなう)
        onFrame: function(scene, xAngle, yAngle){
          this.addEventListener('enterframe', function(){
            //弾がプレイヤーに当たったかチェック
            this.hitBullet(scene);
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

    //ゲームシーン
    var createGameScene = function(stageNumber){
      //背景
      var scene = new Scene();
      var backGround = new Sprite(960, 540);
      backGround.image = core.assets[BACKGROUND_IMG];
      scene.addChild(backGround);
      //プレイヤー配置
      player = new Player(scene);
      //ボス配置
      boss = new Boss(scene, stageNumber);
      boss.opacity = 0;   //フェードインさせるために最初は透明にしておく
      boss.frame = 4;     //フェードイン時のボス画像
      //ボス登場時のセリフ
      var abo = new Label("");
      abo.color = 'white';
      abo.x = boss.x - 30;    //ボスの頭上に表示
      abo.y = boss.y - 50;    //ボスの頭上に表示
      abo.font = '24px "Arial"';
      if (stageNumber == 1) {
        abo.text = "アボカドアボボ";         //ステージ１で登場したときのセリフ
      } else if (stageNumber == 2) {
        abo.x = boss.x - 60;
        abo.text = "ふふふ...ふっかーつ！";          //ステージ２で登場したときのセリフ
      } else if (stageNumber == 3) {
        abo.x = boss.x - 60;
        abo.text = "ラストバトルをやる";    //ステージ３で登場したときのセリフ
      }
      //ボス登場シーン
      bossAppearTime = 155; //ボス登場シーンにかかる合計時間
      boss.tl.fadeIn(60, QUAD_EASEINOUT); //フェードイン
      boss.tl.delay(20).then(function(){
        boss.frame = 2;                   //セリフを言う時のボス画像
        scene.addChild(abo);              //登場時のセリフ
      })
      boss.tl.delay(75).then(function(){
        boss.frame = 0;                   //戦闘時のボス画像
        scene.removeChild(abo);           //セリフは消す
      })
      //ボスの動き方パターンを配列に格納 （[0, 1, 0, 1, 2]のループ)
      bossPattern = [];
      for (var i = 0; i < 200; i+=5) {
        bossPattern[i] = 0;
        bossPattern[i+1] = 1;
        bossPattern[i+2] = 0;
        bossPattern[i+3] = 1;
        bossPattern[i+4] = 2;
      }
      //プレイヤーのライフ表示
      player.lifeLabel(scene);
      //ボスのライフ表示
      boss.lifeLabel(scene);
      //現在のステージを表示
      var stageLabel = new Label("");
      stageLabel.text = "STAGE " + stageNumber;
      stageLabel.color = 'white';
      stageLabel.x = 40;
      stageLabel.y = 45;
      stageLabel.font = '24px "Arial"';
      scene.addChild(stageLabel);
      //変数宣言
      var flag = true;            //連射間隔を守るためのチェック変数
      var gameoverFlag = false;   //ゲームオーバーしたかどうかチェックする変数
      var gameClearFlag = false;  //一度ゲームクリアしたかどうかチェックする変数
      var ranTama = 0;
      var ranTama2 = 0;
      var pauseFlag = false;
      //ボスが動き出してからBGM再生
      setTimeout(function(){
        //ステージのBGM再生
        switch (stageNumber) {
          case 1:
            sound.stage1Bgm(1); //BGM再生
            break;
          case 2:
            sound.stage2Bgm(1); //BGM再生
            break;
          case 3:
            sound.stage3Bgm(1); //BGM再生
            break;
          default:
        }
        //すべての音源の音量を初期化
        sound.stage1Bgm(0).volume = sound.volumeChange(0, sound.stage1Bgm(0).volume, sound.stage1Bgm(2)); //音量初期化
        sound.stage2Bgm(0).volume = sound.volumeChange(0, sound.stage2Bgm(0).volume, sound.stage2Bgm(2)); //音量初期化
        sound.stage3Bgm(0).volume = sound.volumeChange(0, sound.stage3Bgm(0).volume, sound.stage3Bgm(2)); //音量初期化
        sound.playerDamageSe(0).volume = sound.volumeChange(0, sound.playerDamageSe(0).volume, sound.playerDamageSe(2));  //音量初期化
        sound.playerDeadSe(0).volume = sound.volumeChange(0, sound.playerDeadSe(0).volume, sound.playerDeadSe(2));  //音量初期化
        sound.bossDamageSe(0).volume = sound.volumeChange(0, sound.bossDamageSe(0).volume, sound.bossDamageSe(2));  //音量初期化
        sound.bossDeadSe(0).volume = sound.volumeChange(0, sound.bossDeadSe(0).volume, sound.bossDeadSe(2));  //音量初期化
      }, bossAppearTime * core.fps);
      //制限時間を表示
      var timeLabel = new Label("");
      timeLabel.moveTo(800, 45);
      timeLabel.color = 'white';
      timeLabel.font = '24px "Arial"';
      timeLabel.pause = false;
      scene.addChild(timeLabel);
      //シーンのイベントリスナー
      scene.addEventListener('enterframe', function(){
        if (boss.age - bossAppearTime == 1) {
          //制限時間を減らす（タイムラベルのイベントリスナー）
          var time = 0;
          timeLabel.addEventListener('enterframe', function() {
            time += 1 / core.fps; //１フレームあたりで進む秒数
            //時間が減る条件（制限時間内かつゲームクリアしてないかつゲームオーバーしてないかつポーズ画面中でない）
            if (sound.bgmLength(stageNumber) - time > 0 && gameClearFlag == false && gameoverFlag == false && timeLabel.pause == false) {
              timeLabel.text = "Time: " + (sound.bgmLength(stageNumber) - time).toFixed(2);  //BGM全体の長さから引く(BGMが終わったら時間切れ)
              //残り時間30秒を切ったら赤色に変える
              if (sound.bgmLength(stageNumber) - time < 30 && gameClearFlag == false && gameoverFlag == false && timeLabel.pause == false){
                timeLabel.color = 'orangered';
                timeLabel.tl.scaleTo(1.5, 10);
              }
            }
          })
        }
        //ボス登場シーン終了後, プレイヤーは移動可能
        if (boss.age > bossAppearTime) {
          player.move(player.x, player.y);
        }
        //ボタンを押したら自弾発射(ボス登場シーン終了後 ＆ プレイヤーのライフあり & プレイヤー無敵時間以外 & 連射感覚守る)
        if (core.input.a && boss.age > bossAppearTime && player.life > 0 && player.barrier == false && flag == true) {
          //"flag = false" 中はボタンを押しても弾が出ないようにする
          flag = false;
          player.frame = 1;
          setTimeout(function(){
            player.frame = 0;
          }, 100)
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
      //敵弾の発射パターン //initialize: function(scene, x, y, boss, xAngle, yAngle)
        if ((boss.age - bossAppearTime) >= 0 && gameoverFlag == false) {
        //発射した弾がプレイヤーに当たったか判定
          player.hit(boss, scene);
        //通常時（一定時間ごとに発射）
          //ステージ１のとき（16フレーム毎）
          if (stageNumber == 1 && boss.pattern == 0 && (boss.age - bossAppearTime) % 16 == 0) {
            var enemyTama = new EnemyTama(scene, boss.x, boss.y + boss.height/2, boss, -1, 0);
            scene.addChild(enemyTama);
          //ステージ２のとき（12フレーム毎）
          } else if (stageNumber == 2 && boss.pattern == 0 && (boss.age - bossAppearTime) % 12 == 0) {
            var enemyTama = new EnemyTama(scene, boss.x, boss.y + boss.height/2, boss, -1, 0);
            scene.addChild(enemyTama);
          //ステージ３のとき（8フレーム毎）
          } else if (stageNumber == 3 && boss.pattern == 0 && (boss.age - bossAppearTime) % 8 == 0) {
            var enemyTama = new EnemyTama(scene, boss.x, boss.y + boss.height/2, boss, -1, 0);
            scene.addChild(enemyTama);
          }
        //ランダム方向
          //ステージ2のとき
          if (stageNumber == 2 && boss.pattern == 1 && (boss.age - bossAppearTime) % 6 == 0) {
            var random = Math.PI * rand(360) / 180;           // 1度 = Math.PI / 180
            var xAngle = Math.sin(random);                    // sin(theta)
            var yAngle = Math.cos(random);                    // cos(theta)
            var enemyTama1 = new EnemyTama(scene, boss.x, boss.y + boss.height/2, boss, xAngle, yAngle);
            enemyTama1.speed = 4;                              //　弾のスピード（ゆっくり）
            scene.addChild(enemyTama1);
          //ステージ3のとき
          } else if (stageNumber == 3 && boss.pattern == 1 && (boss.age - bossAppearTime) % 2 == 0) {
            var random = Math.PI * rand(360) / 180;           // 1度 = Math.PI / 180
            var xAngle = Math.sin(random);                    // sin(theta)
            var yAngle = Math.cos(random);                    // cos(theta)
            var enemyTama1 = new EnemyTama(scene, boss.x, boss.y + boss.height/2, boss, xAngle, yAngle);
            enemyTama1.speed = rand(6) + 1;                   //　弾のスピード（ランダム：1〜７）
            scene.addChild(enemyTama1);
          }
        //乱射パターン時（中央でランダムな方向に発射）
          if (boss.ransha == true) {
            var random = Math.PI * rand(360) / 180;           // 1度 = Math.PI / 180
            var xAngle = Math.sin(random);                    // sin(theta)
            var yAngle = Math.cos(random);                    // cos(theta)
            var xAngleAddRight = Math.sin(random+Math.PI/2);  // sin(theta + PI/2)
            var yAngleAddRight = Math.cos(random+Math.PI/2);  // cos(theta + PI/2)
            ranTama = new EnemyTama(scene, core.width/2, core.height/2, boss, xAngle, yAngle);
            ranTama2 = new EnemyTama(scene, core.width/2, core.height/2, boss, -xAngle, -yAngle);
            ranTama3 = new EnemyTama(scene, core.width/2, core.height/2, boss, xAngleAddRight, yAngleAddRight);
            ranTama4 = new EnemyTama(scene, core.width/2, core.height/2, boss, -xAngleAddRight, -yAngleAddRight);
          //ステージ１のとき（4フレーム毎 2方向）
            if (boss.pattern == 2 && stageNumber == 1 && (boss.age - bossAppearTime) % 4 == 0) {
              scene.addChild(ranTama);
              scene.addChild(ranTama2);
          //ステージ2のとき（4フレーム毎 4方向）
            } else if (boss.pattern == 2 && stageNumber == 2 && (boss.age - bossAppearTime) % 4 == 0) {
              scene.addChild(ranTama);
              scene.addChild(ranTama2);
              scene.addChild(ranTama3);
              scene.addChild(ranTama4);
          //ステージ3のとき（2フレーム毎 4方向）
          } else if (boss.pattern == 2 && stageNumber == 3 && (boss.age - bossAppearTime) % 2 == 0) {
              scene.addChild(ranTama);
              scene.addChild(ranTama2);
              scene.addChild(ranTama3);
              scene.addChild(ranTama4);
            }
          }
        }

      //プレイヤーのライフが0もしくは時間切れになったらゲームオーバーシーンに移動
        if ((player.life == 0 || sound.bgmLength(stageNumber) - time <= 0) && gameoverFlag == false) {
          gameoverFlag = true;    //ゲームオーバーフラッグを立てることで敵弾発射回避
          boss.tl.clear();        //ボスの動きストップ
          core.gameoverNum++;     //ゲームオーバーの合計回数を1増やす
          //プレイヤー爆発音
          sound.playerDeadSe(1);
          //BGM再生ストップ
          switch (stageNumber) {
            case 1:
              sound.stage1Bgm(0).stop();
              break;
            case 2:
              sound.stage2Bgm(0).stop();
              break;
            case 3:
              sound.stage3Bgm(0).stop();
              break;
          }
          //3秒後にゲームオーバーシーンに移動して文字とボタンを表示
          setTimeout(function(){
            core.replaceScene(createGameOverScene(boss, stageLabel, stageNumber, timeLabel));
          }, 3000);
        }

      //ボスのライフが0になったらゲームクリアシーンに移動
        if (boss.life == 0 && gameClearFlag == false && player.life > 0) {
          sound.bossDeadSe(1);
          boss.delete(scene);     //ボス消滅
          gameClearFlag = true;
          player.playFlag = false;
          //BGM再生ストップ
          switch (stageNumber) {
            case 1:
              sound.stage1Bgm(0).stop();
              break;
            case 2:
              sound.stage2Bgm(0).stop();
              break;
            case 3:
              sound.stage3Bgm(0).stop();
              break;
          }
          //自機のアニメーション
          player.tl.delay(60).moveTo((core.width - player.width)/2, (core.height - player.height)/2 + 100, 90, enchant.Easing.BACK_EASEOUT);
          player.tl.then(function(){
            //if文で全ステージクリアかどうか判断する（最終ステージ＝３）
            if (stageNumber == 3) {
              core.replaceScene(createGameAllClearScene(player, stageLabel, stageNumber, timeLabel));
            } else {
              core.replaceScene(createGameClearScene(player, stageLabel, stageNumber, timeLabel));
            }
          });
        }
      });
      //ポーズ画面に移行する（Pキーを押したら ただしボス出現動作時とクリア時とゲームオーバー時はできない）
      setTimeout(function(){
        scene.addEventListener('bbuttondown', function(){
          if (gameClearFlag == false && gameoverFlag == false && player.life > 0 && boss.life > 0) {
            //BGM一時停止
            switch (stageNumber) {
              case 1:
                sound.stage1Bgm(0).pause();
                break;
              case 2:
                sound.stage2Bgm(0).pause();
                break;
              case 3:
                sound.stage3Bgm(0).pause();
                break;
            }
            timeLabel.pause = true;
            createGamePauseScene(stageNumber, timeLabel);
          }
        });
      }, bossAppearTime*core.fps);

      //ボス登場後、ボスの動き方を（boss.move内に書かれたボスのtimeline）に順に読み込む
      setTimeout(function(){
        bossPattern.forEach(function(value){
          boss.move(value, stageNumber);
        });
      }, bossAppearTime / core.fps)

      return scene;
    };

    //ポーズ画面
    var createGamePauseScene = function(stageNumber, timeLabel){
      var scene = new Scene();
      scene.backgroundColor = "rgba( 0, 0, 0, 0.6 )"; //半透明の画面をゲームシーンの上に重ねる
      //ポーズの文字を表示
      var pauseLabel = new Label("P A U S E")
      pauseLabel.color = 'white';
      pauseLabel.font = '64px "Arial"';
      pauseLabel.moveTo((core.width-pauseLabel.width)/2,100);
      scene.addChild(pauseLabel);
      //ポーズ画面解除方法を表示
      var pauseLabel = new Label("P r e s s\   \"P\"\   k e y\   t o\   b a c k . ")
      pauseLabel.color = 'white';
      pauseLabel.font = '24px "Arial"';
      pauseLabel.width = 400;
      pauseLabel.moveTo((core.width-pauseLabel.width)/2+20,400);
      scene.addChild(pauseLabel);
      //タイトル画面に戻るボタン
      var button = new Button("Title", "light");
      button.x = 10;
      button.y = 500;
      scene.addChild(button);
      //タイトル画面に戻るボタンを押した時のアクション
      button.ontouchstart = function(){
        core.gameoverNum = 0;     //ゲームオーバー合計回数をリセット
        core.playerDamgeNum = 0;  //被ダメージ合計回数をリセット
        //BGM停止
        switch (stageNumber) {
          case 1:
            sound.stage1Bgm(0).stop();
            break;
          case 2:
            sound.stage2Bgm(0).stop();
            break;
          case 3:
            sound.stage3Bgm(0).stop();
            break;
        }
        core.replaceScene(createGameStartScene());  //タイトル画面に戻る
      }
      volumeScene(scene);            //BGM&SE音量調節を表示
      //ポーズ画面解除
      scene.addEventListener('bbuttondown', function(){
          core.popScene();      //ポーズ画面を取り去る
          //BGM再生
          switch (stageNumber) {
            case 1:
              sound.stage1Bgm(0).play();
              break;
            case 2:
              sound.stage2Bgm(0).play();
              break;
            case 3:
              sound.stage3Bgm(0).play();
              break;
          }
          //制限時間が減るの開始
          timeLabel.pause = false;
      } );
      core.pushScene( scene );  //ここでpushしてSceneを重ねる
    };

    //ゲームオーバー画面
    var createGameOverScene = function(boss, stageLabel, stageNumber, timeLabel){
      var scene = new Scene();
      var backGround = new Sprite(960, 540);
      backGround.image = core.assets[BACKGROUND_IMG];
      scene.addChild(backGround);
      scene.addChild(stageLabel);
      scene.addChild(boss);
      scene.addChild(timeLabel);
      boss.lifeLabel(scene);
      //ゲームオーバーの文字
      var gameover = new Sprite(189, 97);
      gameover.image = core.assets[GAMEOVER_IMG];
      gameover.scale(3);
      gameover.x = (core.width - gameover.width) / 2 ;
      gameover.y = 160;
      scene.addChild(gameover);
      //タイトル画面に戻るボタン
      var button = new Button("Back to Title", "dark");
      button.x = 100;
      button.y = 450;
      scene.addChild(button);
      //再挑戦するボタン
      var retryButton = new Button("Retry", "dark");
      retryButton.x = scene.width / 2 - 70;
      retryButton.y = 400;
      retryButton.scale(2);
      scene.addChild(retryButton);
      //タイトル画面に戻るボタンを押した時のアクション
      button.ontouchstart = function(){
        core.gameoverNum = 0;     //ゲームオーバー合計回数をリセット
        core.playerDamgeNum = 0;  //被ダメージ合計回数をリセット
        core.replaceScene(createGameStartScene());  //タイトル画面に戻る
      }
      //再挑戦するボタンを押した時のアクション
      retryButton.ontouchstart = function(){
        core.replaceScene(createGameScene(stageNumber));  //同じステージを再挑戦
      }
      return scene;
    }

    //ゲームクリア画面
    var createGameClearScene = function(player, stageLabel, stageNumber, timeLabel){
        var scene = new Scene();
        var backGround = new Sprite(960, 540);
        backGround.image = core.assets[BACKGROUND_IMG];
        scene.addChild(backGround);
        scene.addChild(player);
        scene.addChild(stageLabel);
        scene.addChild(timeLabel);
        for (var i = 0; i < player.life; i++) {
          scene.addChild(player.myLifeLabel[i]);
        }
        //ゲームクリアの文字
        var clearLabel = new Sprite(267, 48)
        clearLabel.image = core.assets[CLEAR_IMG];
        clearLabel.scale(2.8);
        clearLabel.x = (scene.width - clearLabel.width) / 2 ;
        clearLabel.y = 190;
        //ゲームクリアの文字を表示
        player.tl.delay(10).then(function(){
            scene.addChild(clearLabel);
        });
        //タイトル画面に戻るボタン
        var button = new Button("Back to Title!", "dark");
        button.x = 100;
        button.y = 450;
        //次のステージに進むボタン
        var nextButton = new Button("Next Stage!", "light");
        nextButton.x = scene.width / 2 - 100;
        nextButton.y = 350;
        nextButton.scale(2);
        //時間差でタイトル画面に戻るボタンを表示
        player.tl.delay(75).then(function(){
            scene.addChild(button);
            scene.addChild(nextButton);
        });
        //タイトル画面に戻るボタンを押した時のアクション
        button.ontouchstart = function(){
          core.gameoverNum = 0;     //ゲームオーバー合計回数をリセット
          core.playerDamgeNum = 0;  //被ダメージ合計回数をリセット
          core.replaceScene(createGameStartScene());  //タイトル画面に戻る
        }
        //次のステージに進むボタンを押した時のアクション
        nextButton.ontouchstart = function(){
          core.replaceScene(createGameScene(stageNumber+1));  //次のステージに進む
        }
        return scene;
    }

    //ゲーム全ステージクリア画面
    var createGameAllClearScene = function(player, stageLabel, stageNumber, timeLabel){
        var scene = new Scene();
        var backGround = new Sprite(960, 540);
        backGround.image = core.assets[BACKGROUND_IMG];
        scene.addChild(backGround);
        scene.addChild(player);
        scene.addChild(stageLabel);
        scene.addChild(timeLabel);
        for (var i = 0; i < player.life; i++) {
          scene.addChild(player.myLifeLabel[i]);
        }
        //Congratulations!の文字を表示
        var clearLabel = new Sprite(540, 100)
        clearLabel.image = core.assets[ALLCLEAR_IMG];
        clearLabel.x = (core.width - clearLabel.width) / 2 ;
        clearLabel.y = 190;
        clearLabel.scale(1.2);
        //moyaminCの画像を表示
        var moyamins = new Sprite(80, 80);
        moyamins.image = core.assets[BOSS_IMG];
        moyamins.frame = 3;
        moyamins.scale(1.2);
        moyamins.x = 750;
        moyamins.y = 430;
        //moyaminCのセリフを表示
        var oteage = new Label("こうさんだモーン");
        oteage.x = moyamins.x - 50;
        oteage.y = moyamins.y - 50;
        oteage.color = 'white';
        oteage.font = '24px "Arial"';
        //全部のmoyamin画像を表示
        var moyaminC = [];
        for (var i = 0; i < 5; i++) {
          moyaminC[i] = new Sprite(80, 80);
          moyaminC[i].image = core.assets[BOSS_IMG];
          moyaminC[i].frame = i;
          moyaminC[i].x = 230 + 120 * i;
          moyaminC[i].y = 45;
        }
        //プレイヤーランクを表示
        var rank = new Label();
        rank.moveTo(350,430);
        rank.color = 'white';
        rank.text = "RANK：";
        rank.font = '24px "Arial"';
        //プレイヤーランクを表示
        var rankPlayer = new Label();
        rankPlayer.moveTo(rank.x+100,410);
        rankPlayer.color = 'white';
        rankPlayer.font = '48px "Arial"';
        var rankcount = 0;
        switch (core.gameoverNum) {
          case 0:
            if (core.playerDamgeNum == 0) {
              rankcount = 0;
              rankPlayer.color = 'gold';
              rankPlayer.text = "MASTER";
            } else if (core.playerDamgeNum < 5){
              rankcount = 1;
              rankPlayer.color = 'hotpink';
              rankPlayer.text = "SS";
            } else {
              rankcount = 2;
              rankPlayer.color = 'hotpink';
              rankPlayer.text = "S";
            }
            break;
          case 1:
            rankcount = 3;
            rankPlayer.text = "A";
            break;
          case 2:
          case 3:
            rankcount = 4;
            rankPlayer.text = "B";
            break;
          case 4:
          case 5:
            rankcount = 5;
            rankPlayer.color = 'gray';
            rankPlayer.text = "C";
            break;
          case 6:
          case 7:
            rankcount = 6;
            rankPlayer.color = 'gray';
            rankPlayer.text = "D";
            break;
          default:
            rankcount = 7;
            rankPlayer.color = 'gray';
            rankPlayer.text = "E";
            break;
        }
        //プレイヤーランクをローカルストレージに保存
        if (!localStorage.getItem("rankcount")) { //もしローカルストレージのrankcountがnullだったら100を保存
          localStorage.setItem("rankcount", "100");
        }
        //最高プレイヤーランクを更新したかどうか判別
        if (rankcount < JSON.parse(localStorage.getItem("rankcount"))) {
          localStorage.setItem("rankcount", JSON.stringify(rankcount));     //ランクカウント更新
          localStorage.setItem("rankPlayerText", rankPlayer.text);          //最高プレイヤーランクを更新
          localStorage.setItem("rankPlayerColor", rankPlayer.color);        //文字の色も更新
        }
        //ゲームオーバー回数を表示
        var rankGameoverNum = new Label();
        rankGameoverNum.moveTo(350,480);
        rankGameoverNum.color = 'white';
        rankGameoverNum.text = "ゲームオーバー回数　：" + core.gameoverNum;
        rankGameoverNum.font = '12px "Arial"';
        //ダメージを受けた回数を表示
        var rankPlayerDamageNum = new Label();
        rankPlayerDamageNum.moveTo(350,500);
        rankPlayerDamageNum.color = 'white';
        rankPlayerDamageNum.text = "ダメージを受けた回数：" + core.playerDamgeNum;
        rankPlayerDamageNum.font = '12px "Arial"';

        //ゲームクリアの文字を表示
        player.tl.delay(60).then(function(){
            scene.addChild(clearLabel);
        });
        //タイトル画面に戻るボタン
        var button = new Button("Back to Title!", "dark");
        button.x = 100;
        button.y = 450;
        //再戦するボタン
        // var retryButton = new Button("Fight again!", "dark");
        // retryButton.x = 100;
        // retryButton.y = 400;
        // ツイートボタン
        var e = new Entity();
        e._element = document.createElement('div');
        e.width = 320;
        e._element.innerHTML = "<p><a id=\"tweet\" href=\"https://twitter.com/intent/tweet?hashtags=moyaminC_taoshita&text=「RANK: "+rankPlayer.text+"」でmoyaminCを倒しました！&url=https://jugjug7531.github.io/moyaminC_taosu/\" target=\"_blank\">Tweet</a></p>"
        e.moveTo(400.440);
        e.color = 'white';
        //時間差で降参moyamiC達とボタンとプレイヤーランクを表示
        player.tl.delay(75).then(function(){
            for (var i = 0; i < 5; i++) {
              scene.addChild(moyaminC[i]);
            }
            scene.addChild(e);
            scene.addChild(moyamins);
            scene.addChild(oteage);
            scene.addChild(rank);
            scene.addChild(rankPlayer);
            scene.addChild(rankGameoverNum);
            scene.addChild(rankPlayerDamageNum);
            scene.addChild(button);
          //  scene.addChild(retryButton);
        });
        //タイトル画面に戻るボタンを押した時のアクション
        button.ontouchstart = function(){
          core.gameoverNum = 0;     //ゲームオーバー合計回数をリセット
          core.playerDamgeNum = 0;  //被ダメージ合計回数をリセット
          core.replaceScene(createGameStartScene());  //タイトル画面に戻る
        }
        // //再戦するボタンを押した時のアクション
        // retryButton.ontouchstart = function(){
        //   core.replaceScene(createGameScene(stageNumber));  //ラストステージを再挑戦
        // }
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
      var howToPlay = new Label("ショット：Xキー     移動：十字キー");
      howToPlay.width = 400;
      howToPlay.x = scene.width / 2 - howToPlay.width /2;
      howToPlay.y = 240;
      howToPlay.color = 'white';
      howToPlay.font = '24px "Arial"';
      scene.addChild(howToPlay);
      //操作説明
      var howToPlay = new Label("ポーズ画面：Pキー");
      howToPlay.width = 400;
      howToPlay.x = scene.width / 2 - howToPlay.width /2;
      howToPlay.y = 300;
      howToPlay.color = 'white';
      howToPlay.font = '18px "Arial"';
      scene.addChild(howToPlay);
      //バージョン表示
      var verLabel = new Label("Ver. " + VERSION)
      verLabel.x = 10;
      verLabel.y = 10;
      verLabel.color = 'white';
      verLabel.font = '16px "Arial"';
      scene.addChild(verLabel);
      //「RANK：」の文字を表示
      var rank = new Label("RANK：");
      rank.x = 770;
      rank.y = 15;
      rank.color = 'white';
      rank.font = '18px "Arial"';
      scene.addChild(rank);
      //プレイヤーの最高ランク表示
      var rankLabel = new Label("");
      rankLabel.x = rank.x + 70;
      rankLabel.y = 10;
      if (localStorage.getItem("rankPlayerText") == null) {
        rankLabel.y = 15;
        rankLabel.text = 'BEGINNER';
        rankLabel.font = '18px "Arial"';
        rankLabel.color = 'white';
      } else {
        rankLabel.text = localStorage.getItem("rankPlayerText");
        rankLabel.font = '24px "Arial"';
        rankLabel.color = localStorage.getItem("rankPlayerColor");
      }
      scene.addChild(rankLabel);

      //スタートボタン
      var button = new Button("Play!", "light");
      button.x = scene.width / 2 - 80;
      button.y = 350;
      button.scale(2);
      scene.addChild(button);
      //ボタンを押した時のアクション
      button.ontouchstart = function(){
        core.replaceScene(createGameScene(1));
      }
      //リセットボタン
      var resetbutton = new Button("Reset", "dark");
      resetbutton.x = 10;
      resetbutton.y = 500;
      resetbutton.scale(1);
      scene.addChild(resetbutton);
      //ボタンを押した時のアクション
      resetbutton.ontouchstart = function(){
        var answer = confirm('リセットしますか？最高プレイヤーランクが消えます。');
        if (answer) {
          //このゲームに関連するローカルストレージのデータを全消去
          localStorage.removeItem("rankcount");
          localStorage.removeItem("rankPlayerText");
          localStorage.removeItem("rankPlayerColor");
          core.replaceScene(createGameStartScene());  //タイトル画面更新
        }
      }
      return scene;
    }

    var createGameTimeAttackScene = function () {

    }

    //BGM&SE音量調節ができるシーンを表示する関数
    function volumeScene(scene) {
      var xLayout = -110 //横の位置を調整する
      //VOLUEME：BGMの文字を表示
      var pauseLabel = new Label("VOLUEME：BGM")
      pauseLabel.color = 'white';
      pauseLabel.font = '24px "Arial"';
      pauseLabel.moveTo(330 + xLayout,220);
      scene.addChild(pauseLabel);
      //現在のBGM音量を表示
      var masterBgmNow = new Label("")
      masterBgmNow.color = 'white';
      masterBgmNow.font = '24px "Arial"';
      masterBgmNow.moveTo(720 + xLayout, 220);
      masterBgmNow.text = core.countBgm;
      scene.addChild(masterBgmNow);
      //(0~20)の文字を表示
      var pauseLabel = new Label("(0〜20)")
      pauseLabel.color = 'white';
      pauseLabel.font = '24px "Arial"';
      pauseLabel.moveTo(770+ xLayout,220);
      scene.addChild(pauseLabel);
      //VOLUEME：SEの文字を表示
      var pauseLabel = new Label("VOLUEME：SE")
      pauseLabel.color = 'white';
      pauseLabel.font = '24px "Arial"';
      pauseLabel.moveTo(330 + xLayout,280);
      scene.addChild(pauseLabel);
      //現在のSE音量を表示
      var masterSeNow = new Label("")
      masterSeNow.color = 'white';
      masterSeNow.font = '24px "Arial"';
      masterSeNow.moveTo(720 + xLayout, 280);
      masterSeNow.text = core.countSe;
      scene.addChild(masterSeNow);
      //(0~20)の文字を表示
      var pauseLabel = new Label("(0〜20)")
      pauseLabel.color = 'white';
      pauseLabel.font = '24px "Arial"';
      pauseLabel.moveTo(770 + xLayout,280);
      scene.addChild(pauseLabel);

      //BGM音量あげるボタン
      var buttonBgmUp = new Button("▲", "light");
      buttonBgmUp.x = 650+ xLayout;
      buttonBgmUp.y = 220;
      scene.addChild(buttonBgmUp);
      //ボタンを押した時のアクション
      buttonBgmUp.ontouchstart = function(){
        if (core.countBgm >= 0 && core.countBgm < 20) {
          sound.stage1Bgm(0).volume = sound.volumeChange(1, sound.stage1Bgm().volume, 0.07) ;  //現在の音量
          sound.stage2Bgm(0).volume = sound.volumeChange(1, sound.stage2Bgm().volume, 0.13);  //現在の音量
          sound.stage3Bgm(0).volume = sound.volumeChange(1, sound.stage3Bgm().volume, 0.13) ;  //現在の音量
          masterBgmNow.text++;
          core.countBgm++;
        }
      }
      //SE音量あげるボタン
      var buttonSeUp = new Button("▲", "light");
      buttonSeUp.x = 650+ xLayout;
      buttonSeUp.y = 280;
      scene.addChild(buttonSeUp);
      //ボタンを押した時のアクション
      buttonSeUp.ontouchstart = function(){
        if (core.countSe >= 0 && core.countSe < 20) {
          sound.playerDamageSe(0).volume = sound.volumeChange(1, sound.playerDamageSe().volume, 0.12) ; //現在の音量
          sound.playerDeadSe(0).volume = sound.volumeChange(1, sound.playerDeadSe().volume, 0.8);       //現在の音量
          sound.bossDamageSe(0).volume = sound.volumeChange(1, sound.bossDamageSe().volume, 0.04) ;     //現在の音量
          sound.bossDeadSe(0).volume = sound.volumeChange(1, sound.bossDeadSe().volume, 0.04) ;         //現在の音量
          masterSeNow.text++;
          core.countSe++;
        }
      }

      //BGM音量下げるボタン
      var buttonBgmDown = new Button("▼", "light");
      buttonBgmDown.x = 600+ xLayout;
      buttonBgmDown.y = 220;
      scene.addChild(buttonBgmDown);
      //ボタンを押した時のアクション
      buttonBgmDown.ontouchstart = function(){
        if (core.countBgm > 0 && core.countBgm <= 20) {
          sound.stage1Bgm().volume = sound.volumeChange(2, sound.stage1Bgm(0).volume, 0.07) ;  //現在の音量
          sound.stage2Bgm().volume = sound.volumeChange(2, sound.stage2Bgm(0).volume, 0.13) ;  //現在の音量
          sound.stage3Bgm().volume = sound.volumeChange(2, sound.stage3Bgm(0).volume, 0.13);  //現在の音量
          masterBgmNow.text--;
          core.countBgm--;
        }
      }

      //SE音量下げるボタン
      var buttonSeDown = new Button("▼", "light");
      buttonSeDown.x = 600+ xLayout;
      buttonSeDown.y = 280;
      scene.addChild(buttonSeDown);
      //ボタンを押した時のアクション
      buttonSeDown.ontouchstart = function(){
        if (core.countSe > 0 && core.countSe <= 20) {
        sound.playerDamageSe(0).volume = sound.volumeChange(2, sound.playerDamageSe().volume, 0.12) ; //現在の音量
        sound.playerDeadSe(0).volume = sound.volumeChange(2, sound.playerDeadSe().volume, 0.8);       //現在の音量
        sound.bossDamageSe(0).volume = sound.volumeChange(2, sound.bossDamageSe().volume, 0.04) ;     //現在の音量
        sound.bossDeadSe(0).volume = sound.volumeChange(2, sound.bossDeadSe().volume, 0.04) ;         //現在の音量
        masterSeNow.text--;
        core.countSe--;
        }
      }

   }

    //0からnまでの乱数を生成する関数
    function rand(n) {
      return Math.floor(Math.random() * (n+1));
    }
     core.replaceScene(createGameStartScene());
     //core.replaceScene(createGameScene(3)); //バグ修正用
  }
  core.start();
};
