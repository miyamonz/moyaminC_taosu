const LOAD = require("./loadFiles.js")
const coreInit = require("./coreInit.js")
const getSound = require("./sound.js")

const getPlayer = require("./sprites/Player.js");
const getTama   = require("./sprites/Tama.js");
const getBoss   = require("./sprites/Boss.js");
const getEnemyTama   = require("./sprites/EnemyTama.js");


const sceneList = require("./sceneList.js");

enchant();
var VERSION = '2.2';  //変更したらバージョンを書き換える


window.onload = function() {
  var core = new Core(960, 540);
  coreInit(core)

  var stageClearTimeArray = new Array();

  core.onload = function() {
    //BGMおよびSEを流すクラス
    const sound = getSound(core);
    sound.initialize();

    //自機と敵と玉のspriteを生成
    let Player = getPlayer(core);
    let Tama = getTama(core);
    let Boss = getBoss(core);
    let EnemyTama = getEnemyTama(core);

    //ゲームシーン(0:通常 1:タイムアタック)
    var createGameScene = function(stageNumber, stageMode){
      //背景
      var scene = new Scene();
      var backGround = new Sprite(960, 540);
      backGround.image = core.assets[LOAD.IMG.BACKGROUND_IMG];
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
        abo.text = "ふふふ...ふっかーつ！";   //ステージ２で登場したときのセリフ
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
      if (stageMode == 0) {
        stageLabel.text = "STAGE " + stageNumber;
      } else if (stageMode == 1) {
        stageLabel.text = "STAGE " + stageNumber + " (Speed Run)";
      }
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
        sound.currentScene = stageNumber;
        sound.bgmPlay("play");
        //すべての音源の音量を初期化
        sound.initVolume();

      }, bossAppearTime * core.fps);
      //制限時間を表示
      var timeLabel = new Label("");
      timeLabel.moveTo(800, 45);
      timeLabel.color = 'white';
      timeLabel.font = '24px "Arial"';
      timeLabel.pause = false;
      scene.addChild(timeLabel);
      playerHitBox = player.hitbox(scene);
      var time = 0;
      var playerX = 0;
      var playerY = 0;
      // 最初のタッチ時にタッチした初期位置と主人公位置の差分を取得
      scene.addEventListener("touchstart", function(e){
        playerX = player.x - e.x;
        playerY = player.y - e.y;
      });
      // 指を動かしたときに主人公が相対的に移動する
      scene.addEventListener("touchmove", function(e){
        player.x = playerX + e.x;
        player.y = playerY + e.y;
      });

      //シーンのイベントリスナー
      scene.addEventListener('enterframe', function(){
        if (boss.age - bossAppearTime == 1) {
          //制限時間を減らす（タイムラベルのイベントリスナー）
          // var time = 0;
          timeLabel.addEventListener('enterframe', function() {
            //ゲームクリアするまで時間が減る
            if(gameClearFlag == false){
              time += 1 / core.fps; //１フレームあたりで進む秒数
            }
            //時間が減る条件（制限時間内かつゲームクリアしてないかつゲームオーバーしてないかつポーズ画面中でない）
            if (sound.bgmLength(stageNumber) - time > 0 && gameClearFlag == false && gameoverFlag == false && timeLabel.pause == false) {
              //通常モードの時のタイム表示
              if (stageMode == 0) {
                timeLabel.text = "Time: " + (sound.bgmLength(stageNumber) - time).toFixed(2);  //BGM全体の長さから引く(BGMが終わったら時間切れ)
                //残り時間30秒を切ったら赤色に変える
                if (sound.bgmLength(stageNumber) - time < 30 && gameClearFlag == false && gameoverFlag == false && timeLabel.pause == false){
                  timeLabel.color = 'orangered';
                  timeLabel.tl.scaleTo(1.5, 10);
                }
              //タイムアタックモードの時のタイム表示
            } else if (stageMode == 1){
                timeLabel.text = "Time: " + time.toFixed(2);  //0:00スタートでカウントアップ
              }

            }
          })
        }
        //ボス登場シーン終了後, プレイヤーは移動可能
        if (boss.age > bossAppearTime) {
          player.move(player.x, player.y, player);
          player.move(playerHitBox.x, playerHitBox.y, playerHitBox);
          // player.move(phbX, phbY, playerHitBox);
        }
        //ボタンを押したら自弾発射(ボス登場シーン終了後 ＆ ゲームオーバーになっていない & プレイヤー無敵時間以外 & 連射感覚守る)
        if (core.input.a && boss.age > bossAppearTime && gameoverFlag == false && player.barrier == false && flag == true) {
          //"flag = false" 中はボタンを押しても弾が出ないようにする
          flag = false;
          player.frame = 1;
          setTimeout(function(){
            player.frame = 0;
          }, 100)
          //ボタン押したら弾を一発表示
          var tama = new Tama(scene, player.x, player.y);
          //発射した弾がボスに当たったか判定
          tama.hit(scene);
          //連射間隔を守る
          setTimeout(function(){
            flag = true;
          },tama.interval);
        }
      //
      //敵弾の発射パターン //initialize: function(scene, x, y, boss, xAngle, yAngle)
        if ((boss.age - bossAppearTime) >= 0 && gameoverFlag == false) {
        //発射した弾がプレイヤーに当たったか判定
          player.hit(boss, scene, playerHitBox);
        //通常時（一定時間ごとに発射）
          //ステージ１のとき（16フレーム毎）
          if (stageNumber == 1 && boss.pattern == 0 && (boss.age - bossAppearTime) % 16 == 0) {
            var enemyTama = new EnemyTama(scene, boss.x, boss.y + boss.height/2, boss, -1, 0, playerHitBox);
            scene.addChild(enemyTama);
          //ステージ２のとき（12フレーム毎）
          } else if (stageNumber == 2 && boss.pattern == 0 && (boss.age - bossAppearTime) % 12 == 0) {
            var enemyTama = new EnemyTama(scene, boss.x, boss.y + boss.height/2, boss, -1, 0, playerHitBox);
            scene.addChild(enemyTama);
          //ステージ３のとき（8フレーム毎）
          } else if (stageNumber == 3 && boss.pattern == 0 && (boss.age - bossAppearTime) % 8 == 0) {
            var enemyTama = new EnemyTama(scene, boss.x, boss.y + boss.height/2, boss, -1, 0, playerHitBox);
            scene.addChild(enemyTama);
          }
        //ランダム方向
          //ステージ2のとき
          if (stageNumber == 2 && boss.pattern == 1 && (boss.age - bossAppearTime) % 6 == 0) {
            var random = Math.PI * rand(360) / 180;           // 1度 = Math.PI / 180
            var xAngle = Math.sin(random);                    // sin(theta)
            var yAngle = Math.cos(random);                    // cos(theta)
            var enemyTama1 = new EnemyTama(scene, boss.x, boss.y + boss.height/2, boss, xAngle, yAngle, playerHitBox);
            enemyTama1.speed = 4;                              //　弾のスピード（ゆっくり）
            scene.addChild(enemyTama1);
          //ステージ3のとき
          } else if (stageNumber == 3 && boss.pattern == 1 && (boss.age - bossAppearTime) % 2 == 0) {
            var random = Math.PI * rand(360) / 180;           // 1度 = Math.PI / 180
            var xAngle = Math.sin(random);                    // sin(theta)
            var yAngle = Math.cos(random);                    // cos(theta)
            var enemyTama1 = new EnemyTama(scene, boss.x, boss.y + boss.height/2, boss, xAngle, yAngle, playerHitBox);
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
            ranTama = new EnemyTama(scene, core.width/2, core.height/2, boss, xAngle, yAngle, playerHitBox);
            ranTama2 = new EnemyTama(scene, core.width/2, core.height/2, boss, -xAngle, -yAngle, playerHitBox);
            ranTama3 = new EnemyTama(scene, core.width/2, core.height/2, boss, xAngleAddRight, yAngleAddRight, playerHitBox);
            ranTama4 = new EnemyTama(scene, core.width/2, core.height/2, boss, -xAngleAddRight, -yAngleAddRight, playerHitBox);
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
          if (sound.bgmLength(stageNumber) - time <= 0) {
            player.dead(scene);
            scene.removeChild(playerHitBox);
          }
          gameoverFlag = true;    //ゲームオーバーフラッグを立てることで敵弾発射回避
          boss.tl.clear();        //ボスの動きストップ
          core.gameoverNum++;     //ゲームオーバーの合計回数を1増やす
          //プレイヤー爆発音
          sound.playerDeadSe(1);
          //BGM再生ストップ
          sound.currentScene = stageNumber;
          sound.bgmPlay("stop");
          //3秒後にゲームオーバーシーンに移動して文字とボタンを表示
          setTimeout(function(){
            core.replaceScene(createGameOverScene(boss, stageLabel, stageNumber, timeLabel, stageMode));
          }, 3000);
        }

      //ボスのライフが0になったらゲームクリアシーンに移動
        if (boss.life == 0 && gameClearFlag == false && player.life > 0) {
          sound.bossDeadSe(1);
          boss.delete(scene);     //ボス消滅
          gameClearFlag = true;
          player.playFlag = false;
          if (stageMode == 1) {
            stageClearTime = time.toFixed(2);
            stageClearTimeArray[stageNumber-1] = stageClearTime;
          }
          //BGM再生ストップ
          sound.currentScene = stageNumber;
          sound.bgmPlay("stop");
          //自機のアニメーション
          player.tl.delay(60).moveTo((core.width - player.width)/2, (core.height - player.height)/2 + 100, 90, enchant.Easing.BACK_EASEOUT);
          player.tl.then(function(){
            //if文で全ステージクリアかどうか判断する（最終ステージ＝３）
            if (stageNumber == 3) {
              core.replaceScene(createGameAllClearScene(player, stageLabel, stageNumber, timeLabel, stageMode));
            } else {
              core.replaceScene(createGameClearScene(player, stageLabel, stageNumber, timeLabel, stageMode));
            }
          });
        }
      });
      //ポーズ画面に移行する（Pキーを押したら ただしボス出現動作時とクリア時とゲームオーバー時はできない）
      setTimeout(function(){
        scene.addEventListener('bbuttondown', function(){
          if (gameClearFlag == false && gameoverFlag == false && player.life > 0 && boss.life > 0) {
            //BGM一時停止
            sound.currentScene = stageNumber;
            sound.bgmPlay("pause");
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
        sound.currentScene = stageNumber;
        sound.bgmPlay("stop")
        core.replaceScene(createGameStartScene());  //タイトル画面に戻る
      }
      volumeScene(scene);            //BGM&SE音量調節を表示
      //ポーズ画面解除
      scene.addEventListener('bbuttondown', function(){
          core.popScene();      //ポーズ画面を取り去る
          //BGM再生
        sound.currentScene = stageNumber;
        sound.bgmPlay("play")
          //制限時間が減るの開始
          timeLabel.pause = false;
      } );
      core.pushScene( scene );  //ここでpushしてSceneを重ねる
    };

    //ゲームオーバー画面
    var createGameOverScene = function(boss, stageLabel, stageNumber, timeLabel, stageMode){
      var scene = new Scene();
      var backGround = new Sprite(960, 540);
      backGround.image = core.assets[LOAD.IMG.BACKGROUND_IMG];
      scene.addChild(backGround);
      scene.addChild(stageLabel);
      scene.addChild(boss);
      scene.addChild(timeLabel);
      boss.lifeLabel(scene);
      //ゲームオーバーの文字
      var gameover = new Sprite(189, 97);
      gameover.image = core.assets[LOAD.IMG.GAMEOVER_IMG];
      gameover.scale(2.8);
      gameover.x = (core.width - gameover.width) / 2 ;
      gameover.y = 175;
      scene.addChild(gameover);
      //タイトル画面に戻るボタン
      var button = new Button("Back to Title", "dark");
      button.x = 100;
      button.y = 450;
      //タイトル画面に戻るボタンを押した時のアクション
      button.ontouchstart = function(){
        core.gameoverNum = 0;     //ゲームオーバー合計回数をリセット
        core.playerDamgeNum = 0;  //被ダメージ合計回数をリセット
        core.replaceScene(createGameStartScene());  //タイトル画面に戻る
      }
      //再挑戦するボタン
      var retryButton = new Button("Retry", "dark");
      retryButton.x = scene.width / 2 - 60;
      retryButton.y = 400;
      retryButton.scale(2);
      //再挑戦ボタンは通常モードの時のみ表示（タイムアタックモードは一回ゲームオーバしたらタイトルに戻る）
      if (stageMode == 0) {
        //再挑戦するボタンを押した時のアクション
        retryButton.ontouchstart = function(){
          core.replaceScene(createGameScene(stageNumber, 0));  //同じステージを再挑戦
        }
        scene.addChild(retryButton);
        scene.addChild(button);
      } else if (stageMode == 1) {
        button.x = scene.width / 2 - 100;
        button.y = 400;
        button.scale(2);
        scene.addChild(button);
      }
      return scene;
    }

    //ゲームクリア画面
    var createGameClearScene = function(player, stageLabel, stageNumber, timeLabel, stageMode){
        var scene = new Scene();
        var backGround = new Sprite(960, 540);
        backGround.image = core.assets[LOAD.IMG.BACKGROUND_IMG];
        scene.addChild(backGround);
        scene.addChild(player);
        scene.addChild(stageLabel);
        scene.addChild(timeLabel);
        for (var i = 0; i < player.life; i++) {
          scene.addChild(player.myLifeLabel[i]);
        }
        //ゲームクリアの文字
        var clearLabel = new Sprite(267, 48)
        clearLabel.image = core.assets[LOAD.IMG.CLEAR_IMG];
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
        //時間差でタイトル画面に戻る等をボタンを表示
        player.tl.delay(75).then(function(){
          if (stageMode == 1) {
            //ステージクリアタイム（タイムアタックモードの時のみ）
            for (var i = 0; i < stageNumber; i++) {
              var stageClearTimeLabel = new Label("");
              stageClearTimeLabel.moveTo(scene.width/2 +230, 340 + i * 30);
              stageClearTimeLabel.color = 'white';
              stageClearTimeLabel.font = '24px "Arial"';
              stageClearTimeLabel.text = "STAGE" + (i+1) +"："+ stageClearTimeArray[i];
              scene.addChild(stageClearTimeLabel);  //ステージクリア合計タイム
            }
          }
            scene.addChild(button);       //タイトルに戻るボタンを表示
            scene.addChild(nextButton);   //次のステージに進むボタンを表示

        });
        //タイトル画面に戻るボタンを押した時のアクション
        button.ontouchstart = function(){
          core.gameoverNum = 0;     //ゲームオーバー合計回数をリセット
          core.playerDamgeNum = 0;  //被ダメージ合計回数をリセット
          core.replaceScene(createGameStartScene());  //タイトル画面に戻る
        }
        //次のステージに進むボタンを押した時のアクション
        nextButton.ontouchstart = function(){
          if (stageMode == 1) {
            core.replaceScene(createGameScene(stageNumber+1, 1));  //次のステージに進む
          } else {
            core.replaceScene(createGameScene(stageNumber+1, 0));  //次のステージに進む
          }

        }
        return scene;
    }

    //ゲーム全ステージクリア画面
    var createGameAllClearScene = function(player, stageLabel, stageNumber, timeLabel, stageMode){
        var scene = new Scene();
        var backGround = new Sprite(960, 540);
        backGround.image = core.assets[LOAD.IMG.BACKGROUND_IMG];
        scene.addChild(backGround);
        scene.addChild(player);
        scene.addChild(stageLabel);
        scene.addChild(timeLabel);
        for (var i = 0; i < player.life; i++) {
          scene.addChild(player.myLifeLabel[i]);
        }
        //Congratulations!の文字を表示
        var clearLabel = new Sprite(540, 100)
        clearLabel.image = core.assets[LOAD.IMG.ALLCLEAR_IMG];
        clearLabel.x = (core.width - clearLabel.width) / 2 ;
        clearLabel.y = 190;
        clearLabel.scale(1.2);
        //moyaminCの画像を表示
        var moyamins = new Sprite(80, 80);
        moyamins.image = core.assets[LOAD.IMG.BOSS_IMG];
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
          moyaminC[i].image = core.assets[LOAD.IMG.BOSS_IMG];
          moyaminC[i].frame = i;
          moyaminC[i].x = 250 + 110 * i;
          moyaminC[i].y = 85;
        }
        //「RANK：」or「TOTAL：」の文字を表示
        var rank = new Label();
        rank.moveTo(350,430);
        rank.color = 'white';
        if (stageMode == 0) {
          rank.text = "RANK：";
        } else if(stageMode == 1){
          rank.text = "TOTAL：";
        }
        rank.font = '24px "Arial"';
        //プレイヤーランクを表示
        var rankPlayer = new Label();
        rankPlayer.moveTo(rank.x+100,410);
        rankPlayer.color = 'white';
        rankPlayer.font = '48px "Arial"';
        if (stageMode == 0) {
          var rankcount = 0;
          switch (core.gameoverNum) {
            case 0:
              if (core.playerDamgeNum == 0) {
                rankcount = 0;
                rankPlayer.color = 'gold';
                rankPlayer.text = "MASTER";
              } else if (core.playerDamgeNum < 3){
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
            if (stageMode == 0) {
              //通常モード
              scene.addChild(moyamins);
              scene.addChild(oteage);
              scene.addChild(rankPlayer);
              scene.addChild(rankGameoverNum);
            } else if (stageMode == 1) {
              //タイムアタックモード　ステージクリアタイム
              var totalTime = 0;
              for (var i = 0; i < stageNumber; i++) {
                //各ステージのクリアタイム
                var stageClearTimeLabel = new Label("");
                stageClearTimeLabel.moveTo(scene.width/2 +230, 340 + i * 30);
                stageClearTimeLabel.color = 'white';
                stageClearTimeLabel.font = '24px "Arial"';
                stageClearTimeLabel.text = "STAGE" + (i+1) +"："+ stageClearTimeArray[i];
                scene.addChild(stageClearTimeLabel);  //ステージクリア合計タイム
                totalTime += parseFloat(stageClearTimeArray[i]);
                }
                //ペナルティ　（ダメージ回数×10秒を加算）
                var penalty = new Label("");
                penalty.moveTo(scene.width/2 +230, 435);
                penalty.color = 'white';
                penalty.font = '16px "Arial"';
                penalty.text = "ダメージ回数×10："+ core.playerDamgeNum + "×"+ 10;
                scene.addChild(penalty);
                totalTime += parseInt(core.playerDamgeNum * 10);
                //点線
                var line = new Label("ーーーーーーーーー");
                line.moveTo(scene.width/2 +230, 450);
                line.color = 'white';
                line.font = '24px "Arial"';
                scene.addChild(line);
                //合計タイム
                var totalTimeLabel = new Label("");
                totalTimeLabel.moveTo(scene.width/2 +230, 470);
                totalTimeLabel.color = 'white';
                totalTimeLabel.font = '24px "Arial"';
                totalTimeLabel.text = "TOTAL  ：" + totalTime.toFixed(2);
                scene.addChild(totalTimeLabel);
                //合計タイムをローカルストレージに保存
                if (!localStorage.getItem("totalTime")) { //もしローカルストレージのがnullだったら999.99を保存
                  localStorage.setItem("totalTime", JSON.stringify(999.99));
                }
                //合計クリアタイムを更新したかどうか判別（問題あり）
                if (totalTime.toFixed(2) < parseFloat(JSON.parse(localStorage.getItem("totalTime"))) ) {
                  localStorage.setItem("totalTime", JSON.stringify(totalTime.toFixed(2)));     //合計クリアタイム更新
                  rankPlayer.color = 'gold';
                }
                //プレイヤーランクの場所に合計クリアタイムを表示
                rankPlayer.text = totalTime.toFixed(2);
                scene.addChild(rankPlayer);
                //ツイート内容の変更
                e._element.innerHTML = "<p><a id=\"tweet\" href=\"https://twitter.com/intent/tweet?hashtags=moyaminC_taoshita&text=「TOTAL TIME: "+rankPlayer.text+"」ですべてのmoyaminCを倒しました！&url=https://jugjug7531.github.io/moyaminC_taosu/\" target=\"_blank\">Tweet</a></p>"
            }
            scene.addChild(rank);
            scene.addChild(rankPlayerDamageNum);
            scene.addChild(button);
            scene.addChild(e);
        });
        //タイトル画面に戻るボタンを押した時のアクション
        button.ontouchstart = function(){
          core.gameoverNum = 0;     //ゲームオーバー合計回数をリセット
          core.playerDamgeNum = 0;  //被ダメージ合計回数をリセット
          core.replaceScene(createGameStartScene());  //タイトル画面に戻る
        }
        return scene;
    }

    //スタート画面
    var createGameStartScene = function(){
      var scene = new Scene();
      var backGround = new Sprite(960, 540);
      backGround.image = core.assets[LOAD.IMG.BACKGROUND_IMG];
      scene.addChild(backGround);
      //タイトル文字
      var title = new Sprite(645,90);
      title.image = core.assets[LOAD.IMG.TITLE_IMG];
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
      var howToPlay2 = new Label("ポーズ画面：Pキー（BGMと効果音の音量調整ができます）");
      howToPlay2.width = 500;
      howToPlay2.x = scene.width / 2 - howToPlay.width /2;
      howToPlay2.y = 300;
      howToPlay2.color = 'white';
      howToPlay2.font = '18px "Arial"';
      scene.addChild(howToPlay2);
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

      //タイムアタックモード解禁（RANK：S以上）
      if (localStorage.getItem("rankPlayerText") == "S" || localStorage.getItem("rankPlayerText") == "SS" || localStorage.getItem("rankPlayerText") == "MASTER") {
        //「BEST TIME：」の文字を表示
        var time = new Label("BEST TIME：");
        time.x = 725;
        time.y = 45;
        time.color = 'white';
        time.font = '18px "Arial"';
        scene.addChild(time);
        //ベストタイム表示
        var timeLabel = new Label("");
        timeLabel.x = time.x + 115;
        timeLabel.y = 40;
        if (localStorage.getItem("totalTime") == null) {
          timeLabel.text = '999.99';
          timeLabel.font = '24px "Arial"';
          timeLabel.color = 'white';
        } else {
          timeLabel.text = JSON.parse(localStorage.getItem("totalTime"));
          timeLabel.font = '24px "Arial"';
          timeLabel.font = '24px "Arial"';
          timeLabel.color = 'white';
        }
        scene.addChild(timeLabel);
        //タイムアタックモード開始ボタン
        var button = new Button("Speed Run!", "light");
        button.x = scene.width / 2 + 100;
        button.y = 360;
        button.scale(1.5);
        scene.addChild(button);
        //ボタンを押した時のアクション
        button.ontouchstart = function(){
          core.replaceScene(createGameScene(1, 1));
        }
      }
      //スタートボタン
      var button = new Button("Play!", "light");
      button.x = scene.width / 2 - 80;
      button.y = 350;
      button.scale(2);
      scene.addChild(button);
      //ボタンを押した時のアクション
      button.ontouchstart = function(){
        core.replaceScene(createGameScene(1, 0));
      }
      //リセットボタン
      var resetbutton = new Button("Reset", "dark");
      resetbutton.x = 10;
      resetbutton.y = 500;
      resetbutton.scale(1);
      scene.addChild(resetbutton);
      //ボタンを押した時のアクション
      resetbutton.ontouchstart = function(){
        var answer = confirm('リセットしますか？最高プレイヤーランクやベストクリアタイムが消えます.');
        if (answer) {
          //このゲームに関連するローカルストレージのデータを全消去
          localStorage.removeItem("totalTime");
          localStorage.removeItem("rankcount");
          localStorage.removeItem("rankPlayerText");
          localStorage.removeItem("rankPlayerColor");
          core.replaceScene(createGameStartScene());  //タイトル画面更新
        }
      }
      return scene;
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
      masterBgmNow.text = sound.bgmVolume;
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
      masterSeNow.text = sound.seVolume;
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
        sound.addVolumeBGM(1);
        sound.applyVolumes();
        masterBgmNow.text = sound.bgmVolume;
      }
      //SE音量あげるボタン
      var buttonSeUp = new Button("▲", "light");
      buttonSeUp.x = 650+ xLayout;
      buttonSeUp.y = 280;
      scene.addChild(buttonSeUp);
      //ボタンを押した時のアクション
      buttonSeUp.ontouchstart = function(){
        sound.addVolumeSE(1);
        sound.applyVolumes();
        masterSeNow.text = sound.seVolume;
      }

      //BGM音量下げるボタン
      var buttonBgmDown = new Button("▼", "light");
      buttonBgmDown.x = 600+ xLayout;
      buttonBgmDown.y = 220;
      scene.addChild(buttonBgmDown);
      //ボタンを押した時のアクション
      buttonBgmDown.ontouchstart = function(){
        sound.addVolumeBGM(-1);
        sound.applyVolumes();
        masterBgmNow.text = sound.bgmVolume;
      }

      //SE音量下げるボタン
      var buttonSeDown = new Button("▼", "light");
      buttonSeDown.x = 600+ xLayout;
      buttonSeDown.y = 280;
      scene.addChild(buttonSeDown);
      //ボタンを押した時のアクション
      buttonSeDown.ontouchstart = function(){
        sound.addVolumeSE(-1);
        sound.applyVolumes();
        masterSeNow.text = sound.seVolume;
      }

   }

    sceneList.addScene("gameScene", createGameScene);
    sceneList.addScene("pause", createGamePauseScene);
    sceneList.addScene("gameover", createGameOverScene);
    sceneList.addScene("gameclear", createGameClearScene);
    sceneList.addScene("allclear", createGameAllClearScene);
    sceneList.addScene("start", createGameStartScene);
    sceneList.addScene("volume", volumeScene);

    //0からnまでの乱数を生成する関数
    function rand(n) {
      return Math.floor(Math.random() * (n+1));
    h}
     // core.replaceScene(createGameStartScene());
     core.replaceScene(sceneList.getScene("start")());
     //core.replaceScene(createGameScene(3)); //バグ修正用
  }
  core.start();
};
