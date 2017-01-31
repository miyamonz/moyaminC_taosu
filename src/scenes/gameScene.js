const LOAD = require("../loadFiles.js")

module.exports = function(core){
  const createGamePauseScene = require("./pause.js")(core)

  const Player    = require("../sprites/Player.js")(core);
  const Tama      = require("../sprites/Tama.js")(core);
  const Boss      = require("../sprites/Boss.js")(core);
  const EnemyTama = require("../sprites/EnemyTama.js")(core);

  const sound = require("../sound.js")(core)

  return function(stageNumber, stageMode){
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
}
